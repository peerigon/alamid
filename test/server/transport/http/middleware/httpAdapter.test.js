"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass");

nodeclass.registerExtension();

var Response = require("../../../../../lib/server/request/Response.class.js");
var Request = require("../../../../../lib/server/request/Request.class.js");

describe("httpAdapter", function(){

    afterEach(function() {
        rewire.reset();
    });

    var httpAdapter = rewire("../../../../../lib/server/transport/http/middleware/httpAdapter.js", false);

    it("should hand the request on to the httpAdapter if everything is alright", function (done) {

        var dummyData = { "da" : "ta" };

        var req = {
            "url" : "http://mydomain.com/services/blogpost",
            headers : [],
            parsedURL : {
                pathname : "/services/blogpost"
            },
            method : "PUT",
            body : dummyData,
            getSession : function() {
                return { "sessionData" : "blabla" };
            }
        };

        var res = {
            headers : [],
            write : function(data, encoding) {
                expect(data).to.contain(JSON.stringify(dummyData));
                expect(encoding).to.be("utf-8");
            },
            writeHead : function() {

            },
            end : function() {
                done();
            }
        };

        httpAdapter.__set__("handleRequest", function(aReq, callback) {

            var aRes = new Response();
            aRes.setData({ "da" : "ta"});
            aRes.setStatus("success");

            callback(null, aReq, aRes);
        });

        /*
        httpAdapter.__set__("Request", function(method, path, data){
            expect(method).to.be("update");
            expect(path).to.be("/services/blogpost");
            expect(data).to.be(dummyData);
        });
        */

        httpAdapter.__set__("Request", Request);

        httpAdapter(req, res, function(err) {
            if(err !== null){
                //this case should not happen
                done(err);
            }
        });
    });


    it("should next with an error if the request could not be converted", function (done) {

        var req = {
            "url" : "http://mydomain.com/services/blogpost",
            headers : [],
            parsedURL : {
                pathname : "/services/blogpost"
            },
            method : "BLA",
            body : { "bla" : "bla" }
        };

        var res = {
            headers : [],
            write : function() {
            },
            end : function() {
                done(new Error("This path should not be reached"));
            }
        };

        httpAdapter.__set__("Request", function(){
            throw new Error("Wrong params");
        });

        httpAdapter(req, res, function(err) {
            expect(err).to.be.an("object");
            done();
        });
    });
});