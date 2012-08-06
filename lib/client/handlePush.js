"use strict";

var modelCache = require("../shared/modelCache.js");

socket.on('updatePush', function (modelUrl, modelId, modelData) {
    console.log("push-update for: " + modelUrl + " with ID '"+ modelId + "' - passed Data", modelData);

    var modelToNotify = modelCache.get(modelUrl, modelId);
    if(modelToNotify !== null) {
        modelToNotify.set(modelData);
    }
});

socket.on('deletePush', function (modelUrl, modelId) {
    console.log("push-delete for: " + modelUrl + " with ID '"+ modelId + "'");
    var modelToNotify = modelCache.get(modelUrl, modelId);
    if(modelToNotify !== null) {
        //modelToNotify.destroy(modelData);
        //maybe just emit push-event on model
    }
});