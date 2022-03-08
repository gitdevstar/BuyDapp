const Transaction = require("../models/Transaction");

const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(PUBLIC_KEY, SECRET_KEY);

import {CoinbasePro} from 'coinbase-pro-node';
const auth = {
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    // The Sandbox is for testing only and offers a subset of the products/assets:
    // https://docs.pro.coinbase.com/#sandbox
    useSandbox: true,
};
const client = new CoinbasePro(auth);

const sdk = require('api')('@coinbase-exchange/v1.0#10ldz4jl0h5qqgo');

class Controller {
    
    async checkout(req) {
        var address = req.address;
        var coin = req.coin;
        var amount = req.amount;
        var cardNumber = req.cardNumber;
        var expiry = req.expiry;
        var cvc = req.cvc;
        var paypal = req.paypal;
        var method = '';
        if (paypal !== '') method = 'Paypal';
        else method = 'Card'; 

        var details = null;

        var expiryDate = expiry.split(' / ');

        if (paypal !== '') {
            details = {
                "card_number":cardNumber,
                "cvv":cvc,
                "expiry_month":expiryDate[0],
                "expiry_year":expiryDate[1],
                "currency":"USD",
                "amount":amount,
                "tx_ref":"MC-3243e",
                "redirect_url":"https://www,flutterwave.ng"
             };
        } else {
            details = {
                "currency":"USD",
                "amount":amount,
                "email":paypal,
                "tx_ref":"MC-3243e",
             };
        }
        const res = await flw.Charge.card(details);
        
        await Transaction.findOne({_id: 0}).then(record => {
            if(!record) {
                record = new Transaction({
                    coin: coin,
                    wallet: address,
                    method: method,
                    source: paypal !== '' ? paypal : cardNumber,
                    amount: amount,
                    txRef: '',
                    txnId: res['data'] !== undefined ? res['data']['id']: ''
                });
                
                return record.save().then(result => {
                    return true;
                });
            }
        });

        return res;
        
    }
    
    async webhook(req) {
        const event = req['event'];
        if (event === 'charge.completed') {
            const data = req['data'];
            const amount = data['amount'];
            const txnId = data['id'];

            const transaction = await Transaction.findOne({txnId: txnId}).then(record => {
                return record;
            });
            var payable = 0.0;
            if (transaction['coin'] === 'eth') {
                await sdk['ExchangeRESTAPI_GetCoinbasePriceOracle']()
                .then(res => {
                    payable = amount / res;
                })
                .catch(err => console.error(err));
            } else {
                payable = amount;
            }

            return client.rest.withdraw.withdrawToCryptoAddress(payable, transaction['coin'], transaction['wallet'], '', true);
        }
    }
}
module.exports = new Controller()
