import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, createQueryBuilder, QueryBuilder } from 'typeorm';
import { SkiperWallet } from './skiper-wallet.entity';
import { SkiperWalletInput, SkiperWalletCreateInput } from './skiper-wallet.dto';
import { SkiperWalletsHistory } from '../skiper-wallets-history/skiper-wallets-history.entity';
import { TransactionType } from '../transaction-type/transaction-type.entity';
import { WalletscompaniesService } from "../walletscompanies/walletscompanies.service";
import { AlycoinInvoices } from '../alycoin-invoices/alycoin-invoices.entity';
import { DetailAlycoinIinvoice } from '../detail-alycoin-invoice/detail-alycoin-invoice.entity';
import { UserService } from '../users/user.service';
import { User } from '../users/user.entity';
import { PaymentMethods } from '../payment-methods/payment-methods.entity';
import { Countrie } from '../countries/countrie.entity';
import { HashConfirmedService } from '../hash-confirmed/hash-confirmed.service';
import geotz from 'geo-tz';
import geoip_lite from 'geoip-lite';
import { HashConfirmed } from '../hash-confirmed/hash-confirmed.entity';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import momentTimeZone from 'moment-timezone';
import { ExchangeRate } from '../exchange-rate/exchange-rate.entity';
import node_geocoder from 'node-geocoder';
import { Currency } from '../currency/currency.entity';
import { CountrieService } from '../countries/countrie.service';
const InputDataDecoder = require('ethereum-input-data-decoder');

@Injectable()
export class SkiperWalletService {
    constructor(
        @InjectRepository(SkiperWallet)
        private readonly repository: Repository<SkiperWallet>,
        private readonly walletservice: WalletscompaniesService,
        @Inject(forwardRef(() => UserService))
        private readonly userservice: UserService,
        private readonly hashconfirmed: HashConfirmedService,
        private readonly country: CountrieService

    ) { }

    async getAll(): Promise<SkiperWallet[]> {
        return await this.repository.find({ relations: ["userID", "currencyID", "countryID"] });
    }

    async getWalletByIdUser(iduser: number) {
        try {
            return this.repository.find({ where: { iduser: iduser } })
        } catch (error) {
            console.log(error);
        }
    }

    async getAmountByCrypto(crypto: string, amount: number, iduser: number, idcountry: number, idpackage: number) {
        try {
            let walletcompanies = await this.walletservice.getWalletByCrypto(crypto)
            let Price_usd;
            if (walletcompanies.identifier != "alycoin") {
                const url = `https://api.coinmarketcap.com/v1/ticker/${crypto}/`;
                let cryptodate = await fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                Price_usd = parseFloat(cryptodate[0].price_usd);
            } else { Price_usd = 1 }

            let numfact = await this.CreateInvoice(iduser, idcountry, idpackage, amount);
            let user = await this.userservice.getUserById(numfact.iduser);
            let amountpay = (amount / Price_usd).toFixed(8)
            let datasend = {
                numberFact: numfact.numfac,
                nameUser: `${user.firstname} ${user.lastname}`,
                state: false,
                crypto: walletcompanies.identifier,
                company: walletcompanies.name_company,
                walletReceive: walletcompanies.txt,
                amounSend: amountpay
            };
            return datasend;
        } catch (error) {
            console.log(error)
        }
    }

    private async CreateInvoice(iduser: number, idcountry: number, idpackage: number, amount: number): Promise<AlycoinInvoices> {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        let result;
        let alycoininvoice = new AlycoinInvoices();
        let detailalycoininvoice = new DetailAlycoinIinvoice();
        await queryRunner.startTransaction();
        try {
            let response = await createQueryBuilder(AlycoinInvoices, "AlycoinInvoices")
                .addOrderBy('AlycoinInvoices.id', 'DESC')
                .limit(1)
                .getOne();
            if (response != undefined) {
                alycoininvoice.numfac = response.numfac + 1;
            } else {
                alycoininvoice.numfac = 1;
            }
            alycoininvoice.iduser = iduser;
            alycoininvoice.idcountry = idcountry;
            alycoininvoice.date_in = new Date();
            result = await queryRunner.manager.save(alycoininvoice);

            detailalycoininvoice.idinvoice = result.id;
            detailalycoininvoice.idpackage = idpackage;
            detailalycoininvoice.total = amount;
            await queryRunner.manager.save(detailalycoininvoice);

            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
        } finally {
            queryRunner.release();
            return result;
        }
    }

