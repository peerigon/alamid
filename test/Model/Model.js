var testCase = require('nodeunit').testCase,
    fs = require('fs'),
    pathUtil = require('path'),
    compile = require('nodeclass').compile;

var src,
    alamidFolder = pathUtil.resolve('../../lib/shared'),
    srcFolder = __dirname + '/src',
    compiledFolder = __dirname + '/compiled',
    User, User2, user;

// Copying all necessary files into the test src folder to get the latest versions
src = fs.readFileSync(alamidFolder + '/EventEmitter.class.js', 'utf8');
fs.writeFileSync(srcFolder + '/EventEmitter.class.js', src, 'utf8');
src = fs.readFileSync(alamidFolder + '/Model.class.js', 'utf8');
fs.writeFileSync(srcFolder + '/Model.class.js', src, 'utf8');
src = fs.readFileSync(alamidFolder + '/typeOf.js', 'utf8');
fs.writeFileSync(srcFolder + '/typeOf.js', src, 'utf8');

compile(srcFolder, compiledFolder);

User1 = require('./compiled/User1.class.js');
User2 = require('./compiled/User2.class.js');

///////////////////////////////////////////////////////////////////////////////////////

exports.User1 = testCase({
    setUp: function(callback) {
        user = new User1();
        callback();
    },
    setterAndGetter: function(test) {
        test.equal(user.get('name'), 'John Wayne');
        test.equal(user.get('age'), 45);
        user.set('name', 'John Wayne the mighty cowboy');
        user.set('age', 46);
        test.equal(user.get('name'), 'John Wayne the mighty cowboy');
        test.equal(user.get('age'), 46);
        user.set({
            name: 'John Doe',
            age: 200
        });
        test.deepEqual(
            user.get('name', 'age'),
            {
                name: 'John Doe',
                age: 200
            }
        );
        test.deepEqual(
            user.get(),
            {
                name: 'John Doe',
                age: 200,
                kills: null
            }
        );
        test.done();
    },
    setterAndGetterFail: function(test) {
        test.expect(1);
        try {
            user.set('gun', 'colt');
        } catch (err) {
            test.equal(err.message, 'Unknown property gun');
        }
        test.done();
    },
    castingTest: function(test) {
        user.set('age', '20');
        user.set('name', new Date(0).getFullYear());
        test.strictEqual(user.get('age'), 20);
        test.strictEqual(user.get('name'), '1970');
        test.done();
    },
    escapeTest: function(test) {
        user.set('name', '<script>alert("PWNED");</script>');
        test.equal(user.escape('name'), '&lt;script&gt;alert(&quot;PWNED&quot;);&lt;&#47;script&gt;');
        test.done();
    },
    remove: function(test) {
        user.set('name', 'Octocat');
        test.equal(user.get('name'), 'Octocat');
        user.remove('name');
        test.equal(user.get('name'), 'John Wayne');
        user.remove('name');
        test.equal(user.get('name'), 'John Wayne');     // cannot remove default values;
        user.set({
            name: 'Octocat',
            age: 4
        });
        user.remove('name', 'age');
        test.equal(user.get('name'), 'John Wayne');
        test.equal(user.get('age'), 45);
        test.done();
    },
    removeAll: function(test) {
        user.set({
            name: 'Octocat',
            age: 5,
            kills: 1
        });
        user.accept();     // trigger acceptCurrentState, just to be sure that is is removed and not unset
        user.removeAll();
        test.deepEqual(user.get('name', 'age', 'kills'), {
            name: "John Wayne",
            age: 45,
            kills: null
        });
        test.done();
    },
    unset: function(test) {
        user.set('name', 'Octocat');
        test.equal(user.get('name'), 'Octocat');
        user.unset('name');
        test.equal(user.get('name'), 'John Wayne');
        user.set('name', 'Octocat');
        user.accept();    // trigger acceptCurrentState
        user.unset('name');
        test.equal(user.get('name'), 'Octocat');
        user.set({
            name: 'Johnny Rotten',
            age: 50
        });
        user.accept();
        user.unset('name', 'age');
        test.deepEqual(user.get('name', 'age'), {
            name: 'Johnny Rotten',
            age: 50
        });
        test.done();
    },
    unsetAll: function(test) {
        user.set('name', 'Octocat');
        user.accept();
        user.set('age', 5);
        user.set('kills', 2);
        user.unsetAll();
        test.deepEqual(user.get('name', 'age', 'kills'), {
            name: 'Octocat',
            age: 45,
            kills: null
        });
        test.done();
    },
    hasChanged: function(test) {
        test.strictEqual(user.hasChanged(), false);
        test.strictEqual(user.hasChanged(true), false);
        user.set('name', 'Octocat');
        test.strictEqual(user.hasChanged('name'), true);
        test.strictEqual(user.hasChanged(), true);
        user.remove('name');
        test.strictEqual(user.hasChanged('name'), false);
        user.set('age', 5);
        test.strictEqual(user.hasChanged('name', 'age'), true);
        user.set('age', 45);    // 45 equals the default value
        test.strictEqual(user.hasChanged('age'), false);
        test.strictEqual(user.hasChanged('age', true), true);
        user.remove('name', 'age');
        test.strictEqual(user.hasChanged(), false);
        test.done();
    },
    isDefault: function(test) {
        test.strictEqual(user.isDefault(), true);
        test.strictEqual(user.isDefault(true), true);
        user.set('name', 'Octocat');
        test.strictEqual(user.isDefault(), false);
        test.strictEqual(user.isDefault('age'), true);
        user.remove('name');
        test.strictEqual(user.isDefault('name'), true);
        user.set('age', 5);
        test.strictEqual(user.isDefault('name', 'age'), false);
        user.set('age', 45);    // 45 equals the default value
        test.strictEqual(user.isDefault('age'), true);
        test.strictEqual(user.isDefault('age', true), false);
        user.remove('name', 'age');
        test.strictEqual(user.isDefault(), true);
        test.done();
    },
    toJSON: function(test) {
        var json1,
            json2,
            json3;

        user.set('name', 'Octocat');
        user.set({
            age: 5,
            kills: 1
        });
        test.deepEqual(user.getDefaults(), {
            name: 'John Wayne',
            age: 45,
            kills: Number
        });
        test.deepEqual(user.toJSON(), {
            name: 'Octocat',
            age: 5,
            kills: 1
        });

        json1 = user.toJSON();
        json2 = JSON.parse(JSON.stringify(user));    // fake serializing
        user.set(json2);
        json3 = user.toJSON();
        test.deepEqual(json1, json2);
        test.deepEqual(json2, json3);

        user.removeAll();   // should also work for default / null values
        json1 = user.toJSON();
        json2 = JSON.parse(JSON.stringify(user));    // fake serializing
        user.set(json2);
        json3 = user.toJSON();
        test.deepEqual(json1, json2);
        test.deepEqual(json2, json3);
        test.done();
    },
    validate: function validate(test) {
        user.set('name', 'Octocat');
        test.strictEqual(user.hasChanged('name'), true);
        user.accept();
        test.strictEqual(user.hasChanged('name'), false);
        test.strictEqual(user.isDefault('name'), false);
        test.done();
    },
    eventTests: function eventTests(test) {
        var changeTimes = 0;

        user.on('change', function() {
            changeTimes++;
        });

        user.set('name', 'bla');
        try {
            user.set('asdasd', 'asd');
        } catch (err) {
            // this error should not trigger an event
        }
        user.set('age', 27);
        user.unset('age');
        user.set('age', 23);
        user.get('age');
        user.remove('age');
        user.set('name', 'blaablaa');
        user.unsetAll();
        user.removeAll();
        user.escape('name');
        user.hasChanged('name');
        user.isDefault('name');
        user.getDefaults();
        user.toJSON();
        test.equal(changeTimes, 8);

        test.done();
    },
    muteTest: function muteTest(test) {
        var changeTimes = 0;

        user.on('change', function() {
            changeTimes++;
        });

        user.setMuted(true);
        user.set('name', 'bla');
        user.set('age', 27);
        user.unset('age');
        user.set('age', 23);
        user.get('age');
        user.remove('age');
        user.set('name', 'blaablaa');
        user.unsetAll();
        user.removeAll();
        user.escape('name');
        user.hasChanged('name');
        user.isDefault('name');
        user.getDefaults();
        user.toJSON();
        test.equal(changeTimes, 0);

        test.done();
    }
});

exports.User2 = testCase({
    setUp: function(callback) {
        user = new User2();
        callback();
    },
    dateTest: function(test) {
        user.set('born', new Date(1955, 11, 5));
        test.ok(user.get('born') instanceof Date);
        test.strictEqual(user.get('born').getTime(), -444186000000);
        test.done();
    },
    nullDefaultValue: function(test) {
        user.set('age', 'hello');
        test.equal(user.get('age'), 'hello');
        user.set('age', 12);
        test.equal(user.get('age'), 12);
        test.done();
    },
    toJSON: function(test) {
        var json1,
            json2,
            json3;

        user.set({
            name: 'John"',
            age: 21,
            born: new Date()
        });
        json1 = user.toJSON();
        json2 = JSON.parse(JSON.stringify(user));    // fake serializing
        user.set(json2);
        json3 = user.toJSON();
        test.deepEqual(json1, json2);
        test.deepEqual(json2, json3);

        user.removeAll();   // should also work for default / null values
        json1 = user.toJSON();
        json2 = JSON.parse(JSON.stringify(user));    // fake serializing
        user.set(json2);
        json3 = user.toJSON();
        test.deepEqual(json1, json2);
        test.deepEqual(json2, json3);

        test.done();
    }
});