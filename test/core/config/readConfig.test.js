"use strict";

var expect = require("expect.js"),
    path = require("path"),
    exec = require('child_process').exec,
    readConfig = require("../../../lib/core/config/readConfig.js"),
    extractConfig = require("../../../lib/core/config/extractConfig.js"),
    defaultConfig = require("../../../lib/core/defaults/defaultConfig.json");

/**
 * This function is used to simulate different calls of the process via CLI.
 * Don't forget to update readConfigWrapper.js if something changes on readConfig.js.
 *
 * All console.logs of readConfig.js will only be visible in stdout.
 *
 * @param {!String} argv
 * @param {!Object} env
 * @param {!Function} done
 */
function checkConfigViaSubprocess(argv, env, done) {

    var readConfigWrapper = exec("node " + __dirname + "/readConfig/readConfigWrapper.js "+ argv,
        {
            env : env,
            cwd : __dirname
        },
        function (error, stdout) {
            if (error) throw error;
            var configJson = stdout.match(/\{(.*)\}/gi)[0];
            var parsedConf = JSON.parse(configJson);
            done(parsedConf);
        }
    );
}

describe("readConfig", function () {

    var result;

    before(function () {
        readConfig.log = function () { /* do nothing. we don't want to spill the console when testing */ };
    });

    //skip on travis, cause exec with nvm doesn't work
    if(process.env.TRAVIS === "true") {
        return;
    }

    it("should read the default config if nothing was passed", function () {
        result = readConfig("server");
        //we can't check for env, because we need it for testing
        defaultConfig = extractConfig(defaultConfig, "server");
        defaultConfig.env = "";
        delete defaultConfig.type;
        result.env = "";
        expect(result).to.eql(defaultConfig);
    });

    it("should respect the env set via process.env.NODE_ENV", function(done) {

        checkConfigViaSubprocess("", { NODE_ENV : "production"} , function(parsedConf) {
            expect(parsedConf.env).to.eql("production");
            done();
        });

    });

    it("should read a custom config if passed via args and accept additional attributes (other than the default config)", function (done) {

        var relativePathToTestConf = "readConfig/customConfig.json";

        checkConfigViaSubprocess("--server:config " + relativePathToTestConf, {}, function(parsedConf) {
            expect(parsedConf.port).to.equal(1234);
            expect(parsedConf.customConfigAttribute).to.be(true);
            done();
        });
    });

    it("should read a custom config if passed via env", function (done) {

        var relativePathToTestConf = "readConfig/customConfig.json";

        checkConfigViaSubprocess("", { "server:config" : relativePathToTestConf } , function(parsedConf) {
            expect(parsedConf.port).to.equal(1234);
            expect(parsedConf.customConfigAttribute).to.be(true);
            done();
        });
    });

    it("should read the suitable config if env is set from subdir (config)", function (done) {

        checkConfigViaSubprocess("--env testing", {}, function(parsedConf) {
            expect(parsedConf.port).to.equal(1223);
            expect(parsedConf.isTestingConfig).to.be(true);
            done();
        });
    });

    it("should set attributes if passed via argv", function (done) {
        checkConfigViaSubprocess("--server:port 9099", {} , function(parsedConf) {
            expect(parsedConf.port).to.equal(9099);
            done();
        });
    });

    it("should respect the hierachy and prefer command given via argv", function (done) {

        var relativePathToTestConf = "readConfig/customConfig.json";

        checkConfigViaSubprocess("--server:port 9099", { "server:config" : relativePathToTestConf }, function(parsedConf) {
            expect(parsedConf.port).to.equal(9099);
            done();
        });
    });

    it("should respect the hierachy and prefer command given via env before argv", function (done) {

        var relativePathToTestConf = "readConfig/customConfig.json";
        var relativePathToTestConf2 = "readConfig/customConfig2.json";

        checkConfigViaSubprocess("--server:config " + relativePathToTestConf2, { "server:config" : relativePathToTestConf }, function(parsedConf) {
            expect(parsedConf.port).to.equal(5555);
            done();
        });
    });
});