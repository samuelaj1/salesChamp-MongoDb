const mongoose = require('mongoose');

let apiUrl ="mongodb+srv://saleschamp:H3ll0w0rld!123@sales-chamop.15lkn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

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

require('./address');