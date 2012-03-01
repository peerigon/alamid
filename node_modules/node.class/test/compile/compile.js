var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    compile = require('../../lib').compile;

///////////////////////////////////////////////////////////////////////////////////////

exports.compile = testCase({
    compile: function(test) {
        compile(__dirname + '/src/node_modules', __dirname + '/compiled/node_modules');
        var Class = require('./compiled/node_modules/Class.class.js'),
            class1 = new Class();

        class1.assertProperties();
        test.done();
    },
    compileWithIncludes: function(test) {
        var options = {
                includes: {
                    SomethingIncluded: __dirname + '/include/node_modules'
                }
            },
            Class,
            class1;

        compile(__dirname + '/srcWithIncludes/node_modules', __dirname + '/compiledWithIncludes/node_modules', options);
        Class = require('./compiledWithIncludes/node_modules/Class.class.js');
        class1 = new Class();
        test.equal(class1.sayImFine(), "Yes, I'm fine");
        test.equal(class1.speakForModules(), '"I\'m a module" "Me, too"');
        test.done();
    },
    wrongPaths: function(test) {
        test.throws(function() {
            compile('./asdasd', './asdd');
        })
        test.done();
    }
});