    async validateHash(hash: string, crypto: string, invoice: number, total_real: number, total_crypto: number, lat: number, long: number, ip: string, email: string, is_user: boolean) {

        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        var datecountry = await geocoder.reverse({ lat: lat, lon: long })

        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        let wallet = await this.walletservice.getWalletByCrypto(crypto);
        let paymethodCrypto = await this.getPaymentMethodBYName();
        let validaHas = await this.hashconfirmed.getByHash(hash);

        if (validaHas != undefined) {
            throw new HttpException(
                'hash has already been confirmed',
                HttpStatus.BAD_REQUEST
            );
        }
        let arraymi = new Array();
        switch (crypto) {
            case 'bitcoin':
                let url = `https://api.blockcypher.com/v1/btc/main/txs/${hash}`;
                let cryptodate = await fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });

                if (!cryptodate.error) {
                    cryptodate.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.00000001).toFixed(8)).toString()))
                    })

                    if (cryptodate.addresses.includes(wallet.txt)) {
                        if (arraymi.includes(total_crypto.toString())) {
                            try {
                                if (is_user == false) {
                                    crypto = undefined;
                                }
                                let wallet = await this.getWalletsByEmailUser(email, crypto);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RECARGA SALDO')
                                    let exchanging = (total_real * exchance).toFixed(2);
                                    return await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), total_crypto, is_user, "Recarga credito");
                                }
                                throw new HttpException(
                                    `error wallet is not exist `,
                                    HttpStatus.BAD_REQUEST
                                )
                            } catch (error) {
                                throw new HttpException(
                                    `error system ${error}`,
                                    HttpStatus.BAD_REQUEST
                                )
                            }
                        } else {
                            throw new HttpException(
                                `you did not send the amount necessary to accept your transaction`,
                                HttpStatus.BAD_REQUEST
                            )
                        }
                    } else {
                        throw new HttpException(
                            `We have not found our wallet in your transaction`,
                            HttpStatus.BAD_REQUEST
                        )
                    }

                } else {
                    throw new HttpException(
                        `wrong hash check and try again`,
                        HttpStatus.BAD_REQUEST
                    )
                }
                break
            case 'dash':
                const url2 = `https://api.blockcypher.com/v1/dash/main/txs/${hash}`;
                let cryptodate2 = await fetch(url2)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate2.error) {
                    cryptodate2.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.00000001).toFixed(8)).toString()))
                    })

                    if (cryptodate2.addresses.includes(wallet.txt)) {
                        if (arraymi.includes(total_crypto.toString())) {
                            try {
                                let wallet = await this.getWalletsByEmailUser(email, crypto);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RECARGA SALDO')
                                    let exchanging = (total_real * exchance).toFixed(2);
                                    return await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), total_crypto, is_user, "Recarga credito");
                                }
                                throw new HttpException(
                                    `error wallet is not exist `,
                                    HttpStatus.BAD_REQUEST
                                )

                            } catch (error) {
                                throw new HttpException(
                                    `error system ${error}`,
                                    HttpStatus.BAD_REQUEST
                                )
                            }
                        } else {
                            throw new HttpException(
                                'you did not send the amount necessary to accept your transaction',
                                HttpStatus.BAD_REQUEST
                            )
                        }
                    } else {
                        throw new HttpException(
                            'We have not found our wallet in your transaction',
                            HttpStatus.BAD_REQUEST
                        )
                    }

                } else {
                    throw new HttpException(
                        'wrong hash check and try again',
                        HttpStatus.BAD_REQUEST
                    )
                }
                break
            case 'litecoin':
                const url3 = `https://api.blockcypher.com/v1/ltc/main/txs/${hash}`;
                let cryptodate3 = await fetch(url3)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate3.error) {
                    cryptodate3.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.00000001).toFixed(8)).toString()))
                    })

                    if (cryptodate3.addresses.includes(wallet.txt)) {
                        if (arraymi.includes(total_crypto.toString())) {
                            try {
                                let wallet = await this.getWalletsByEmailUser(email, crypto);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RECARGA SALDO')
                                    let exchanging = (total_real * exchance).toFixed(2);
                                    return await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), total_crypto, is_user, "Recarga credito");
                                }
                                throw new HttpException(
                                    `error wallet is not exist `,
                                    HttpStatus.BAD_REQUEST
                                )
                            } catch (error) {
                                throw new HttpException(
                                    `error system ${error}`,
                                    HttpStatus.BAD_REQUEST
                                )
                            }
                        } else {
                            throw new HttpException(
                                'you did not send the amount necessary to accept your transaction',
                                HttpStatus.BAD_REQUEST
                            )
                        }
                    } else {
                        throw new HttpException(
                            'We have not found our wallet in your transaction',
                            HttpStatus.BAD_REQUEST
                        )
                    }

                } else {
                    throw new HttpException(
                        'wrong hash check and try again',
                        HttpStatus.BAD_REQUEST
                    )
                }
                break
            case 'ethereum':
                const url4 = `https://api.blockcypher.com/v1/eth/main/txs/${hash}`;
                let cryptodate4 = await fetch(url4)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate4.error) {
                    cryptodate4.outputs.forEach(output => {
                        arraymi.push((((parseFloat(output.value) * 0.000000000000000001).toFixed(8)).toString()))
                    })
                    var wcompanystring = wallet.txt
                    var wcompay = wcompanystring.substr(2);
                    if (cryptodate4.addresses.includes(wcompay.toLowerCase())) {
                        if (arraymi.includes(total_crypto.toString())) {
                            try {
                                let wallet = await this.getWalletsByEmailUser(email, crypto);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RECARGA SALDO')
                                    let exchanging = (total_real * exchance).toFixed(2);
                                    return await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), total_crypto, is_user, "Recarga credito");
                                }
                                throw new HttpException(
                                    `error wallet is not exist `,
                                    HttpStatus.BAD_REQUEST
                                )
                            } catch (error) {
                                throw new HttpException(
                                    `error system ${error}`,
                                    HttpStatus.BAD_REQUEST
                                )
                            }
                        } else {
                            throw new HttpException(
                                "you did not send the amount necessary to accept your transaction",
                                HttpStatus.BAD_REQUEST
                            )
                        }
                    } else {
                        throw new HttpException(
                            "We have not found our wallet in your transaction",
                            HttpStatus.BAD_REQUEST
                        )
                    }

                } else {
                    throw new HttpException(
                        "We have not found our wallet in your transaction",
                        HttpStatus.BAD_REQUEST
                    )
                }
                break
            case 'alycoin':
                let abiExample = {
                    'abi': [
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "name",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "string"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "_spender",
                                    "type": "address"
                                },
                                {
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "approve",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "generatedBy",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "string"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "totalSupply",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [],
                            "name": "endCrowdsale",
                            "outputs": [],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "_from",
                                    "type": "address"
                                },
                                {
                                    "name": "_to",
                                    "type": "address"
                                },
                                {
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "transferFrom",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "isMinting",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "decimals",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint8"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "_totalSupply",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "changeCrowdsaleRate",
                            "outputs": [],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "RATE",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "burnTokens",
                            "outputs": [],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [
                                {
                                    "name": "_owner",
                                    "type": "address"
                                }
                            ],
                            "name": "balanceOf",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "owner",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "symbol",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "string"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "_to",
                                    "type": "address"
                                },
                                {
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "transfer",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "constant": false,
                            "inputs": [],
                            "name": "createTokens",
                            "outputs": [],
                            "payable": true,
                            "stateMutability": "payable",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [
                                {
                                    "name": "_owner",
                                    "type": "address"
                                },
                                {
                                    "name": "_spender",
                                    "type": "address"
                                }
                            ],
                            "name": "allowance",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "inputs": [],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "payable": true,
                            "stateMutability": "payable",
                            "type": "fallback"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "name": "_from",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "name": "_to",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "Transfer",
                            "type": "event"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": true,
                                    "name": "_owner",
                                    "type": "address"
                                },
                                {
                                    "indexed": true,
                                    "name": "_spender",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "name": "_value",
                                    "type": "uint256"
                                }
                            ],
                            "name": "Approval",
                            "type": "event"
                        }
                    ]
                };
                const url5 = `https://api.blockcypher.com/v1/eth/main/txs/${hash}`;
                let cryptodate5 = await fetch(url5)
                    .then(response => response.json())
                    .then(json => {
                        return json;
                    });
                if (!cryptodate5.error) {
                    const decoder = new InputDataDecoder(abiExample.abi);
                    let result = decoder.decodeData(cryptodate5.outputs[0].script);
                    var wcompanystring = wallet.txt
                    var wcompay = wcompanystring.substr(2);
                    if (result.inputs[0] == wcompay.toLowerCase()) {
                        let amountFromContract = parseFloat(result.inputs[1].words[0]) / 10000;
                        if (amountFromContract <= total_crypto) {
                            try {
                                let wallet = await this.getWalletsByEmailUser(email, crypto);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RECARGA SALDO')
                                    let exchanging = (total_real * exchance).toFixed(2);
                                    return await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), total_crypto, is_user, "Recarga credito");
                                }
                                throw new HttpException(
                                    `error wallet is not exist `,
                                    HttpStatus.BAD_REQUEST
                                )
                            } catch (error) {
                                throw new HttpException(
                                    `error system ${error}`,
                                    HttpStatus.BAD_REQUEST
                                )
                            }
                        } else {
                            throw new HttpException(
                                "you did not send the amount necessary to accept your transaction",
                                HttpStatus.BAD_REQUEST
                            )
                        }
                    } else {
                        throw new HttpException(
                            "We have not found our wallet in your transaction",
                            HttpStatus.BAD_REQUEST
                        )
                    }

                } else {
                    throw new HttpException(
                        "We have not found our wallet in your transaction",
                        HttpStatus.BAD_REQUEST
                    )
                }
                break
            default:
                throw new HttpException(
                    "select an available method",
                    HttpStatus.BAD_REQUEST
                )
        }

    }

    private async getTransactionType(name: string): Promise<TransactionType> {
        return await createQueryBuilder(TransactionType, "TransactionType")
            .where("TransactionType.name = :name", { name })
            .getOne();
    }

    async getExchange(nameCountry: string, date_in: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let x = await queryRunner.manager.createQueryBuilder(ExchangeRate, "ExchangeRate")
                .innerJoin("ExchangeRate.country", "country")
                .where("country.name = :name ", { name: nameCountry })
                .andWhere("ExchangeRate.date_in = :date_in", { date_in: date_in })
                .getOne();
            // console.log(x)
            return x;
        } catch (error) {
            console.log(error)
        }
    }

    async getPaymentMethodBYName() {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            return await queryRunner.manager.findOneOrFail(PaymentMethods, { where: { name: 'CryptoCurrencies' } });
        } catch (error) {
            console.log(error);
        }
    }

    async getAllByUserId(id: number): Promise<SkiperWallet[]> {
        return await this.repository.find({
            relations: ["userID", "currencyID", "countryID"], where: {
                iduser: id
            }
        });
    }

    async getWalletByUserIdAndCurrency(userId, currencyId): Promise<SkiperWallet> {
        return await this.repository.findOne({ where: { iduser: userId, idcurrency: currencyId } });
    }

    async getById(id: number): Promise<SkiperWallet> {
        try {
            let result = await this.repository.findOne(
                {
                    relations: ["userID", "currencyID", "countryID"],
                    where: { id }
                }
            );
            return result;
        } catch (error) {
            const errorMessage = error.error_message || 'Error in the request';
            throw new HttpException(
                errorMessage,
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async getOnlyByTypeCurrency(id: number, iscrypto: boolean) {
        try {
            return await createQueryBuilder(Currency, "Currency")
                .where("Currency.id = :id", { id: id })
                .andWhere("Currency.isCrypto = :isCrypto", { isCrypto: iscrypto }).getOne()

        } catch (error) {
            console.log(error)
        }
    }

    async getWalletsByEmailUser(email: string, crypto: string) {
        try {
            if (crypto != undefined) {
                return await createQueryBuilder(SkiperWallet, "SkiperWallet")
                    .innerJoin("SkiperWallet.userID", "userID")
                    .innerJoin("SkiperWallet.currencyID", "currencyID")
                    .where("currencyID.name = :name", { name: crypto })
                    .andWhere("userID.email = :email and userID.idcountry = SkiperWallet.idcountry", { email: email })
                    .getOne();
            } else {
                return await createQueryBuilder(SkiperWallet, "SkiperWallet")
                    .innerJoin("SkiperWallet.userID", "userID")
                    .andWhere("userID.email = :email and userID.idcountry = SkiperWallet.idcountry", { email: email })
                    .getOne();
            }
        } catch (error) {
            console.log(error);
        }
    }

    async registerSkiperLocalwallet(input: SkiperWalletCreateInput) {
        try {
            let zonahoraria = geotz(input.lat, input.long);
            let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")
            let currency = await this.getOnlyByTypeCurrency(input.idcurrency, false);
            let searchWallet = await this.getWalletByUserIdAndCurrency(input.iduser, input.idcurrency);
            if (currency != undefined) {
                if (searchWallet == undefined) {
                    let parseDateWallet = this.parseSkiperWallet(input, date);
                    parseDateWallet.amount = 0;
                    return await this.repository.save(parseDateWallet);
                } else {
                    throw new HttpException('the wallet has already been created', HttpStatus.BAD_REQUEST)
                }
            } else {
                throw new HttpException('sorry! register only local wallet', HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
            console.error(error);
            throw new HttpException(error, HttpStatus.NOT_FOUND)
        }
    }

    async registerSkiperCryptowallet(input: SkiperWalletCreateInput) {
        try {
            let zonahoraria = geotz(input.lat, input.long);
            let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD HH:mm:ss")
            let currency = await this.getOnlyByTypeCurrency(input.idcurrency, true);
            let country = await this.country.getById(input.idcountry);
            let user = await this.userservice.getUserById(input.iduser);
            if (currency != undefined) {
                let searchWallet = await this.getWalletByUserIdAndCurrency(input.iduser, input.idcurrency);
                if (searchWallet == undefined) {
                    let parseDateWallet = this.parseSkiperWallet(input, date, country, currency, user);
                    let result = this.repository.save(parseDateWallet);
                    if (result) {
                        return "success! your wallet has been created";
                    }
                } else {
                    throw new HttpException('the wallet has already been created', HttpStatus.BAD_REQUEST)
                }
            } else {
                throw new HttpException('sorry! register only crypto wallet', HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
            console.error(error);
            throw new HttpException(error, HttpStatus.NOT_FOUND)
        }
    }

    async updateSkiperWallet(input: SkiperWalletInput) {
        try {
            let result = await this.getById(input.id);
            if (result) {
                result.iduser = input.iduser;
                result.idcountry = input.idcountry;
                result.idcurrency = input.idcurrency;
                result.amount = input.amount;
                result.date_in = input.date_in;
                return await this.repository.save(result);
            }
        } catch (error) {
            console.error(error);
        }
    }


    async registerDeposit(id: number, idtransaction: number, idpayment_method: number, deposit: number, depositCrypto: number, is_user: boolean, description: string) {
        try {
            let result;
            let wallet = await this.repository.findOneOrFail({ id });
            if (is_user) {
                result = await this.walletDepositTransactionCryptoCurrency(wallet, depositCrypto, idtransaction, idpayment_method, description);
                if (result) {
                    return await this.getById(result.id);
                }
            } else {
                result = await this.walletDepositTransactionLocalCurrency(wallet, deposit, idtransaction, idpayment_method, description);
                if (result) {
                    return await this.getById(result.id);
                }
            }

            return result;
        } catch (error) {
            throw new HttpException('wallet is missing', HttpStatus.BAD_REQUEST);
        }
    }

    private async regiterHash(invoice: number, hash: string) {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let hashConfirmed = new HashConfirmed();

        try {
            hashConfirmed.invoice = invoice;
            hashConfirmed.hash = hash;
            hashConfirmed.date_in = new Date();
            await queryRunner.manager.save(hashConfirmed);
            await queryRunner.commitTransaction;

        } catch (error) {
            await queryRunner.rollbackTransaction;
        } finally {
            await queryRunner.release;
        }

    }

    async requestWithdrawals(id: number, idtransaction: number, idpayment_method: number, amount: number, description: string) {

        let wallet = await this.repository.findOne({ id });
        if (wallet == undefined) {
            throw new HttpException(
                'no wallet available',
                HttpStatus.BAD_REQUEST
            );
        }
        let result = await this.WithdrawalsorReversed(wallet, amount, idtransaction, idpayment_method, description);

        if (result) {
            return await this.getById(result.id);
        }
        return result;

    }


    private async WithdrawalsorReversed(wallet: SkiperWallet, amount: number, idtransaction: number, idpayment_method: number, description: string): Promise<SkiperWallet> {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let result;
        let walletHistory = new SkiperWalletsHistory();

        let transacionType = await queryRunner.manager.findOne(TransactionType, { where: { id: idtransaction } });
        let verifywallet = await queryRunner.manager.findOneOrFail(SkiperWallet, { where: { id: wallet.id } });
        walletHistory.amount = amount;
        walletHistory.idcurrency = wallet.idcurrency;
        walletHistory.idskiperwallet = wallet.id;
        walletHistory.idpayment_methods = idpayment_method;
        walletHistory.description = description;
        walletHistory.idtransactiontype = idtransaction;
        walletHistory.date_in = new Date();

        if (parseFloat(verifywallet.amount.toString()) < parseFloat(walletHistory.amount.toString())) {
            throw new HttpException(
                'you dont have enough balance for this transaction',
                HttpStatus.BAD_REQUEST
            );
        }

        if (parseFloat(verifywallet.amount.toString()) <= 0) {
            throw new HttpException(
                'there are not enough funds',
                HttpStatus.BAD_REQUEST
            );
        }

        if (transacionType == undefined) {
            throw new HttpException('transaction type not exist', HttpStatus.BAD_REQUEST)
        }

        if (parseInt(transacionType.id.toString()) == 3 || parseInt(transacionType.id.toString()) == 6) {
            if (parseInt(transacionType.id.toString()) == 3) {
                walletHistory.paidout = false;
            }
            if (parseInt(transacionType.id.toString()) == 6) {
                walletHistory.paidout = true;
            }
        } else {
            throw new HttpException('transaction type is not available', HttpStatus.BAD_REQUEST)
        }


        try {
            wallet.amount = (parseFloat(wallet.amount.toString()) - parseFloat(walletHistory.amount.toString()));
            result = await queryRunner.manager.save(wallet);
            await queryRunner.manager.save(walletHistory);
            await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
            return null;

        } finally {
            await queryRunner.release();
            return result;
        }

    }

    private async walletDepositTransactionCryptoCurrency(wallet: SkiperWallet, deposit: number, idtransaction: number, idpayment_method: number, description: string): Promise<SkiperWallet> {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let result;
        let walletHistory = new SkiperWalletsHistory();
        try {
            walletHistory.amount = 0;
            walletHistory.amount_crypto = deposit;
            walletHistory.idcurrency = wallet.idcurrency;
            walletHistory.idskiperwallet = wallet.id;
            walletHistory.idpayment_methods = idpayment_method;
            walletHistory.description = description;
            walletHistory.idtransactiontype = idtransaction;
            walletHistory.date_in = new Date();
            //Save entity
            wallet.amount_crypto = (parseFloat(walletHistory.amount_crypto.toString()) + parseFloat(wallet.amount_crypto.toString()));
            result = await queryRunner.manager.save(wallet);
            await queryRunner.manager.save(walletHistory);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            await queryRunner.rollbackTransaction();
            return null;
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    private async walletDepositTransactionLocalCurrency(wallet: SkiperWallet, deposit: number, idtransaction: number, idpayment_method: number, description: string): Promise<SkiperWallet> {
        let connection = getConnection();
        let queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let result;
        let walletHistory = new SkiperWalletsHistory();
        try {
            let transacionType = await queryRunner.manager.findOneOrFail(TransactionType, { where: { id: idtransaction } });
            walletHistory.amount = deposit * transacionType.sign;
            walletHistory.idcurrency = wallet.idcurrency;
            walletHistory.idskiperwallet = wallet.id;
            walletHistory.idpayment_methods = idpayment_method;
            walletHistory.description = description;
            walletHistory.idtransactiontype = idtransaction;
            walletHistory.date_in = new Date();
            //Save entity
            wallet.amount = (parseFloat(walletHistory.amount.toString()) + parseFloat(wallet.amount.toString()));
            result = await queryRunner.manager.save(wallet);
            await queryRunner.manager.save(walletHistory);
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            await queryRunner.rollbackTransaction();
            return null;
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    private parseSkiperWallet(input: SkiperWalletCreateInput, date: Date, country?, currency?, user?): SkiperWallet {
        let skiperwallet: SkiperWallet = new SkiperWallet();
        skiperwallet.userID = user;
        skiperwallet.date_in = date;
        skiperwallet.countryID = country;
        skiperwallet.currencyID = currency;
        skiperwallet.minimun = input.minimun;
        skiperwallet.bretirar = input.bretirar;
        return skiperwallet;
    }
}