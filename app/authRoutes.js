var express = require('express');
var router = express.Router();
var userService = require('../services/UserService.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ limit: '10mb' });
let bodyFieldsValidator = require('express-body-parser-validator').hasReqParam
let util = require("../lib/Utils")


/**
 * @api {post} /auth/sign-up SignUp
 * @apiDescription To register a new user or to authenticate an existing user. This user will be a super admin to the App.
 * @apiName signup
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} [name]                                Full name of user, used for registering the user via email.
 * @apiParam {String} email                                 Email address, required while signing up/loggin in via email and password.
 * @apiParam {String} password                              Required Password.
 * @apiParam {String="admin","user"} role           Required Role.
 * @apiParam {String} device_id                             Device ID of phone
 * @apiParam {String} [app]                                   App ID (when app_user is signing up)
 * @apiParam {String="male","female"} [gender]                                   App ID (when app_user is signing up)

 * @apiParamExample {json} Request-Example:
 *     {
 *          "email":"t1@ta.run",
 *          "password":"tarun1234",
 *          "name": "Tarun Mittal",
 *          "role": "user",
 *          "device_id": "asdasd112312sad",
 *          "gender": "male"
 *      }

 * @apiSuccess {String} status  success.
 * @apiSuccess {Number} response_code 200.
 * @apiSuccess {String} response_message Empty or error message.
 * @apiSuccess {Object} data 
 * @apiSuccess {String} data.user_id                        user id
 * @apiSuccess {String} data.name                           user name
 * @apiSuccess {String} data.photo_url                      Will be returned only if avaialbale
 * 
 @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Error
 *     {
 *       "status": "error"
 *       "response_code": 400
 *       "response_message": "User already exists"
 *     }
 *
 *
 * @apiUse SuccessResponse
 * @apiUse Error
 * @apiUse MissingReqParam
 * @apiUse EntityNotFound

 */
router.post('/sign-up', [jsonParser, bodyFieldsValidator(["email", "password", "role"])], function (req, res) {
    var userObject = req.body;
    userService.createNewUser(userObject, req.session).then((user) => {
        util.sendResponse({"user_id" : user._id, "name": user.name, "photo_url": user.photo_url}, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});


/**
 * @api {post} /auth/login Authenticate
 * @apiDescription To register a new user or to authenticate an existing user. This user will be a super admin to the App.
 * @apiName authenticate
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} email                                 Email address, required while signing up/loggin in via email and password.
 * @apiParam {String} password                              Required Password.
 * @apiParam {String="admin","user"} role           Required Role.
 * @apiParamExample {json} Request-Example:
 *     {
 *          "email":"t1@ta.run",
 *          "password":"tarun1234",
 *          "role": "user"
 *      }
 * 
 * @apiSuccess {String} status  success.
 * @apiSuccess {Number} response_code 200.
 * @apiSuccess {String} response_message Empty or error message.
 * @apiSuccess {Object} data 
 * @apiSuccess {String} data.user_id                        user id
 * @apiSuccess {String} data.name                           user name
 * @apiSuccess {String} data.photo_url                      Will be returned only if avaialbale
 *
 * @apiUse SuccessResponse
 * @apiUse Error
 * @apiUse MissingReqParam
 * @apiUse EntityNotFound
 */
router.post('/login', [jsonParser, bodyFieldsValidator(["email", "role", "password"])], function (req, res) {
    var userObject = req.body;
    userService.login(userObject, req.session).then((user) => {
        util.sendResponse({"user_id" : user._id, "name": user.name, "photo_url": user.photo_url}, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});


/**
 * @api {post} /auth/social-auth Facebook Sign up
 * @apiDescription To register a new user or to authenticate an existing user. This user will be a super admin to the App.
 * @apiName signup
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} access_token                          FB Access token.
 * @apiParam {String="app_user","developer"} role           Required Role.
 * @apiParam {String} device_id                             Device ID of phone
 * @apiParam {String="male","female"} [gender]                                   App ID (when app_user is signing up)
 *
 * @apiSuccess {String} status  success.
 * @apiSuccess {Number} response_code 200.
 * @apiSuccess {String} response_message Empty or error message.
 * @apiSuccess {Object} data 
 * @apiSuccess {String} data.user_id                        user id
 * @apiSuccess {String} data.name                           user name
 * @apiSuccess {String} data.photo_url                      Will be returned only if avaialbale
 * 
 @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Error
 *     {
 *       "status": "error"
 *       "response_code": 400
 *       "response_message": "User already exists"
 *     }
 *
 *
 * @apiUse SuccessResponse
 * @apiUse Error
 * @apiUse MissingReqParam
 * @apiUse EntityNotFound

 */
router.post('/social-auth', [bodyFieldsValidator(["access_token"])], function (req, res) {
    var userObject = req.body;
    userService.handleFBLoginAndSignUp(userObject, req.session).then((user) => {
        util.sendResponse({"user_id" : user._id, "name": user.name, "photo_url": user.photo_url}, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});


module.exports = router;
