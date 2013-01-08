"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    pathUtil = require("path"),
    getAppPaths = require("../../../lib/shared/helpers/resolvePaths.js").getAppPaths,
    runCreateBundle = require("../../../lib/core/bundle/runCreateBundle.js"),
    _ = require("underscore"),
    connect = require("connect"),
    Browser = require("zombie");

describe("runCreateBundle()", function () {
    var paths = getAppPaths(__dirname + "/runCreateBundle"),
        devConfig = {
            appDir: __dirname + "/runCreateBundle",
            useWebsockets: false
        },
        browser;

    before(function (done) {
        fshelpers.makeDirSync(__dirname + "/node_modules");
        try {
            fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), __dirname + "/node_modules/alamid");
        } catch (err) { /* ignore err */ }


        browser = new Browser();
        var app = connect()
            .use(connect.static(paths.bundle))
         .listen(3000, done);


    });
    after(function () {
        fs.unlinkSync(__dirname + "/node_modules/alamid");
        fs.rmdirSync(__dirname + "/node_modules");
    });
    it("should return no errors nor warnings", function (done) {
        this.timeout(10000);    // we need to expand mocha's default timeout
        runCreateBundle(devConfig, function onCreateBundleFinished(err) {
            expect(err).to.be(null);

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
    it("should output a browser-executable bundle", function (done) {
        browser
            .visit("http://localhost:3000/index.html", { /* debug: true */ }, function onBrowserReady(err) {
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
        browser.window.client.once("pageChange", function () {
            expect(browser.text("#headline2")).to.be("I'm the BlogPage, baby!");
            done();
        });
        browser.window.client.changePage("blog");
    });
});