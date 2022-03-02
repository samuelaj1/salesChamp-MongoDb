const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Address', AddressSchema);