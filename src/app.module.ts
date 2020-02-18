import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import 'dotenv/config';

import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { AppController } from './app.controller';

//Modulos
import { KindTicketModule } from './mapping/kind-ticket/kind-ticket.module';
import { TicketCategoryModule } from './mapping/ticket-category/ticket-category.module';
import { TicketPriorityModule } from './mapping/ticket-priority/ticket-priority.module';
import { TicketStatusModule } from './mapping/ticket-status/ticket-status.module';
import { SupportTicketModule } from './mapping/support-ticket/support-ticket.module';
import { SkiperOrderModule } from './mapping/skiper-order/skiper-order.module';
import { SkiperOrderDetailModule } from './mapping/skiper-order-detail/skiper-order-detail.module';

import { CategoryAgentModule } from './mapping/category-agent/category-agent.module';
import { SkiperAgentModule } from './mapping/skiper-agent/skiper-agent.module';
import { SkiperCommerceModule } from './mapping/skiper-commerce/skiper-commerce.module';
import { UsersModule } from './mapping/users/users.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { CountriesModule } from './mapping/countries/countries.module';
import { CitiesModule } from './mapping/cities/cities.module';
import { SkiperCatCommerceModule } from './mapping/skiper-cat-commerce/skiper-cat-commerce.module';
import { SkiperCatProductCommerceModule } from './mapping/skiper-cat-product-commerce/skiper-cat-product-commerce.module';
import { SkiperProductCommerceModule } from './mapping/skiper-product-commerce/skiper-product-commerce.module';
import { SizeProductModule } from './mapping/size-product/size-product.module';
import { OptionAddonModule } from './mapping/option-addon/option-addon.module';
import { CommerceRolModule } from './mapping/commerce-rol/commerce-rol.module';
import { UserCommerceRolesModule } from './mapping/user-commerce-roles/user-commerce-roles.module';
import { CommerceModulesModule } from './mapping/commerce-modules/commerce-modules.module';
import { CommerceOperationsModule } from './mapping/commerce-operations/commerce-operations.module';
import { RolOperationModule } from './mapping/rol-operation/rol-operation.module';
import { AppsModule } from './mapping/apps/apps.module';
import { SkiperDriverScheduleModule } from './mapping/skiper-driver-schedule/skiper-driver-schedule.module';
import { SkiperOrderTracingModule } from './mapping/skiper-order-tracing/skiper-order-tracing.module';
import { UserCivilStatusModule } from './mapping/user-civil-status/user-civil-status.module';
import { AppCitiesModule } from './mapping/app-cities/app-cities.module';
import { SkiperVehicleModule } from './mapping/skiper-vehicle/skiper-vehicle.module';
import { SkiperVehicleAgentModule } from './mapping/skiper-vehicle-agent/skiper-vehicle-agent.module';
import { UsersAddressModule } from './mapping/users-address/users-address.module';
import { CatPlacesUsersModule } from './mapping/cat-places-users/cat-places-users.module';
import { SkiperTravelsModule } from './mapping/skiper-travels/skiper-travels.module';
import { SkiperTravelsTracingModule } from './mapping/skiper-travels-tracing/skiper-travels-tracing.module';
import { SkiperTravelsStatusModule } from './mapping/skiper-travels-status/skiper-travels-status.module';
import { SkiperSubCatCommercesModule } from './mapping/skiper-sub-cat-commerces/skiper-sub-cat-commerces.module';
import { SkiperCommerceFavoritesModule } from './mapping/skiper-commerce-favorites/skiper-commerce-favorites.module';
import { SkiperWalletModule } from './mapping/skiper-wallet/skiper-wallet.module';
import { CurrencyModule } from './mapping/currency/currency.module';
import { SkiperWalletsHistoryModule } from './mapping/skiper-wallets-history/skiper-wallets-history.module';
import { PaymentMethodsModule } from './mapping/payment-methods/payment-methods.module';
import { TransactionTypeModule } from './mapping/transaction-type/transaction-type.module';
import { UsersCommissionsModule } from './mapping/users-commissions/users-commissions.module';
import { CategoryLevelModule } from './mapping/category-level/category-level.module';
import { CountryPaymentCurrencyModule } from './mapping/country-payment-currency/country-payment-currency.module';
import { PaymentCryptoCurrencyModule } from './mapping/payment-crypto-currency/payment-crypto-currency.module';
import { SkiperRatingModule } from './mapping/skiper-rating/skiper-rating.module';
import { ExecutiveCommissionsModule } from './mapping/executive-commissions/executive-commissions.module';
import { SkiperUserInvoiceModule } from './mapping/skiper-user-invoice/skiper-user-invoice.module';
import { SkiperInvoiceDetailModule } from './mapping/skiper-invoice-detail/skiper-invoice-detail.module';
import { WalletscompaniesModule } from './mapping/walletscompanies/walletscompanies.module';
import { PackageAlycoinModule } from './mapping/package-alycoin/package-alycoin.module';
import { AlycoinInvoicesModule } from './mapping/alycoin-invoices/alycoin-invoices.module';
import { DetailAlycoinInvoiceModule } from './mapping/detail-alycoin-invoice/detail-alycoin-invoice.module';
import { HashConfirmedModule } from './mapping/hash-confirmed/hash-confirmed.module';
import { ExchangeRateModule } from './mapping/exchange-rate/exchange-rate.module';
import { UsersRatingModule } from './mapping/users-rating/users-rating.module';
import { AppGateway } from './app.gateway';
import { UploadImgAgentModule } from './mapping/upload-img-agent/upload-img-agent.module';
import { UploadVehicleAppearanceModule } from './mapping/upload-vehicle-appearance/upload-vehicle-appearance.module';
import { from } from 'rxjs';
import { UploadimagebannerModule } from './mapping/uploadimagebanner/uploadimagebanner.module';
import { SkiperTariffsModule } from './mapping/skiper-tariffs/skiper-tariffs.module';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { PackageAlypayRechargeModule } from './mapping/package-alypay-recharge/package-alypay-recharge.module';
import { BillingConceptModule } from './mapping/billing-concept/billing-concept.module';
import { UserwalletaddressModule } from './mapping/userwalletaddress/userwalletaddress.module';

