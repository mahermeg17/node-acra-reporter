"use strict";

/* Nodefly has to be the first item loaded */
if (process.env.NODEFLY_KEY)
{
    require('nodefly').profile(
            process.env.NODEFLY_KEY,
            ['acra-reporting']
    );
}
var express = require('express');
var util    = require('util');
var url     = require("url");
var fs      = require('fs');
var models = require('./lib/models');
var mongoose = require('mongoose');
var routes = [
    "./lib/routes/base",
    "./lib/routes/api"
];

/* Config */

var config = {
    users: {},
    mongodb: process.env.MONGO_URL || 'mongodb://localhost/node-acra-reporting'
};

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function callback () {
    startExpress();
});
mongoose.connect(config.mongodb);


/* Callback after everything else is connected  to start express */
var startExpress = function(db) {

    var app = express();
    app.configure(function() {
        app.engine('ejs', require('ejs-locals'));
        app.use(express.logger());
        app.use(express['static'](__dirname + '/public'));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({ 
            secret: process.env.SESSION_SECRET || 'DemtAimfild9' 
        }));
        // http://www.senchalabs.org/connect/favicon.html
        app.use(express.favicon());
        app.use(function(req,res,next) {
            res.locals.title = "ACRA Reporter";
            res.locals.current_path = req.path;
            res.locals.user = {};
            res.locals.ga = process.env.GOOGLE_ANALYTICS_KEY;
            next();
        });
        routes.forEach(function(r) {
            console.log("Now loading route: ", r);
            app.use(require(r));
        });
        app.use(app.router);

    });

    app.configure('development', function(){
        app.use(express.errorHandler());
    });

    // listen to the PORT given to us in the environment
    var port = process.env.PORT || 3000;
    app.listen(port, function() {
        console.log("Listening on " + port);
    });
};
