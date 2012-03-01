var testCase = require('nodeunit').testCase,
    paths2obj = require('../../lib').util.paths2obj;

///////////////////////////////////////////////////////////////////////////////////////

var pathsObj = {
        'aaa/bbb/eee/ddd': 'aaa/bbb/eee/ddd',
        'aaa/bbb/ccc': 'aaa/bbb/ccc',
        'aaa/bbb/ddd': 'aaa/bbb/ddd',
        'ccc/ddd': 'ccc/ddd',
        'ccc/aaa': 'ccc/aaa',
        'bbb/aaa': 'bbb/aaa'
    },
    pathsArr = Object.keys(pathsObj),
    expectedObj1 = {
        'aaa': {
            'bbb': {
                'ccc': 'aaa/bbb/ccc',
                'ddd': 'aaa/bbb/ddd',
                'eee': {
                    'ddd': 'aaa/bbb/eee/ddd'
                }
            }
        },
        'bbb': {
            'aaa': 'bbb/aaa'
        },
        'ccc': {
            'ddd': 'ccc/ddd',
            'aaa': 'ccc/aaa'
        }
    },
    expectedObj2 = {
        'aaa': {
            'bbb': {
                'ccc': false,
                'ddd': false,
                'eee': {
                    'ddd': false
                }
            }
        },
        'bbb': {
            'aaa': false
        },
        'ccc': {
            'ddd': false,
            'aaa': false
        }
    }

module.exports = testCase({
    arr: function(test) {
        var result = paths2obj(pathsArr);
        test.deepEqual(result, expectedObj2);
        test.done();
    },
    obj: function(test) {
        var result = paths2obj(pathsObj);
        test.deepEqual(result, expectedObj1);
        test.done();
    },
    errObj: function(test) {
        var wrongObj = {
            'aaa/bbb/ccc': 'some data',
            'aaa/bbb': 'some other data'
        };

        test.throws(function() {
            paths2obj(wrongObj);
        });
        test.done();
    },
    substrTest: function(test) {
        var pathsObj = {
                '/aaa/bbb/ccc/ddd': 'some data',
                '/aaa/bbb/ccc/eee': 'some other data'
            },
            pathsArr = [
                '/aaa/bbb/ccc/ddd',
                '/aaa/bbb/ccc/eee'
            ],
            result;

        result = paths2obj(pathsObj, '/aaa/bbb/ccc/'.length);
        test.equals(result.ddd, 'some data');
        test.equals(result.eee, 'some other data');
        result = paths2obj(pathsArr, '/aaa/bbb/ccc/'.length);
        test.strictEqual(result.ddd, false);
        test.strictEqual(result.eee, false);
        test.done();
    }
});