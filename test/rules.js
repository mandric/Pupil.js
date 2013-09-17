var pupil = require('../src/pupil');

exports.setUp = function(callback) {
    callback();
};

exports.tearDown = function(callback) {
    callback();
};

exports['if no rules then fields validates'] = function(test) {
    var rules = {},
        data = {foo: 'test'};
    var ret = pupil.validate(rules, data);
    test.deepEqual(ret.fields(), { foo: true });
    test.done();
};

exports['non-valid lenMin does not validate if field not present'] = function(test) {
    var rules = {foo: "lenMin(3)"},
        data = {};
    var ret = pupil.validate(rules, data);
    test.deepEqual(ret.fields(), {foo: false});
    test.done();
};

exports['optional rule validates if field not present'] = function(test) {
    var rules = { foo: "optional" };
    var ret = pupil.validate(rules, {});
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['optional or non-valid lenMin validates when field not present'] = function(test) {
    var rules = { foo: "optional || lenMin(3)" };
    var ret = pupil.validate(rules, {});
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['optional or non-valid lenMin rules validates'] = function(test) {
    var rules = { foo: "optional || lenMin(3)" };
    var ret = pupil.validate(rules, { foo: 'a' });
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['optional and non-valid lenMin rules do not validate'] = function(test) {
    var rules = { foo: "optional && lenMin(3)" };
    var ret = pupil.validate(rules, { foo: 'a' });
    test.deepEqual(ret.fields(), {foo: false});
    test.done();
};

exports['optional and valid lenMin rules validates'] = function(test) {
    var rules = { foo: "optional && lenMin(3)" };
    var ret = pupil.validate(rules, { foo: 'aaa' });
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['use other to require one of two fields'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {name: "Sally", age: 20});
    test.deepEqual(ret.fields(), {name: true, age: true});
    test.done();
};

