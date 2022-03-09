
const Flutterwave = require('flutterwave-node-v3');

const sdk = require('api')('@coinbase-exchange/v1.0#10ldz4jl0h5qqgo');

require('dotenv').config();
const Transaction = require("../models/Transaction");

const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

const auth = {
    apiKey: process.env.COINBASE_API_KEY,
    apiSecret: process.env.COINBASE_SECRET_KEY,
    passphrase: process.env.COINBASE_PHRASE,
    useSandbox: true,
};
const {CoinbasePro} = require('coinbase-pro-node');
const client = new CoinbasePro(auth);


class Controller {
    
    async checkout(req) {
        var address = req.address;
        var coin = req.coin;
        var email = req.email;
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

        if (paypal === '') {
            details = {
                "email": email,
                "card_number":cardNumber.replaceAll(' ', ''),
                "cvv":cvc,
                "expiry_month":expiryDate[0],
                "expiry_year":expiryDate[1],
                "currency":"USD",
                "amount":amount,
                "tx_ref":"MC-"+Date.now(),
                "redirect_url":"http://localhost:8001/api/webhook",
                "enckey": process.env.FLUTTERWAVE_ENCRYPTION_KEY,
             };
            console.log('charge detail', details);
        } else {
            details = {
                "currency":"USD",
                "amount":amount,
                "email":paypal,
                "tx_ref":"MC-"+Date.now(),
                "enckey": process.env.FLUTTERWAVE_ENCRYPTION_KEY,
             };
        }
        try {
            const res = await flw.Charge.card(details);
            if(res['status'] === 'success') {
                const record = new Transaction({
                    coin: coin,
                    wallet: address,
                    method: method,
                    source: paypal !== '' ? paypal : cardNumber,
                    amount: amount,
                    txRef: '',
                    txnId: res['data'] !== undefined ? res['data']['id']: ''
                });
                
                const transaction = await record.save().then(result => {
                    return result;
                });
    
                return res;
            } else {
                throw res['message'];
            }
            

        } catch (error) {
            console.log('charge issue', error);
            throw error;
        }
        
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
                    payable = amount / res['prices'['ETH']];
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
