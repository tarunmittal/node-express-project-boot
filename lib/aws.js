var AWS = require('aws-sdk');
var ses = require('node-ses')
var util = require("./Utils.js");
var Q = require('q');
var appRoot = process.cwd();

var fs=require('fs');

// var ses = new AWS.SES({apiVersion: '2010-12-01'});
var bucketName = process.env.S3_BUCKET_NAME;
var s3Bucket = new AWS.S3( { params: {Bucket: bucketName} } );

var sesClient = ses.createClient({key : process.env.AWS_ACCESS_KEY_ID, secret : process.env.AWS_SECRET_ACCESS_KEY, amazon: 'https://email.us-west-2.amazonaws.com'})

exports.sendEmail = function(to,  subject, template, templateData) {
    var templateBody = fs.readFileSync(appRoot+ '/views/mail_templates/'+template, 'utf-8');
    var deferred = Q.defer();
    var from = "Knitify Support <knitify@ta.run>";
    to = [to];
    getEmailBody(templateBody, templateData, function(emailBody){
        sesClient.sendEmail({
                from: from,
                to: to,
                subject: subject,
                message: emailBody
            },
            function(err, data) {
                if(err) {
                    console.log(err);
                    deferred.reject("Unable to send email");
                }else {
                    deferred.resolve(data);
                }
            }
        );
    });
    return deferred.promise;
};

var getEmailBody = function(emailText, params, callback){
    var i=0;
    Object.keys(params).forEach(function(key) {
        var val = params[key];
        key = "_PARAM_"+key+"_";
        re = new RegExp(key, "g");
        emailText = emailText.replace(re, val);
        i++;
        if(i == Object.keys(params).length){
            callback(emailText);
        }
    });

};

exports.uploadImageToS3 = function(base64Data, user_id, folder){
    return new Promise((resolve, reject) => {
        if(!util.validField(folder))
            folder="";
        var key = new Date().getTime()+"_"+user_id+".jpeg";
        var baseUrl = process.env.S3_BUCKET_URL;
        var buf = new Buffer(base64Data.replace(/^data:image\/\w+;base64,/, ""),'base64');
        key = folder+"/"+key;
        var data = {
            Key: key,
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
            ACL:'public-read'
        };
        s3Bucket.putObject(data, function(err, data){
            if (err) {
                reject(err.errmsg);
                console.log(err);
            } else {
                resolve(key);       //process.env.S3_BUCKET_URL+bucketName+"/"+
            }
        });
    });
};

var notifyAdmin = function(to,  subject, template, templateData){

}
