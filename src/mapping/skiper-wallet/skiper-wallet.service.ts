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
import { BillingConcept } from '../billing-concept/billing-concept.entity';
import { MailerService } from '@nest-modules/mailer';
const InputDataDecoder = require('ethereum-input-data-decoder');
const rp = require('request-promise');
import { CurrencyService } from '../currency/currency.service';
import { PackageAlycoinService } from '../package-alycoin/package-alycoin.service';
import { DetailAlycoinInvoiceService } from '../detail-alycoin-invoice/detail-alycoin-invoice.service';
import { AlycoinInvoicesService } from '../alycoin-invoices/alycoin-invoices.service';
import { HashConfirmedInput } from '../hash-confirmed/hash-confirmed.dto';

@Injectable()
export class SkiperWalletService {
    constructor(
        @InjectRepository(SkiperWallet)
        private readonly repository: Repository<SkiperWallet>,
        private readonly walletservice: WalletscompaniesService,
        @Inject(forwardRef(() => UserService))
        private readonly userservice: UserService,
        private readonly hashconfirmed: HashConfirmedService,
        private readonly country: CountrieService,
        private readonly currency: CurrencyService,
        private readonly mailerservice: MailerService,
        private readonly packageAlycoinservice: PackageAlycoinService,
        private readonly detailalycoininvoiceservice: DetailAlycoinInvoiceService,
        private readonly alycoinInvoiceService: AlycoinInvoicesService,
        private readonly hashconfirmedservice: HashConfirmedService

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


    async getAmountByCrypto(cryptoId: number, concept: number, amount: number, iduser: number, idcountry: number, idpackage: number) {
        try {
            let currency = await this.currency.getById(cryptoId);
            let walletcompanies = await this.walletservice.getWalletByCrypto(currency.name.toLowerCase());
            let Price_usd;
            if (walletcompanies.identifier != "alycoin") {
                const requestOptions = {
                    method: 'GET',
                    uri: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${currency.iso}`,
                    qs: {
                        'convert': 'USD'
                    },
                    headers: {
                        'X-CMC_PRO_API_KEY': 'f78fa793-b95e-4a58-a0ef-760f070defb0'
                    },
                    json: true,
                    gzip: true
                };
                let dataCoinMarketCap = await rp(requestOptions).then(result => {
                    return result;
                })
                Price_usd = parseFloat(dataCoinMarketCap.data[`${currency.iso}`].quote.USD.price);
            } else { Price_usd = 1 }

            let invoiceConcept = await createQueryBuilder(BillingConcept, "BillingConcept")
                .where("BillingConcept.id = :id", { id: concept }).getOne();
            let amountpay = (amount / Price_usd).toFixed(8)
            let numfact = await this.CreateInvoice(iduser, idcountry, invoiceConcept.id, idpackage, amount, parseFloat(amountpay), Price_usd, currency.id);
            let user = await this.userservice.getUserById(numfact.iduser);

            let datasend = {
                numberFact: numfact.numfac,
                nameUser: `${user.firstname} ${user.lastname}`,
                state: false,
                crypto: walletcompanies.identifier,
                concept: invoiceConcept.name,
                company: walletcompanies.name_company,
                walletReceive: walletcompanies.txt,
                amounSend: amountpay,
                priceUsd: Price_usd
            };
            return datasend;
        } catch (error) {
            console.log(error)
        }
    }

    private async CreateInvoice(iduser: number, idcountry: number, concept: number, idpackage: number, amount: number, amountCrypto: number, priceCryptoUSD: number, receivedCurrencyId: number): Promise<AlycoinInvoices> {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.startTransaction();
        let result;
        try {
            let response = await createQueryBuilder(AlycoinInvoices, "AlycoinInvoices")
                .addOrderBy('AlycoinInvoices.id', 'DESC')
                .limit(1)
                .getOne();
            let alycoininvoice = new AlycoinInvoices();
            if (response != undefined) {
                alycoininvoice.numfac = response.numfac + 1;
            } else {
                alycoininvoice.numfac = 1;
            }

            alycoininvoice.iduser = iduser;
            alycoininvoice.idcountry = idcountry;
            alycoininvoice.date_in = new Date();
            result = await queryRunner.manager.save(alycoininvoice);

            let detailalycoininvoice = new DetailAlycoinIinvoice();
            detailalycoininvoice.idinvoice = result.id;
            detailalycoininvoice.idpackage = idpackage;
            detailalycoininvoice.amountCrypto = amountCrypto;
            detailalycoininvoice.priceCryptoUSD = priceCryptoUSD;
            detailalycoininvoice.receivedCurrencyId = receivedCurrencyId;
            detailalycoininvoice.billingConceptId = concept;
            if (concept == 2) {
                detailalycoininvoice.sendCurrencyId = 11;
                detailalycoininvoice.sent = false;
                detailalycoininvoice.amountSendAlycoin = amount / 1;
            } else { detailalycoininvoice.sent = true; }
            detailalycoininvoice.dateIn = new Date();
            detailalycoininvoice.total = amount;
            await queryRunner.manager.save(detailalycoininvoice);

            await queryRunner.commitTransaction();

        } catch (error) {
            console.error(error)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
            return result;
        }
    }

    async validateHash(hash: string, invoice: number, lat: number, long: number, packageId: number, userId: number, email: string, is_user: boolean) {
        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        let paymethodCrypto = await this.getPaymentMethodBYName();
        var datecountry = await geocoder.reverse({ lat: lat, lon: long });
        let user = await this.userservice.getUserById(userId);
        let packageA = await this.packageAlycoinservice.getById(packageId);
        let validaHas = await this.hashconfirmed.getByHash(hash);
        let getDetailInvoice = await this.detailalycoininvoiceservice.getDetailByNumfact(invoice, 1);
        if (getDetailInvoice == undefined) {
            throw new HttpException(
                'no data invoice',
                HttpStatus.BAD_REQUEST
            );
        }
        let wallet = await this.walletservice.getWalletByCrypto(getDetailInvoice.receiveCurrency.name.toLowerCase());

        if (validaHas != undefined) {
            throw new HttpException(
                'hash has already been confirmed',
                HttpStatus.BAD_REQUEST
            );
        }
        let arraymi = new Array();
        switch (getDetailInvoice.receiveCurrency.name.toLowerCase()) {
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            try {
                                let is_w = (is_user == true) ? getDetailInvoice.receiveCurrency.name.toLowerCase() : undefined;
                                let wallet = await this.getWalletsByEmailUser(email, is_w);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RS')
                                    let exchanging = (getDetailInvoice.total * exchance).toFixed(2);
                                    let result = await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), getDetailInvoice.amountCrypto, is_user, `Recarga saldo de ${getDetailInvoice.receiveCurrency.name.toLowerCase()}`, getDetailInvoice, packageA, user, hash, date, datecountry, invoice);
                                    if (result) {
                                        let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                                        updateInvoice.state = true;
                                        this.alycoinInvoiceService.update(updateInvoice);

                                        let hasconfirmedinput = new HashConfirmedInput();
                                        hasconfirmedinput.invoiceId = invoice;
                                        hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                                        hasconfirmedinput.hash = hash;
                                        this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                                        return result;
                                    }
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            try {
                                let is_w = (is_user == true) ? getDetailInvoice.receiveCurrency.name.toLowerCase() : undefined;
                                let wallet = await this.getWalletsByEmailUser(email, is_w);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RS')
                                    let exchanging = (getDetailInvoice.total * exchance).toFixed(2);
                                    let result = await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), getDetailInvoice.amountCrypto, is_user, `Recarga saldo de ${getDetailInvoice.receiveCurrency.name.toLowerCase()}`, getDetailInvoice, packageA, user, hash, date, datecountry, invoice);

                                    if (result) {
                                        let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                                        updateInvoice.state = true;
                                        this.alycoinInvoiceService.update(updateInvoice);

                                        let hasconfirmedinput = new HashConfirmedInput();
                                        hasconfirmedinput.invoiceId = invoice;
                                        hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                                        hasconfirmedinput.hash = hash;
                                        this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                                        return result;
                                    }
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            try {
                                let is_w = (is_user == true) ? getDetailInvoice.receiveCurrency.name.toLowerCase() : undefined;
                                let wallet = await this.getWalletsByEmailUser(email, is_w);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RS')
                                    let exchanging = (getDetailInvoice.total * exchance).toFixed(2);
                                    let result = await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), getDetailInvoice.amountCrypto, is_user, `Recarga saldo de ${getDetailInvoice.receiveCurrency.name.toLowerCase()}`, getDetailInvoice, packageA, user, hash, date, datecountry, invoice);

                                    if (result) {
                                        let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                                        updateInvoice.state = true;
                                        this.alycoinInvoiceService.update(updateInvoice);

                                        let hasconfirmedinput = new HashConfirmedInput();
                                        hasconfirmedinput.invoiceId = invoice;
                                        hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                                        hasconfirmedinput.hash = hash;
                                        this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                                        return result;
                                    }
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            try {
                                let is_w = (is_user == true) ? getDetailInvoice.receiveCurrency.name.toLowerCase() : undefined;
                                let wallet = await this.getWalletsByEmailUser(email, is_w);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RS')
                                    let exchanging = (getDetailInvoice.total * exchance).toFixed(2);
                                    let result = await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), getDetailInvoice.amountCrypto, is_user, `Recarga saldo de ${getDetailInvoice.receiveCurrency.name.toLowerCase()}`, getDetailInvoice, packageA, user, hash, date, datecountry, invoice);
                                    if (result) {
                                        let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                                        updateInvoice.state = true;
                                        this.alycoinInvoiceService.update(updateInvoice);

                                        let hasconfirmedinput = new HashConfirmedInput();
                                        hasconfirmedinput.invoiceId = invoice;
                                        hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                                        hasconfirmedinput.hash = hash;
                                        this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                                        return result;
                                    }
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
                        if (amountFromContract <= getDetailInvoice.amountCrypto) {
                            try {
                                let is_w = (is_user == true) ? getDetailInvoice.receiveCurrency.name.toLowerCase() : undefined;
                                let wallet = await this.getWalletsByEmailUser(email, is_w);
                                if (wallet != undefined) {
                                    let typeChangeByCountry = await this.getExchange(datecountry[0].country, date);
                                    let exchance = (typeChangeByCountry != undefined && typeChangeByCountry.value != null) ? typeChangeByCountry.value : 0;
                                    let transactiontype = await this.getTransactionType('RS')
                                    let exchanging = (getDetailInvoice.total * exchance).toFixed(2);
                                    let result = await this.registerDeposit(wallet.id, transactiontype.id, paymethodCrypto.id, parseFloat(exchanging), getDetailInvoice.amountCrypto, is_user, `Recarga saldo de ${getDetailInvoice.receiveCurrency.name.toLowerCase()}`, getDetailInvoice, packageA, user, hash, date, datecountry, invoice);
                                    if (result) {
                                        let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                                        updateInvoice.state = true;
                                        this.alycoinInvoiceService.update(updateInvoice);

                                        let hasconfirmedinput = new HashConfirmedInput();
                                        hasconfirmedinput.invoiceId = invoice;
                                        hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                                        hasconfirmedinput.hash = hash;
                                        this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                                        return result;
                                    }
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

    async convertBalance(amount: number, isoCrypto: string, lat: number, long: number) {
        var options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        var geocoder = node_geocoder(options);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        var datecountry = await geocoder.reverse({ lat: lat, lon: long });
        let exchangeUSD = await this.getExchange(datecountry[0].country, date);
        let validateValue = (exchangeUSD != undefined && exchangeUSD.value != null) ? exchangeUSD.value : 0;
        const requestOptions = {
            method: 'GET',
            uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
            qs: {
                'symbol': `${isoCrypto}`
            },

            headers: {
                'X-CMC_PRO_API_KEY': 'f78fa793-b95e-4a58-a0ef-760f070defb0'
            },
            json: true,
            gzip: true
        };

        return rp(requestOptions).then(response => {
            let converToUSD = (amount / validateValue).toFixed(2);
            let convertToCRYPTO = parseFloat(converToUSD) / response.data[`${isoCrypto}`].quote.USD.price.toFixed(2);
            let dataConvert = {
                amountCrypto: convertToCRYPTO.toFixed(8),
                amountUsd: converToUSD,
                priceCrypto: response.data[`${isoCrypto}`].quote.USD.price.toFixed(2)
            }
            return dataConvert;
        }).catch((err) => {
            console.log('API call error:', err.message);
        });
    }


    async validateHashBuyAlycoin(hash: string, invoice: number, lat: number, long: number, packageId: number, userId: number, walletAly: string) {
        let options = {
            provider: 'google',
            httpAdapter: 'https', // Default
            apiKey: 'AIzaSyDJqxifvNO50af0t6Y9gaPCJ8hYtkbOmQ8', // for Mapquest, OpenCage, Google Premier
            formatter: 'json' // 'gpx', 'string', ...
        };
        let geocoder = node_geocoder(options);
        let datecountry = await geocoder.reverse({ lat: lat, lon: long })
        let user = await this.userservice.getUserById(userId);
        let zonahoraria = geotz(lat, long)
        let date = momentTimeZone().tz(zonahoraria.toString()).format("YYYY-MM-DD")
        let validaHas = await this.hashconfirmed.getByHash(hash);
        let packageA = await this.packageAlycoinservice.getById(packageId);
        let getDetailInvoice = await this.detailalycoininvoiceservice.getDetailByNumfact(invoice);
        if (getDetailInvoice == undefined) {
            throw new HttpException(
                'no data invoice',
                HttpStatus.BAD_REQUEST
            );
        }
        let wallet = await this.walletservice.getWalletByCrypto(getDetailInvoice.receiveCurrency.name.toLowerCase());
        if (validaHas != undefined) {
            throw new HttpException(
                'hash has already been confirmed',
                HttpStatus.BAD_REQUEST
            );
        }
        let arraymi = new Array();
        switch (getDetailInvoice.receiveCurrency.name.toLowerCase()) {
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                            updateInvoice.state = true;
                            this.alycoinInvoiceService.update(updateInvoice);

                            let getDetailByInvoice = await this.detailalycoininvoiceservice.getDetailByNumfact(invoice);
                            let getOnlyDetail = await this.detailalycoininvoiceservice.getById(getDetailByInvoice.id);
                            getOnlyDetail.walletAly = walletAly;
                            this.detailalycoininvoiceservice.update(getOnlyDetail);

                            let hasconfirmedinput = new HashConfirmedInput();
                            hasconfirmedinput.invoiceId = invoice;
                            hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                            hasconfirmedinput.hash = hash;
                            this.hashconfirmedservice.regiterHash(hasconfirmedinput);

                            this.sendInvoiceAlypayByEmail(getDetailInvoice.receiveCurrency.name, user.email, `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/${hash}`, hash, user.firstname, user.lastname, invoice, packageA.name, getDetailInvoice.amountCrypto, parseFloat(getDetailInvoice.total.toString()), parseFloat(getDetailInvoice.priceCryptoUSD.toString()), date, getDetailInvoice.amountSendAlycoin, datecountry[0].country, walletAly)
                            return true;
                        } else {
                            return false;
                            // throw new HttpException(
                            //     `you did not send the amount necessary to accept your transaction`,
                            //     HttpStatus.BAD_REQUEST
                            // )
                        }
                    } else {
                        return false;
                        // throw new HttpException(
                        //     `We have not found our wallet in your transaction`,
                        //     HttpStatus.BAD_REQUEST
                        // )
                    }

                } else {
                    return false;
                    // throw new HttpException(
                    //     `wrong hash check and try again`,
                    //     HttpStatus.BAD_REQUEST
                    // )
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                            updateInvoice.state = true;
                            this.alycoinInvoiceService.update(updateInvoice);

                            let getDetailByInvoice = await this.detailalycoininvoiceservice.getDetailByNumfact(invoice);
                            let getOnlyDetail = await this.detailalycoininvoiceservice.getById(getDetailByInvoice.id);
                            getOnlyDetail.walletAly = walletAly;
                            this.detailalycoininvoiceservice.update(getOnlyDetail);

                            let hasconfirmedinput = new HashConfirmedInput();
                            hasconfirmedinput.invoiceId = invoice;
                            hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                            hasconfirmedinput.hash = hash;
                            this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                            this.sendInvoiceAlypayByEmail(getDetailInvoice.receiveCurrency.name, user.email, `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/${hash}`, hash, user.firstname, user.lastname, invoice, packageA.name, getDetailInvoice.amountCrypto, parseFloat(getDetailInvoice.total.toString()), parseFloat(getDetailInvoice.priceCryptoUSD.toString()), date, getDetailInvoice.amountSendAlycoin, datecountry[0].country, walletAly)
                            return true;
                        } else {
                            return false;
                            // throw new HttpException(
                            //     'you did not send the amount necessary to accept your transaction',
                            //     HttpStatus.BAD_REQUEST
                            // )
                        }
                    } else {
                        return false;
                        // throw new HttpException(
                        //     'We have not found our wallet in your transaction',
                        //     HttpStatus.BAD_REQUEST
                        // )
                    }

                } else {
                    return false;
                    // throw new HttpException(
                    //     'wrong hash check and try again',
                    //     HttpStatus.BAD_REQUEST
                    // )
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                            updateInvoice.state = true;
                            this.alycoinInvoiceService.update(updateInvoice);

                            let getDetailByInvoice = await this.detailalycoininvoiceservice.getDetailByNumfact(invoice);
                            let getOnlyDetail = await this.detailalycoininvoiceservice.getById(getDetailByInvoice.id);
                            getOnlyDetail.walletAly = walletAly;
                            this.detailalycoininvoiceservice.update(getOnlyDetail);

                            let hasconfirmedinput = new HashConfirmedInput();
                            hasconfirmedinput.invoiceId = invoice;
                            hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                            hasconfirmedinput.hash = hash;
                            this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                            this.sendInvoiceAlypayByEmail(getDetailInvoice.receiveCurrency.name, user.email, `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/${hash}`, hash, user.firstname, user.lastname, invoice, packageA.name, getDetailInvoice.amountCrypto, parseFloat(getDetailInvoice.total.toString()), parseFloat(getDetailInvoice.priceCryptoUSD.toString()), date, getDetailInvoice.amountSendAlycoin, datecountry[0].country, walletAly)
                            return true;
                        } else {
                            return false;
                            // throw new HttpException(
                            //     'you did not send the amount necessary to accept your transaction',
                            //     HttpStatus.BAD_REQUEST
                            // )
                        }
                    } else {
                        return false;
                        // throw new HttpException(
                        //     'We have not found our wallet in your transaction',
                        //     HttpStatus.BAD_REQUEST
                        // )
                    }

                } else {
                    return false;
                    // throw new HttpException(
                    //     'wrong hash check and try again',
                    //     HttpStatus.BAD_REQUEST
                    // )
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
                        if (arraymi.includes(getDetailInvoice.amountCrypto.toString())) {
                            let updateInvoice = await this.alycoinInvoiceService.getByNumFact(invoice);
                            updateInvoice.state = true;
                            this.alycoinInvoiceService.update(updateInvoice);

                            let getDetailByInvoice = await this.detailalycoininvoiceservice.getDetailByNumfact(invoice);
                            let getOnlyDetail = await this.detailalycoininvoiceservice.getById(getDetailByInvoice.id);
                            getOnlyDetail.walletAly = walletAly;
                            this.detailalycoininvoiceservice.update(getOnlyDetail);

                            let hasconfirmedinput = new HashConfirmedInput();
                            hasconfirmedinput.invoiceId = invoice;
                            hasconfirmedinput.urlCheck = `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/`;
                            hasconfirmedinput.hash = hash;
                            this.hashconfirmedservice.regiterHash(hasconfirmedinput);
                            this.sendInvoiceAlypayByEmail(getDetailInvoice.receiveCurrency.name, user.email, `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/${hash}`, hash, user.firstname, user.lastname, invoice, packageA.name, getDetailInvoice.amountCrypto, parseFloat(getDetailInvoice.total.toString()), parseFloat(getDetailInvoice.priceCryptoUSD.toString()), date, getDetailInvoice.amountSendAlycoin, datecountry[0].country, walletAly)
                            return true;
                        } else {
                            return false;
                            // throw new HttpException(
                            //     "you did not send the amount necessary to accept your transaction",
                            //     HttpStatus.BAD_REQUEST
                            // )
                        }
                    } else {
                        return false;
                        // throw new HttpException(
                        //     "We have not found our wallet in your transaction",
                        //     HttpStatus.BAD_REQUEST
                        // )
                    }

                } else {
                    return false;
                    // throw new HttpException(
                    //     "We have not found our wallet in your transaction",
                    //     HttpStatus.BAD_REQUEST
                    // )
                }
                break
            default:
                return false;
            // throw new HttpException(
            //     "select an available method",
            //     HttpStatus.BAD_REQUEST
            // )
        }

    }

    private async sendInvoiceRechargeCryptoByEmail(nameCrypto: string, email: string, hash: string, hashtxt: string, name: string, lastname: string, invoicenumber: number, packageName: string, amountCrypto: number, amountReal: number, priceUSD: number, date: Date, country: string, ) {
        this.mailerservice.sendMail({
            to: `${email}, gerencia@alysystem.com`,
            from: 'Alypay <gerencia@alysystem.com>',
            subject: 'Has recibido factura por recarga en alypay',
            template: 'sendInvoiceRechargeAlypay',
            context: {
                hashtxt: hashtxt,
                hash: hash,
                name: name,
                lastname: lastname,
                invoiceNumber: invoicenumber,
                date: date,
                package: packageName,
                amountCrypto: amountCrypto,
                amountReal: amountReal.toLocaleString('en-IN', { style: 'currency', currency: 'USD' }),
                nameCrypto: nameCrypto,
                priceUSD: priceUSD.toLocaleString('en-IN', { style: 'currency', currency: 'USD' }),
                country: country
            }
        }).then(result => {
            if (result) {
                return true;
            }
            return false;
        });
    }

    private async sendInvoiceRechargeAccountDriverByEmail(nameCrypto: string, email: string, hash: string, hashtxt: string, name: string, lastname: string, invoicenumber: number, packageName: string, amountCrypto: number, depositLocal: number, amountReal: number, priceUSD: number, date: Date, country: string, ) {
        this.mailerservice.sendMail({
            to: `${email}, gerencia@alysystem.com`,
            from: 'Alypay <gerencia@alysystem.com>',
            subject: 'Has recibido factura por recarga en alypay',
            template: 'sendInvoiceRechargeDriveAlypay',
            context: {
                hashtxt: hashtxt,
                hash: hash,
                name: name,
                lastname: lastname,
                invoiceNumber: invoicenumber,
                date: date,
                package: packageName,
                amountCrypto: amountCrypto,
                amountLocal: depositLocal,
                amountReal: amountReal.toLocaleString('en-IN', { style: 'currency', currency: 'USD' }),
                nameCrypto: nameCrypto,
                priceUSD: priceUSD.toLocaleString('en-IN', { style: 'currency', currency: 'USD' }),
                country: country
            }
        }).then(result => {
            if (result) {
                return true;
            }
            return false;
        });
    }

    private async sendInvoiceAlypayByEmail(nameCrypto: string, email: string, hash: string, hashtxt: string, name: string, lastname: string, invoicenumber: number, packageName: string, amountCrypto: number, amountReal: number, priceUSD: number, date: Date, amountAly: number, country: string, alyWallet: string) {
        this.mailerservice.sendMail({
            to: `${email}, gerencia@alysystem.com`,
            from: 'Alycoin <gerencia@alysystem.com>',
            subject: 'Has recibido factura por tu compra en alyskiper',
            template: 'sendInvoiceBuyAlycoin',
            context: {
                hashtxt: hashtxt,
                sendwallet: alyWallet,
                hash: hash,
                name: name,
                lastname: lastname,
                invoiceNumber: invoicenumber,
                date: date,
                package: packageName,
                amountCrypto: amountCrypto,
                amountReal: amountReal.toLocaleString('en-IN', { style: 'currency', currency: 'USD' }),
                nameCrypto: nameCrypto,
                priceUSD: priceUSD.toLocaleString('en-IN', { style: 'currency', currency: 'USD' }),
                cantAly: (amountAly / 100000000),
                country: country
            }
        }).then(result => {
            if (result) {
                return true;
            }
            return false;
        });
    }

    private async getTransactionType(code: string): Promise<TransactionType> {
        return await createQueryBuilder(TransactionType, "TransactionType")
            .where("TransactionType.code = :code", { code })
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

    private async getWalletsByEmailUser(email: string, crypto: string) {
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


    async registerDeposit(id: number, idtransaction: number, idpayment_method: number, deposit: number, depositCrypto: number, is_user: boolean, description: string, getDetailInvoice?, packageA?, user?, hash?, date?, datecountry?, invoice?) {
        try {
            let result;
            let wallet = await this.repository.findOneOrFail({ id });
            if (is_user) {
                result = await this.walletDepositTransactionCryptoCurrency(wallet, depositCrypto, idtransaction, idpayment_method, description);
                if (result) {
                    this.sendInvoiceRechargeCryptoByEmail(getDetailInvoice.receiveCurrency.name, user.email, `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/${hash}`, hash, user.firstname, user.lastname, invoice, packageA.name, getDetailInvoice.amountCrypto, parseFloat(getDetailInvoice.total.toString()), parseFloat(getDetailInvoice.priceCryptoUSD.toString()), date, datecountry[0].country);
                    return await this.getById(result.id);
                }
            } else {
                result = await this.walletDepositTransactionLocalCurrency(wallet, deposit, idtransaction, idpayment_method, description);
                if (result) {
                    this.sendInvoiceRechargeAccountDriverByEmail(getDetailInvoice.receiveCurrency.name, user.email, `https://live.blockcypher.com/${getDetailInvoice.receiveCurrency.iso.toLowerCase()}/tx/${hash}`, hash, user.firstname, user.lastname, invoice, packageA.name, getDetailInvoice.amountCrypto, deposit, parseFloat(getDetailInvoice.total.toString()), parseFloat(getDetailInvoice.priceCryptoUSD.toString()), date, datecountry[0].country);
                    return await this.getById(result.id);
                }
            }
        } catch (error) {
            throw new HttpException('wallet is missing', HttpStatus.BAD_REQUEST);
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
        //   let result = await this.WithdrawalsorReversed(wallet, amount, idtransaction, idpayment_method, description);

        // if (result) {
        //     return await this.getById(result.id);
        // }
        // return result;

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
            walletHistory.amount = deposit;
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