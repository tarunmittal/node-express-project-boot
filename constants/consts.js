/**
 * Created by tarun on 27/06/17.
 */
var ini = require('ini');
var appRoot = process.cwd();



/**
 * @apiDefine SuccessResponse
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status": "success"
 *          "response_code": 200
 *          "response_message": ""
 *     }
 *
 */

/**
 * @apiDefine EntityNotFound
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "no_result_found"
 *       "response_code": 404
 *       "response_message": "No result obtained from DB for given entity, based on provided filters."
 *     }
 */

/**
 * @apiDefine MissingReqParam
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 407 Missing Param
 *     {
 *       "status": "missing_param"
 *       "response_code": 407
 *       "response_message": "One or more request parameters missing"
 *     }
 */

/**
 * @apiDefine UnauthorizedAction
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 406 Unauthorized
 *     {
 *       "status": "unauthorized"
 *       "response_code": 406
 *       "response_message": "User not allowed."
 *     }
 */

/**
 * @apiDefine Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Error
 *     {
 *       "status": "error"
 *       "response_code": 403
 *       "response_message": "There was an error performing the action. Please try again"
 *     }
 */

exports.RESPONSE_SUCCESS = { text: "success", code: 200 };
exports.RESPONSE_SESSION_EXPIRED = { text: "session_expired", code: 405 };
exports.RESPONSE_ERROR = { text: "error", code: 403 };
exports.RESPONSE_UNAUTHORIZED = { text: "unauthorized", code: 406 };
exports.RESPONSE_MISSING_PARAM = { text: "missing_req_param", code: 407 };
exports.RESPONSE_DATA_NOT_FOUND = { text: "no_result", code: 404 };
exports.SESSION_TIME = 1 * 60 * 60 * 1000 * 34 * 30;         //1 hour session

exports.REQ_PAYLOAD_LIMIT = "5mb"



exports.EXEMPTED_ROUTES = [
    '/admin/authenticate',
    '/auth/login',
    '/auth/sign-up',
    '/auth/social-auth',
];

