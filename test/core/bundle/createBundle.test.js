"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    pathUtil = require("path"),
    getAppPaths = require("../../../lib/shared/helpers/resolvePaths.js").getAppPaths,
    createBundle = require("../../../lib/core/bundle/createBundle.js");

describe("createBundle()", function () {
    var config = {
        isDev: true,
        paths: getAppPaths(__dirname + "/createBundle")
    };

    before(function () {
        fshelpers.makeDirSync(__dirname + "/node_modules");
        fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), __dirname + "/node_modules/alamid");
    });
    after(function () {
        fs.unlinkSync(__dirname + "/node_modules/alamid");
        fs.rmdirSync(__dirname + "/node_modules");
    });
    it("should write an executable bundle", function (done) {
        this.timeout(10000);
        createBundle(config, function (err, stats) {
            console.log(err);
            fs.writeFileSync(__dirname + "/moduleDump.json", require("util").inspect(stats.fileModules, false, 10, false), "utf8");
            done();
        });
    });
});