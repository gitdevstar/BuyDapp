require('dotenv').config();
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
}
module.exports = new Controller()