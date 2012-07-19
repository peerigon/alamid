"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass");

nodeclass.registerExtension();

var Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js");

var dummySchema = {
    title : { type : String },
    createDate : Date,
    count : Number
};

var schemasMock = {
    getSchema : function(path, type) {
        if(path === "blog") {
            return dummySchema;
        }
        return null;
    }
};

describe("sanitizeData", function () {

    var sanitizeData,
        req, res;

    beforeEach(function() {
        sanitizeData = rewire("../../../../lib/server/request/middleware/sanitizeData.js");
        sanitizeData.__set__("schemas", schemasMock);

        var requestData = {
            title : "my title",
            randomField : "random String",
            anotherRandomField : "random value 2",
            createDate : Date.now(),
            count : 12
        };

        req = new Request("read", "/services/blog", requestData);
        res = new Response();
    });

    it("should remove all fields that are not part of the shared-schema", function (done) {

        sanitizeData(req, res, function(err) {

            var expectedKeys = [
                "title",
                "createDate",
                "count"
            ];

            var data = req.getData();
            expect(err).to.be(undefined);
            expect(data).to.only.have.keys(expectedKeys);
            done();
        });
    });

    it("should next with an error if no shared-schema exists", function (done) {

        req.setPath("/services/nonExistent");

        sanitizeData(req, res, function(err) {
            expect(err).not.to.be(null);
            done();
        });
    });

});