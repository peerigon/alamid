var testCase = require('nodeunit').testCase,
    wrap = require('../../lib').util.wrap;
    
///////////////////////////////////////////////////////////////////////////////////////

var wrappedSomething;

function doSomethingRight(arg1, arg2, arg3, callback) {
    // do something right
    if(callback) {
        setTimeout(function() {
            callback(undefined, 'arg4', 'arg5');
        }, 0);
    }
}

function doSomethingWrong(arg1, arg2, arg3, callback) {
    // do something wrong
    if(callback) {
        setTimeout(function() {
            callback('error');
        }, 0);
    }
}

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    doSomethingRightWithCallback: function(test) {
        function callback(err, arg4, arg5, arg1, arg2, arg3) {
            test.equal(err, undefined);
            test.equal(arg4, 'arg4');
            test.equal(arg5, 'arg5');
            test.equal(arg1, 'arg1');
            test.equal(arg2, 'arg2');
            test.equal(arg3, 'arg3');
            test.done();
        }
        
        test.expect(6);
        wrappedSomething = wrap(doSomethingRight);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },
    doSomethingWrongWithCallback: function(test) {
        function callback(err, arg4, arg5, arg1, arg2, arg3) {
            test.equal(err, 'error');
            test.equal(arg4, undefined);
            test.equal(arg5, undefined);            
            test.equal(arg1, 'arg1');
            test.equal(arg2, 'arg2');
            test.equal(arg3, 'arg3');
            test.done();
        }
        
        test.expect(6);
        wrappedSomething = wrap(doSomethingWrong);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },
    doSomethingWrongAndIgnoreError: function(test) {
        function callback(err, arg4, arg5, arg1, arg2, arg3) {
            test.equal(err, undefined);
            test.equal(arg4, undefined);
            test.equal(arg5, undefined);            
            test.equal(arg1, 'arg1');
            test.equal(arg2, 'arg2');
            test.equal(arg3, 'arg3');
            test.done();
        }
        
        test.expect(6);
        wrappedSomething = wrap(doSomethingWrong, true);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },
    doSomethingWithoutCallback: function(test) {
        test.expect(1);
        test.doesNotThrow(function() {
            wrappedSomething('arg1', 'arg2', 'arg3');
        });
        test.done();
    },
    doSomethingRightWithLessParameters: function(test) {
        function callback(err, arg4, arg5, arg1) {
            test.equal(err, undefined);         
            test.equal(arg4, 'arg4');
            test.equal(arg5, 'arg5');
            test.equal(arg1, 'arg1');
            test.done();
        }
        
        test.expect(4);
        wrappedSomething = wrap(doSomethingRight);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },
    doSomethingWrongWithLessParameters: function(test) {
        function callback(err, arg4, arg5, arg1) {
            test.equal(err, 'error');         
            test.equal(arg4, 'arg1');
            test.equal(arg5, 'arg2');
            test.equal(arg1, 'arg3');
            test.done();
        }
        
        test.expect(4);
        wrappedSomething = wrap(doSomethingWrong);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },    
    doSomethingWrongWithEvenLessParameters: function(test) {
        function callback(err, arg4, arg5) {
            test.equal(err, 'error');         
            test.equal(arg4, 'arg1');
            test.equal(arg5, 'arg2');
            test.done();
        }
        
        test.expect(3);
        wrappedSomething = wrap(doSomethingWrong);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },
    doSomethingWrongWithMoreParameters: function(test) {
        function callback(err, arg4, arg5, arg1, arg2, arg3, argX, argY) {
            test.equal(err, 'error');         
            test.equal(arg4, undefined);
            test.equal(arg5, undefined);
            test.equal(arg1, undefined);
            test.equal(arg2, undefined);
            test.equal(arg3, 'arg1');
            test.equal(argX, 'arg2');
            test.equal(argY, 'arg3');
            test.done();
        }
        
        test.expect(8);
        wrappedSomething = wrap(doSomethingWrong);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    },
    doSomethingWrongAndCollectError: function(test) {
        var errors = [];
        
        function callback(err) {
            test.equal(err, undefined);
            test.equal(errors.length, 1);
            test.done();
        }
        
        test.expect(2);
        wrappedSomething = wrap(doSomethingWrong, errors);
        wrappedSomething('arg1', 'arg2', 'arg3', callback);
    }
})