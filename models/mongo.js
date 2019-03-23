
/*
    (c) Hiperware Pte Ltd, Singapore
    Created by Vadim V. Mostovoy
*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require("../lib/Utils.js");

// models

var User = exports.User = require("./User.js").User;

var mongo_options = {
    config: { autoIndex: true },
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    useNewUrlParser: true       //as old version is deprecated by mongo db
};

mongoose.Promise = require('q').Promise;        //plugging in our own library as mpromise has been deprecated.

mongoose.connect('mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME, mongo_options, function(err) {
    if (err) {
        console.error(err);
        console.error("Database connection error. Exiting process...");
        process.exit(1);
        return;
    }

    exports.collection = function (name) {
        return mongoose.connection.db.collection(name);
    };

});

//mongoose.set("debug", parseInt(process.env.LOCAL) || parseInt(process.env.STAGING));


var db = mongoose.connection;

db.once('open', function () {
    console.log('MongoDB connection successful.');
});
db.on('error', console.error.bind(console, "Database connection:"));



