"use strict";

var sanitizeConfig = require("../config/sanitizeConfig.js");

//simply execute
//function gets called by "runCreateBundle" in a separate process
process.on('message', function(config) {

    //we need to set the dir, cause cwd of fork didn't work
    //we are doing it before requiring bundle because it uses __dirname
    process.chdir(config.paths.root);

    var bundle = require("./bundle.js");

    bundle.createBundle(config, function onCreateBundleDone (err) {

        if(err) {
            throw err;
        }

        //we have to exit here explicitly for "fork"
        process.exit(0);
    });
});
