var _ = require('underscore');
    testCase = require('nodeunit').testCase,
    collect = require('../../lib/collect'),
    collectProperties = collect.collectProperties,
    collectSuperProperties = collect.collectSuperProperties,
    collectOverriddenProperties = collect.collectOverriddenProperties,
    collectImplAbstracts = collect.collectImplAbstracts;
        
///////////////////////////////////////////////////////////////////////////////////////

var SuperSuperClassModule = {
    "Class": {
        "initialize": function() {},
        "__privateFunc": function() {},
        "__privateProp": "SuperSuperClassModule",
        "_protectedFunc": function() {},
        "_protectedProp": "SuperSuperClassModule",
        "publicFuncSuperSuper": function() {},
        "publicProp": "SuperSuperClassModule",
        "?somethingAbstract": function() {},
        "$staticFunc": function() {},
        "$staticPropSuperSuper": "SuperSuperClassModule"
    }
};

var SuperClassModule = {
    "Extends": SuperSuperClassModule,
    "Class": {
        "init": function() {},
        "__privateFunc": function() {},
        "?_protectedAbstract": function() {},
        "publicFunc": function() {},
        "publicProp": "SuperClass",
        "?somethingAbstract": function() {},
        "?anotherAbstract": function() {},
        "$staticFunc": function() {},
        "$staticProp": "SuperClass"
    }
};

var ClassModule = {
    "Extends": SuperClassModule,
    "Class": {
        "init": function() {},
        "__privateFunc": function() {},
        "__privateProp": "ClassModule",
        "_protectedFunc": function() {},
        "_protectedAbstract": function() {},    // not abstract anymore
        "_protectedProp": "ClassModule",
        "publicFunc": function() {},
        "publicProp": "ClassModule",
        "?somethingAbstract": function() {},
        "anotherAbstract": function() {},    // not abstract anymore
        "$staticFunc": function() {},
        "$staticProp": "ClassModule"
    }    
};

    
///////////////////////////////////////////////////////////////////////////////////////    
    

module.exports = testCase({
    collectPropertiesClass: function(test) {
        var result;
        var Class = ClassModule.Class;
        var expectedResult = {
            "Init": "init",
            "Private": {
                "Function": {"__privateFunc": Class.__privateFunc},
                "Other": {"__privateProp": Class.__privateProp}
            },
            "Protected": {
                "Function": {"_protectedFunc": Class._protectedFunc, "_protectedAbstract": Class._protectedAbstract},
                "Other": {"_protectedProp": Class._protectedProp}
            },
            "Public": {
                "Function": {"publicFunc": Class.publicFunc, "anotherAbstract": Class.anotherAbstract},
                "Other": {"publicProp": Class.publicProp}
            },
            "Abstract": {
                "?somethingAbstract": Class["?somethingAbstract"]
            },
            "Static": {
                "Function": {"$staticFunc": Class.$staticFunc},
                "Other": {"$staticProp": Class.$staticProp}
            }
        };
        
        result = collectProperties(Class);
        test.deepEqual(result, expectedResult);
        test.done();
    },
    collectPropertiesTwoInitMethods: function(test) {
        var TwoInitMethods = {
            "init": function() {},
            "initialize": function() {}
        };
        
        test.throws(function() {
            collectProperties(TwoInitMethods);
        });
        test.done();
    },
    collectPropertiesInitNotAFunc: function(test) {
        var InitNotAFunc = {
            "init": 0
        };
        
        test.throws(function() {
            collectProperties(InitNotAFunc);
        });
        test.done();
    },
    collectPropertiesAbstractNotAFunc: function(test) {
        var AbstractNotAFunc = {
            "?abstract": 0
        };
        
        test.throws(function() {
            collectProperties(AbstractNotAFunc);
        });
        test.done();
    },
    collectSuperProperties: function(test) {
        var SuperSuperClass = SuperSuperClassModule.Class,
            SuperClass = SuperClassModule.Class,
            result,
            expectedResult = {
            "Init": "init",
            "Private": {
                "Function": {"__privateFunc": SuperClass.__privateFunc},
                "Other": {"__privateProp": SuperSuperClass.__privateProp}
            },
            "Protected": {
                "Function": {"_protectedFunc": SuperSuperClass._protectedFunc},
                "Other": {"_protectedProp": SuperSuperClass._protectedProp}
            },
            "Public": {
                "Function": {"publicFunc": SuperClass.publicFunc, "publicFuncSuperSuper": SuperSuperClass.publicFuncSuperSuper},
                "Other": {"publicProp": SuperClass.publicProp}
            },
            "Abstract": {
                "?somethingAbstract": SuperClass["?somethingAbstract"],
                "?anotherAbstract": SuperClass["?anotherAbstract"],
                "?_protectedAbstract": SuperClass["?_protectedAbstract"]
            },
            "Static": {
                "Function": {"$staticFunc": SuperClass.$staticFunc},
                "Other": {"$staticProp": SuperClass.$staticProp, "$staticPropSuperSuper": SuperSuperClass.$staticPropSuperSuper}
            }
        };
        
        result = collectSuperProperties(SuperClassModule);
        test.deepEqual(result, expectedResult);
        test.done();
    },
    collectOverriddenProperties: function(test) {
        var Class = ClassModule.Class,
            result,
            expectedResult = {
                "_protectedFunc": true,
                "_protectedProp": true,
                "publicFunc": true,
                "publicProp": true
            },
            classProps = collectProperties(Class),
            superClassProps = collectSuperProperties(SuperClassModule);
        
        result = collectOverriddenProperties(classProps, superClassProps);
        test.deepEqual(result, expectedResult);
        test.done();
    },
    collectImplAbstracts: function(test) {
        var Class = ClassModule.Class,
            result,
            expectedResult = {
                "_protectedAbstract": true,
                "anotherAbstract": true
            },
            superClassProps = collectSuperProperties(SuperClassModule),
            abstracts = _(superClassProps.Abstract).keys();
            
        result = collectImplAbstracts(Class, abstracts);
        test.deepEqual(result, expectedResult);
        test.done();
    },
    collectImplAbstractsUnhandledAbstract: function(test) {
        var Class = {},
            superClassProps = collectSuperProperties(SuperClassModule),
            abstracts = _(superClassProps.Abstract).keys();
        
        test.throws(function() {
            collectImplAbstracts(Class, abstracts);
        });
        test.done();
    }
});