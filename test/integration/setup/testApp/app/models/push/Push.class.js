var Model = require('../../../../../../../lib/shared/Model.class.js');

 var PushSchema = {
        name: {
            type: String
        }
    };

var Push = Model.extend("Push", {
    url : "push",
    constructor: function(id) {
        this._super(id);
        this.setSchema(PushSchema, "shared");
        this.setSchema(PushSchema);
    }
});

module.exports = Push;