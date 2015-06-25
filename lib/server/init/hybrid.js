"use strict";

function initHybrid(hybrid) {

    //TODO only attach if no other error handler is attached?
    //TODO is it overwritable?
    hybrid.on("error", function (err, req, res) {

        if(err.toJSend) {
            res.send(err.toJSend());
            return;
        }

        //TODO better way? kind of hidden and unexpected here?
        if(res.validation) {
            res.fail("validation", res.validation);
            return;
        }

        res.error({
            message: err.message,
            data: {
                code: err.code || "unknown-error"
            }
        });
    });

}

module.exports = initHybrid;