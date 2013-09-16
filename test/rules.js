var pupil = require('../src/pupil'),
    rules;

exports.setUp = function(callback) {
    callback();
};

exports.tearDown = function(callback) {
    callback();
};

exports['if no rules then everything validates'] = function(test) {
    var rules = {},
        data = {foo: 'test'};
    var ret = pupil.validate(rules, data);
    test.deepEqual(ret.fields(), { foo: true });
    test.done();
};

exports['require when rule is present'] = function(test) {
    var rules = {foo: "lenMin(3)"},
        data = {};
    var ret = pupil.validate(rules, data);
    test.deepEqual(ret.fields(), {foo: false});
    test.done();
};

exports['optional validates if not present'] = function(test) {
    var rules = { foo: "optional" };
    var ret = pupil.validate(rules, {});
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['optional with or condition validates if not present'] = function(test) {
    var rules = { foo: "optional || lenMin(3)" };
    var ret = pupil.validate(rules, {});
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['optional with or condition always validates'] = function(test) {
    // does this make sense?
    var rules = { foo: "optional || lenMin(3)" };
    var ret = pupil.validate(rules, { foo: 'a' });
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['optional with and condition does not validate'] = function(test) {
    // does this make sense?
    var rules = { foo: "optional && lenMin(3)" };
    var ret = pupil.validate(rules, { foo: 'a' });
    test.deepEqual(ret.fields(), {foo: false});
    test.done();
};

exports['use otherRequire to require one of two fields'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {name: "Sally", age: 20});
    test.deepEequal(ret.fields(), {name: true, age: true});
    test.done();
};

