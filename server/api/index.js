
const express = require('express');
const router = express.Router();

const Controller = require('./controller')

router.post("/checkout", (req, res) => {
    Controller.checkout(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    })
});

router.post("/webhook", (req, res) => {
    Controller.webhook(req.body).then(result => {
        return res.status(200).json({result: result, status: true})
    })
});

module.exports = router;
