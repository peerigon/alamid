"use strict";

var expect = require("expect.js");
var parseMiddlewareObject = require("../../lib/server/parseMiddlewareObject.js");

describe("parseMiddlewareObject", function () {

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
     "create update destroy /blogPost": blogPostCPD,
     "destroy /users" : usersD,
     "create /users" : usersC,
     "create update /users/friends": [usersCommentsCU1, usersCommentsCU2],
     "create /users/friends/comments" : usersFriendsCommentsC
     };

     var mwObj = parseMiddlewareObject([], mwDef);

     //BlogPost
     expect(mwObj.blogpost.create[0]).to.eql(blogPostCPD);
     expect(mwObj.blogpost.update[0]).to.eql(blogPostCPD);
     expect(mwObj.blogpost.destroy[0]).to.eql(blogPostCPD);

     //BlogPost-comments
     expect(mwObj["blogpost/comments"].create[0]).to.eql(blogPostCPD);
     expect(mwObj["blogpost/comments"].update[0]).to.eql(blogPostCPD);
     expect(mwObj["blogpost/comments"].destroy[0]).to.eql(blogPostCPD);

     expect(mwObj["blogpost/comments"].read[0]).to.be(blogPostCommentsG);

     //Users
     expect(mwObj.users.create[0]).to.be(usersC);
     expect(mwObj.users.destroy[0]).to.be(usersD);

     //Users-friends
     expect(mwObj["users/friends"].create[0]).to.be(usersC);
     expect(mwObj["users/friends"].destroy[0]).to.be(usersD);

     expect(mwObj["users/friends"].create[1]).to.be(usersCommentsCU1);
     expect(mwObj["users/friends"].create[2]).to.be(usersCommentsCU2);

     expect(mwObj["users/friends"].update[0]).to.be(usersCommentsCU1);
     expect(mwObj["users/friends"].update[1]).to.be(usersCommentsCU2);

     //Users-friends-comments
     expect(mwObj["users/friends/comments"].create[0]).to.be(usersC);
     expect(mwObj["users/friends/comments"].destroy[0]).to.be(usersD);

     expect(mwObj["users/friends/comments"].create[1]).to.be(usersCommentsCU1);
     expect(mwObj["users/friends/comments"].create[2]).to.be(usersCommentsCU2);

     expect(mwObj["users/friends/comments"].update[0]).to.be(usersCommentsCU1);
     expect(mwObj["users/friends/comments"].update[1]).to.be(usersCommentsCU2);

     expect(mwObj["users/friends/comments"].create[3]).to.be(usersFriendsCommentsC);
     });

     it("should convert a given object and recognize wildcards for methods", function () {

     var mwDef =  {
     "read /blogPost/comments": blogPostCommentsG,
     "create update destroy /blogPost": blogPostCPD,
     "* /blogPost" : blogPostAll
     };

     var mwObj = parseMiddlewareObject([], mwDef);

     //BlogPost
     expect(mwObj.blogpost.create[0]).to.eql(blogPostAll);
     expect(mwObj.blogpost.read[0]).to.eql(blogPostAll);
     expect(mwObj.blogpost.update[0]).to.eql(blogPostAll);
     expect(mwObj.blogpost.destroy[0]).to.eql(blogPostAll);

     expect(mwObj.blogpost.create[1]).to.eql(blogPostCPD);
     expect(mwObj.blogpost.update[1]).to.eql(blogPostCPD);
     expect(mwObj.blogpost.destroy[1]).to.eql(blogPostCPD);

     //BlogPost-comments
     expect(mwObj["blogpost/comments"].create[0]).to.eql(blogPostAll);
     expect(mwObj["blogpost/comments"].read[0]).to.eql(blogPostAll);
     expect(mwObj["blogpost/comments"].update[0]).to.eql(blogPostAll);
     expect(mwObj["blogpost/comments"].destroy[0]).to.eql(blogPostAll);

     expect(mwObj["blogpost/comments"].create[1]).to.eql(blogPostCPD);
     expect(mwObj["blogpost/comments"].update[1]).to.eql(blogPostCPD);
     expect(mwObj["blogpost/comments"].destroy[1]).to.eql(blogPostCPD);

     expect(mwObj["blogpost/comments"].read[1]).to.be(blogPostCommentsG);
     });

     it("should convert a given object and recognize wildcards paths", function () {

     function readGlobal() {}
     function updateGlobal() {}
     function makeAllStuffAwesome() {}

     var mwDef =  {
     "read /": readGlobal,
     "update /*" : updateGlobal,
     "* /" : makeAllStuffAwesome,
     "create update destroy /blogPost": blogPostCPD
     };

     var mwObj = parseMiddlewareObject([], mwDef);

     //BlogPost
     expect(mwObj.blogpost.create[0]).to.eql(makeAllStuffAwesome);
     expect(mwObj.blogpost.read[0]).to.eql(makeAllStuffAwesome);
     expect(mwObj.blogpost.update[0]).to.eql(makeAllStuffAwesome);
     expect(mwObj.blogpost.destroy[0]).to.eql(makeAllStuffAwesome);

     expect(mwObj.blogpost.read[1]).to.eql(readGlobal);
     expect(mwObj.blogpost.update[1]).to.eql(updateGlobal);

     expect(mwObj.blogpost.create[1]).to.eql(blogPostCPD);
     expect(mwObj.blogpost.update[2]).to.eql(blogPostCPD);
     expect(mwObj.blogpost.destroy[1]).to.eql(blogPostCPD);
     });

     it("should keep the given order if there are more methods for the same path", function() {

     function blogPostRead (){}
     function blogPostUpdateAndRead() {}

     var mwDef =  {
     "read /blogPost": blogPostRead,
     "read update /blogPost" : blogPostUpdateAndRead
     };

     var mwObj = parseMiddlewareObject([], mwDef);

     //BlogPost
     expect(mwObj.blogpost.read[0]).to.eql(blogPostUpdateAndRead);
     expect(mwObj.blogpost.read[1]).to.eql(blogPostRead);
     expect(mwObj.blogpost.update[0]).to.eql(blogPostUpdateAndRead);

     mwDef =  {
     "read update /blogPost" : blogPostUpdateAndRead,
     "read /blogPost": blogPostRead
     };

     mwObj = parseMiddlewareObject([], mwDef);

     //BlogPost
     expect(mwObj.blogpost.read[1]).to.eql(blogPostUpdateAndRead);
     expect(mwObj.blogpost.read[0]).to.eql(blogPostRead);
     expect(mwObj.blogpost.update[0]).to.eql(blogPostUpdateAndRead);
     });

     it("should accept wildcard-only middleware definitions", function () {

     var mwDef =  {
     "* /*": blogPostCommentsG
     };

     var mwObj = parseMiddlewareObject([], mwDef);
     expect(mwObj["/"].create[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj["/"].read[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj["/"].update[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj["/"].destroy[0]).to.be.eql(blogPostCommentsG);
     });

     it("should accept wildcard-only middleware and merge them with other paths", function () {

     var mwDef =  {
     "* /*": blogPostCommentsG,
     "create /blogpost" : blogPostCPD
     };

     var mwObj = parseMiddlewareObject([], mwDef);

     expect(mwObj["/"].create[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj["/"].read[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj["/"].update[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj["/"].destroy[0]).to.be.eql(blogPostCommentsG);

     expect(mwObj.blogpost.create[0]).to.be.eql(blogPostCommentsG);
     expect(mwObj.blogpost.create[1]).to.be.eql(blogPostCPD);
     });


    it("should add routes for defined paths that are not part of the middleware", function () {

        var mwDef =  {
            "* /*": blogPostCommentsG,
            "create /blogpost" : blogPostCPD
        };

        var mwObj = parseMiddlewareObject(["users", "friends", "blogpost/comment"], mwDef);

        expect(mwObj["/"].create[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["/"].read[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["/"].update[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["/"].destroy[0]).to.be.eql(blogPostCommentsG);

        expect(mwObj.blogpost.create[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.blogpost.read[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.blogpost.update[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.blogpost.destroy[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.blogpost.create[1]).to.be.eql(blogPostCPD);


        expect(mwObj.users.create[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.users.read[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.users.update[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.users.destroy[0]).to.be.eql(blogPostCommentsG);

        expect(mwObj.friends.create[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.friends.read[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.friends.update[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj.friends.destroy[0]).to.be.eql(blogPostCommentsG);

        expect(mwObj["blogpost/comment"].create[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["blogpost/comment"].read[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["blogpost/comment"].update[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["blogpost/comment"].destroy[0]).to.be.eql(blogPostCommentsG);
        expect(mwObj["blogpost/comment"].create[1]).to.be.eql(blogPostCPD);
        //console.log(mwObj);
    });
});
