var testCase = require('nodeunit').testCase,
    vm = require('vm'),
    collect = require('../../lib/collect'),
    assembleStrings = require('../../lib/assembleStrings');
    
///////////////////////////////////////////////////////////////////////////////////////    

var SuperClassModule = {
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

var sandbox = ClassModule;
sandbox.module = {
    exports: null
};
//sandbox.console = console;

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    assembleStrings: function(test) {
        var This = collect.collectProperties(ClassModule.Class),
            Super = collect.collectSuperProperties(SuperClassModule),
            src = assembleStrings(This, Super);
        
        test.doesNotThrow(function() {
            vm.runInNewContext(src, sandbox);
        })
        
        test.done();
    }
});