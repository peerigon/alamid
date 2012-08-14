"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    renderFillModelRegistry = require("../../../lib/core/bundle/renderFillModelRegistry.js"),
    vm = require("vm");

var modelsPath = __dirname + "/renderFillModelRegistry/models";

describe("renderFillModelRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (path === "alamid/lib/shared/registries/modelRegistry.js") {
                    return {
                        setModel: function setPage(modelUrl, modelClass) {
                            registry[modelUrl] = modelClass;
                        }
                    };
                }

                return function (callback) {
                    callback(path); // returning the path for testing purposes
                };
            },
            console: console
        };

    it("should throw no error", function () {
        var src = renderFillModelRegistry(modelsPath);

        vm.runInNewContext(src, sandbox);
    });

    it("should only register 'blogpost' and 'blogpost/comment'", function () {
        expect(registry).to.only.have.keys(["blogpost", "blogpost/comment"]);
    });
});