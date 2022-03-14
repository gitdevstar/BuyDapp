require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);
const sdk = require('api')('@coinbase-exchange/v1.0#10ldz4jl0h5qqgo');

class Controller {

    async checkout(req) {
        const amount = req.amount;
        const coin = req.coin;
        const wallet = req.wallet;
        var payable = 0.0;
            if (coin === 'eth') {
                await sdk['ExchangeRESTAPI_GetCoinbasePriceOracle']()
                .then(res => {
                    payable = amount / res['prices'['ETH']];
                })
                .catch(err => console.error(err));
            } else {
                payable = amount;
            }

        return client.rest.withdraw.withdrawToCryptoAddress(payable, coin, wallet, 'buy', true);
    }

    async onBoradLink(req) {
        try {
            var accountId = req.account;
            if ( accountId === null || accountId === undefined) {
                const account = await stripe.accounts.create({ type: 'custom' });
                accountId = account.id;
            }
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: 'http://localhost/refresh',
                return_url: 'http://localhost/return',
                type: 'account_onboarding',
            });
            accountLink['id'] = accountId;
            return accountLink;
        } catch (e) {
            throw e;
        }
    }

    async paymentSheet(req) {
        const amount = req.amount;
        var customerId = req.customer;
        const account = req.account;

        try {
            if (customerId === null) {
                const customer = await stripe.customers.create();
                customerId = customer.id;
            }
            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: customerId },
                { apiVersion: '2020-08-27' }
            );
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency: 'usd',
                customer: customerId,
                // automatic_payment_methods: {
                //     enabled: true,
                // },
                payment_method_types: ['card', 'sepa_debit'],
                application_fee_amount: amount * 0.1,
                transfer_data: {
                    destination: account,
                },
            });
    
            const rest = {
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: customerId,
                publishableKey: process.env.STRIPE_PUB_KEY
            };
            return rest;
        } catch (e) {
            throw e;
        }
    }

    async webhook(req) {
    }
}
module.exports = new Controller()