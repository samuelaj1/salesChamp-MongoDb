const mongoose = require('mongoose');
const Address = mongoose.model('Address');
const NodeCache = require("node-cache");
const myCache = new NodeCache({stdTTL: 600});

var iso3311a2 = require('iso-3166-1-alpha-2')

const {
    addressValidation,
    patchAddressValidation
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

module.exports.addressList = function (req, res, next) {
    let content_type = req.headers['content-type'];
    if (content_type && content_type !== 'application/json') {
        // Send error here
        return res.status(415).json({
            status: false
        });
    } else {
        const key = 'address';
        const cachedResponse = myCache.get(key);
        if (cachedResponse) {
            // console.log(`cache hit for key ${key}`);
            return res.status(200).json(cachedResponse);
        }
            Address.find({}, function (err, address) {
                if (err) {
                    return res.status(400).json({
                        status: false,
                        message: err.message,
                    });
                }
                let address_data = address.map(function (ad) {
                    return {
                        id: ad._id,
                        country: ad.country,
                        city: ad.city,
                        street: ad.street,
                        postalcode: ad.postalcode,
                        number: ad.number,
                        numberAddition: ad.numberAddition,
                        createdAt: ad.createdAt,
                        updatedAt: ad.updatedAt,
                        status: ad.status,
                        name: ad.name,
                        email: ad.email
                    }
                });
                myCache.set(key, {
                    message: "successfully retrieved all addresses",
                    status: true,
                    data: address_data
                }, 300);
                return res.status(200).json({
                    message: "successfully retrieved all addresses",
                    status: true,
                    data: address_data
                });

            })



    }

};

module.exports.getAddressById = function (req, res, next) {
    let content_type = req.headers['content-type'];
    if (content_type && content_type !== 'application/json') {
        // Send error here
        return res.status(415).json({
            status: false
        });
    } else {
        const {id} = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            return res.status(404).json({
                status: false,
                message: "Address Id is invalid"
            });
        }
        const cachedResponse = myCache.get('address');
        if (cachedResponse) {
            // console.log(`cache hit for key`);
            return res.status(200).json(cachedResponse);
        }
        Address.findById(id)
            .exec((err, address) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (address) {
                    let address_data = {
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
                    };
                    myCache.set('address', {
                        message: "successfully retrieved all addresses",
                        status: true,
                        data: address_data
                    }, 300);
                    return res.status(200).json({
                        message: "Successfully retrieved address",
                        status: true,
                        data: address_data
                    });
                } else {
                    return res.status(404).json({
                        status: false,
                        message: "Address not found",

                    });
                }

            })
    }

};
module.exports.updateAddress = function (req, res, next) {
    let content_type = req.headers['content-type'];
    if (content_type && content_type !== 'application/json') {
        // Send error here
        return res.status(415).json({
            status: false
        });
    } else {
        const {id} = req.params;
        const {status, name, email} = req.body;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            return res.status(404).json({
                status: false,
                message: "Address Id is invalid"
            });
        }

        const {error} = patchAddressValidation(
            {status, name, email}
        );

        if (error) {
            return res.status(422).json({
                success: false,
                message: error.details[0].message,
            });
        }

        Address
            .findById(id)
            .exec((err, address) => {
                if (err) {
                    return res.status(404).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (!address) {
                    return res.status(404).json({
                        success: false,
                        message: 'Address not found',
                    });
                }
                if (status === 'not interested' || status === 'interested') {
                    return res.status(403).json({
                        success: false,
                        message: 'Action cannot be completed because status selected was "' + status + '"',
                    });
                }

                address.status = status ? status : address.status;
                address.email = email ? email : address.email;
                address.name = name ? name : address.name;
                address.updatedAt = new Date().toISOString();

                address.save((err, addr) => {
                    if (err) {
                        return res.status(404).json({
                            success: false,
                            message: err.message,
                        });
                    } else {
                        myCache.flushAll();
                        // res.set('Last-Modified', new Date());
                        // res.set('Content-Type', 'application/json');

                        return res.status(200).json({
                            message: "Address has been updated successfully",
                            status: true,
                            data: {
                                id: addr._id,
                                country: addr.country,
                                city: addr.city,
                                street: addr.street,
                                postalcode: addr.postalcode,
                                number: addr.number,
                                numberAddition: addr.numberAddition,
                                createdAt: addr.createdAt,
                                updatedAt: addr.updatedAt,
                                status: addr.status,
                                name: addr.name,
                                email: addr.email
                            }
                        });
                    }
                });


            })

    }

};


module.exports.deleteAddressById = function (req, res, next) {
    let content_type = req.headers['content-type'];
    if (content_type && content_type !== 'application/json') {
        // Send error here
        return res.status(415).json({
            status: false
        });
    } else {
        const {id} = req.params;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            return res.status(404).json({
                status: false,
                message: "Address Id is invalid"
            });
        }
        //validating id
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Address id is required",
                type: "error",
            });
        }

        Address
            .findByIdAndRemove(id, {
                useFindAndModify: false
            })
            .exec((err, address) => {
                if (err) {
                    return res.status(409).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (address) {
                    myCache.flushAll();
                    return res.status(204).json({});
                } else {
                    return res.status(404).json({
                        status: false,
                        message: "Address cannot be found"
                    });
                }

            });
    }

};


