var socket = {
    emit : function(method, url, model, callback) {
        callback({ status : "success", data : { mock : "ed" }});
    }
};