"use strict";

module.exports = {
	email: {
		type: String,
		required: true,
		validate: function () {
            return true;
		}
	}
};