"use strict";

var expect = require("expect.js");

var collectMiddleware = require("../../lib/server/collectMiddleware.js");

describe("collectMiddleware", function () {

    describe("#middlewareDefintionToObject", function() {

        it("should convert a given object", function () {

            var mwDef =  {
                "get /blogPost/comments": function blogPostCommentsG(){ },
                "create put delete /blogPost": function blogPostCPD(){},
                "delete /users" : function usersD() {},
                "create put /users/friends": [function usersCP1() {}, function usersCP2() {}]
            };

            var mwObj = collectMiddleware.middlewareDefintionToObject(mwDef);

            //console.log(mwObj);
        });
    });


});