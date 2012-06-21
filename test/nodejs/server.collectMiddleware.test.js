"use strict";

var expect = require("expect.js");

var collectMiddleware = require("../../lib/server/collectMiddleware.js");

describe("collectMiddleware", function () {

    describe("#middlewareDefintionToObject", function() {

        it("should convert a given object", function () {

                var expectedResult = {
                    "services" : {
                        "blogPost" : {
                            "create" : [],
                            "delete" : []
                        },
                        "blogPost/comment/" : {
                            "create" : [],
                            "delete" : []
                        }
                    }
                };




    var mwDef =  {
        "read /blogPost/comments": function blogPostCommentsG(){ },
        "create update delete /blogPost": function blogPostCPD(){},
        "delete /users" : function usersD() {},
        "create /users" : function usersC() {},
        "create /users/friends/comments" : function usersfriendsCommentsC() {},
        "create update /users/friends": [function usersCP1() {}, function usersCP2() {}]
    };

    collectMiddleware.middlewareDefintionToObject(mwDef);

    //console.log(mwObj);
});
});


});