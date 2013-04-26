"use strict";

var modelCache = require("../modelCache.js");

function createModelInstances(ids, modelDataArray, ModelClass) {
    var instances = [],
        url = ModelClass.prototype.url,
        arrayElem,
        modelData,
        modelInstance;

    for (arrayElem in modelDataArray) {
        if (modelDataArray.hasOwnProperty(arrayElem)) {
            modelData = modelDataArray[arrayElem];

            if (modelData.id !== undefined) {
                ids[url] = modelData.id;
                modelInstance = modelCache.get(url, ids);

                if (modelInstance === null) {
                    modelInstance = new ModelClass(modelData.id);
                    modelInstance.setIds(ids);
                    modelCache.add(modelInstance);
                }

                // TODO What happens if data has changed? Emit a conflict or something similar?
                if (!modelInstance.hasChanged()) {
                    modelInstance.set(modelData);
                    modelInstance.accept();
                }

                instances.push(modelInstance);
            }
        }
    }

    return instances;
}

module.exports = createModelInstances;