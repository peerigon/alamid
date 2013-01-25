"use strict"; // run code in ES5 strict mode

var fork = require("child_process").fork,
    _ = require("underscore");

/**
 * call the bundler as a separate forked process
 * pass config via message to forked process
 *
 * @param {!Object} config server-config
 * @param {!Function} callback
 */
function runCreateBundle(config, callback) {

    var createBundleProcess;

    createBundleProcess = fork(__dirname + "/createBundle.js", {
        cwd: __dirname
    });

    //send config to start bundle process
    createBundleProcess.send(config);
    createBundleProcess.on("exit", function onProcessExit(code) {
        if (code !== 0) {
            callback(new Error("(alamid) Bundle creation failed"));
            return;
        }

        callback(null);
    });
}

module.exports = runCreateBundle;