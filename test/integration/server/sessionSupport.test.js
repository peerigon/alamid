var Browser = require("zombie");
var assert = require("assert"),
    expect = require("expect.js");

/*
describe("visit", function() {
    before(function(done) {
        this.browser = new Browser({ "debug" : true });
        this.browser
            .visit("http://localhost:9090/statics/websockettest.html")
            .then(done, done);
    });

    it("should load the promises page", function() {
        assert.equal(this.browser.location.pathname, "/statics/websockettest.html");
    });

    it("should load the promises page", function(done) {
        var browser = this.browser;
        var pommes1 = this.browser.evaluate("sessionTest();");

        pommes1.success = function(res) {
            assert.equal(JSON.stringify(res), '{"status":"success","data":{"sessionCounter":1}}');

            var pommes2 = browser.evaluate("sessionTest();");
            pommes2.success = function(res) {
                assert.equal(JSON.stringify(res), '{"status":"success","data":{"sessionCounter":2}}');
                done();
            };
        };
    });
});
*/
