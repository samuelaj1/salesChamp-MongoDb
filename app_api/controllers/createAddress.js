const mongoose = require('mongoose');
const Address = mongoose.model('Address');
const NodeCache = require("node-cache");
const myCache = new NodeCache({stdTTL: 600});

var iso3311a2 = require('iso-3166-1-alpha-2')

const {
    addressValidation
} = require("../../validation");


module.exports.addressCreate = function (req, res, next) {
    let content_type = req.headers['content-type'];
    if (content_type && content_type !== 'application/json') {
        // Send error here
        return res.status(415).json({
            status: false
        });
    } else {
        const {country, city, street, postalcode, number, numberAddition} = req.body;
        let country_codes = iso3311a2.getCodes();
        if (country) {
            let code_found = country_codes.indexOf(country);
            if (code_found === -1) {
                return res.status(422).json({
                    success: false,
                    message: 'Enter a valid country code',
                });
            }
        } else {
            return res.status(422).json({
                success: false,
                message: 'Country field is required',
            });
        }


        const {error} = addressValidation(
            {city, street, postalcode, number, numberAddition}
        );

        if (error) {
            return res.status(422).json({
                success: false,
                message: error.details[0].message,
            });
        }

        Address
            .create({
                country: country,
                city: city,
                street: street,
                postalcode: postalcode,
                number: number,
                numberAddition: numberAddition
            }, (err, address) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                } else {
                    myCache.flushAll();
                    res.set('location', 'https://sales-champ-mongo-db.herokuapp.com/address');
                    return res.status(201).json({
                        message: "Successfully created address",
                        status: true,
                        data: {
                            id: address._id,
                            country: address.country,
                            city: address.city,
                            street: address.street,
                            postalcode: address.postalcode,
                            number: address.number,
                            numberAddition: address.numberAddition,
                            createdAt: address.createdAt,
                            updatedAt: address.updatedAt,
                            status: address.status,
                            name: address.name,
                            email: address.email
                        }
                    });
                }
            });

    }

};




