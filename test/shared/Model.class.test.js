"use strict";

var expect = require("expect.js"),
    rewire = require("rewire");

// @browser ./testHelpers/compileAlamidClient.js
require("./testHelpers/compileAlamid.js");

var User1 = require("./Model/User1.class.js"),
    User2 = require("./Model/User2.class.js"),
    Octocat = require("./Model/Octocat.class.js");

describe("Model", function() {

    describe("Schema", function(){

        var octocat;

        beforeEach(function() {
            octocat = new Octocat();
        });

        it("should have all keys and default values", function() {

            expect(octocat.get("age")).to.be(5);
            octocat.set("name", "hugo");
            octocat.set("age", 12);
            octocat.set("location", "Under the sea");

            expect(octocat.get("name")).to.be("hugo");
            expect(octocat.get("age")).to.be(12);
            expect(octocat.get("location")).to.be("Under the sea");
        });
    });

    describe("Model-Features", function() {

        var user;

        beforeEach(function() {
            user = new User1();
        });

        describe("#Setter & Getter", function() {

            it("should return single attributes", function() {
                expect(user.get("name")).to.eql("John Wayne");
                expect(user.get("age")).to.eql(45);
            });

            it("should return multiple attributes at once", function() {
                expect(user.get("name", "age")).to.eql({
                    name : "John Wayne",
                    age : 45
                });
            });

            it("should fail if setting an unknown attribute", function() {
                expect(function() { user.set("what", "ever"); }).to.throwError();
                expect(function() {
                    user.set({
                        name : "hans",
                        what : "ever"
                    });
                }).to.throwError();

                //this is important because it depends on the order
                expect(user.get("name")).to.eql("hans");
            });
        });

        describe("#Url", function() {

            var user;
            beforeEach(function() {
                user = new User1();
            });

            it("should set and get urls", function() {
                expect(user.getUrl()).to.eql("User1");
                user.setUrl("user/likes");
                expect(user.getUrl()).to.eql("user/likes");
            });
        });

        describe("parentIds", function() {

            var user;
            beforeEach(function() {
                user = new User1();
            });

            it("#setParentID", function() {
                expect(user.getUrl()).to.eql("User1");
                user.setParentId("user", 2);
                user.setParentId("comment", 3);
                expect(user.getParentId("user")).to.eql(2);
                expect(user.getParentId("comment")).to.eql(3);
            });
        });

        describe("#Casting", function() {

            var user2;

            beforeEach(function() {
                user2 = new User2();
            });

            //casting disabled
            describe("String Fields", function() {
                it("should accept Numbers", function() {
                    user2.set('name', "1234");
                    expect(user2.get("name")).to.eql("1234");
                });

                it("should accept Dates", function() {
                    var date = new Date();
                    user2.set('name', date);
                    expect(user2.get("name")).to.eql(date.toString());
                });
            });

            describe("Number Fields", function() {
                it("should accept String", function() {
                    user2.set('age', "1234");
                    expect(user2.get("age")).to.eql(1234);
                });

                it("should accept Dates", function() {
                    var date = new Date();
                    user2.set('age', date);
                    expect(user2.get("age")).to.eql(date.getTime());
                });
            });

            describe("Date Fields", function() {
                it("should accept Strings", function() {
                    var nowDate = new Date();
                    user2.set('birthday', nowDate.toString());
                    expect(user2.get("birthday")).to.be.a(Date);
                    expect(user2.get("birthday").toString()).to.be(nowDate.toString());

                    //Invalid input
                    user2.set('birthday', "bla bla");
                    expect(user2.get("birthday")).to.be(null);
                });

                it("should accept Numbers (Integers)", function() {
                    var date = new Date();
                    user2.set('birthday', date.getTime());
                    expect(user2.get("birthday")).to.be.a(Date);
                    expect(user2.get("birthday").getTime()).to.eql(date.getTime());

                    //invalid number
                    //never invalid just unix timestamp!

                    //user2.set('birthday', 1223);
                    //expect(user2.get("birthday")).to.be(null);

                });
            });
        });

        describe("#Escaping", function() {

            it("should escape all values on set", function() {
                user.set('name', '<script>alert("PWNED");</script>');
                expect(user.escape("name")).to.eql("&lt;script&gt;alert(&quot;PWNED&quot;);&lt;&#47;script&gt;");
            });
        });

        describe("#Removing", function() {

            it("should restore previous value", function() {
                user.set('name', 'Octocat');
                expect(user.get("name")).to.eql("Octocat");
                user.remove('name');
                expect(user.get("name")).to.eql("John Wayne");
                user.remove('name');
            });

            it("should restores previous values for multiple value", function() {

                expect(user.get("name")).to.eql("John Wayne");
                user.set({
                    name: 'Octocat',
                    age: 4
                });
                expect(user.get("age")).to.eql(4);
                user.remove("name", "age");
                expect(user.get("name")).to.eql("John Wayne");
                expect(user.get("age")).to.eql(45);
            });

            it("should remove many properties at once", function() {
                user.set({
                    name: 'Octocat',
                    age: 5,
                    kills: 1
                });
                user.accept();     // trigger acceptCurrentState, just to be sure that is is removed and not unset
                user.removeAll();
                expect(user.get('name', 'age', 'kills')).to.eql({
                    name: "John Wayne",
                    age: 45,
                    kills: null
                });
            });
        });

        describe("#Unset", function() {

            it("should set values and accept current state", function() {
                user.set('name', 'Octocat');
                expect(user.get('name')).to.eql('Octocat');
                user.unset('name');
                expect(user.get('name')).to.eql('John Wayne');
                user.set('name', 'Octocat');
                user.accept();    // trigger acceptCurrentState
                user.unset('name');
                expect(user.get('name')).to.eql('Octocat');
                user.set({
                    name: 'Johnny Rotten',
                    age: 50
                });
                user.accept();
                user.unset('name', 'age');
                expect(user.get()).to.eql({
                    name: 'Johnny Rotten',
                    age: 50,
                    kills : null //was not returned before?
                });
            });

            it("should unset values for multiple keys", function() {
                user.set('name', 'Octocat');
                user.accept();
                user.set('age', 5);
                user.set('kills', 2);
                user.unsetAll();
                expect(user.get()).to.eql({
                    name: 'Octocat',
                    age: 45,
                    kills : null
                });
            });
        });

        describe("#hasChanged", function() {
            it("should return the status of changed attributes", function() {
                expect(user.hasChanged()).to.be(false);
                expect(user.hasChanged(true)).to.be(false);
                user.set('name', 'Octocat');
                expect(user.hasChanged("name")).to.be(true);
                expect(user.hasChanged()).to.be(true);
                user.remove('name');
                expect(user.hasChanged("name")).to.be(false);
                user.set('age', 5);
                expect(user.hasChanged("name", "age")).to.be(true);
                user.set('age', 45);    // 45 equals the default value
                expect(user.hasChanged("age")).to.be(false);
                expect(user.hasChanged("age", true)).to.be(true);
                user.remove('name', 'age');
                expect(user.hasChanged()).to.be(false);
            });
        });

        describe("#isDefault", function() {
            it("should check if applied values are the default values", function() {
                expect(user.isDefault()).to.be(true);
                expect(user.isDefault(true)).to.be(true);
                user.set('name', 'Octocat');
                expect(user.isDefault()).to.be(false);
                expect(user.isDefault("age")).to.be(true);
                user.remove('name');
                expect(user.isDefault("name")).to.be(true);
                user.set('age', 5);
                expect(user.isDefault("name","age")).to.be(false);
                user.set('age', 45);    // 45 equals the default value
                expect(user.isDefault("age")).to.be(true);
                expect(user.isDefault("age", true)).to.be(false);
                user.remove('name', 'age');
                expect(user.isDefault()).to.be(true);
            });
        });

        describe("#toJSON", function() {
            it("should return the attributes as JSON-string", function() {
                user.set('name', 'Octocat');
                user.set({
                    age: 5,
                    kills: 1
                });
                expect(user.getDefaults()).to.eql({
                    name: 'John Wayne',
                    age: 45,
                    kills: null
                });
                expect(JSON.parse(user.toJSON())).to.eql({
                    name: 'Octocat',
                    age: 5,
                    kills: 1
                });
            });
        });

        describe("#Change", function() {
            it("should determine if values have changed", function() {
                user.set('name', 'Octocat');
                expect(user.hasChanged('name')).to.be(true);
                user.accept();
                expect(user.hasChanged('name')).to.be(false);
                expect(user.isDefault('name')).to.be(false);
            });
        });

        describe("Events", function() {
            it("should call all events", function() {
                var changeTimes = 0;

                user.on('change', function() {
                    changeTimes++;
                });

                user.set('name', 'bla');
                try {
                    user.set('asdasd', 'asd');
                } catch (err) {
                    // this error should not trigger an event
                }

                user.set('age', 27);
                user.unset('age');
                user.set('age', 23);
                user.get('age');
                user.remove('age');
                user.set('name', 'blaablaa');
                user.unsetAll();
                user.removeAll();
                user.escape('name');
                user.hasChanged('name');
                user.isDefault('name');
                user.getDefaults();
                user.toJSON();
                expect(changeTimes).to.be(8);
            });

            it("should not call the events if muted", function() {
                var changeTimes = 0;

                user.setMuted(true);
                user.on('change', function() {
                    changeTimes++;
                });

                user.set('name', 'bla');

                try {
                    user.set('asdasd', 'asd');
                } catch (err) {
                    // this error should not trigger an event
                }

                user.set('age', 27);
                user.unset('age');
                user.set('age', 23);
                user.get('age');
                user.remove('age');
                user.set('name', 'blaablaa');
                user.unsetAll();
                user.removeAll();
                user.escape('name');
                user.hasChanged('name');
                user.isDefault('name');
                user.getDefaults();
                user.toJSON();
                expect(changeTimes).to.be(0);
            });
        });
    });


    describe("Validation", function(){
        var octocat;

        beforeEach(function() {
            octocat = new Octocat();
        });

        it("should call shared and local validator on default", function(done) {
            octocat.set('name', 'Octocat');
            octocat.set('age', 8);

            octocat.validate(function(result) {
                expect(result.result).to.be(true);
                expect(result.shared).to.be.an("object");
                expect(result.local).to.be.an("object");
                done();
            });
        });

        it("should only call shared validator if fullValidation is disabled", function(done) {
            octocat.set('name', 'Octocat');
            octocat.set('age', 8);

            octocat.validate(false, function(result) {
                expect(result.result).to.be(true);
                expect(result.shared).to.be.an("object");
                expect(result.local).to.be(undefined);
                done();
            });
        });

        it("should only call shared validator if fullValidation is disabled", function(done) {
            octocat.set('name', 'Octocat');
            octocat.set('age', 99);

            octocat.validate(function(result) {
                expect(result.result).to.be(false);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(false);
                done();
            });
        });
    });

    describe("Services", function(){

        var octocat, testService;

        beforeEach(function() {
            octocat = new Octocat();
            testService = {
                create : function(model, callback) {
                    callback({ status : "success", data : { name : model.get("name"), age : 10 }});
                },
                update : function(model, callback) {
                    callback({ status : "success", data : { name : model.get("name"), age : 12 }});
                },
                delete : function(model, callback) {
                    callback({ status : "success" });
                }
            };
        });

        describe("Error handling and format parsing (__processResponse)", function() {
            it("should fail if response is no valid object", function(done) {
                testService.create = function(model, callback) {
                    callback();
                };

                octocat = new Octocat();
                octocat.setService(testService);
                octocat.save(function(err) {
                    expect(err).not.to.be(null);
                    done();
                });
            });

            it("should fail if no service is defined for requests", function(done) {
                octocat = new Octocat();
                octocat.setService({});
                octocat.save(function(err) {
                    expect(err).not.to.be(null);
                    done();
                });
            });

            it("should convert an error-response to an internal error", function(done) {
                octocat = new Octocat();
                octocat.setService({
                    create : function(model, callback) {
                        callback({ status : "error", message : "my error message" });
                    }
                });
                octocat.save(function(err) {
                    expect(err.message).to.contain("my error message");
                    done();
                });
            });
        });

        describe("#save", function() {
            it("call the update service if ID is set and return successfully", function(done) {
                octocat = new Octocat(2);
                octocat.setService(testService);
                octocat.set('name', 'Octocat');
                octocat.set('age', 8);
                expect(octocat.getId()).to.be(2);

                octocat.save(function(err) {
                    expect(err).to.be(null);
                    expect(octocat.getId()).to.be(2);
                    expect(octocat.get("age")).to.be(12);
                    expect(octocat.get("name")).to.be("Octocat");
                    done();
                });
            });

            it("call the create service if ID is not set and return successfully", function(done) {
                octocat.setService(testService);
                octocat.set('name', 'Octocat');
                expect(octocat.getId()).to.be(null);

                octocat.save(function(err) {
                    expect(err).to.be(null);
                    expect(octocat.get("age")).to.be(10);
                    expect(octocat.get("name")).to.be("Octocat");
                    done();
                });
            });

            it("should also work with sync services", function(done) {
                octocat.setService({
                    create : function(model) {
                        return { status : "success", data : { age : 10 } };
                    }
                });
                octocat.set('name', 'Octocat');
                expect(octocat.getId()).to.be(null);

                octocat.save(function(err) {
                    expect(err).to.be(null);
                    expect(octocat.get("age")).to.be(10);
                    expect(octocat.get("name")).to.be("Octocat");
                    done();
                });
            });
        });

        describe("#destroy", function() {
            it("call the delete-service if ID is set and return successfully", function(done) {
                octocat = new Octocat(2);
                octocat.setService(testService);
                octocat.set('name', 'Octocat');
                octocat.set('age', 8);
                expect(octocat.getId()).to.be(2);

                octocat.save(function(err) {
                    expect(err).to.be(null);
                    done();
                });
            });
        });

        describe("Statics", function(){

            var Model,
                services,
                mockedOctocats;

            before(function() {

                mockedOctocats = [
                    {
                        id : 1,
                        name : "Octo 1",
                        age : 12
                    },
                    {
                        id : 2,
                        name : "Octo 2",
                        age : 10
                    }
                ];

                var testService = {
                    readCollection : function(model, callback) {
                        callback({ status : "success", data : mockedOctocats });
                    }
                };
                services = require("../../lib/shared/registries/serviceRegistry.js");
                services.getService =  function() {
                    return testService;
                };
                Model = require("../../lib/shared/Model.class.js");
            });

            it("should call the static method and run the mocked readCollection-service", function(done) {
                Model.find(Octocat, { da : "ta" }, function(err, models) {
                    expect(err).to.be(null);
                    expect(models.get(0).get("name")).to.eql("Octo 1");
                    expect(models.get(1).get("name")).to.eql("Octo 2");
                    done();
                });
            });
            //TODO add test for cached instances
        });
    });

    describe("Model-Loader (Model-Caching)", function(){

        var Model;

        before(function() {
            var modelCache = require("../../lib/shared/modelCache.js"),
                clientModelCache = require("../../lib/client/modelCache.client.js");

            //reMap functions
            modelCache.get = clientModelCache.get;
            modelCache.add = clientModelCache.add;

            Model = require("../../lib/shared/Model.class.js", false);
        });


        describe("#find", function() {

            var Octoduck;

            before(function() {
                Octoduck = require("./Model/OctoDuck.class.js", false);
            });

            it("should return a cached instance", function(done) {
                Model.findById(Octoduck, 2, function(err, octo) {
                    expect(octo).to.be.an("object");
                    octo.set("name", "emil");
                    Model.findById(Octoduck, 2, function(err, octo2) {
                        expect(octo).to.eql(octo2);
                        expect(octo2.get("name")).to.be("emil");
                        octo2.set("name", "erpel");
                        expect(octo2.get("name")).to.be("erpel");
                        expect(octo.get("name")).to.be("erpel");
                        done();
                    });
                });
            });

            it("should not cache instances created with new", function(done) {
                var octo = new Octoduck(24);
                octo.set("name", "old emil");

                Model.findById(Octoduck, 24, function(err, octo2) {
                    expect(octo).to.be.an("object");
                    expect(octo2).not.to.eql(octo);
                    expect(octo2.get("name")).to.be(null);
                    octo2.set("name", "erpel");
                    expect(octo2.get("name")).to.be("erpel");
                    expect(octo.get("name")).to.be("old emil");
                    done();
                });
            });
        });

        describe("#save", function() {

            var Octoduck;

            before(function() {
                Octoduck = require("./Model/OctoDuck.class.js", false);
            });

            it("should add an instance to the registry after successful saving", function(done) {
                var octo = new Octoduck();
                octo.save(function(err) {
                    Model.findById(Octoduck, 2, function(err, octo2) {
                        expect(octo2).to.eql(octo);
                        done();
                    });
                });
            });
        });
    });
});

