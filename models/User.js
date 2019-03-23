var mongoose = require('mongoose');
var validate = require("mongoose-validator");

var Schema = mongoose.Schema;

function toLowerCase(val) {
    if (!val)
        return val;
    else
        return val.toLowerCase();
}

// create a schema
var userSchema = new Schema({
    email:  {type: String, trim: true, set: toLowerCase, validate: validate({validator: "isEmail", message: "Invalid email address"})},
    role: {type: String, required: true,  enum: ["admin", "user"]},
    name: {type: String,  trim: true},
    about_me: {type: String,  trim: true},
    password: {type: String, required: false, trim: true},
    photo_url: {type: String,  trim: true},
    gender: {type: String,  trim: true, enum: ["male", "female"]},
    device_id: {type: String, required: false, trim: true},
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    social_profile_id: {type: String,  trim: true},
    social_profile_source: {type: String,  trim: true},
    mobile: {type: String, trim: true},
});


// on every save, add the date
userSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

//update user with complete profile URLs
userSchema.post('find', function(result) {
    var urlPrefix = process.env.S3_BUCKET_URL + process.env.S3_BUCKET_NAME+"/";
    if(result && result.length > 0){
        for(var i=0;i<result.length;i++){
            if(result[i].photo_url){
                result[i].photo_url = result[i].photo_url.indexOf('http') == 0 ? result[i].photo_url : urlPrefix+result[i].photo_url;
            }else{
                result[i].photo_url = null;
            }
             
        }
    }
    return new Promise((resolve, reject) => {
        resolve(result);
    });
});

//following is used to add s3 bucket url and name to each profile image key.
userSchema.post('findOne', function(result) {
    var urlPrefix = process.env.S3_BUCKET_URL + process.env.S3_BUCKET_NAME+"/";
    if(result && result.photo_url)
        result.photo_url = result.photo_url.indexOf('http') == 0 ? result.photo_url:urlPrefix+result.photo_url;
    return new Promise((resolve, reject) => {
        resolve(result);
    });
});

userSchema.index({email: 1, role:1}, {unique: true});
userSchema.index({email: 1});


// the schema is useless so far
// we need to create a model using it
var User = exports.User  = mongoose.model('User', userSchema);