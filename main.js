'use strict';

// get the packages we need 
const fs = require('fs'), // use to handle file I/O opreations 
    express = require('express'), //use to define framework 
    app = express(), //taking express object for whole project
    bodyParser = require('body-parser'), //it is use to handle post reuqests
    morgan = require('morgan'), //use morgan to for development env    
    cluster = require('cluster');
 
//setting up clusters
if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {

    var server = app.listen(4000, function () {
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });
}
 

// Setting Secret code globally 
//app.set('superSecret', config.CONSTANTS.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
    extended: false
}));
//enabling bodyparser to accept json also
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));
//define public folder as a static folder
app.use(express.static(__dirname + '/public'));

// Switch off the default 'X-Powered-By: Express' header
app.disable('x-powered-by');
//create custom headers to aa our custom headers
function customHeaders(req, res, next) {
    // OR set your own header here
    res.setHeader('X-everus-App-Version', 'v1.0.0');
    next();
}
//adding customHeaders function in middleware 
app.use(customHeaders);


// Set the options, the only required field is applicationId.
var options = {

    applicationId: 'eyJhcHAiOiI0OTM6MTUiLCJ2ZXIiOiIyLjAiLCJvcmciOiI1ODY6MTYiLCJpYXQiOjE1MTE1NjgwMDB9.GhE1UzJPnOQnkMg-TdN5u4ckN0vZjFK6bAbPOL1OC0Q',

    identifyUser: function (req, res) {
        if (req.user) {
            return req.user.id;
        }
        return undefined;
    },

    getSessionToken: function (req, res) {
        return req.headers['x-access-token'];
    }
};

  

app.use(function (req, res, next) {

    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // console.log(ip)
    next();
})


// Route Start

//adding route for home page
app.get('/', function (req, res) {
    res.send('<center><h2><b>Hi, This is Everus Server.<br><i> How can I help you ;)</i></b></h2></center>');
});



//adding route for docs 
app.get('/docs', function (req, res) {
    app.use(express.static(__dirname + '/docs'));
    res.sendFile('./public/docs/index.html', {
        root: __dirname
    });
});



// define apiv1 for version v1 api routes and require routes based file
  //var market = require('./src/routes/index')(app, express);
// //adding middleware for api v1
//  app.use('/market', market);



// starting server at define port
// app.listen(config.CONSTANTS.PORT);
// console.log('Node JS Server running on http://localhost:' + config.CONSTANTS.PORT);


// cathc errors and save as file in log folder 
process.on(
    'uncaughtException',
    function (err) {
        var stack = err.stack;
        var timeout = 1;
        console.log(stack)
        // save log to timestamped logfile
        var filename = "crash_" + new Date() + ".log";
        console.log("LOGGING ERROR TO " + filename);
        console.log(stack);
        fs.writeFile('logs/' + filename, stack);

        //paging code           
        //paging code           
        Util.pagerDutyCreate('uncaughtException', err.stack);
        setTimeout
            (
            function () {
                console.log("KILLING PROCESS");
            },
            timeout * 1000
            );
    }
);
process.on('unhandledRejection',
    function (err) {
        var stack = err.stack;
        var timeout = 1;
        console.log(stack)
        // save log to timestamped logfile
        var filename = "crash_" + new Date() + ".log";
        console.log("LOGGING ERROR TO " + filename);
        console.log(stack);
        fs.writeFile('logs/' + filename, stack);

        //paging code           
        Util.pagerDutyCreate('unhandledRejection', err.stack);
        setTimeout
            (
            function () {
                console.log("KILLING PROCESS");
            },
            timeout * 1000
            );
    }
);


