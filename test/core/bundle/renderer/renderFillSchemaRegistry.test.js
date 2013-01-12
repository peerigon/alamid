"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    path = require("path"),
    renderFillSchemaRegistry = require("../../../../lib/core/bundle/renderer/renderFillSchemaRegistry.js"),
    vm = require("vm");

var schemasPath = path.resolve(__dirname, "../../collect/collectModels"),
    rootPath = schemasPath;


describe("renderFillSchemaRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (path.indexOf("alamid/lib/shared/registries/schemaRegistry.js") !== -1) {
                    return {
                        setSchema: function setSchema(pageURL, pageBundle, pageDataLoader) {
                            registry[pageURL] = {
                                bundle: pageBundle,
                                dataLoader: pageDataLoader
                            };
                        },
                        setSchemas : function setSchemas(schemas) {
                            registry = schemas;
                        },
                        schemas : registry
                    };
                }
                else if(path === "alamid/lib/core/helpers/extendSchemas.js") {
                    return require("../../../../lib/core/helpers/extendSchemas.js");
                }
                return require(path); // returning the path for testing purposes

            },
            console: console
        };

    it("should throw no error", function () {
        var src = renderFillSchemaRegistry(rootPath, schemasPath);
        vm.runInNewContext(src, sandbox);
    });


    it("should only register 'a', 'b' and 'b/c'", function () {

        expect(registry.client).to.only.have.keys(["blogpost", "blogpost/comment"]);
        expect(registry.shared).to.only.have.keys(["blogpost", "blogpost/comment"]);

        expect(registry.shared.blogpost.email.required).to.be(true);
        expect(registry.client.blogpost.email.required).to.be(true);

        //new attribute for client only
        expect(registry.client.blogpost.saved).not.to.be(undefined);
        expect(registry.shared.blogpost.saved).to.be(undefined);
    });

});