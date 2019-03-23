var mongo = require('../models/mongo.js');
let httpStatusCodes = require('../constants/httpStatusCodes');
let util = require("../lib/Utils")
let userDAO = require("../dao/userDao");
let httpError = require("../errors/httpError");
let dbError = require("../errors/dbError");
let constants = require("../constants/consts")
let aws = require("../lib/aws")
let fbServices = require('./fbServices');

var createNewUser = module.exports.createNewUser = (user, session = null) => {
    let { email, role, password} = user;
    return userDAO.getUserByEmailRole(email, role)
        .then((foundUser) => {
            if (foundUser == null || foundUser == undefined) {
                return util.encrypt(password)
                    .then((hashed) => {
                        user.password = hashed;
                        return userDAO.createUser(user)
                            .then((user) => {
                                return refreshSession(session, user)
                                .then((user) => {
                                    return user;
                                });
                            })
                    },
                    (err) => {
                        throw new httpError(httpStatusCodes.BAD_REQUEST, { response: 'Error saving the user.' });
                    })
                    
            } else {
                throw new httpError(httpStatusCodes.BAD_REQUEST, { response: 'User already exists' });
            }
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

module.exports.login = (user, session) => {
    let { email, password, role} = user;
    return userDAO.getUserByEmailRole(email, role)
    .then((user) => {
        if (user == null) {
            throw new httpError(httpStatusCodes.UNAUTHORIZED, { response: 'Not able to find user' });
        }
        return util
            .compare(password, user.password)
            .then(() => {
                return user;
            }, () => {
                throw new httpError(httpStatusCodes.UNAUTHORIZED, { response: 'Wrong Credentials,Please try again' });
            })
            .then(() => {
                return refreshSession(session, user)
                .then((user) => {
                    return user;
                });
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    });
}

module.exports.updateProfile = (params, session) => {
    let promiseArray = [Promise.resolve(params)];
    var userObj = {};
    if(params.image_string){
        promiseArray.push(aws.uploadImageToS3(params.image_string, session.user_id, "profile-image")
        .then((imageUrl) => {
            userObj.photo_url = imageUrl;
            return params;
        }), (err) => {
            console.log(err);
        })
    }
    return Promise.all(promiseArray)
        .then(() => {
            if(params.name) userObj.name =  params.name;
            if(params.gender) userObj.gender = params.gender; 
            if(params.about_me) userObj.about_me = params.about_me; 
            return userDAO.findAndUpdateUser(session.user_id, userObj)
        }).then(() => {
            return userDAO.findUserById(session.user_id);
        })
    .catch((err) => {
        return Promise.reject(err);
    });
}

module.exports.getUserProfile = (user_id) => {
    return userDAO.findUserById(user_id)
    .then((user) => {
        if(!user)
            throw new httpError(httpStatusCodes.NOT_FOUND, { response: 'User not found' });
        else    
            return user;
    }, (err)=>{
        throw new httpError(httpStatusCodes.BAD_REQUEST, { response: 'There was an error' });
    }).catch((err) => {
        return Promise.reject(err);
    });
}


module.exports.handleFBLoginAndSignUp = (userObject, session = null) => {
    let {access_token, role, device_id} = userObject;
    let fbService = new fbServices(access_token);
    let fbDetailUser = null;
    return fbService.getUserBasics()
        .then((fbDetails) => {
            if (fbDetails == null || fbDetails.error != null) {
                //Throw new httpError
                throw new httpError(httpStatusCodes.FORBIDDEN, { response: responseConstants.FBUNATHORIZED })
            }
            return fbDetails;
        })
        .then((fbDetails) => {
            let { id, email } = fbDetails;
            fbDetailUser = fbDetails;
            let fromFbProfile = userDAO.getUserFromSocialProfileId("fb", id, role);
            
            let fromFbEmail = userDAO.getUserByEmailRole(email, role)
            return Promise.all([fromFbProfile, fromFbEmail]);
        })
        .then((users) => {
            let fromFb = users[0];
            let fromEmail = users[1];
            if (!fromFb && !fromEmail) {
                let { id, name, email, gender } = fbDetailUser;
                let photo_url = fbService.parsePhotoUrlFromFbResponse(fbDetailUser);
                let userDbObject = { social_profile_id: id, name, email, gender, photo_url, social_profile_source: "fb" , role, device_id};
                return userDAO.createUser(userDbObject)
                    .then((user) => {
                        return refreshSession(session, user)
                        .then(() => {
                            return user;
                        });
                });
            } else if (!fromFb && fromEmail) {
                //Associate both, that is in the from email mark the fid and put Fromfb is true
                return userDAO.updateFidInUser(fbDetailUser.id, fromEmail._id)
                    .then(() => {
                        return refreshSession(session, fromEmail)
                        .then(() => {
                            return fromEmail;
                        });
                    })
            }
            else if (fromFb) {
                //Old user has logged in, refresh the session and return logged in as true
                return refreshSession(session, fromFb)
                .then(() => {
                    return fromFb;
                });
            }
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

let refreshSession = module.exports.refreshSession = (session, user) => {
    session.user_id = user.id;
    session.name = user.name != undefined ? user.name : "user";
    if (util.validField(user.is_master_admin) && user.is_master_admin === true) {
        session.is_master_admin = true;
    }
    session.voted_posts = user.voted_posts ? user.voted_posts : {};
    session.status = user.status;
    session.role = user.role;

    session.cookie.expires = new Date(Date.now() + constants.SESSION_TIME);
   
    return new Promise((resolve, reject) => {
        resolve(session);
    });
}

