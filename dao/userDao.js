var mongo = require('../models/mongo');
var consts = require('../constants/consts')

module.exports.getUserByEmailRole = function(email_id, role){
    var cond = {email: email_id, role : role};
    return mongo.User.findOne(cond);
};

module.exports.createUser = function(userObject){
    var newUser = new mongo.User(userObject);
    return newUser.save();
}


module.exports.findAndUpdateUser = (user_id, updateParams) => {
    return mongo.User.findByIdAndUpdate(user_id, { $set : updateParams });
}

module.exports.findUserById = (user_id) => {
    return mongo.User.findOne({"_id" : user_id}).select('_id name email photo_url gender about_me');
}


module.exports.getUserFromSocialProfileId = (socialSource, socialProfileId, role) => {
    var cond = {
        social_profile_id: socialProfileId,
        role : role,
        social_profile_source: socialSource
    };
    return mongo.User.findOne(cond);
}

module.exports.updateFidInUser = (userFbId, userId) => {
    userFb.fid = id;
    return mongo.User.findByIdAndUpdate(userId, { $set : {social_profile_id: userFbId, social_profile_source: "fb"} });
}