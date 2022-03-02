const mongoose = require('mongoose');
const Publisher = mongoose.model('Publisher');



function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}



module.exports.publishersList = function(req, res, next) {
    let userid = req.query.userid;
    let query = {};
    if (userid) query.user = userid;
    Publisher
        .find(query)
        .populate("user")
        .exec((err, result) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 400, err);
                return;
            } else if (!result) {
                console.warn("No publishers found");
                sendJsonResponse(res, 404, {
                    "message": "No publishers found"
                });
                return;
            }
            let publishers = [];
            result.forEach(doc => {
                publishers.push({
                    id: doc._id,
                    content_type: doc.content_type,
                    user: doc.user,
                    phone: doc.phone,
                    website: doc.website,
                    verified: doc.verified
                });
            });
            console.log("Publishers retrieved");
            sendJsonResponse(res, 200, publishers);
        });
};

module.exports.savePricingOptions = function(req, res, next) {
    console.log(req.body.publisher_id,req.body.prices);

    if (!req.body.publisher_id) {
        sendJsonResponse(res, 404, {
            "message": "Not found, publisherid is required"
        });
        return;
    }

    Publisher.findByIdAndUpdate(req.body.publisher_id, {
        prices:req.body.prices,
    }, {
        new: true
    }, (err, publisher) => {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else if (!publisher) {
            sendJsonResponse(res, 404, {
                "error": "publisher id not found"
            });
            return;
        }
        sendJsonResponse(res, 200, {success:true, publisher:publisher});
    })

    
};

module.exports.publishersCreate = function(req, res, next) {
    if (req.body) {
        Publisher
            .create({
                content_type: req.body.content_type,
                user: req.body.userid,
                phone: req.body.phone,
                website: req.body.website
            }, (err, publisher) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 400, err);
                } else {
                    console.log("Publisher added");
                    sendJsonResponse(res, 201, publisher);
                }
            });
    } else {
        console.error("No body in request");
        sendJsonResponse(res, 404, {
            "message": "No body in request"
        });
    }
};

module.exports.publishersReadOne = function(req, res, next) {
    if (req.params && req.params.publisherid) {
        Publisher
            .findById(req.params.publisherid)
            .populate("user")
            .exec((err, publisher) => {
                if (!publisher) {
                    console.warn("publisherid not found");
                    sendJsonResponse(res, 404, {
                        "message": "publisherid not found"
                    });
                    return;
                } else if (err) {
                    console.error(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                console.log("publisherid found");
                sendJsonResponse(res, 200, publisher);
            });
    } else {
        console.log("No publisherid in request");
        sendJsonResponse(res, 404, {
            "message": "No publisherid in request"
        });
    }
};

module.exports.publishersUpdateOne = function(req, res, next) {
    if (!req.params.publisherid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, publisherid is required"
        });
        return;
    }
    Publisher
        .findById(req.params.publisherid)
        .populate('user', "username photo")
        .exec((err, publisher) => {
            if (!publisher) {
                sendJsonResponse(res, 404, {
                    "message": "publisherid not found"
                });
                
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            // console.log(req.body);
            // console.log(req);
            // console.log(req.file);

            
            publisher.private_key = req.body.private_key ? req.body.private_key : publisher.private_key;
            publisher.content_type = req.body.content_type ? req.body.content_type : publisher.content_type;
            publisher.frequency = req.body.frequency ? req.body.frequency : publisher.frequency;
            publisher.verified = req.body.verified ? req.body.verified : publisher.verified;
            publisher.phone = req.body.phone ? req.body.phone : publisher.phone;
            publisher.website = req.body.website ? req.body.website : req.body.website;
            publisher.name = req.body.name ? req.body.name : publisher.name;
            publisher.photo = req.file ? process.env.host+req.file.path : publisher.photo;
            publisher.payment_details.bank =  req.body.bank ? req.body.bank : publisher.payment_details.bank;
            publisher.payment_details.account_name =  req.body.account_name ? req.body.account_name : publisher.payment_details.account_name;
            publisher.payment_details.account_number =  req.body.account_number ? req.body.account_number : publisher.payment_details.account_number;

            publisher.save((err, publisher) => {
                if (err) {
                    sendJsonResponse(res, 422, err);
                } else {
                    sendJsonResponse(res, 200, {success :true,publisher:publisher});
                }
            });
        });
};

module.exports.publishersDeleteOne = function(req, res, next) {};