"use strict";

var expect = require("expect.js"),
    Junction = require("alamid-junction");

var Animal = require("./Model/Animal.class.js"),
    User1 = require("./Model/User1.class.js"),
    User2 = require("./Model/User2.class.js"),
    Octocat = require("./Model/Octocat.class.js"),
    Model = require("../../lib/shared/Model.class.js");

var slice = Array.prototype.slice;

describe("Model", function () {

    describe("Extending", function () {
        it("should define a model and add all methods of event emitter", function () {
            expect(Animal.on).to.be.a(Function);
            expect(Animal.find).to.be.a(Function);
        });
        it("should make the url lowercase", function () {
            expect(Octocat.prototype.url).to.be("octocat");
        });
    });

    describe("Schema", function () {
        var octocat;

        beforeEach(function () {
            octocat = new Octocat();
        });

        it("should have all keys and default values", function () {
            expect(octocat.get("age")).to.be(5);
            octocat.set("name", "hugo");
            octocat.set("age", 12);
            octocat.set("location", "Under the sea");

            expect(octocat.get("name")).to.be("hugo");
            expect(octocat.get("age")).to.be(12);
            expect(octocat.get("location")).to.be("Under the sea");
        });
    });

    describe("Model-Features", function () {

        var user;

        beforeEach(function () {
            user = new User1();
        });

        describe("setter & getter", function () {

            it("should return single attributes", function () {
                expect(user.get("name")).to.eql("John Wayne");
                expect(user.get("age")).to.eql(45);
            });

            it("should fail when setting an attribute that is not in the schema", function () {
                expect(function () {
                    user.set("what", "ever");
                }).to.throwError();
                expect(function () {
                    user.set({
                        name: "hans",
                        what: "ever"
                    });
                }).to.throwError();

                //this is important because it depends on the order
                expect(user.get("name")).to.eql("hans");
            });

            it("should return all attributes and defaults", function () {
                expect(user.get()).to.eql({
                    name: "John Wayne",
                    age: 45,
                    id: undefined,
                    ids: {}
                });
            });

            it("should be possible to set and get any key if there is no schema", function () {
                var model = new Model();

                model.set("what", "ever");
                expect(model.get("what")).to.be("ever");
                expect(model.get()).to.eql({
                    what: "ever",
                    id: undefined,
                    ids: {}
                });
            });

            it("should call a setter if it is defined on the schema", function () {
                user = new User2();

                user.set("loginName", "   john   ");
                expect(user.get("loginName")).to.eql("john");
            });

            it("should call all setters in order if there are any defined as an array on the schema", function () {
                user = new User2();

                user.set("email", "   john@WAYNE.de   ");
                expect(user.get("email")).to.eql("john@wayne.de");
            });

            it("should call the override-able setter()-function for every key", function () {
                var setterArgs = [];

                user.setter = function () {
                    setterArgs = setterArgs.concat(slice.call(arguments));
                };

                user.set({
                    name: "Johnny Rotten",
                    age: 52
                });
                user.set("name", "Octojohnny");

                expect(setterArgs).to.eql([
                    "name", "Johnny Rotten", "age", 52, "name", "Octojohnny"
                ]);
            });

            it("should be chainable", function () {
                expect(user.set("name", "Clint Eastwood")).to.be(user);
            });
        });

        describe("signals", function () {
            var name,
                age,
                email;

            beforeEach(function () {
                user = new User2();
            });

            it("should return a signal for the given attribute", function () {
                var signalHasChanged = false;

                name = user.signal("name");

                expect(name()).to.equal("John Wayne");
                name("Johnny Rotten");

                expect(user.get("name")).to.equal("Johnny Rotten");

                name.subscribe(function () {
                    signalHasChanged = true;
                });
                user.set("name", "John wayne");

                expect(signalHasChanged).to.equal(true);
            });

            it("should apply the model's default attribute setter to the signal as well", function () {
                age = user.signal("age");
                age("12");

                // check if the cast to Number is also working on the signal
                expect(age()).to.equal(12);
                expect(user.get("age")).to.equal(12);

                email = user.signal("email");
                email("   test@eXaMPle.com ");

                // check if custom setters are still working
                expect(email()).to.equal("test@example.com");
                expect(user.get("email")).to.equal("test@example.com");
            });

            it("should throw an error if the given attribute is not defined on the schema", function () {
                expect(function () {
                    user.signal("whatever");
                }).to.throwError();
            });

        });

        describe("url", function () {

            var user;
            beforeEach(function () {
                user = new User1();
            });

            it("should set and get urls", function () {
                expect(user.getUrl()).to.eql("user1");
                user.setUrl("user/likes");
                expect(user.getUrl()).to.eql("user/likes");
            });
        });

        describe("ids", function () {

            var user;
            beforeEach(function () {
                user = new User1();
            });

            it("should set and get ids", function () {
                user.setId("user", 2);
                user.setId("comment", 3);
                expect(user.getId("user")).to.eql(2);
                expect(user.getId("comment")).to.eql(3);
            });

            it("should also be possible to set multiple ids", function () {
                user.setIds({
                    user1: 5,
                    comment: 6
                });
                expect(user.getIds()).to.eql({
                    user1: 5,
                    comment: 6
                });
            });

            it("should create a copy of the passed ids-object", function () {
                var ids = {};

                user.setIds(ids);
                expect(user.getIds()).to.not.be(ids);
            });

            it("should be chainable", function () {
                expect(user.setIds({})).to.equal(user);
            });
        });

        describe("casting", function () {

            var user2;

            beforeEach(function () {
                user2 = new User2();
            });

            describe("String Fields", function () {
                it("should accept Numbers", function () {
                    user2.set("name", "1234");
                    expect(user2.get("name")).to.eql("1234");
                });

                it("should accept Dates", function () {
                    var date = new Date();
                    user2.set("name", date);
                    expect(user2.get("name")).to.eql(date.toString());
                });
            });

            describe("Number Fields", function () {
                it("should accept String", function () {
                    user2.set("age", "1234");
                    expect(user2.get("age")).to.eql(1234);
                });

                it("should accept Dates", function () {
                    var date = new Date();
                    user2.set("age", date);
                    expect(user2.get("age")).to.eql(date.getTime());
                });
            });

            describe("Date Fields", function () {
                it("should accept Strings", function () {
                    var nowDate = new Date();
                    user2.set("birthday", nowDate.toString());
                    expect(user2.get("birthday")).to.be.a(Date);
                    expect(user2.get("birthday").toString()).to.be(nowDate.toString());

                    //Invalid input
                    user2.set("birthday", "bla bla");
                    expect(user2.get("birthday")).to.be(null);
                });

                it("should accept Numbers (Integers)", function () {
                    var date = new Date();
                    user2.set("birthday", date.getTime());
                    expect(user2.get("birthday")).to.be.a(Date);
                    expect(user2.get("birthday").getTime()).to.eql(date.getTime());

                    //should fail on floats!
                    user2.set("birthday", 1.2);
                    expect(user2.get("birthday")).to.be(null);
                });
            });
        });

        describe("unset", function () {

            it("should unset values to the defaults", function () {

                user.set("name", "Octocat");
                expect(user.get("name")).to.eql("Octocat");
                user.unset("name");
                expect(user.get("name")).to.eql("John Wayne");

                user.set({
                    name: "Johnny Rotten",
                    age: 50
                });

                expect(user.get("age")).to.eql(50);
                //unset multiple
                user.unset("name", "age");
                expect(user.get()).to.eql({
                    name: "John Wayne",
                    age: 45,
                    id: undefined,
                    ids: {}
                });
            });
            
            it("should unset all keys when no keys are passed", function () {
                user.set({
                    name: "Johnny Rotten",
                    age: 50
                });
                user.unset();

                expect(user.get()).to.eql({
                    name: "John Wayne",
                    age: 45,
                    id: undefined,
                    ids: {}
                });
            });

            it("should inform the signals too", function () {
                var nameSignalNotified = false,
                    ageSignalNotified = false,
                    name = user.signal("name"),
                    age = user.signal("age");

                user.set({
                    name: "Johnny Rotten",
                    age: 50
                });

                name.subscribe(function () {
                    nameSignalNotified = true;
                });
                age.subscribe(function () {
                    ageSignalNotified = true;
                });

                user.unset();

                expect(nameSignalNotified).to.equal(true);
                expect(ageSignalNotified).to.equal(true);
            });

            it("should never unset id and ids", function () {
                user.set("id", 1);
                user.setId("group", 1);
                user.unset();

                expect(user.get("id")).to.equal(1);
                expect(user.get("ids")).to.eql({
                    user1: 1,
                    group: 1
                });
            });

            it("should be chainable", function () {
                expect(user.unset("name")).to.equal(user);
            });

            describe("when accept() has been called previously", function () {

                beforeEach(function () {
                    user.set({
                        name: "Johnny Rotten",
                        age: 50
                    });
                    user.accept();
                });

                it("should unset values to the previous state", function () {
                    user.set({
                        name: "Lou Reed",
                        age: 70
                    });
                    user.unset();

                    expect(user.get()).to.eql({
                        name: "Johnny Rotten",
                        age: 50,
                        id: undefined,
                        ids: {}
                    });
                });

            });
        });

        describe("remove", function () {

            describe("when no schema has been defined", function () {
                var model;

                beforeEach(function () {
                    model = new Model();
                    model.set({
                        name: "Pirate",
                        greeting: "Arr!",
                        age: 20
                    });
                });

                it("should completely remove the given attributes", function () {
                    model.remove("greeting", "age");

                    expect(model.get()).to.eql({
                        name: "Pirate",
                        id: undefined,
                        ids: {}
                    });
                });

                it("should remove all attributes except id and ids when no attribute-names are given", function () {
                    model.remove();

                    expect(model.get()).to.eql({
                        id: undefined,
                        ids: {}
                    });
                });

                it("should never remove id and ids", function () {
                    user.set("id", 1);
                    user.setId("group", 1);
                    user.remove();

                    expect(user.get("id")).to.equal(1);
                    expect(user.get("ids")).to.eql({
                        user1: 1,
                        group: 1
                    });
                });

                it("should set all signals of removed attributes on undefined", function () {
                    var name = model.signal("name"),
                        age = model.signal("age");

                    model.remove("name", "age");

                    expect(name()).to.equal(undefined);
                    expect(age()).to.equal(undefined);
                });

            });
            
            describe("when a schema has been defined", function () {
                
                beforeEach(function () {
                    user.set({
                        name: "Pirate",
                        age: 20,
                        kills: 20
                    });
                });

                it("should reset the given attributes to the schema's default value", function () {
                    user.remove("name", "age");

                    expect(user.get()).to.eql({
                        name: "John Wayne",
                        age: 45,
                        kills: 20,
                        id: undefined,
                        ids: {}
                    });
                });

                it("should reset all attributes to schema defaults if no attribute-names are given", function () {
                    user.remove();

                    expect(user.get()).to.eql({
                        name: "John Wayne",
                        age: 45,
                        id: undefined,
                        ids: {}
                    });
                });

                it("should set all signals of removed attributes on default values", function () {
                    var name = user.signal("name"),
                        age = user.signal("age");

                    user.remove("name", "age");

                    expect(name()).to.equal("John Wayne");
                    expect(age()).to.equal(45);
                });

            });            

        });

        describe("reset", function () {

            beforeEach(function () {
                user.set({
                    name: "Pirate",
                    age: 20,
                    kills: 20
                });
            });

            it("should reset all attributes to the initial state", function () {
                user.reset();

                expect(user.get()).to.eql({
                    name: "John Wayne",
                    age: 45,
                        id: undefined,
                        ids: {}
                });
            });

            it("should not reset ids or urls", function () {
                user.setIds({
                    someId: 20,
                    user1: 40
                });

                user.reset();

                expect(user.getIds()).to.eql({
                    someId: 20,
                    user1: 40
                });
                expect(user.getUrl()).to.equal("user1");
            });

            it("should also reset previous states", function () {
                user.reset();
                user.set("name", "Another Pirate");
                user.unset("name");

                expect(user.get("name")).to.equal("John Wayne");
            });

            it("should inform all signals about the reset", function () {
                var name = user.signal("name"),
                    age = user.signal("age"),
                    newName,
                    newAge;

                name.subscribe(function (name) {
                    newName = name;
                });
                age.subscribe(function (age) {
                    newAge = age;
                });
                user.reset();

                expect(newName).to.equal("John Wayne");
                expect(newAge).to.equal(45);
            });

        });

        describe("accept", function () {

            it("should save the current state, but not modify anything", function () {
                user.set("name", "Octocat");

                expect(user.getChanged()).to.eql({
                    name: "Octocat"
                });

                user.accept();

                expect(user.get("name")).to.equal("Octocat");
                expect(user.hasChanged()).to.eql(false);

                user.set("name", "Johnny rotten");
                user.unset("name");

                expect(user.get("name")).to.eql("Octocat");
            });

            it("should be chainable", function () {
                expect(user.accept()).to.equal(user);
            });
        });

        describe("isDefault", function () {
            it("should check if applied values are the default values", function () {
                expect(user.isDefault()).to.be(true);
                user.set("name", "Octocat");
                expect(user.isDefault()).to.be(false);
                expect(user.isDefault("age")).to.be(true);
                user.unset("name");
                expect(user.isDefault("name")).to.be(true);
                user.set("age", 5);
                expect(user.isDefault("name", "age")).to.be(false);
                user.set("age", 45);    // 45 equals the default value
                expect(user.isDefault("age")).to.be(true);
                user.unset("name", "age");
                expect(user.isDefault()).to.be(true);
            });
        });

        describe("getChanged", function () {

            it("should return only changed attributes", function () {

                expect(user.getChanged()).to.eql({});

                user.set("name", "hugo");
                user.set("age", null);

                expect(user.getChanged()).to.eql({ name: "hugo", age: null });

                user.accept();

                expect(user.getChanged()).to.eql({});
            });
        });

        describe("hasChanged", function () {

            it("should return false for unchanged attributes", function () {
                expect(user.getChanged()).to.eql({});

                expect(user.hasChanged("name")).to.be(false);
                expect(user.hasChanged("age")).to.be(false);
                expect(user.hasChanged("name", "age")).to.be(false);

            });

            it("should return true for changed attributes", function () {
                user.set("name", "hugo");
                user.set("age", null);

                expect(user.hasChanged("name")).to.be(true);
                expect(user.hasChanged("age")).to.be(true);
                expect(user.hasChanged("name", "age")).to.be(true);
            });

        });

        describe("toObject", function () {

            it("should return an object containing id & ids on default", function () {
                user.set("name", "Octocat");
                user.set({
                    age: 5,
                    kills: 1
                });

                expect(user.getDefaults()).to.eql({
                    name: "John Wayne",
                    age: 45
                });

                expect(user.toObject()).to.eql({
                    id: null,
                    ids: {},
                    name: "Octocat",
                    age: 5,
                    kills: 1
                });
            });

            it("should only return defined attributes", function () {

                user.unset("age");

                expect(user.toObject()).to.eql({
                    name: "John Wayne",
                    age: 45,
                    id: null,
                    ids: {}
                });
            });

            it("should return name the ID as defined in options.idAttribute", function () {
                user.set("name", "Octocat");
                user.set({
                    age: 5,
                    kills: 1
                });

                expect(user.toObject({ idAttribute: "_id" })).to.eql({
                    _id: null,
                    ids: {},
                    name: "Octocat",
                    age: 5,
                    kills: 1
                });
            });

            it("should exclude the attributes defined in options.exclude", function () {
                user.set("name", "Octocat");

                expect(user.toObject({ exclude: ["id", "age", "kills"] })).to.eql({
                    ids: {},
                    name: "Octocat"
                });
            });

            it("should return only changed attributes if options.changedOnly = true", function () {
                user.set("name", "Octocat");

                expect(user.toObject({ changedOnly: true })).to.eql({
                    id: null,
                    ids: {},
                    name: "Octocat"
                });
            });

            it("should return only attributes defined on the given schema", function () {
                user.setSchema({ name: String, age: Number }, "local");
                user.setSchema({ name: String }, "shared");

                user.set("name", "Octocat");
                user.set("age", 5);

                expect(user.toObject({ schemaType: "shared" })).to.eql({
                    name: "Octocat"
                });
            });

            it("should return only changed attributes defined on the given schema", function () {
                user.setSchema({ name: String, age: Number }, "local");
                user.setSchema({ name: String }, "shared");

                user.set("name", "Octocat");
                user.set("age", 5);
                user.accept();

                expect(user.toObject({ schemaType: "shared", changedOnly: true })).to.eql({});
            });

            it("should be chainable", function () {
                expect(user.setSchema({})).to.equal(user);
            });
        });

        describe("toJSON (alias for toObject)", function () {
            it("should return an object to be used with JSON-Stringify", function () {
                user.set("name", "Octocat");
                user.set({
                    age: 5,
                    kills: 1
                });

                expect(JSON.parse(JSON.stringify(user))).to.eql({
                    id: null,
                    ids: {},
                    name: "Octocat",
                    age: 5,
                    kills: 1
                });
            });
        });

        describe("dispose", function () {

            it("should emit a DisposeEvent", function () {
                var hasBeenCalled = false;

                user.on("dispose", function onDispose(event) {
                    expect(event.name).to.equal("DisposeEvent");
                    expect(event.target).to.equal(user);
                    hasBeenCalled = true;
                });
                user.dispose();
                expect(hasBeenCalled).to.equal(true);
            });

            it("should remove all event listeners", function () {
                var hasBeenCalled = false;

                user.removeAllListeners = function () {
                   hasBeenCalled = true;
                };
                user.dispose();
                expect(hasBeenCalled).to.equal(true);
            });

            it("should set the isDisposed-flag on true", function () {
                user.dispose();
                expect(user.isDisposed).to.equal(true);
            });

            it("should also call Junction.prototype.dispose on the model to dispose all signals", function () {
                var dispose = Junction.prototype.dispose,
                    disposeContext;

                Junction.prototype.dispose = function () {
                    disposeContext = this;
                };
                user.dispose();

                expect(disposeContext).to.equal(user);

                Junction.prototype.dispose = dispose;
            });

        });

        describe("Events", function () {

            it("should emit all change events", function () {
                var changeTimes = 0,
                    name;

                user.on("change", function () {
                    changeTimes++;
                });

                user.set("name", "bla");
                expect(changeTimes).to.be(1);

                try {
                    user.set("asdasd", "asd");
                } catch (err) {
                    expect(changeTimes).to.be(1);
                }

                user.set("age", 27);
                user.unset("age");

                expect(changeTimes).to.be(3);

                user.remove("name");

                expect(changeTimes).to.be(4);

                user.set({          // should only emit a signal change event
                    age: 5,
                    kills: 1
                });

                expect(changeTimes).to.be(5);

                name = user.signal("name");
                name("Johnny Rotten"); // setting signals should also emit a change event

                expect(changeTimes).to.be(6);
            });

        });

        describe("Static Events", function () {

            it("should also be possible to emit events on the model class itself", function (done) {
                Model.on("test", done);
                Model.emit("test");
            });

        });
    });

    describe("Validation", function () {
        var octocat;

        var environment = require("../../lib/shared/env.js");

        before(function () {
            environment.isServer = function () {
                return true;
            };

            environment.isClient = function () {
                return false;
            };
        });

        beforeEach(function () {
            octocat = new Octocat();
        });

        it("should call shared and local validator on default", function (done) {
            octocat.set("name", "Octocat");
            octocat.set("age", 8);

            octocat.validate(function (result) {
                expect(result.result).to.be(true);
                expect(result.shared).to.be.an("object");
                expect(result.local).to.be.an("object");
                done();
            });
        });

        it("should only call shared & local validator if remoteValidation is disabled", function (done) {
            octocat.set("name", "Octocat");
            octocat.set("age", 8);

            octocat.validate(false, function (result) {
                expect(result.result).to.be(true);
                expect(result.shared).to.be.an("object");
                expect(result.remote).to.be(undefined);
                done();
            });
        });

        it("should only call shared validator and therefor work if only shared passes", function (done) {
            octocat.set("name", "Octocat");
            octocat.set("age", 99);

            octocat.validate(function (result) {
                expect(result.result).to.be(false);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(false);
                done();
            });
        });
    });
});