const mongoose = require('mongoose');
const User = mongoose.model('User');
const Publisher = mongoose.model('Publisher');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const request = require('request');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

function generateToken(email, type) {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    let token = jwt.sign({
        email: email,
        type: type,
        // exp: parseInt(expiry.getTime() / 1000)
    }, process.env.JWT_SECRET);
    return token;
}

module.exports.sendmail = function (req, res, next) {
    let publisher = new Publisher();
    publisher.sendingEmail().then((info) => {
        sendJsonResponse(res, 201, info);
    }).catch(err => {
        sendJsonResponse(res, 400, err);

    });
}

function create_UUID() {
    var dt = new Date().getTime();
    var uuid = "xxx4xxyxx".replace(
        /[xy]/g,
        function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
}

module.exports.uploadImage = function (req, res, next) {
    console.log(req.body,req.params)
    return;
    const AWS = require("aws-sdk");
    if (req.body.file) {
        this.isLoading = true;
        let fileName = create_UUID() + req.body.file.name;
        const ID = 'AKIAJMJULVY4DJFP3E3Q';
        const SECRET = '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';
        const BUCKET_NAME = 'applicant-pictures';

        const s3 = new AWS.S3({
            accessKeyId: ID,
            secretAccessKey: SECRET
        });
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName, // File name you want to save as in S3
            Body: req.body.file,
            ContentType: req.body.file.type,
            ACL: 'public-read'
        };
        s3.upload(params, function (err, data) {
            if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            sendJsonResponse(res, 201, {
                "user": publisher,
                "token": publisher.token,
            });
        });
    }
}

module.exports.register = function (req, res, next) {
    if (req.body.password && req.body.email && req.body.accountType) {
        let fileArray = req.file ? req.file.path.split("/") : [];
        let filePath = req.file ? fileArray[fileArray.length - 2] + "/" + fileArray[fileArray.length - 1] : "";

        if (req.body.accountType == 'publisher') {
            let publisher = new Publisher();
            // publisher.username = req.body.username;
            publisher.name = "";
            publisher.photo = req.file ? filePath : "https://unsplash.com/photos/G9i_plbfDgk";
            publisher.email = req.body.email;
            publisher.phone = req.body.phone;
            publisher.setPassword(req.body.password);
            publisher.token = generateToken(req.body.email, 'publisher');
            publisher.secretcode = req.body.secretcode;
            publisher.account_type = req.body.accountType;
            publisher.save((err, publisher) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 401, err);
                } else {
                    console.debug("Saved new publisher");
                    let content = {
                        email: req.body.email,
                        subject: 'Newsbag Account Verification',
                        text: 'Thank you for registerign with Newsbag',
                        html: `<p>Please Enter ${publisher.secretcode} in app to verify your email address`
                    };
                    publisher.sendingEmail(content).then((info) => {}).catch(err => {
                        console.log(err)
                    });
                    sendJsonResponse(res, 201, {
                        "user": publisher,
                        "token": publisher.token,
                    });


                    // const payload = {
                    //     "id": publisher._id,
                    //     "username": publisher.username,
                    //     "iat": Date.now()
                    // };
                    // const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});

                    // publisher.sendEmail(content)
                    //     .then(() => {
                    //         const payload = {
                    //             "id": publisher._id,
                    //             "username": publisher.username,
                    //             "iat": Date.now()
                    //         };
                    //         // const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});
                    //         sendJsonResponse(res, 201, {
                    //             "user": publisher,
                    //             "token": publisher.token,
                    //         });
                    //     })
                    //     .catch((err) => {
                    //         console.log(err)
                    //         sendJsonResponse(res, 401, {
                    //             "message": "Email transport error"
                    //         });
                    //     });
                }
            });

        }

        if (req.body.accountType == 'reader') {
            console.debug("Creating new user");
            let user = new User();
            user.username = req.body.username;
            user.photo = req.file ? filePath : "";
            user.email = req.body.email;
            user.phone = req.body.phone;
            user.setPassword(req.body.password);
            user.token = generateToken(req.body.email, 'reader');
            user.secretcode = req.body.secretcode;
            user.account_type = req.body.accountType;
            user.save((err, user) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 401, err);
                } else {
                    console.debug("Saved new user");
                    let content = {
                        email: req.body.email,
                        subject: 'Newsbag Account Verification',
                        text: 'Thank you for registerign with Newsbag',
                        html: `<p>Please Enter ${user.secretcode} in app to verify your email address`
                    };
                    user.sendEmail(content)
                        .then(() => {
                            const payload = {
                                "id": user._id,
                                "username": user.username,
                                "iat": Date.now()
                            };
                            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                                expiresIn: '1d'
                            });
                            let postdata = {
                                userid: user._id
                            };
                            console.debug("Creating new account");
                            let path = `http://localhost:8080/api/${req.body.accountType + "s"}`;
                            let requestOptions = {
                                url: path,
                                method: "POST",
                                json: postdata,
                                auth: {
                                    "bearer": `${token}`
                                }
                            };
                            request(
                                requestOptions,
                                (err, response, body) => {
                                    if (response.statusCode === 201) {
                                        console.log("Created new account");
                                        sendJsonResponse(res, 201, {
                                            "user": user,
                                            "token": token,
                                            "account": body
                                        });
                                    } else if (err) {
                                        sendJsonResponse(res, 400, err);
                                    }
                                }
                            );
                        })
                        .catch((err) => {
                            sendJsonResponse(res, 401, {
                                "message": "Email transport error"
                            });
                        });
                }
            });
        }

    } else {
        sendJsonResponse(res, 404, {
            "message": "All fields are required"
        });
    }
};

