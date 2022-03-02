const mongoose = require('mongoose');
const crypto = require("crypto");

const Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
};


const PublisherSchema = new Schema({
    // username: {
    //     type: String,
    //     unique: true,
    // },
    name: {
        type: String,
        // default: ""
        // required: true,
    },
    photo: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    token: String,
    secretcode: String,
    private_key: {
        type: String,
        default: crypto.randomBytes(10).toString('hex')
    },
    // publication_name: {
    //     type: String,
    //     // unique: true,
    // },
    content_type: {
        type: String,
        enum: ["newspapers", "books", "magazines"]
    },
    frequency: {
        type: String,
        enum: ["one-time", "daily", "bi-weekly", "weekly", "forthnightly", "monthly", "quarterly", "annually"]
    },
    prices: [{
        period: {
            type: String,
            enum: ["one-time", "1 month", "2 months", "3 months", "6 months", "1 year", "annually"]
        },
        amount: {
            type: String,
        }
    }],
    website: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    payment_details: {
        bank: String,
        account_name: String,
        account_number: String
    }
});

// PublisherSchema.methods.sendEmail = function (content) {
//     return nodemailer.createTestAccount()
//         .then(testAccount => {
//             return nodemailer.createTransport({
//                 host: 'smtp.gmail.com',
//                 port: 465,
//                 secure: true,
//                 auth: {
//                     type: 'OAuth2',
//                     user: 'donotreply@newsbag.xyz',
//                     serviceClient: testAccount.client_id,
//                     privateKey: testAccount.private_key,
//                 }
//             });
//         })
//         .then(transporter => {
//             return transporter.sendMail({
//                 from: '"Newsbag" <donoteply@newsbag.xyz',
//                 to: content.email,
//                 subject: content.subject,
//                 text: content.text,
//                 html: content.html
//             });
//         })
//         .then(info => {
//             console.log('Email sent: %s', info.messageId);
//             console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//         })
//         .catch(error => {
//             console.error(error);
//         });
// };

PublisherSchema.methods.sendingEmail = function (content) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const options = {
            from: '"Newsbag" <donoteply@newsbag.xyz',
            to: content.email,
            subject: content.subject,
            text: content.text,
            html: content.html
        }

        transporter.sendMail(options, function (err, info) {
            if (err) {
                reject(err)
            }
            resolve(info)
        })
    })

}

PublisherSchema.methods.setPassword = function (password) {
    const salt = bcryptjs.genSaltSync(10);
    this.password = bcryptjs.hashSync(password, salt);
};

PublisherSchema.methods.validPassword = function (password) {
    return bcryptjs.compareSync(password, this.password);
};

mongoose.model('Publisher', PublisherSchema);