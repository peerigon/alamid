"use strict";

var usersD = function usersD(){},
    usersC = function usersC(){},
    blogPostCPD = function blogPostCPD(){},
    usersCommentsCU1 = function usersCommentsCU1() {},
    usersCommentsCU2 = function usersCommentsCU2() {},
    usersFriendsCommentsC = function usersFriendsCommentsC(){},
    blogPostCommentsG = function blogPostCommentsG(){};


var middleware = {
    "read /blogPost/comments": blogPostCommentsG,
    "create update delete /blogPost": blogPostCPD,
    "delete /users" : usersD,
    "create /users" : usersC,
    "create update /users/friends": [usersCommentsCU1, usersCommentsCU2],
    "create /users/friends/comments" : usersFriendsCommentsC
};

module.exports = middleware;


