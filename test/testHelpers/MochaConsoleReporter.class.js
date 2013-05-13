"use strict";

function MochaConsoleReporter(runner) {
    var passes = 0,
        failures = 0;

    runner.on("pass", function () {
        passes++;
    });

    runner.on("fail", function(test, err){
        failures++;
        console.log("fail: %s -- error: %s", test.fullTitle(), err.message);
    });

    runner.on("end", function(){
        console.log("end: %d/%d", passes, passes + failures);
    });
}

module.exports = MochaConsoleReporter;