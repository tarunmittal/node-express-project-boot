var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var userService = require('../services/UserService.js');
var util = require('../lib/Utils.js');
var consts = require('../constants/consts.js');
var jsonParser = bodyParser.json({ limit: consts.REQ_PAYLOAD_LIMIT });
let httpError = require('../errors/httpError');
let httpStatusCodes = require('../constants/httpStatusCodes');
let responseConsts = require('../constants/responseConst');

var urlencoded = bodyParser.urlencoded({ extended: true });



/**
 * @api {post} /user/edit-user-profile Edit User profile
 * @apiDescription For user to update their basic profile info
 * @apiName Upadte Profile
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} [name]                                         User's name (first and last. NOT unique)
 * @apiParam {String="male","female"} [gender]                       Gender
 * @apiParam {String} [about_me]                                     User's own short description
 * @apiParam {String} [image_string]                                 Base64 encoded image string. 
 * 
 * @apiSuccess {String} status  success.
 * @apiSuccess {Number} response_code 200.
 * @apiSuccess {String} response_message Empty or error message.
 * @apiSuccess {Object} data 
 * @apiSuccess {String} data.name                          user name
 * @apiSuccess {String} data.photo_url                     user profile image url
 * @apiSuccess {String} data.gender                        Will be returned only if avaialbale
 * @apiSuccess {String} data.about_me                      Will be returned only if avaialbale
 *
 * @apiUse SuccessResponse
 * @apiUse Error
 */
router.post('/edit-user-profile', [jsonParser], function (req, res) {
    let {image_string, name, gender, about_me} = req.body;
    if(!image_string && !name && !gender && !about_me){
        util.sendError(new httpError(httpStatusCodes.BAD_REQUEST, {}), req, res);
    }else{
        userService.updateProfile(req.body, req.session).then((user) => {
            util.sendResponse({"user_id" : user._id, "name": user.name, "photo_url": user.photo_url, "about_me":user.about_me}, req, res);
        }, (err) => {
            util.sendError(err, req, res);
        });
    }
    
});




/**
 * @api {post} /user/get-profile Gets User profile
 * @apiDescription Gets profile for current logged in user. Todo us to have limit access to users.
 * @apiName Get User profile
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiParam {String} [user_id]                            To fetch profile of some user.

 * @apiSuccess {String} status  success.
 * @apiSuccess {Number} response_code 200.
 * @apiSuccess {String} response_message Empty or error message.
 * @apiSuccess {Object} data 
 * @apiSuccess {String} data.name                          user name
 * @apiSuccess {String} data.photo_url                     user profile image url
 * @apiSuccess {String} data.gender                        Will be returned only if avaialbale
 * @apiSuccess {String} data.about_me                      Will be returned only if avaialbale
 *
 * @apiUse SuccessResponse
 * @apiUse Error
 */
router.post('/get-profile', [jsonParser], function (req, res) {
    var user_id = req.body.user_id ? req.body.user_id : req.session.user_id;
    userService.getUserProfile(user_id).then((user) => {
        util.sendResponse({"user_id" : user._id, "name": user.name, "photo_url": user.photo_url, "about_me":user.about_me}, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
})


module.exports = router;
