var testCase = require('nodeunit').testCase,
    compile = require('./setup').compile,
    load = require('./setup').load,
    ErrorClass,
    testClass,
    err,
    SuperSuperClass;

function build(name) {
    compile(name + '.class');
    ErrorClass = load(name + '.class');
}

function tryIt(func) {
    try {
        func();
    } catch(e) {
        err = e.message;
    }
}

module.exports = testCase({
    twoInit: function(test) {
        tryIt(function() {
            build('Error2Init');
        });
        test.equal(err, 'Found two init methods "initialize" and "init".');
        test.done();
    },
    initNotAFunc: function(test) {
        tryIt(function() {
            build('ErrorInitNonFunc');
        });
        test.equal(err, 'The init method "init" is not a function.');
        test.done();
    },
    abstract1Error: function(test) {
        tryIt(function() {
            build('Abstract1Error');
        });
        test.equal(err, 'You didnt take care of the inherited abstract function(s) "?abstract".\nDeclare them as abstract or implement them without the "?"-prefix.');
        test.done();
    },
    abstract2Error: function(test) {
        tryIt(function() {
            build('Abstract2Error');
        });
        test.equal(err, 'You can only define abstract functions.\nHowever, the abstract property "?anotherAbstract" is typeof boolean.');
        test.done();
    },
    abstract3Error: function(test) {
        build('Abstract3Error');
        tryIt(function() {
            testClass = new ErrorClass();
        });
        test.equal(err, 'Class error in ' + __dirname + '/compiled/node_modules/Abstract3Error.class.js: You cant instantiate an abstract class.\nThese methods are declared as abstract: "?anotherAbstract", "?abstract".');
        test.done();
    },
    recursionError: function(test) {
        build('RecursionError');
        tryIt(function() {
            testClass = new ErrorClass();
        });
        test.equal(err, 'Class error in ' + __dirname + '/compiled/node_modules/RecursionError.class.js: Constructor recursion detected.');
        test.done();
    }
});