// var multerGoogleStorage = require("multer-google-storage")

@Module({
  imports: [
    UploadVehicleAppearanceModule,
    UsersRatingModule,
    AppCitiesModule,
    KindTicketModule,
    TicketCategoryModule,
    TicketPriorityModule,
    TicketStatusModule,
    SupportTicketModule,
    SkiperOrderModule,
    SkiperOrderDetailModule,
    SharedModule,
    UsersModule,
    AuthModule,
    CountriesModule,
    CitiesModule,
    CategoryAgentModule,
    SkiperAgentModule,
    SkiperCommerceModule,
    SkiperCatCommerceModule,
    SkiperCatProductCommerceModule,
    SkiperProductCommerceModule,
    SizeProductModule,
    OptionAddonModule,
    CommerceRolModule,
    UserCommerceRolesModule,
    CommerceModulesModule,
    CommerceOperationsModule,
    RolOperationModule,
    AppsModule,
    SkiperDriverScheduleModule,
    SkiperOrderTracingModule,
    UserCivilStatusModule,
    SkiperVehicleModule,
    SkiperVehicleAgentModule,
    SkiperCommerceFavoritesModule,
    UsersCommissionsModule,
    CategoryLevelModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: 'smtp://info@alycoin.net:Rolas1.19@smtp.zoho.com',
        defaults: {
          from: '"nest-modules" <gerencia@alysystem.com>',
        },
        template: {
          dir: __dirname + '../../src/templates',
          adapter: new HandlebarsAdapter(), // or new PugAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // host: gpcloud,
      host: process.env.DATABASE_HOST,
      extra: {
        //socketPath: "/cloudsql/backend-alysystem:us-west2:alysystem-db" 
        connectionLimit: 50,
      },
      port: Number.parseFloat(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      logging: false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: true,
      // dropSchema: true
    }),
    GraphQLModule.forRoot({
      // autoSchemaFile: './schema.gql',
      typePaths: ['./**/*.graphql'],
      playground: true,
      introspection: true,
      // debug:true,
      installSubscriptionHandlers: true,
      context: async ({ req, connection }) => ({
        headers: connection ? null : req.headers
      }),
      subscriptions: {
        onConnect: (connectionParams, webSocket) => {
          console.log('Websocket CONNECTED');
          return { hello: 'world' }
        },
        onDisconnect: () => console.log('Websocket DISCONNECTED'),
      },
      formatError: (err) => {
        return ({
          message: err.extensions.exception.message,
          status: err.extensions.exception.status,
        })
      },
      cors: {
        "origin": "*",
        "Access-Control-Allow-Origin": "*"
      }
    }),
    UsersAddressModule,
    CatPlacesUsersModule,
    SkiperTravelsModule,
    SkiperTravelsTracingModule,
    SkiperTravelsStatusModule,
    SkiperSubCatCommercesModule,
    SkiperCommerceFavoritesModule,
    SkiperWalletModule,
    CurrencyModule,
    SkiperWalletsHistoryModule,
    PaymentMethodsModule,
    TransactionTypeModule,
    SkiperRatingModule,
    SkiperUserInvoiceModule,
    SkiperInvoiceDetailModule,
    WalletscompaniesModule,
    PackageAlycoinModule,
    AlycoinInvoicesModule,
    DetailAlycoinInvoiceModule,
    HashConfirmedModule,
    ExchangeRateModule,
    UploadImgAgentModule,
    UploadimagebannerModule,
    SkiperTariffsModule,
    PackageAlypayRechargeModule,
    BillingConceptModule,
    UserwalletaddressModule,    
    // ExecutiveCommissionsModule,
    //PaymentCryptoCurrencyModule,
    //CountryPaymentCurrencyModule,
  ],
  providers: [AppService, AppResolver, AppGateway],
  controllers: [AppController]
})
export class AppModule {
}