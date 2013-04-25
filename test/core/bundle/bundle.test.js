"use strict"; // run code in ES5 strict mode

try {
    // Check if zombie runs on this platform (there is currently an issue on windows)
    //TODO This test should run on all platforms
    require("zombie");
} catch (err) {
    return;
}

var expect = require("expect.js"),
    fs = require("fs"),
    fshelpers = require("fshelpers"),
    pathUtil = require("path"),
    getAppPaths = require("../../../lib/core/defaults/defaultPaths.js").getAppPaths,
    sanitizeConfig = require("../../../lib/core/config/sanitizeConfig.js"),
    extractConfig = require("../../../lib/core/config/extractConfig.js"),
    clientConfig = require(__dirname + "/bundle/config.json"),
    _ = require("underscore"),
    connect = require("connect"),
    Browser = require("zombie");

describe("bundle()", function () {

    var bundle = require("../../../lib/core/bundle/bundle.js").createBundle,
        paths = getAppPaths(__dirname + "/bundle"),
        devConfig = sanitizeConfig({
            appDir: __dirname + "/bundle/",
            port : 9000,
            use : {
                websockets : false
            },
            config : "config.json"
        }),
        browser,
        app;

    before(function (done) {
        var app;

        fshelpers.makeDirSync(__dirname + "/bundle/node_modules");

        try {
            fs.symlinkSync(pathUtil.resolve(__dirname, "../../../"), __dirname + "/bundle/node_modules/alamid");
        } catch (err) { /* ignore err */ }


        browser = new Browser();

        app = connect()
            .use(connect.static(paths.bundle))
            .listen(3000, done);
    });
    after(function () {
        fs.unlinkSync(__dirname + "/bundle/node_modules/alamid");
        fs.rmdirSync(__dirname + "/bundle/node_modules");
    });
    it("should return no errors nor warnings", function (done) {
        this.timeout(10000);    // we need to expand mocha's default timeout
        bundle(devConfig, function onCreateBundleFinished(err) {
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
        this.timeout(10000);    // we need to expand mocha's default timeout
        browser
            .visit("http://localhost:3000/index.html", { /* debug: true */ }, function onBrowserReady(err) {
                if (err) {
                    throw err;
                }
                expect(browser.errors).to.have.length(0);
                done();
            });
    });
    it("should add the HomePage.html to the DOM", function () {
        console.log(browser.document.body.innerHTML);

        expect(getH2Content()).to.be("I'm the HomePage, baby!");
    });
    it("should load the BlogPage.html on link click", function (done) {
        browser.window.client.once("pageChange", function () {
            // clearing callstack because the thrown error would be caught by zombie.js instead of mocha
            setTimeout(check, 0);
        });
        browser.window.client.show("blog/posts");

        function check() {
            expect(getH2Content()).to.be("I'm the PostsPage, baby!");
            done();
        }
    });

    it("should be able to access the client config via alamid.config", function() {

        //not merged with default config
        var expectedClientConf = extractConfig(clientConfig, "client");

        //we can't test for env, because it depends how the test was ran
        expectedClientConf.env = browser.window.alamidClientConfig.env;

        expect(browser.window.alamidClientConfig.use.websockets).to.eql(expectedClientConf.use.websockets);
    });

    function getH2Content() {
        // We need this odd selector because jQuery's sizzle adds some strange caching elements to the DOM
        // when running on zombie.js which make it impossible to select via an id.
        // Couldn't figure out whats going on.
        return browser.window.jQuery("body > [data-node='page'] > div h2").text();
    }
});