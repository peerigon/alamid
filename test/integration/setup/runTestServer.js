"use strict";

var path = require("path"),
    exec = require('child_process').exec;

function runTestServer(configEnv, callback) {

    var cmd = "node " + path.resolve(__dirname, "./testApp/app/init.server.js"),
        testSrv;

    testSrv = exec(cmd, { "env" : configEnv },
        function (error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

    testSrv.stdout.pipe(process.stdout);

    testSrv.stdout.on("data", function (data) {
        console.log(data);
        if (data.indexOf("alamid-Server running") !== -1) {
            callback(testSrv);
        }
    });
}

module.exports = runTestServer;