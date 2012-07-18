module.exports = {
	email: {
		type: String,
		required: true,
		validate: function () {
			isEmail(email);
			
		}
	}
};