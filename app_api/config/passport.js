const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const User = mongoose.model('User');
const Publisher = mongoose.model('Publisher');

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, cb) => {
    let criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    let message = '';
    if (req.body.account_type == 'reader') {
        User.findOne(criteria)
            .then(user => {
                if (!user) {
                    if ((username.indexOf('@') === -1)) {
                        message = "Incorrect username"
                    } else {
                        message = "Incorrect email"
                    }
                    return cb(null, false, {
                        "message": message
                    });
                }
                if (!user.validPassword(password)) {
                    console.error("Incorrect password");
                    return cb(null, false, {
                        "message": "Incorrect password"
                    });
                }
                return cb(null, user, {
                    "message": "User logged in"
                });
            })
            .catch(err => {
                console.error(err);
                cb(err)
            });
    } else {
        Publisher.findOne(criteria)
            .then(user => {
                if (!user) {
                    if ((username.indexOf('@') === -1)) {
                        message = "Incorrect username"
                    } else {
                        message = "Incorrect email"
                    }
                    return cb(null, false, {
                        "message": message
                    });
                }
                if (!user.validPassword(password)) {
                    console.error("Incorrect password");
                    return cb(null, false, {
                        "message": "Incorrect password"
                    });
                }
                return cb(null, user, {
                    "message": "User logged in"
                });
            })
            .catch(err => {
                console.error(err);
                cb(err)
            });
    }
}));

passport.use('jwt', new JwtStrategy(jwtOptions, (payload, cb) => {
    if (payload.type == 'publisher') {
        return Publisher.findOne({email: payload.email})
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                console.log('error')
                return cb(err);
            });
    } else {
        return User.findOne({email: payload.email})
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                console.log('error')
                return cb(err);
            });
    }

}));