"use strict";

var expect = require("expect.js");

var Animal = require("./Model/Animal.class.js"),
    User1 = require("./Model/User1.class.js"),
    User2 = require("./Model/User2.class.js"),
    Octocat = require("./Model/Octocat.class.js"),
    Model = require("../../lib/shared/Model.class.js");

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

        describe("Setter & Getter", function () {

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

            it("should return all attributes", function () {
                expect(user.get()).to.eql({
                    name: "John Wayne",
                    age: 45,
                    kills: undefined
                });
            });

            it("should be possible to set and get any key if there is no schema", function () {
                var model = new Model();

                model.set("what", "ever");
                expect(model.get("what")).to.be("ever");
                expect(model.get()).to.eql({ what: "ever" });
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

            it("should be chainable", function () {
                expect(user.set("name", "Clint Eastwood")).to.be(user);
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

        describe("Casting", function () {

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

        describe("Unset", function () {

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
                    kills: undefined
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
                    kills: undefined
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
                        kills: undefined
                    });
                });

            });
        });

        describe("accept", function () {

            it("should set values and accept current state", function () {

                user.set("name", "Octocat");
                expect(user.get("name")).to.eql("Octocat");
                user.unset("name");
                expect(user.get("name")).to.eql("John Wayne");
                user.set("name", "Octocat");

                user.accept();

                user.unset("name");
                expect(user.get("name")).to.eql("Octocat");

                user.set({
                    name: "Johnny Rotten",
                    age: 50
                });

                user.accept();
                user.unset("name", "age");

                expect(user.get()).to.eql({
                    name: "Johnny Rotten",
                    age: 50
                });
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
                    age: 45,
                    kills: undefined
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
        });

        describe("Events", function () {
            it("should call all events", function () {
                var changeTimes = 0;

                user.on("change", function () {
                    changeTimes++;
                });

                user.set("name", "bla");
                try {
                    user.set("asdasd", "asd");
                } catch (err) {
                    // this error should not trigger an event
                }

                user.set("age", 27);
                user.unset("age");
                user.set("age", 23);
                user.set("name", "blaablaa");
                expect(changeTimes).to.be(5);
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