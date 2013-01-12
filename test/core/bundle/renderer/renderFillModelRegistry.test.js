"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    renderFillModelRegistry = require("../../../../lib/core/bundle/renderer/renderFillModelRegistry.js"),
    vm = require("vm");

var rootPath = path.resolve(__dirname, "../../collect/collectModels"),
modelsPath = path.resolve(__dirname, "../../collect/collectModels");

describe("renderFillModelRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (path.indexOf("alamid/lib/shared/registries/modelRegistry.js") !== -1) {
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
        var src = renderFillModelRegistry(rootPath, modelsPath);

        vm.runInNewContext(src, sandbox);
    });

    it("should only register 'blogpost' and 'blogpost/comment'", function () {
        expect(registry).to.only.have.keys(["blogpost", "blogpost/comment"]);
    });
});
