const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    postalcode: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    numberAddition: {
        type: String,
        default:''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: null
    },
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    }
});

mongoose.model('Address', AddressSchema);