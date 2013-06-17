"use strict";

function MochaConsoleReporter(runner) {
    var passes = 0,
        failures = 0;

    runner.on("pass", function () {
        passes++;
    });

    runner.on("fail", function(test, err){
        failures++;
        console.log("fail: " + test.fullTitle());
        console.log(err);
    });

    runner.on("end", function(){
        console.log("end: " + passes + "/" + (passes + failures));
    });
}

module.exports = MochaConsoleReporter;