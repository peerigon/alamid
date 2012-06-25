"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    middleware = require("../../lib/server/request/middleware.js");

describe("middleware", function () {

/*
    describe("#services", function() {

        function serviceFunction1 () {}
        function serviceFunction2 () {}

        it("should return middleware if the services-object was filled before", function () {

            middleware.middleware = {
                "services" : {
                    "myPath" : {
                        "create" : [serviceFunction1],
                        "delete" : [serviceFunction1, serviceFunction2]
                    }
                }
            };

            //console.log(middleware.middleware.services);

            var myPathCreate,
                myPathDelete;

            myPathCreate = middleware.getMiddleware("services", "read", "myPath");
            myPathDelete = middleware.getMiddleware("services", "delete", "myPath");

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
     console.log(middleware.middleware.validators);

     it("should return middleware if the validators-object was filled before", function () {

     middleware.middleware.validators = {
     "myPath" : {
     "create" : [validatorsFunction1],
     "delete" : [validatorsFunction1, validatorsFunction2]
     }
     };

     var myPathCreate,
     myPathDelete;

     myPathCreate = middleware.getMiddleware("validators", "read", "myPath");
     myPathDelete = middleware.getMiddleware("validators", "delete", "myPath");

     expect(myPathCreate[0]).to.be(validatorsFunction1);

     expect(myPathDelete[0]).to.be(validatorsFunction1);
     expect(myPathDelete[1]).to.be(validatorsFunction2);
     });
     });
     */

});