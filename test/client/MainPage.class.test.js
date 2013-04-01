"use strict"; // run code in ES5 strict mode

var expect = require("../testHelpers/expect.jquery.js"),
    Page = require("../../lib/client/Page.class.js"),
    MainPage = require("../../lib/client/MainPage.class.js"),
    PageLoader = require("../../lib/client/PageLoader.class.js"),
    pageRegistry = require("../../lib/client/registries/pageRegistry.js");

describe("MainPage", function () {
    var main,
        blog,
        posts,
        about,
        contact,
        Blog = Page.extend("Blog"),
        Posts = Page.extend("Posts"),
        About = Page.extend("About"),
        Contact = Page.extend("Contact");

    function removeAllListeners() {
        main.removeAllListeners();
        blog.removeAllListeners();
        posts.removeAllListeners();
    }

    before(function () {
        PageLoader.bundles["/about"] =  function (callback) {
            callback(About);
        };
        PageLoader.bundles["/about/contact"] = function (callback) {
            callback(Contact);
        };
        PageLoader.bundles["/blog"] = function (callback) {
            callback(Blog);
        };
    });
    beforeEach(function () {
        main = new MainPage();
        blog = new Blog();
        posts = new Posts();
        about = new About();
    });

    describe("#constructor()", function () {

        it("should pass all params to the super class", function () {
            var ctx = {},
                template = "<div></div>";

            main = new MainPage(ctx, template);
            expect(main.getRoot()).to.eql(template);
            expect(main.context).to.be(ctx);
        });

        it("should use document.body as page-node when the root is the document and there is no page-node within the document", function () {
            main = new MainPage({}, document);
            expect(main.getNode("page")).to.be(document.body);
        });
    });

    describe("#getSubPages()", function () {
        var subPages;

        it("should return an empty array if there are no sub-pages", function () {
            subPages = main.getSubPages();
            expect(subPages).to.be.an(Array);
            expect(subPages).to.have.length(0);
        });
        it("should return an array with the current page hierarchy", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            expect(main.getSubPages()).to.eql([blog, posts]);
            blog.setSubPage(about);
            expect(main.getSubPages()).to.eql([blog, about]);
        });

    });

    describe("#setSubPages()", function () {

        it("should set all pages according to the given array", function () {
            main.setSubPages([blog, posts]);
            expect(main.getSubPage()).to.be(blog);
            expect(blog.getSubPage()).to.be(posts);
        });

        it("should remove pages that are not in the given array", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            main.setSubPages([]);
            expect(main.getSubPage()).to.be(null);
            expect(blog.getSubPage()).to.be(null);
        });

        it("should be possible to remove all sub-pages by passing null", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            main.setSubPages(null);
            expect(main.getSubPage()).to.be(null);
            expect(blog.getSubPage()).to.be(null);
        });

        it("should not re-set pages that are in both arrays", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            blog.setSubPage = function () {
                throw new Error("This function should not be called");
            };
            main.setSubPages([blog, posts, about]);
            expect(posts.getSubPage()).to.be(about);
        });

        it("should be chainable", function () {
            expect(main.setSubPages([])).to.be(main);
        });

    });

    describe("#changePage()", function () {
        var originalLoad = PageLoader.prototype.load,
            originalCancel = PageLoader.prototype.cancel;

        beforeEach(function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
        });

        afterEach(function () {
            PageLoader.prototype.load = originalLoad;
            PageLoader.prototype.cancel = originalCancel;
        });

        it("should emit 'beforePageChange' first and than 'beforeUnload' on every Sub-Page that will be changed from bottom to top", function () {
            var emitted = [],
                ctx = {};

            main.on("beforePageChange", function (event) {
                expect(event.context).to.be(ctx);
                expect(event.target).to.be(main);
                expect(event.name).to.be("BeforePageChange");
                emitted.push("main");
            });
            blog.on("beforeUnload", function (event) {
                expect(event.context).to.be(ctx);
                expect(event.target).to.be(main);
                expect(event.name).to.be("BeforeUnload");
                emitted.push("blog");
            });
            posts.on("beforeUnload", function (event) {
                expect(event.context).to.be(ctx);
                expect(event.target).to.be(main);
                expect(event.name).to.be("BeforeUnload");
                emitted.push("posts");
            });
            main.on("beforeUnload", function () {
                throw new Error("This event should never be emitted because the main page can't be left");
            });

            main.changePage("about", ctx);
            expect(emitted).to.eql(["main", "posts", "blog"]);
        });

        it("should immediately cancel the process when calling event.preventDefault()", function () {
            var ctx = {};

            function throwError() {
                throw new Error("This function should not be called");
            }

            PageLoader.prototype.load = throwError;

            main.on("beforePageChange", function (event) {
                event.preventDefault();
            });
            blog.on("beforeUnload", throwError);
            posts.on("beforeUnload", throwError);
            main.changePage("about", ctx);
            removeAllListeners();

            blog.on("beforeUnload", throwError);
            posts.on("beforeUnload", function (event) {
                event.preventDefault();
            });
            main.changePage("about", ctx);
            removeAllListeners();
        });

        it("should cancel() the previous pageLoader that is still running", function (done) {
            PageLoader.prototype.load = function () {
                // never call back
            };
            PageLoader.prototype.cancel = done;

            main.changePage("about", {});
            main.changePage("blog", {});
        });

        it("should emit 'pageChange' if it has finished", function (done) {
            var ctx = {};

            main.on("pageChange", function (event) {
                expect(event.target).to.be(main);
                expect(event.context).to.be(ctx);
                expect(event.name).to.be("PageChange");
                done();
            });

            main.changePage("about", ctx);
        });

        it("should accept all combinations of trailing or leading slashes", function (done) {
            var called = 0;

            main.on("pageChange", function onPageChange() {
                if (++called === 3) {
                    done();
                }
            });

            main.changePage("blog");
            main.changePage("about/");
            main.changePage("/blog/");
        });

        it("should be possible to change current page to MainPage with '/' as route", function (done) {
            var subPages;

            main.on("pageChange", function () {
                subPages = main.getSubPages();
                expect(subPages).to.have.length(0);
                done();
            });

            main.changePage("/", {});
        });

        it("should be possible to change current page to MainPage with '' as route", function (done) {
            var subPages;

            main.on("pageChange", function () {
                subPages = main.getSubPages();
                expect(subPages).to.have.length(0);
                done();
            });

            main.changePage("", {});
        });

        it("should append all loaded pages from top to bottom", function () {
            main.changePage("about/contact", {});

            about = main.getSubPage();
            expect(about).to.be.an(About);

            contact = about.getSubPage();
            expect(contact).to.be.a(Contact);
        });

    });

});
