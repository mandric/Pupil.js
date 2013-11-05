var tokens = require('../src/tokens.js'),
    lexer  = require('../src/lexer.js').create(tokens);

exports.setUp = function(callback) {
    callback();
};

exports.tearDown = function(callback) {
    callback();
};

exports['identifiers, strings and numbers are tokenized correctly'] = function(test) {
    var tokenized = lexer.tokenize('func "stringArg" 50');

    test.deepEqual(tokenized, [
        {name: tokens.Identifier, data: 'func'},
        {name: tokens.String, data: 'stringArg'},
        {name: tokens.Number, data: 50},
    ]);

    test.done();
};

exports['brackets are tokenized correctly'] = function(test) {
    var tokenized = lexer.tokenize('()');

    test.deepEqual(tokenized, [
        {name: tokens.BracketOpen, data: null},
        {name: tokens.BracketClose, data: null}
    ]);

    test.done();
};

exports['logical operators are tokenized correctly'] = function(test) {
    var tokenized = lexer.tokenize('&& || !');

    test.deepEqual(tokenized, [
        {name: tokens.LogicalAnd, data: null},
        {name: tokens.LogicalOr, data: null},
        {name: tokens.LogicalNot, data: null},
    ]);

    test.done();
};

exports['ternaries are tokenized correctly'] = function(test) {
    var tokenized = lexer.tokenize('condition ? then : else');

    test.notDeepEqual(tokenized, [
        {name: tokens.Identifier, data: 'condition'},
        {name: tokens.TernaryThen, data: null},
        {name: tokens.Identifier, data: 'then'},
        {name: tokens.TernaryElse, data: null},
        {name: tokens.Identifier, data: 'else'}
    ]);

    test.done();
};

exports['strings need to start and end with the same delimiter'] = function(test) {
    var tokenized = lexer.tokenize('"test\'');
    var tokenized2 = lexer.tokenize('"test"');

    test.deepEqual(tokenized, [
        {name: tokens.String, data: 'test\''}
    ]);

    test.deepEqual(tokenized2, [
        {name: tokens.String, data: 'test'}
    ]);

    test.done();
};

exports['whitespace outside of strings and identifier separators has no effect'] = function(test) {
    var tokenized = lexer.tokenize('"string with whitespace"identifier&&identifier||identifier');
    var tokenized2 = lexer.tokenize('"string with whitespace" identifier    &&identifier||    identifier');

    test.deepEqual(tokenized, tokenized2);

    test.done();
};

exports['whitespace affects strings'] = function(test) {
    var tokenized = lexer.tokenize('"string with whitespace"');
    var tokenized2 = lexer.tokenize('"string  with       whitespace"');

    test.notDeepEqual(tokenized, tokenized2);

    test.done();
};