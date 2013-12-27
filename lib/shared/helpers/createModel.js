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
 * @param {Object=} ids (optional)
 * @returns {Model}
 */
function createSingle(ModelClass, modelData, ids) {
    var cache = ModelClass.cache,
        setNewData = true,
        id = modelData.id,
        model;

    if (modelData instanceof ModelClass) {
        // it's already an instance, so we do nothing
        return modelData;
    }

    if (id === undefined) {
        throw new Error("(alamid) Cannot create new model: The new model data has no id.");
    }

    if (cache) {
        model = cache.get(id);
    }

    if (model) {
        // TODO What happens if data has changed? Emit a conflict or something similar?
        setNewData = model.hasChanged() === false;
    } else {
        model = new ModelClass(id);
    }

    if (setNewData) {
        if (ids) {
            model.setIds(ids);
        }
        model.set(modelData);
        model.accept();
    }

    if (cache) {
        cache.set(id, model);
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