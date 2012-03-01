var testCase = require('nodeunit').testCase;

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    doesNotThrow: function(test) {
        test.doesNotThrow(function() {
            var setup = require('../../lib/setup');
        })
        test.done();
    }
});

