"use strict";

/**
 * Tries to load the given model from cache and updates the attributes.
 * Creates a new instance if there is no cache or if the cache has not this instance yet.
 * After that the instance is stored in the cache (if present).
 *
 * If the cached model has unaccepted changes the new data is discarded.
 *
 * @param {Object} ids
 * @param {Object|Model} modelData
 * @param ModelClass
 * @returns {Model}
 */
function createSingle(ids, modelData, ModelClass) {
    var cache = ModelClass.cache,
        setNewData = true,
        resourceUrl,
        model;

    if (modelData instanceof ModelClass) {
        // it's already an instance, so we do nothing
        return modelData;
    }

    if (cache) {
        resourceUrl = ModelClass.getResourceUrl(ids);
        model = cache.get(resourceUrl);
    }

    if (model) {
        // TODO What happens if data has changed? Emit a conflict or something similar?
        setNewData = model.hasChanged() === false;
    } else {
        model = new ModelClass(modelData.id);
    }

    if (setNewData) {
        model.setIds(ids);
        model.set(modelData);
        model.accept();
    }

    if (cache) {
        cache.set(resourceUrl, model);
    }

    return model;
}

/**
 * Calls createSingle for every modelData-object in the array. modelInstances in the
 * modelDataArray are just skipped.
 *
 * @param {Object} ids
 * @param {Array<Object|Model>} modelDataArray
 * @param {Class} ModelClass
 * @returns {Array<Model>}
 */
function createMultiple(ids, modelDataArray, ModelClass) {
    var instances = [],
        url = ModelClass.prototype.url,
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

            if (modelData.id === undefined) {
                throw new Error("(alamid) Cannot create new model: The new model data has no id.");
            }

            // we can re-use the ids-object since model.setIds() clones the object
            ids[url] = modelData.id;

            instances.push(createSingle(ids, modelData, ModelClass));
        }
    }

    return instances;
}

exports.multiple = createMultiple;
exports.single = createSingle;