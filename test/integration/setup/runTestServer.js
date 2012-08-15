"use strict";

var path = require("path"),
    exec = require('child_process').exec;

function runTestServer(configEnv, callback) {

    var cmd = "node " + path.resolve(__dirname, "./testServer.js"),
        testSrv;

    testSrv = exec(cmd, { "env" : configEnv },
        function (error) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });

    testSrv.stdout.on("data", function(data) {
        console.log(data);
        if(data.indexOf("alamid-server running") !== -1){
            callback(testSrv);
        }
    });
}

module.exports = runTestServer;