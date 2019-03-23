var cluster = require('cluster');
require('dotenv').config()
//Following if condition is to run the server once (either on master core, or in test mode)
//else condition creates more workers  (one for each CPU core).
if(cluster.isMaster && process.env.NODE_ENV !== 'test') {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    var express = require('express');
    var app = express();

    var bodyParser = require('body-parser');
    var redis =  require('./lib/redis.js');
    var session = require('express-session');
    var redisStore = require('connect-redis')(session);

    var util = require('./lib/Utils.js');
    var consts = require('./constants/consts.js');
    var mongo = require("./models/mongo.js");

    // create application/json parser
    var jsonParser = bodyParser.json({limit: '10mb'});

    // create application/x-www-form-urlencoded parser
    app.use(bodyParser.json({limit: '10mb', extended: true}));

    var sessionTime = 24 * 60 *  60;       //30 days rolling session

    var client = redis.redisConnection();

    /*
     * Setting up of redis session store
     */
    app.use(session({
        secret: process.env.SALT,    //Session will be encrypted using this value.
        // create new redis store.
        store: new redisStore({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, client: client, ttl: sessionTime}),
        saveUninitialized: false,       //session will not be saved in first response itself (without values)
        resave: false,                  //won't be stored in session store if session is not modified
        rolling: true                   //expiration is reset on every response
    }));


     /*
      * Authenticate each request, except login and sign-up (and other exaempted routes)
      * hard coded password for API doc
      */
     app.use(function(req,res,next) {
         var reqPath = req.path;
         if(consts.EXEMPTED_ROUTES.indexOf(reqPath) !== -1 || util.checkSession(req)){
            next();
         }else if(reqPath.indexOf('/api/documentation') == 0){
           if(req.query.password === process.env.API_DOC_PASSWORD ||
                 (reqPath.endsWith('js') || reqPath.endsWith('css') || reqPath.endsWith('map'))){
                next();
             }else {
                 res.send(util.getResponseObject(consts.RESPONSE_SESSION_EXPIRED));
             }
         }
         else{
             res.send(util.getResponseObject(consts.RESPONSE_SESSION_EXPIRED));
         }
     });

     app.use('/api/documentation', express.static(__dirname + '/public/apidoc'));

    app.use("/user",require('./app/userRoutes'));
    app.use("/auth",require('./app/authRoutes'));


    var server = app.listen(process.env.PORT, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log("Example app listening at http://%s:%s", host, port)

    });

    module.exports = app;               //for testing
}