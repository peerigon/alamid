"use strict";

/**
 * Emits an error event if there is a listener
 *
 * @param {EventEmitter} emitter
 * @param {Event} event
 */
function emitErrorEvent(emitter, event) {
    if (emitter._events && emitter._events.error) {
        emitter.emit(event);
    }
}

module.exports = emitErrorEvent;