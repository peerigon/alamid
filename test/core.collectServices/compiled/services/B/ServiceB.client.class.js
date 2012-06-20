"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class;

var ServiceB = new Class({

    "init" : function () {
        //nothing to do here
    },
    "create" : function(model, callback) {
        callback();
    },
    "read" : function(model, callback) {
        callback(200, model.getData());
    },
    "update" : function(model, callback) {
        callback();
    },
    "delete" : function(model, callback) {
        callback();
    }
});

module.exports = ServiceB;



var Module = this;
var Class = module.exports; 
var Extends = Class.Extends;


var Constructor = function() {
    var tmp,
        implChildAbstracts,
        implAbstracts,
        constructorIsRunning,
        exposeProtected,
        exposeNothing,
        Properties,
        Instance,
        key;

    
    if(Constructor.$) {
        tmp = Constructor.$;
        Instance = tmp.Instance; 
        implChildAbstracts = tmp.implChildAbstracts; 
        constructorIsRunning = tmp.constructorIsRunning; 
        exposeProtected = tmp.exposeProtected; 
        exposeNothing = tmp.exposeNothing; 
    }

    if(constructorIsRunning) { 
        throw new Error("Class error in " + __filename + ": Constructor recursion detected.");
        return;
    } else {
        Constructor.$ = {
            "constructorIsRunning": true
        };
    }

     

    if(!exposeNothing) {
        if(!implChildAbstracts) {
            implChildAbstracts = {};
        }

        if (Instance === undefined) {
            Instance = this;
        }
        Properties = {};  
        Properties.create=Class.create.bind(Properties);Properties.read=Class.read.bind(Properties);Properties.update=Class.update.bind(Properties);Properties.delete=Class.delete.bind(Properties); 
        Properties.Instance = Instance;

        implAbstracts = implChildAbstracts;

        
        
        
        
        for(key in implChildAbstracts) {
            if(implChildAbstracts.hasOwnProperty(key)) {
                Properties[key] = implChildAbstracts[key];
            }
        }

         
        Class.init.apply(Properties, arguments); 
         

        this.create=Class.create.bind(Properties);this.read=Class.read.bind(Properties);this.update=Class.update.bind(Properties);this.delete=Class.delete.bind(Properties); 
        if(exposeProtected) {
             
        }
    }

    delete Constructor.$; 
};


Constructor.$construct = function(args) { 
    var Instance = function Instance() {
        return Constructor.apply(this,args);
    };
    Instance.prototype = Constructor.prototype;
    return new Instance();
};


 

module.exports = Constructor;