var testCase = require('nodeunit').testCase,
    normalizePath = require('../../lib/normalizePath');

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    normalizePath: function(test) {
        test.equal(normalizePath('aaa/bbb'), 'aaa/bbb');
        test.equal(normalizePath('aaa/bbb/'), 'aaa/bbb/');
        test.equal(normalizePath('./aaa'), 'aaa');
        test.equal(normalizePath('./aaa/'), 'aaa/');
        test.equal(normalizePath('././aaa'), 'aaa');
        test.equal(normalizePath('./aaa/bbb/../ccc'), 'aaa/ccc');
        test.equal(normalizePath('./aaa/bbb/ccc/ddd/../../../../eee'), 'eee');
        test.equal(normalizePath('aaa///bbb'), 'aaa/bbb');
        test.equal(normalizePath('aaa///bbb//'), 'aaa/bbb/');
        test.equal(normalizePath('../'), undefined);
        test.equal(normalizePath('aaa/bbb/../../../ccc'), undefined);
        test.done();
    }
})
