"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    renderFillServiceRegistry = require("../../../lib/core/bundle/renderFillServiceRegistry.js"),
    vm = require("vm");

var servicesPath = path.resolve(__dirname, "../collect/collectServices");

describe("renderFillServiceRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (path === "alamid/lib/shared/registries/serviceRegistry.js") {
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
        var src = renderFillServiceRegistry(servicesPath);
        console.log("src", src);
        vm.runInNewContext(src, sandbox);
    });

    it("should only register 'a', 'b' and 'b/c'", function () {
        expect(registry).to.only.have.keys(["a", "b", "b/c"]);
    });
});