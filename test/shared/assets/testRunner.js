//@TODO Catch errors on hooks
(function (window) {
    "use strict";

    var nof5 = window.nof5,
        mocha = window.mocha;

    jQuery(function onReady() {

        nof5.connect(function onConnect(socket) {

            var runner;

            mocha.setup({
                ui:"bdd",
                globals: [
                    "io",
                    "stats",
                    "report"
                ]
            });

            nof5.enableTests();

            runner = mocha.run();

            runner.on("suite", function (suite) {
                if(suite.root) {
                    socket.emit("start", new Date());
                }
            });

            runner.on("fail", function onFail(test) {

                runner.once("test end", function onTestEnd() {

                    var error = {
                        "suite": test.parent.title,
                        "test": test.title,
                        "type": test.err.toString()
                    };

                    socket.emit("fail", error);
                });
            });

            runner.on("suite end", function onSuiteEnd(suite) {
                if (suite.root) {
                    socket.emit("end", new Date());
                    runner.removeAllListeners("test end");
                }
            });

            socket.on("disconnect", function onDisconnect() {
                runner.removeAllListeners();
            });

            socket.once("f5", function onf5() {
                location.reload();
            });

        });
    });

})(window);