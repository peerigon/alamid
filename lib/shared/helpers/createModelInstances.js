"use strict";

function createModelInstances(ids, modelDataArray, ModelClass) {
    var instances = [],
        url = ModelClass.prototype.url,
        cache = ModelClass.cache,
        resourceUrl,
        arrayElem,
        modelData,
        model;

    for (arrayElem in modelDataArray) {
        if (modelDataArray.hasOwnProperty(arrayElem)) {
            modelData = modelDataArray[arrayElem];

            if (modelData instanceof ModelClass) {
                // it's already an instance, so we do nothing
                instances.push(modelData);
                continue;
            }

            if (modelData.id !== undefined) {
                ids[url] = modelData.id;
                if (cache) {
                    resourceUrl = ModelClass.getResourceUrl(ids);
                    model = cache.get(resourceUrl);
                }

                if (!model) {
                    model = new ModelClass(modelData.id);
                }

                model.setIds(ids);

                // TODO What happens if data has changed? Emit a conflict or something similar?
                if (!model.hasChanged()) {
                    model.set(modelData);
                    model.accept();
                }

                if (cache) {
                    cache.set(resourceUrl, model);
                }

                instances.push(model);
            }
        }
    }

    return instances;
}

module.exports = createModelInstances;