"use strict";

var caster = require("./caster.js"),
    typeOf = require("./typeOf.js");

function AttributeSetter() {
    function attributeSetter(newValue) {
        var expectedType = attributeSetter.expectedType,
            customSetters = attributeSetter.customSetters,
            key = attributeSetter.key,
            actualType,
            i;

        // Do we need to check the type?
        if (expectedType) {
            actualType = typeOf(newValue);

            if (actualType !== expectedType) {
                if (attributeSetter.casting === false) {
                    throw new TypeError("Cannot set '" + key + "' to " + newValue + ". '" + key + "' must be type of " + expectedType + ".");
                }

                newValue = caster(newValue, actualType, expectedType);
            }
        }

        if (customSetters) {
            for (i = 0; i < customSetters.length; i++) {
                newValue = customSetters[i].call(attributeSetter.context, newValue);
            }
        }

        return newValue;
    }

    attributeSetter.customSetters = null;
    attributeSetter.key = null;
    attributeSetter.expectedType = null;
    attributeSetter.casting = true;
    attributeSetter.context = null;

    return attributeSetter;
}

module.exports = AttributeSetter;