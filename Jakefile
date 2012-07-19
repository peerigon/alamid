var path = require("path"),
    nodeclass = require("nodeclass");

nodeclass.registerExtension();

desc('This is the default task.');
task('default', function () {
    console.log("what can i do, for you? ");
});

desc('Test all server files');
task('test-server', function () {

    var list = new jake.FileList();
    list.include('test/server/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

desc('Test all core files');
task('test-core', function () {

    var list = new jake.FileList();
    list.include('test/core/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

desc('Test all shared files');
task('test-shared', function () {

    var list = new jake.FileList();
    list.include('test/shared/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

task('test-client', function () {

    var list = new jake.FileList();
    list.include('test/client/**/*.test.js');

    //add nof5 tests here
});


desc('Test all server, core and shared files');
task('test-server-all', function () {

    var list = new jake.FileList();
    list.include('test/server/**/*.test.js');
    list.include('test/core/**/*.test.js');
    list.include('test/shared/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

desc('Test all client and shared files');
task('test-browser-all', function () {

    var list = new jake.FileList();
    list.include('test/client/**/*.test.js');
    list.exclude('test/shared/**/*.test.js');

    /*
     to be implemented using nof5
     */
});

desc('Test all server files');
task('test-integration', function () {

    var list = new jake.FileList();
    list.include('test/integration/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

task('test-all', function() {

    var list = new jake.FileList();
    list.include('test/server/**/*.test.js');
    list.include('test/core/**/*.test.js');
    list.include('test/shared/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

task('test-jenkins', function() {

    var list = new jake.FileList();
    list.include('test/server/**/*.test.js');
    list.include('test/core/**/*.test.js');
    list.include('test/shared/**/*.test.js');

    var cmd = "mocha -R xunit " + list.join(" ") + " --mode testing > xunit.xml";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});