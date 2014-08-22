"use strict";

/**
 * Tries to load the given model from cache and updates the attributes.
 * Creates a new instance if there is no cache or if the cache has not this instance yet.
 * After that the instance is stored in the cache (if present).
 *
 * If the cached model has unaccepted changes the new data is discarded.
 *
 * @param ModelClass
 * @param {Object|Model} modelData
 * @param {Object} ids
 * @returns {Model}
 */
function createSingle(ModelClass, modelData, ids) {
    var cache = ModelClass.cache;
    var id = modelData.id;
    var resourceUrl;
    var model;

    if (modelData instanceof ModelClass) {
        // it's already an instance, so we do nothing
        model = modelData;
    } else {
        if (id === undefined) {
            throw new Error("(alamid) Cannot create new model: The new model data has no id.");
        }
        ids[ModelClass.prototype.url] = id;

        if (cache) {
            resourceUrl = ModelClass.getResourceUrl(ids);
            model = cache.get(resourceUrl);
        }
        model = model || new ModelClass(id);

        if (ids) {
            model.setIds(ids);
        }
        model.update(modelData);

        if (cache) {
            cache.set(resourceUrl, model);
        }
    }

    return model;
}

/**
 * Calls createSingle for every raw model object in the array. The array can be mixed with instances of ModelClass,
 * which will just be ignored.
 *
 * @param {Class} ModelClass
 * @param {Array<Object|Model>} models an array containing raw model data or instances of the ModelClass
 * @param {Object} ids parent ids of the model
 * @returns {Array<Model>}
 */
function createMultiple(ModelClass, models, ids) {
    var instances = [],
        i;

    for (i = 0; i < models.length; i++) {
        instances.push(createSingle(ModelClass, models[i], ids));
    }

    return instances;
}

exports.multiple = createMultiple;
exports.single = createSingle;