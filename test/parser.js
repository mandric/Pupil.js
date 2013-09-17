var tokens   = require('../src/tokens.js'),
    entities = require('../src/entities.js'),
    parser   = require('../src/parser.js').create(tokens, entities);

var cloneObject = function(object) {
    var newObject = {};

    for (var index in object) {
        newObject[index] = object[index];
    }

    return newObject;
};

var baseEntity = {
    type: null,

    sub: [],

    funcName: "",
    funcArgs: [],

    conditions: [],
    ifThen: null,
    ifElse: null
};

exports.setUp = function(callback) {
    callback();
};

exports.tearDown = function(callback) {
    callback();
};

exports['functions are parsed correctly'] = function(test) {
    var tokenized = [
        {name: tokens.Identifier, data: 'func'},
        {name: tokens.BracketOpen, data: null},
        {name: tokens.String, data: 'stringArg'},
        {name: tokens.Comma, data: null},
        {name: tokens.Number, data: 50},
        {name: tokens.BracketClose, data: null}
    ];
    
    var parseResultFunction = cloneObject(baseEntity);
    parseResultFunction.type = entities.Func;
    parseResultFunction.funcName = 'func';
    parseResultFunction.funcArgs = ['stringArg', 50];

    var expectedParseResult = cloneObject(baseEntity);
    expectedParseResult.type = entities.Block;
    expectedParseResult.sub = [parseResultFunction];

    var parsed = parser.parse(tokenized);

    test.deepEqual(parsed, [expectedParseResult]);

    test.done();
};