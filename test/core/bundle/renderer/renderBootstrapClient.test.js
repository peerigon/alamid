"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pathUtil = require("path"),
    renderBootstrapClient = require("../../../../lib/core/bundle/renderer/renderBootstrapClient.js"),
    vm = require("vm"),
    fs = require("fs"),
    makeDirSync = require("fshelpers").makeDirSync,
    alamidClientIndex = require("../../../../lib/index.js"),
    extractConfig = require("../../../../lib/core/config/extractConfig.js"),
    _ = require("underscore");

var util = require("util");

var appPath = __dirname + "/renderBootstrapClient",
    bootstrapPath = appPath + "/bundle/";

describe("renderBootstrapClient", function () {
    var config = {
            "env":"development",
            "useCasting":true,
            "useWebsockets":true
        },
        index = {},
        sandbox = {
            require:function (path) {
                if (path.charAt(0) === ".") {
                    path = pathUtil.resolve(bootstrapPath, path);
                }

                //webpack mocks
                if (path.indexOf("!?") !== -1) {
                    return {};
                }

                // Alamid mocks
                if (path.indexOf("alamid/lib/client/Client.class.js") !== -1) {
                    return Client;
                }
                else if (path.indexOf("alamid/lib/index.js") !== -1) {
                    return index;
                }
                else if (path.indexOf("alamid/lib/shared/config.js") !== -1) {
                    return require("../../../../lib/client/config.client.js");
                }

                return require(path);
            }
        },
        MainPage = require(appPath + "/app/pages/MainPage.class.js");

    function Client (MainPage) {
        this.MainPage = MainPage;
    }

    before(function () {
        index = _(index).extend(alamidClientIndex);
        makeDirSync(__dirname + "/node_modules");
        fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), __dirname + "/node_modules/alamid");
    });

    after(function () {
        fs.unlinkSync(__dirname + "/node_modules/alamid");
        fs.rmdirSync(__dirname + "/node_modules");
    });

    it("should throw no error", function () {
        var src = renderBootstrapClient(config);
        vm.runInNewContext(src, sandbox);
    });

    it("should only assign client config keys", function () {
        expect(index.config).to.only.have.keys(_(config).keys());
    });

    it("should use the same values as in the server config", function () {
        _(index.config).each(function eachConfigValue (value, key) {
            expect(value).to.be(config[key]);
        });
    });

    it("should initialize the app", function () {
        expect(index.client).to.be.a(Client);
        expect(index.client.MainPage.name).to.be(MainPage.name);
    });
});