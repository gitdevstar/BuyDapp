
const express = require('express');
const router = express.Router();

const Controller = require('./stripeController')
const CoinBaseController = require('./coinbaseController')

router.post("/checkout", (req, res) => {
    CoinBaseController.checkout(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/payout", (req, res) => {
    CoinBaseController.payout(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/stripe/register/account", (req, res) => {
    Controller.registerAccount(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/stripe/update/account", (req, res) => {
    Controller.updateAccount(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/stripe/account/complete", (req, res) => {
    Controller.completeAccountWithBank(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/stripe/onboard-user", (req, res) => {
    Controller.onBoradLink(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/stripe/paymentSheet", (req, res) => {
    Controller.paymentSheet(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/webhook", (req, res) => {
    Controller.webhook(req.body).then(result => {
        console.log('stripe webhook', result);
    });
});

module.exports = router;
