desc('This is the default task.');
task('default', function () {
    console.log('This is the default task.');
});

desc('Test all server and shared files');
task('serverSharedTest', function () {

    var list = new jake.FileList();
    list.include('test/**/*.test.js');
    list.exclude('test/old/*');
    list.exclude('test/browser/*');

    var cmd = "mocha " + list.join(" ") + " --mode testing";

    jake.exec(cmd, function () {
        console.log('All tests passed.');
        complete();
    }, {printStdout: true});
});