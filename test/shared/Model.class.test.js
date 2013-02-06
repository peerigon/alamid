"use strict";

var expect = require("expect.js");

var Animal = require("./Model/Animal.class.js"),
    User1 = require("./Model/User1.class.js"),
    User2 = require("./Model/User2.class.js"),
    Octocat = require("./Model/Octocat.class.js");

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

            it("should return multiple attributes at once", function () {
                expect(user.get("name", "age")).to.eql({
                    name : "John Wayne",
                    age : 45
                });
            });

            it("should fail if setting an unknown attribute", function () {
                expect(function () {
                    user.set("what", "ever");
                }).to.throwError();
                expect(function () {
                    user.set({
                        name : "hans",
                        what : "ever"
                    });
                }).to.throwError();

                //this is important because it depends on the order
                expect(user.get("name")).to.eql("hans");
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
        });

        describe("Casting", function () {

            var user2;

            beforeEach(function () {
                user2 = new User2();
            });

            describe("String Fields", function () {
                it("should accept Numbers", function () {
                    user2.set('name', "1234");
                    expect(user2.get("name")).to.eql("1234");
                });

                it("should accept Dates", function () {
                    var date = new Date();
                    user2.set('name', date);
                    expect(user2.get("name")).to.eql(date.toString());
                });
            });

            describe("Number Fields", function () {
                it("should accept String", function () {
                    user2.set('age', "1234");
                    expect(user2.get("age")).to.eql(1234);
                });

                it("should accept Dates", function () {
                    var date = new Date();
                    user2.set('age', date);
                    expect(user2.get("age")).to.eql(date.getTime());
                });
            });

            describe("Date Fields", function () {
                it("should accept Strings", function () {
                    var nowDate = new Date();
                    user2.set('birthday', nowDate.toString());
                    expect(user2.get("birthday")).to.be.a(Date);
                    expect(user2.get("birthday").toString()).to.be(nowDate.toString());

                    //Invalid input
                    user2.set('birthday', "bla bla");
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

        describe("Escaping", function () {

            it("should return an escaped attribute", function () {
                user.set('name', '<script>alert("PWNED");</script>');
                expect(user.escape("name")).to.eql("&lt;script&gt;alert(&quot;PWNED&quot;);&lt;&#47;script&gt;");
            });

            it("should return an all escaped attribute if called without arguments", function () {
                user.set('name', '<script>alert("PWNED");</script>');
                user.set('age', 3);
                var escapedUser = user.escape();

                expect(escapedUser.name).to.eql("&lt;script&gt;alert(&quot;PWNED&quot;);&lt;&#47;script&gt;");
                expect(escapedUser.age).to.eql(3)
            });
        });

        describe("Unset", function () {

            it("should unset values to the defaults", function () {

                user.set('name', 'Octocat');
                expect(user.get('name')).to.eql('Octocat');
                user.unset('name');
                expect(user.get('name')).to.eql('John Wayne');

                user.set({
                    name: 'Johnny Rotten',
                    age: 50
                });

                expect(user.get('age')).to.eql(50);
                //unset multiple
                user.unset('name', 'age');
                expect(user.get()).to.eql({
                    name: 'John Wayne',
                    age: 45,
                    kills : null
                });
            });
        });

        describe("isDefault", function () {
            it("should check if applied values are the default values", function () {
                expect(user.isDefault()).to.be(true);
                user.set('name', 'Octocat');
                expect(user.isDefault()).to.be(false);
                expect(user.isDefault("age")).to.be(true);
                user.unset('name');
                expect(user.isDefault("name")).to.be(true);
                user.set('age', 5);
                expect(user.isDefault("name","age")).to.be(false);
                user.set('age', 45);    // 45 equals the default value
                expect(user.isDefault("age")).to.be(true);
                user.unset('name', 'age');
                expect(user.isDefault()).to.be(true);
            });
        });

        describe("toObject", function () {

            it("should return an object containing id & ids on default", function () {
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

                expect(user.toObject()).to.eql({
                    id : null,
                    ids : {},
                    name: 'Octocat',
                    age: 5,
                    kills: 1
                });
            });

            it("should return name the ID as defined in options.idAttribute", function () {
                user.set('name', 'Octocat');
                user.set({
                    age: 5,
                    kills: 1
                });

                expect(user.toObject({ idAttribute : "_id" })).to.eql({
                    _id : null,
                    ids : {},
                    name: 'Octocat',
                    age: 5,
                    kills: 1
                });
            });

            it("should exclude the attributes defined in options.exclude", function () {
                user.set('name', 'Octocat');

                expect(user.toObject({ exclude : ["id", "age", "kills"] })).to.eql({
                    ids : {},
                    name: 'Octocat'
                });
            });
        });

        describe("toJSON (alias for toObject)", function () {
            it("should return an object to be used with JSON-Stringify", function () {
                user.set('name', 'Octocat');
                user.set({
                    age: 5,
                    kills: 1
                });

                expect(JSON.parse(JSON.stringify(user))).to.eql({
                    id : null,
                    ids : {},
                    name: 'Octocat',
                    age: 5,
                    kills: 1
                });
            });
        });

        describe("Events", function () {
            it("should call all events", function () {
                var changeTimes = 0;

                user.on('change', function () {
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
                user.set('name', 'blaablaa');
                user.escape('name');
                user.getDefaults();
                user.toJSON();
                expect(changeTimes).to.be(5);
            });
        });
    });

    describe("Validation", function(){
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

        it("should call shared and local validator on default", function(done) {
            octocat.set('name', 'Octocat');
            octocat.set('age', 8);

            octocat.validate(function (result) {
                expect(result.result).to.be(true);
                expect(result.shared).to.be.an("object");
                expect(result.local).to.be.an("object");
                done();
            });
        });

        it("should only call shared & local validator if remoteValidation is disabled", function(done) {
            octocat.set('name', 'Octocat');
            octocat.set('age', 8);

            octocat.validate(false, function (result) {
                expect(result.result).to.be(true);
                expect(result.shared).to.be.an("object");
                expect(result.remote).to.be(undefined);
                done();
            });
        });

        it("should only call shared validator and therefor work if only shared passes", function(done) {
            octocat.set('name', 'Octocat');
            octocat.set('age', 99);

            octocat.validate(function (result) {
                expect(result.result).to.be(false);
                expect(result.shared.result).to.be(true);
                expect(result.local.result).to.be(false);
                done();
            });
        });
    });
});