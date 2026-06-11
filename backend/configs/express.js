/* eslint-disable no-sequences */
/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

(passport = require('passport')), (path = require('path'));

module.exports = async (app) => {
    // Connect MongoDB
    require('./databases');

    // CORS
    // const allowedOrigins = []
    // const corsOptions = {
    //   origin: function (origin, callback) {
    //     if (!origin) return callback(null, true)
    //     if (allowedOrigins.indexOf(origin) === -1) {
    //       const msg = 'The CORS policy for this site does not ' + 'allow access from the specified Origin.'
    //       return callback(new Error(msg), false)
    //     }
    //     return callback(null, true)
    //   },
    // }

    // app.use(cors(corsOptions))

    app.use(cors());

    // Parser Body
    app.use(express.json({ limit: process.env.ENTITY_SIZE }));
    app.use(
        express.urlencoded({ limit: process.env.ENTITY_SIZE, extended: false })
    );

    // Logger
    app.use(morgan('dev'));

    // Passport
    require('./passport');

    // Static file
    app.use('/static', express.static(path.join(__dirname, '../public')));

    // Custom Response Format
    app.use(require('./responseFormat'));
};
