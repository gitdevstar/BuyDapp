
const express = require('express');
const router = express.Router();

const Controller = require('./controller')

router.post("/checkout", (req, res) => {
    Controller.checkout(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    }).catch(e => {
        return res.status(200).json({result: e, status: false})
    });
});

router.post("/webhook", (req, res) => {
    Controller.webhook(req.body).then(result => {
        console.log('flutterwave webhook', result);
    });
});

module.exports = router;
