"use strict";

function requestEnder(req, res, next) {

    res.setStatus("success");
    res.setData({ requestEnder : true });
    res.end();
}

module.exports = requestEnder;