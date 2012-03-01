var expect = require('expect.js');
var Visibility = require('../../../lib/meta/Visibility.class');

describe('Visibility', function () {

    describe('#PUBLIC', function () {
        it('should return 1', function () {
            expect(Visibility.PUBLIC).to.be(1);
        });
    });

    describe('#PROTECTED', function () {
        it('should return 2', function () {
            expect(Visibility.PROTECTED).to.be(2);
        });
    });

    describe('#PRIVATE', function () {
        it('should return 3', function () {
            expect(Visibility.PRIVATE).to.be(3);
        });
    });

})