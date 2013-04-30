//@TODO Catch errors on hooks
(function (window) {

    var nof5 = window.nof5,
        mocha = window.mocha,
        reconnect = false;

    jQuery(function onReady() {

        nof5.connect(function onConnect(socket) {

            var runner;

            if (reconnect === true) {
                location.reload();
            }

            reconnect = true;

            mocha.setup({
                ui:"bdd",
                globals: [
                    "io",
                    "stats",
                    "report"
                ]
            });

            // disable html reporter
            if (/[\?&]reporter/.test(window.location.search) === false) {
                mocha.reporter(function () {});
            }

            nof5.enableTests();

            runner = mocha.run();

            runner.on("fail", function (test, err) {
                socket.emit("fail", {
                    "suite": test.fullTitle(),
                    "type": err.toString(),
                    "stack": err.stack || err.message
                });
                console.log(err);
            });

            runner.on("end", function onEnd() {
                socket.emit("end", new Date());
                runner.removeAllListeners("test end");
            });

            socket.emit("start", new Date());

            socket.on("disconnect", function onDisconnect() {
                runner.removeAllListeners();
            });

            //Reload if a file has changed on server
            socket.once("f5", function onf5() {
                location.reload();
            });

        });
    });

})(window);