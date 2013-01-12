"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    renderFillServiceRegistry = require("../../../../lib/core/bundle/renderer/renderFillServiceRegistry.js"),
    vm = require("vm");

var servicesPath = path.resolve(__dirname, "../../collect/collectServices"),
    rootPath = servicesPath;

describe("renderFillServiceRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (path.indexOf("alamid/lib/shared/registries/serviceRegistry.js") !== -1) {
                    return {
                        setService: function setPage(serviceUrl, serviceClass) {
                            registry[serviceUrl] = serviceClass;
                        }
                    };
                }

                return require(path);
            },
            console: console
        };

    it("should throw no error", function () {
        var src = renderFillServiceRegistry(rootPath, servicesPath);
        vm.runInNewContext(src, sandbox);
    });

    it("should only register 'a', 'b' and 'b/c'", function () {
        expect(registry).to.only.have.keys(["a", "b", "b/c"]);
    });
});
