var Class = require('./compiled_expected/node_modules/Class.class'),
    testClass,
    SuperClass = require('./compiled_expected/node_modules/SuperClass.class'),
    testSuperClass,
    SuperSuperClass = require('./compiled_expected/node_modules/SuperSuperClass.class'),
    testSuperSuperClass,
    testCase = require('nodeunit').testCase;

function log(txt) {
    console.log(txt.replace(/([\{\}\;])/gi, "$1\n"));
}

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    init: function(test) {
        test.doesNotThrow(function() {
            Class.$init();
        })
        test.ok(Class.$init === undefined);
        test.done();
    },
    classCreate: function(test) {
        test.doesNotThrow(function() {
            testClass = new Class("argument 1", "argument 2");
        })
        test.done();
    },
    assertAllInitialized: function(test) {
        test.equal(testClass.getIsClassInit(), true);
        test.equal(testClass.getIsSuperClassInit(), true);
        test.equal(testClass.getIsSuperSuperClassInit(), true);
        test.done();
    },
    assertProperties: function(test) {
        test.doesNotThrow(function() {
            testClass.assertProperties();
        })
        test.done();
    },
    ensureIndependentInstance: function(test) {
        test.notEqual(testClass.getIsClassInit(), Class.isClassInit);
        test.notEqual(testClass.getIsSuperClassInit(), Class.isSuperClassInit);
        test.notEqual(testClass.getIsSuperSuperClassInit(), Class.isSuperSuperClassInit);
        test.done();
    },
    testInstanceOfOperator: function(test) {
        test.ok(testClass instanceof Class);
        test.ok(testClass instanceof SuperClass);
        test.ok(testClass instanceof SuperSuperClass);
        test.done();
    },
    assertSuperConstructor: function(test) {
        var expected = [
            "argument 1","argument 2",
            "different argument 1","different argument 2",
            "different argument 1","different argument 2"
        ];
        
        test.deepEqual(testClass.getArgs(), expected);
        test.done();
    },
    testFunctionCalls: function(test) {
        test.equal(testClass.getPrivateStuffFromSuper(), 23);
        test.equal(testClass.callAbstract(), "i am not abstract anymore");
        test.equal(Class.staticString, "static");
        test.done();
    },
    testSetters: function(test) {
        test.doesNotThrow(function() {
            testClass.setPrivateStuff(24);
            testClass.setIsClassInit(false);
            testClass.setIsSuperClassInit(false);
            testClass.setIsSuperSuperClassInit(false);
        });
        test.done();
    },
    testGetters: function(test) {
        test.equal(testClass.getPrivateStuffFromSuper(), 24);
        test.equal(testClass.getIsClassInit(), false);
        test.equal(testClass.getIsSuperClassInit(), false);
        test.equal(testClass.getIsSuperSuperClassInit(), false);
        test.done();
    }
});
