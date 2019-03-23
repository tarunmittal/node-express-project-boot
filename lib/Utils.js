var ini = require('ini');
var Q = require('q');
var appRoot = process.cwd();
var consts = require('../constants/consts.js');
let httpError = require('../errors/httpError');
let dbError = require('../errors/dbError');
var util = require('../lib/Utils.js');
let httpStatusCodes = require('../constants/httpStatusCodes');
let responseConsts = require('../constants/responseConst');
let bcrypt = require('bcrypt');

var sessionTime = 1 * 60 * 60 * 1000 * 34 * 30;  //

var getResponseObject = exports.getResponseObject = function (status, message, success = true) {
    if (status.text == 'error') {
        //logger.log(message);
    }
    return {
        'status': status.text,
        'response_code': status.code,
        'response_message': status.text === 'success' ? "" : message,
        'success': status.success
    }
};

var validField = exports.validField = function (fieldVal) {
    if (!fieldVal || fieldVal == null || fieldVal == undefined) {
        return false;
    } else {
        return true;
    }
};

exports.checkSession = function (req) {
    if (!validField(req.session)) {
        return false;
    }
    var currentUser = req.session.user_id;
    //var device_id = req.session.device_id;
    if (!validField(currentUser)) {
        return false;
    } else {
        return currentUser;
    }
};

/*
 *  Middleware to check if API is accessible to user with particular type
 */
var allowedUser = exports.allowedUser = function (paramArray) {
    return allowedUser[paramArray] || (allowedUser[paramArray] = function (req, res, next) {
        var userType = req.session.role;
        if (paramArray.indexOf(userType) == -1) {
            res.send(getResponseObject(consts.RESPONSE_UNAUTHORIZED, userType + " is not allowed to access this" +
                " API"));
        } else {
            next();
        }
    })
};

let sendResponse = (data, req, res) => {
    var responseObject = getResponseObject(consts.RESPONSE_SUCCESS);
    if(data !== null && (typeof data === 'object' || data instanceof Array))
        responseObject['data'] = data;
    res.status(200).json(responseObject);
};

module.exports.sendResponse = sendResponse;

let sendError = (err, req, res) => {
    if (err instanceof httpError) {
        let { response: err_string } = err.response;
        if (err_string == '') {
            err_string = 'Some unknown error occured';
        }
        res.status(200).json(getResponseObject({ text: 'error', code: err.httpCode, success: false }, err_string) || {});
        //res.status(err.httpCode).json(err.response || {});
        return;
    }
    if (err instanceof dbError) {
        //Log it somewhere and send something bad happened error
        //res.status(200).json(getResponseObject({ text: 'error', code: err.httpCode, success: false }, err_string) || {});
        return;
    }
    let err_string = 'Some unknown error occured, please try again';
    //Log it somewhere
    res.status(200).json(getResponseObject({ text: 'error', code: 403, success: false }, err_string) || {});
    //Dont throw it for now
    //throw err;
};

module.exports.encrypt = function (password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10).then(function (hash) {
            resolve(hash);
        });
    });
};

module.exports.compare = function (str, compareStr) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(str, compareStr, (err, same) => {
            if (err) {
                return reject(new Error('Failed'));
            }
            if (!same) {
                return reject();
            }
            resolve();
        });
    })

}
module.exports.sendError = sendError;