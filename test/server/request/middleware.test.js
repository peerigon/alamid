"use strict";

var expect = require("expect.js"),
    middleware = require("../../../lib/server/request/middleware.js");

describe("middleware", function () {
    describe("#models", function() {

        function serviceFunction1 () {}
        function serviceFunction2 () {}

        it("should return middleware if the services-object was filled before", function () {

            middleware.setMiddleware("models", {
                "myPath" : {
                    "create" : [serviceFunction1],
                    "delete" : [serviceFunction1, serviceFunction2]
                }
            });

            var myPathCreate,
                myPathDelete;

            myPathCreate = middleware.getMiddleware("models", "myPath", "create");
            myPathDelete = middleware.getMiddleware("models", "myPath", "delete");

            expect(myPathCreate[0]).to.be(serviceFunction1);

            expect(myPathDelete[0]).to.be(serviceFunction1);
            expect(myPathDelete[1]).to.be(serviceFunction2);

        });
    });

    describe("#validators", function() {

        function validatorsFunction1 () {}
        function validatorsFunction2 () {}

        middleware.middleware.validators = {
            "myPath" : {
                "create" : [validatorsFunction1],
                "delete" : [validatorsFunction1, validatorsFunction2]
            }
        };

        it("should return middleware if the validators-object was filled before", function () {
            middleware.setMiddleware("validators", {
                "myPath" : {
                    "create" : [validatorsFunction1],
                    "delete" : [validatorsFunction1, validatorsFunction2]
                }
            });

            var myPathCreate,
                myPathDelete;

            myPathCreate = middleware.getMiddleware("validators", "myPath", "create");
            myPathDelete = middleware.getMiddleware("validators", "myPath", "delete");

            expect(myPathCreate[0]).to.be(validatorsFunction1);

            expect(myPathDelete[0]).to.be(validatorsFunction1);
            expect(myPathDelete[1]).to.be(validatorsFunction2);
        });
    });


});