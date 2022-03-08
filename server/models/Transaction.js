const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TransactionSchema = new Schema({
    id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    wallet: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    txnId: {
        type: String,
    },
    date: {
        type: String,
        default: moment().format('YYYY-MM-DD')
    },
});

var Transaction = mongoose.model("Transactions", TransactionSchema);

module.exports =  Transaction;