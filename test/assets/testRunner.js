//@TODO Catch errors on hooks
(function (window) {
    "use strict";

    var nof5 = window.nof5,
        mocha = window.mocha,
        reconnect = false;

    jQuery(function onReady() {

        nof5.connect(function onConnect(socket) {

            if (reconnect === true) {
                location.reload();
            }

            reconnect = true;

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

            socket.emit("start", new Date());

            socket.on("disconnect", function onDisconnect() {
                runner.removeAllListeners();
            });

            //Reload if a file has changed on server
            socket.once("f5", function onf5() {
                location.reload();
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

            runner.on("end", function onEnd() {
                socket.emit("end", new Date());
                runner.removeAllListeners("test end");
            });

        });
    });

})(window);