"use strict";

var expect = require("expect.js");

var collectMiddleware = require("../../lib/server/collectMiddleware.js");

describe("collectMiddleware", function () {

    describe("#middlewareDefintionToObject", function() {

        var usersD = function usersD(){},
            usersC = function usersC(){},
            blogPostCPD = function blogPostCPD(){},
            blogPostAll = function blogPostAll(){},
            usersCommentsCU1 = function usersCommentsCU1() {},
            usersCommentsCU2 = function usersCommentsCU2() {},
            usersFriendsCommentsC = function usersFriendsCommentsC(){},
            blogPostCommentsG = function blogPostCommentsG(){};

        it("should convert a given object without wildcards", function () {

            var mwDef =  {
                "read /blogPost/comments": blogPostCommentsG,
                "create update delete /blogPost": blogPostCPD,
                "delete /users" : usersD,
                "create /users" : usersC,
                "create update /users/friends": [usersCommentsCU1, usersCommentsCU2],
                "create /users/friends/comments" : usersFriendsCommentsC
            };

            var mwObj = collectMiddleware.middlewareDefintionToObject(mwDef);

            //BlogPost
            expect(mwObj.blogPost.create[0]).to.eql(blogPostCPD);
            expect(mwObj.blogPost.update[0]).to.eql(blogPostCPD);
            expect(mwObj.blogPost.delete[0]).to.eql(blogPostCPD);

            //BlogPost-comments
            expect(mwObj["blogPost/comments"].create[0]).to.eql(blogPostCPD);
            expect(mwObj["blogPost/comments"].update[0]).to.eql(blogPostCPD);
            expect(mwObj["blogPost/comments"].delete[0]).to.eql(blogPostCPD);

            expect(mwObj["blogPost/comments"].read[0]).to.be(blogPostCommentsG);

            //Users
            expect(mwObj.users.create[0]).to.be(usersC);
            expect(mwObj.users.delete[0]).to.be(usersD);

            //Users-friends
            expect(mwObj["users/friends"].create[0]).to.be(usersC);
            expect(mwObj["users/friends"].delete[0]).to.be(usersD);

            expect(mwObj["users/friends"].create[1]).to.be(usersCommentsCU1);
            expect(mwObj["users/friends"].create[2]).to.be(usersCommentsCU2);

            expect(mwObj["users/friends"].update[0]).to.be(usersCommentsCU1);
            expect(mwObj["users/friends"].update[1]).to.be(usersCommentsCU2);

            //Users-friends-comments
            expect(mwObj["users/friends/comments"].create[0]).to.be(usersC);
            expect(mwObj["users/friends/comments"].delete[0]).to.be(usersD);

            expect(mwObj["users/friends/comments"].create[1]).to.be(usersCommentsCU1);
            expect(mwObj["users/friends/comments"].create[2]).to.be(usersCommentsCU2);

            expect(mwObj["users/friends/comments"].update[0]).to.be(usersCommentsCU1);
            expect(mwObj["users/friends/comments"].update[1]).to.be(usersCommentsCU2);

            expect(mwObj["users/friends/comments"].create[3]).to.be(usersFriendsCommentsC);
        });

        it("should convert a given object and recognize wildcards for methods", function () {

            var mwDef =  {
                "read /blogPost/comments": blogPostCommentsG,
                "create update delete /blogPost": blogPostCPD,
                "* /blogPost" : blogPostAll
            };

            var mwObj = collectMiddleware.middlewareDefintionToObject(mwDef);

            //BlogPost
            expect(mwObj.blogPost.create[0]).to.eql(blogPostAll);
            expect(mwObj.blogPost.read[0]).to.eql(blogPostAll);
            expect(mwObj.blogPost.update[0]).to.eql(blogPostAll);
            expect(mwObj.blogPost.delete[0]).to.eql(blogPostAll);

            expect(mwObj.blogPost.create[1]).to.eql(blogPostCPD);
            expect(mwObj.blogPost.update[1]).to.eql(blogPostCPD);
            expect(mwObj.blogPost.delete[1]).to.eql(blogPostCPD);

            //BlogPost-comments
            expect(mwObj["blogPost/comments"].create[0]).to.eql(blogPostAll);
            expect(mwObj["blogPost/comments"].read[0]).to.eql(blogPostAll);
            expect(mwObj["blogPost/comments"].update[0]).to.eql(blogPostAll);
            expect(mwObj["blogPost/comments"].delete[0]).to.eql(blogPostAll);

            expect(mwObj["blogPost/comments"].create[1]).to.eql(blogPostCPD);
            expect(mwObj["blogPost/comments"].update[1]).to.eql(blogPostCPD);
            expect(mwObj["blogPost/comments"].delete[1]).to.eql(blogPostCPD);

            expect(mwObj["blogPost/comments"].read[1]).to.be(blogPostCommentsG);
        });

        it("should convert a given object and recognize wildcards paths", function () {

            function readGlobal() {}
            function updateGlobal() {}
            function makeAllStuffAwesome() {}

            var mwDef =  {
                "read /": readGlobal,
                "update /*" : updateGlobal,
                "* /" : makeAllStuffAwesome,
                "create update delete /blogPost": blogPostCPD
            };

            var mwObj = collectMiddleware.middlewareDefintionToObject(mwDef);

            //BlogPost
            expect(mwObj.blogPost.create[0]).to.eql(makeAllStuffAwesome);
            expect(mwObj.blogPost.read[0]).to.eql(makeAllStuffAwesome);
            expect(mwObj.blogPost.update[0]).to.eql(makeAllStuffAwesome);
            expect(mwObj.blogPost.delete[0]).to.eql(makeAllStuffAwesome);

            expect(mwObj.blogPost.read[1]).to.eql(readGlobal);
            expect(mwObj.blogPost.update[1]).to.eql(updateGlobal);

            expect(mwObj.blogPost.create[1]).to.eql(blogPostCPD);
            expect(mwObj.blogPost.update[2]).to.eql(blogPostCPD);
            expect(mwObj.blogPost.delete[1]).to.eql(blogPostCPD);
        });

        it("should keep the given order if there are more methods for the same path", function() {

            function blogPostRead (){}
            function blogPostUpdateAndRead() {}

            var mwDef =  {
                "read /blogPost": blogPostRead,
                "read update /blogPost" : blogPostUpdateAndRead
            };

            var mwObj = collectMiddleware.middlewareDefintionToObject(mwDef);

            //BlogPost
            expect(mwObj.blogPost.read[0]).to.eql(blogPostUpdateAndRead);
            expect(mwObj.blogPost.read[1]).to.eql(blogPostRead);
            expect(mwObj.blogPost.update[0]).to.eql(blogPostUpdateAndRead);

            mwDef =  {
                "read update /blogPost" : blogPostUpdateAndRead,
                "read /blogPost": blogPostRead
            };

            mwObj = collectMiddleware.middlewareDefintionToObject(mwDef);

            //BlogPost
            expect(mwObj.blogPost.read[1]).to.eql(blogPostUpdateAndRead);
            expect(mwObj.blogPost.read[0]).to.eql(blogPostRead);
            expect(mwObj.blogPost.update[0]).to.eql(blogPostUpdateAndRead);
        });
    });
});
