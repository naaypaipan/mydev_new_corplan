const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        (username, password, done) => {
            User.findOne({ username })
                .then((user) => {
                    if (!user || !user.validPassword(password)) {
                        return done(null, false, {
                            errors: { 'username or password': 'is invalid' },
                        });
                    }

                    return done(null, user);
                })
                .catch(done);
        }
    )
);
