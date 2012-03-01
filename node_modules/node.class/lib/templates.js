var _ = require('underscore'),
    fs = require('fs'),
    pathUtil = require('path');

var templateFolder = pathUtil.resolve(__dirname, '../templates/');

var PropertiesLeftHand,
    FunctionRightHand,
    ImplAbstractsLeftHand,
    WrapperLeftHand,
    WrapperSuperRightHand,
    SetterFunction,
    GetterFunction,
    StaticsLeftHand,
    StaticsRightHand,
    SuperConstructor,
    SuperConstructorCall,
    InitConstructor,
    InitCall,
    AbstractInstanceError,
    ClassConstructor,
    Code;

function read(templName) {
    return fs.readFileSync(templateFolder + '/' + templName + '.ejs', 'utf8');
}


PropertiesLeftHand = read('PropertiesLeftHand');
FunctionRightHand = read('FunctionRightHand');
ImplAbstractsLeftHand = read('ImplAbstractsLeftHand');
WrapperLeftHand = read('WrapperLeftHand');
WrapperSuperRightHand = read('WrapperSuperRightHand');
SetterFunction = read('SetterFunction');
GetterFunction = read('GetterFunction');
StaticsLeftHand = read('StaticsLeftHand');
StaticsRightHand = read('StaticsRightHand');
SuperConstructor = read('SuperConstructor');
SuperConstructorCall = read('SuperConstructorCall');
InitConstructor = read('InitConstructor');
InitCall = read('InitCall');
AbstractInstanceError = read('AbstractInstanceError');
ClassConstructor = read('ClassConstructor');
Code = read('Code');

PropertiesLeftHand = _.template(PropertiesLeftHand);
FunctionRightHand = _.template(FunctionRightHand);
ImplAbstractsLeftHand = _.template(ImplAbstractsLeftHand);
WrapperLeftHand = _.template(WrapperLeftHand);
WrapperSuperRightHand = _.template(WrapperSuperRightHand);
SetterFunction = _.template(SetterFunction);
GetterFunction = _.template(GetterFunction);
StaticsLeftHand = _.template(StaticsLeftHand);
StaticsRightHand = _.template(StaticsRightHand);
SuperConstructor = _.template(SuperConstructor);
SuperConstructorCall = _.template(SuperConstructorCall);
InitConstructor = _.template(InitConstructor);
InitCall = _.template(InitCall);
AbstractInstanceError = _.template(AbstractInstanceError);
ClassConstructor = _.template(ClassConstructor);
Code = _.template(Code);


exports.PropertiesLeftHand = function(key) {
    return PropertiesLeftHand({
        "key": key
    });
};

exports.FunctionRightHand = function(key) {
    return FunctionRightHand({
        "key": key
    });
};

exports.ImplAbstractsLeftHand = function(key) {
    return ImplAbstractsLeftHand({
        "key": key
    });
};

exports.WrapperLeftHand = function(key) {
    return WrapperLeftHand({
        "key": key
    });
};

exports.WrapperSuperRightHand = function(key) {
    return WrapperSuperRightHand({
        "key": key
    });
};

exports.SetterFunction = function(key) {
    return SetterFunction({
        "key": key
    });
};

exports.GetterFunction = function(key) {
    return GetterFunction({
        "key": key
    });
};

exports.StaticsLeftHand = function(key) {
    return StaticsLeftHand({
        "key": key
    });
};

exports.StaticsRightHand = function(key) {
    return StaticsRightHand({
        "key": key
    });
};

exports.SuperConstructor = function() {
    return SuperConstructor();
};

exports.SuperConstructorCall = function() {
    return SuperConstructorCall();
};

exports.InitConstructor = function() {
    return InitConstructor();
};

exports.InitCall = function(initName) {
    return InitCall({
        "initName": initName
    });
};

exports.AbstractInstanceError = function(abstractMethodNames) {
    return AbstractInstanceError({
        "abstractMethodNames": abstractMethodNames
    });
};

exports.ClassConstructor = function(
        properties,
        wrapper,
        exposeWrapper,
        initCall,
        implAbstracts,
        abstractInstanceError,
        superConstructor,
        superConstructorCall
    ) {
    if(!implAbstracts) {
        implAbstracts = '';
    }
    if(!abstractInstanceError) {
        abstractInstanceError = '';
    }
    if(!superConstructor) {
        superConstructor = '';
    }
    if(!superConstructorCall) {
        superConstructor = '';
    }
    return ClassConstructor({
        "properties": properties,
        "wrapper": wrapper,
        "exposeWrapper": exposeWrapper,
        "implAbstracts": implAbstracts,
        "initCall": initCall,
        "abstractInstanceError": abstractInstanceError,
        "superConstructor": superConstructor,
        "superConstructorCall": superConstructorCall
    });
};

exports.Code = function(classConstructor, initConstructor, statics) {
    if(!initConstructor) {
        initConstructor = '';
    }
    if(!statics) {
        statics = '';
    }
    return Code({
        "classConstructor": classConstructor,
        "initConstructor": initConstructor,
        "statics": statics
    });
};