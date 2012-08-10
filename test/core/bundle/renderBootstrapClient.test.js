"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pathUtil = require("path"),
    renderBootstrapClient = require("../../../lib/core/bundle/renderBootstrapClient.js"),
    vm = require("vm"),
    fs = require("fs");

var appPath = __dirname + "/renderBootstrapClient",
    bootstrapPath = appPath + "/bundle/tmp";

describe("renderBootstrapClient", function () {
    var config = {
            "mode" : "development",
            "useCasting" : true,
            "useWebsockets": true
        },
        sandbox = {
            require: function (path) {
                if (path.charAt(0) === ".") {
                    path = pathUtil.resolve(bootstrapPath, path);
                }

                return require(path);
            }
        };

    before(function () {
        fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), appPath + "/node_modules/alamid");
    });
    after(function () {
        fs.unlinkSync(appPath + "/node_modules/alamid");
    });
    it("should throw no error", function () {
        var src = renderBootstrapClient(config);

        vm.runInNewContext(src, sandbox);
    });
});