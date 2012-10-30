"use strict"; // run code in ES5 strict mode

var spawn = require("child_process").spawn,
    _ = require("underscore");

function runCreateBundle(config, callback) {
    var createBundleProcess;

    createBundleProcess = spawn("node", ["createBundle.js"], {
        cwd: __dirname,
        env: _(config).extend(process.env)
    });
    createBundleProcess.stdout.pipe(process.stdout);
    createBundleProcess.stderr.pipe(process.stderr);
    createBundleProcess.on("exit", function onProcessExit(code) {
        if (code !== 0) {
            callback(new Error("(alamid) Bundle creation failed"));
            return;
        }

        callback(null);
    });
}

module.exports = runCreateBundle;