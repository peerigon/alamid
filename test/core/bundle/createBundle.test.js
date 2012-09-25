"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    pathUtil = require("path"),
    getAppPaths = require("../../../lib/shared/helpers/resolvePaths.js").getAppPaths,
    createBundle = require("../../../lib/core/bundle/createBundle.js"),
    _ = require("underscore"),
    Browser = require("zombie");

describe("createBundle()", function () {
    var paths = getAppPaths(__dirname + "/createBundle"),
        devConfig = {
            isDev: true,
            paths: paths
        },
        extensionHandlers = {},
        browser;

    before(function () {
        fshelpers.makeDirSync(__dirname + "/node_modules");
        fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), __dirname + "/node_modules/alamid");

        _(require.extensions).each(function cacheExtensionHandler(handler, key) {
            extensionHandlers[key] = handler;
        });

        browser = new Browser();
    });
    after(function () {
        fs.unlinkSync(__dirname + "/node_modules/alamid");
        fs.rmdirSync(__dirname + "/node_modules");
    });
    it("should return no errors nor warnings", function (done) {
        this.timeout(10000);    // we need to expand mocha's default timeout
        createBundle(devConfig, function onCreateBundleFinished(err, stats) {
            expect(err).to.be(null);
            expect(stats.errors).to.have.length(0);
            expect(stats.warnings).to.have.length(0);

            done();
        });
    });
    it("should output app.js into the bundle-folder", function () {
        expect(fs.existsSync(paths.bundle + "/app.js")).to.be(true);
    });
    it("should output 1.app.js into the bundle-folder", function () {
        expect(fs.existsSync(paths.bundle + "/1.app.js")).to.be(true);
    });
    it("should output 2.app.js into the bundle-folder", function () {
        expect(fs.existsSync(paths.bundle + "/2.app.js")).to.be(true);
    });
    it("should output 3.app.js into the bundle-folder", function () {
        expect(fs.existsSync(paths.bundle + "/3.app.js")).to.be(true);
    });
    it("should remove " + paths.bundle + "/tmp", function () {
        expect(fs.existsSync(paths.bundle + "/tmp")).to.be(false);
    });
    it("should restore require.extensions when finished", function () {
        expect(require.extensions).to.eql(extensionHandlers);
    });
    it("should output a browser-executable bundle", function (done) {
        browser
            .visit("file://" + paths.bundle + "/index.html", { /* debug: true */ }, function onBrowserReady(err) {
                if (err) {
                    throw err;
                }
                expect(browser.errors).to.have.length(0);
                done();
            });
    });
    it("should add the MainPage.html to the DOM", function () {
        expect(browser.text("#headline1")).to.be("I'm the MainPage, baby!");
    });
    it("should add the HomePage.html to the DOM", function () {
        expect(browser.text("#headline2")).to.be("I'm the HomePage, baby!");
    });
    it("should load the BlogPage.html on link click", function (done) {
        browser.window.app.once("pageChange", function () {
            expect(browser.text("#headline2")).to.be("I'm the BlogPage, baby!");
            done();
        });
        browser.window.app.changePage("blog");
    });
});