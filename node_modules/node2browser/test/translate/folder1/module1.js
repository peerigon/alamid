var a = 1,
    b = 1;
    
function test1() {
    return a + b;
}

function test2() {
    return test1();
}

module.exports = test2;