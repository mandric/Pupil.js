var pupil = require('../src/pupil');

exports.setUp = function(callback) {
    callback();
};

exports.tearDown = function(callback) {
    callback();
};

exports['values without rules will always validate'] = function(test) {
    var rules = {},
        data = {foo: 'test'};
    var ret = pupil.validate(rules, data);
    test.deepEqual(ret.fields(), { foo: true });
    test.done();
};

exports['rules are also applied to values that are not present'] = function(test) {
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

exports['"optional" with an "or" condition always validates'] = function(test) {
    var rules = { foo: "optional || lenMin(3)" };
    var ret = pupil.validate(rules, { foo: 'a' });
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['"optional" with an "or" condition validates if value is not present'] = function(test) {
    var rules = { foo: "optional || lenMin(3)" };
    var ret = pupil.validate(rules, {});
    test.deepEqual(ret.fields(), {foo: true});
    test.done();
};

exports['"optional" with an "and" requires the other condition to also validate'] = function(test) {
    // does this make sense?
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

exports['validates both fields when using other and optional rule'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {name: "Sally", age: 20});
    test.deepEqual(ret.fields(), {name: true, age: true});
    test.done();
};

exports['validates both fields when using other and first one is defined'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {name: "Sally"});
    test.deepEqual(ret.fields(), {name: true, age: true});
    test.done();
};

exports['validates both fields when using other and second one is defined'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {age: 20});
    test.deepEqual(ret.fields(), {name: true, age: true});
    test.done();
};

exports['both fields are not validated when using other and one field defined and invalid'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {age: 200});
    test.deepEqual(ret.fields(), {name: false, age: false});
    test.done();
};

exports['when using optional if one field is valid they both validate'] = function(test) {
    var rules = {
        name: "otherMax('age', 100) ? optional : lenMin(5)",
        age: "otherLenMin('name', 5) ? optional : max(100)"
    };
    var ret = pupil.validate(rules, {name: "Sally", age: 200});
    test.deepEqual(ret.fields(), {name: true, age: true});
    test.done();
};

