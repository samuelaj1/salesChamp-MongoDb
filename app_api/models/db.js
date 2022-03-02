const mongoose = require('mongoose');

// 'mongodb+srv://NebKin:FF3PvNt4WJBaVaCP@newsbagcluster.2qpgi.mongodb.net/NewsbagCluster?retryWrites=true&w=majority'
let apiUrl = 'mongodb+srv://0421994733a:0421994733a@cluster0.guuoe.mongodb.net/NewsBag?retryWrites=true&w=majority';


if (process.env.NODE_ENV === 'production') {
    apiUrl = process.env.DATABASE_URL;
}

mongoose.connect(apiUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connection has been made to database");
})
.catch(err => {
    console.error("App starting error:", err.stack);
    process.exit(1);
});

require('./user');
require('./publisher');
require('./reader');
require('./publication');
require('./payment');
require("./payout");