module.exports.login = function (req, res, next) {
    passport.authenticate('local', {
        session: false
    }, (err, user, info) => {
        if (err) {
            console.debug("Error");
            console.error(info ? info.message : "Login failed");
            sendJsonResponse(res, 400, err);
            return;
        } else if (!user) {
            console.debug("No user");
            console.error(info ? info.message : "Login failed");
            sendJsonResponse(res, 404, {
                "message": info ? info.message : "Login failed"
            });
            return;
        }
        console.log(user)
        sendJsonResponse(res, 201, {
            "user": user
        });
    })(req, res);
};

module.exports.settings = function (req, res, next) {
    let {
        userid,
        author,
        content,
        title,
        frequency
    } = req.body;
    let price = [];
    if (frequency === 'monthly') {
        price = [{
                period: "2 months",
                amount: "0"
            },
            {
                period: "3 months",
                amount: "0"
            },
            {
                period: "6 months",
                amount: "0"
            },
            {
                period: "1 year",
                amount: "0"
            },
        ]
    } else if (frequency === 'quarterly') {
        price = [{
                period: "6 month",
                amount: "0"
            },
            {
                period: "1 year",
                amount: "0"
            },
        ]
    } else if (frequency === 'annually') {
        price = [{
            period: "1 year",
            amount: "0.00"
        }, ]
    }

    Publisher.findByIdAndUpdate(userid, {
        content_type: content.toLowerCase(),
        name: content.toLowerCase() == 'books' ? author : title,
        prices: price,
        frequency: content.toLowerCase() == 'books' ? '' : frequency
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
        sendJsonResponse(res, 200, publisher);
    })

}

module.exports.verify = function (req, res, next) {
    let {
        userid,
        secretcode,
        type
    } = req.params;
    if (type == "publisher") {
        Publisher
            .findById(userid, (err, user) => {
                if (err) {
                    console.error(err);
                    sendJsonResponse(res, 400, err);
                } else if (!user) {
                    console.error('userid not found');
                    sendJsonResponse(res, 404, {
                        "message": "userid not found"
                    });
                    return;
                }
                if (user.secretcode === secretcode && !user.verified) {
                    user.verified = true;
                    user.save((err, user) => {
                        if (err) {
                            console.error(err);
                            sendJsonResponse(res, 400, err);
                        } else {
                            // console.log(res,'result')
                            console.log('User verification successful');
                            sendJsonResponse(res, 200, {
                                "message": "User verification successful"
                            });
                        }
                    });
                } else {
                    console.error("Invalid code or user is already verified");
                    sendJsonResponse(res, 400, {
                        "message": "Invalid code or user is already verified"
                    });
                }
            });
        return;
    }
    User
        .findById(userid, (err, user) => {
            if (err) {
                console.error(err);
                sendJsonResponse(res, 400, err);
            } else if (!user) {
                console.error('userid not found');
                sendJsonResponse(res, 404, {
                    "message": "userid not found"
                });
                return;
            }
            if (user.secretcode === secretcode && !user.verified) {
                user.verified = true;
                user.save((err, user) => {
                    if (err) {
                        console.error(err);
                        sendJsonResponse(res, 400, err);
                    } else {
                        console.log('User verification successful');
                        sendJsonResponse(res, 200, {
                            "message": "User verification successful"
                        });
                    }
                });
            } else {
                console.error("Invalid code or user is already verified");
                sendJsonResponse(res, 400, {
                    "message": "Invalid code or user is already verified"
                });
            }
        });
};

module.exports.logout = function (req, res, next) {};