var path = require("path");

desc('This is the default task.');
task('default', function () {
    console.log("what can i do, for you? ");
});

task('compileTestAlamid', function () {
    //self-executing module
    require(path.resolve(__dirname, "./test/testHelpers/compileTestAlamid"));
});


//to be deleted! just to be compatible during change of test-structure
task('test-nodejs',["compileTestAlamid"], function () {

    var list = new jake.FileList();
    list.include('test/nodejs/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

desc('Test all server files');
task('test-server',["compileTestAlamid"], function () {

    var list = new jake.FileList();
    list.include('test/server/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

desc('Test all core files');
task('test-core',["compileTestAlamid"], function () {

    var list = new jake.FileList();
    list.include('test/core/**/*.test.js');

    var cmd = "mocha -c -R spec " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});

desc('Test all shared files');
task('test-shared', ["compileTestAlamid"], function () {

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
task('test-server-all',["compileTestAlamid"], function () {

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

task('test-jenkins', ["compileTestAlamid"], function() {

    var list = new jake.FileList();
    list.include('test/server/**/*.test.js');
    list.include('test/core/**/*.test.js');
    list.include('test/shared/**/*.test.js');

    var cmd = "mocha -R xunit " + list.join(" ") + " --mode testing > xunit.xml";

    jake.exec(cmd, function () {
        complete();
    }, {printStdout: true});
});