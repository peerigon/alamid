"use strict";

var EventEmitter = require('../../../lib/shared/EventEmitter.class.js');

var Socket = EventEmitter.extend("Socket", {});

module.exports = Socket;