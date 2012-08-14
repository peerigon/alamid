"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    renderFillServiceRegistry = require("../../../lib/core/bundle/renderFillServiceRegistry.js"),
    vm = require("vm");

var servicesPath = path.resolve(__dirname, "../collect/collectServices/app/services/");

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

                return function (callback) {
                    callback(path); // returning the path for testing purposes
                };
            },
            console: console
        };

    it("should throw no error", function () {
        var src = renderFillServiceRegistry(servicesPath);
        vm.runInNewContext(src, sandbox);
    });

    it("should only register 'a', 'b' and 'b/c'", function () {
        expect(registry).to.only.have.keys(["a", "b", "b/c"]);
    });
});