var testCase = require('nodeunit').testCase,
    collectErr = require('../../lib').util.collectErr;
    
///////////////////////////////////////////////////////////////////////////////////////

var wrappedSomething;

function doSomethingRight(arg1, arg2, callback) {
    // do something right
    if(callback) {
        setTimeout(function() {
            callback(undefined, 'arg4', 'arg5');
        }, 0);
    }
}

function doSomethingWrong(arg1, arg2, callback) {
    // do something wrong
    if(callback) {
        setTimeout(function() {
            callback('error');
        }, 0);
    }
}

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    doSomethingRight: function(test) {
        var errors = [];
        
        function callback(err, arg4, arg5) {
            test.equal(err, undefined);
            test.equal(arg4, 'arg4');
            test.equal(arg5, 'arg5');
            test.done();
        }
        
        test.expect(4);
        test.doesNotThrow(function() {
            doSomethingRight('arg1', 'arg2', collectErr(callback, errors));
        });
    },
    doSomethingWrong: function(test) {
        var errors = [],
            times = 0;
        
        function callback(err, arg1, arg2) {
            times++;
            if(times === 3) {
                test.equal(err, undefined);
                test.equal(errors.length, 3);
                test.done();
            }
        }
        
        test.expect(3);
        test.doesNotThrow(function() {
            doSomethingWrong('arg1', 'arg2', collectErr(callback, errors));
            doSomethingWrong('arg1', 'arg2', collectErr(callback, errors));
            doSomethingWrong('arg1', 'arg2', collectErr(callback, errors));
        });
    },
    doSomethingWithoutCallback: function(test) {
        var errors = [];
        
        test.expect(1);
        test.doesNotThrow(function() {
            doSomethingRight('arg1', 'arg2', collectErr(undefined, errors));
        });
        setTimeout(function() {
            test.done();
        }, 50);
    }
})