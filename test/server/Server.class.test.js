"use strict";

var expect = require("expect.js"),
    path = require("path");

var Server = require("../../lib/server/Server.class.js");

describe("Server", function () {

    /*
    describe("#bootstrap", function() {

        var server;

        beforeEach(function() {
            server = new Server();
        });

        it("should only add the alamid-routes on bootstrap", function() {

            server.setConfig("appDir", path.resolve(__dirname, "../integration/setup/testApp/"));

            server.bootstrap();

            var router = server.getRouter();

            //18 alamid-default routes added on bootstrap
            //for services and validators
            expect(router.items.length).to.eql(18);
        });
    });
    */

});