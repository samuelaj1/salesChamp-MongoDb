const mongoose = require('mongoose');
const Address = mongoose.model('Address');

module.exports.addressCreate = function (req, res, next) {
    let content_type = req.headers['content-type'];
    if (content_type && content_type !== 'application/json') {
        // Send error here
        return res.status(415).json({
            status: false
        });
    } else {
        const {name} = req.body;
        Address
            .create({
                name: name,
            }, (err, address) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                } else {
                    return res.status(200).json({
                        message: "Successfully created address",
                        status: true,
                        data: {
                            id: address._id,
                            name: address.name,
                            created_at: address.created_at
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
                    name: ad.name,
                    created_at: ad.created_at
                }
            });
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
        Address.findById(id)
            .exec((err, address) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (address) {
                    return res.status(200).json({
                        message: "Successfully retrieved address",
                        status: true,
                        data: {
                            id: address._id,
                            name: address.name,
                            created_at: address.created_at
                        }
                    });
                } else {
                    return res.status(400).json({
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
        const {name} = req.body;

        if (!name) {
            return res.status(400).json({
                status: false,
                message: "Name field is required"
            });
        }

        Address.findByIdAndUpdate(id, {
            name: name,
        }, {
            new: true
        }, (err, address) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
            if (!address) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
            return res.status(200).json({
                message: "Address has been updated successfully",
                status: true,
                data: {
                    id: address._id,
                    name: address.name,
                    created_at: address.created_at
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
        //validating id
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Address id is required",
                type: "error",
            });
        }

        Address
            .findByIdAndRemove(id)
            .exec((err, address) => {
                console.log(address)
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message,
                    });
                }
                if (address) {
                    return res.status(200).json({
                        message: "Address has been deleted successfully",
                        status: true
                    });
                } else {
                    return res.status(400).json({
                        status: false,
                        message: "Address cannot be found"
                    });
                }

            });
    }

};


