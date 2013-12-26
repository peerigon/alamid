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
 * Calls createSingle for every raw model object in the array. The array can be mixed with instances of ModelClass,
 * which will just be ignored.
 *
 * @param {Object} ids parent ids of the model
 * @param {Array<Object|Model>} models an array containing raw model data or instances of the ModelClass
 * @param {Class} ModelClass
 * @returns {Array<Model>}
 */
function createMultiple(ids, models, ModelClass) {
    var instances = [],
        url = ModelClass.prototype.url,
        i,
        model;

    for (i = 0; i < models.length; i++) {
        model = models[i];

        if (model instanceof ModelClass) {
            // it's already an instance, so we do nothing
            instances.push(model);
            continue;
        }

        if (model.id === undefined) {
            throw new Error("(alamid) Cannot create new model: The new model data has no id.");
        }

        // we can re-use the ids-object since model.setIds() clones the object
        ids[url] = model.id;

        instances.push(createSingle(ids, model, ModelClass));
    }

    return instances;
}

exports.multiple = createMultiple;
exports.single = createSingle;