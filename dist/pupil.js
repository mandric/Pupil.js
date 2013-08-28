(function(undefined) {
	var entities = {};

	var addEntity = function(name) {
		entities[name] = {
			name: name,
			toString: function() {
				return name;
			}
		};
	};

	addEntity('Block');
	addEntity('Func');
	addEntity('LogicalAnd');
	addEntity('LogicalOr');
	addEntity('LogicalNot');

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = entities;
    } else {
        window.pupil = window.pupil || {};
        window.pupil.entities = entities;
    }
})();;(function(undefined) {
    var Lexer = function(tokens) {
        this.tokens = tokens;
    };

    Lexer.prototype.tokenize = function(str) {
        str = str.replace(/([^\\])\s+/g, '$1');

        var chars = str.split(""),
            resultTokens = [],
            i;

        var Token = this.tokens; // A shorthand

        var pushToken = function(name, data) {
            resultTokens.push({
                name: name,
                data: data || null
            });
        };

        // If we're "building" an identifier, store it here until we flush it
        var tempIdentifier = "";

        // When a char is escaped, treat it as an identifier even if it would
        // otherwise be resolved to a different token
        var treatNextAsIdentifier = false;

        // Whether we should flush the identifier we're building
        var flushIdentifier = true;

        // The token or tokens to push after e.g. flushing the identifier
        var tokensToPush = [];

        // Sometimes we'll completely ignore a char, such as with escape symbols
        var ignoreThisChar = false;

        // Loop through the chars
        for (i = 0; i < chars.length; i++) {
            var thisChar = chars[i],
                nextChar = chars[i + 1];

            flushIdentifier = true;
            tokensToPush = [];
            ignoreThisChar = false;

            // This char was escaped;
            // skip the tokens, go straight to the identifier part
            if (treatNextAsIdentifier) {
                treatNextAsIdentifier = false;
            }

            // Escape the next char; ignore this one (because it's an escaping symbol)
            // and don't flush the identifier (as the next char will be added to it).
            else if (thisChar == '\\') {
                treatNextAsIdentifier = true;
                ignoreThisChar = true;
                flushIdentifier = false;
            }

            // General tokens
            else if (thisChar == ',') {
                tokensToPush.push([Token.Comma]);
            } else if (thisChar == ':') {
                tokensToPush.push([Token.Colon]);
            } else if (thisChar == '&' && nextChar == '&') {
                tokensToPush.push([Token.LogicalAnd]);
                i++;
            } else if (thisChar == '|' && nextChar == '|') {
                tokensToPush.push([Token.LogicalOr]);
                i++;
            } else if (thisChar == '!') {
                tokensToPush.push([Token.LogicalNot]);
            } else if (thisChar == '(') {
                tokensToPush.push([Token.BracketOpen]);
            } else if (thisChar == ')') {
                tokensToPush.push([Token.BracketClose]);
            }

            // If there is no token to push and we're not ignoring
            // this char, assume we're continuing (or starting) an
            // identifier.
            if (tokensToPush.length === 0 && ! ignoreThisChar) {
                tempIdentifier += thisChar;
                flushIdentifier = false;
            }

            // Make sure we flush the identifier if we still have one
            // going when the string ends.
            if (i == chars.length - 1) {
                flushIdentifier = true;
            }

            // Flushing the identifier means pushing an identifier
            // token with the current "tempIdentifier" as the data
            // and then emptying the temporary identifier.
            if (flushIdentifier && tempIdentifier !== "") {
                tokensToPush.unshift([Token.Identifier, tempIdentifier]);
                tempIdentifier = "";
            }

            if (tokensToPush.length > 0) {
                for (var a = 0; a < tokensToPush.length; a++) {
                    pushToken(tokensToPush[a][0], tokensToPush[a][1]);
                }
            }
        } // End the char loop

        return resultTokens;
    };

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = {
            create: function(tokens) {
                return new Lexer(tokens);
            }
        };
    } else {
        window.pupil = window.pupil || {};
        window.pupil.lexer = Lexer;
    }
})();;(function(undefined) {
    var createEntity = function(type) {
        return {
            type: type,

            // Used for "Block" type entities
            sub: [],

            // Used for "Func" (Function) type entities
            funcName: "",
            funcArgs: []
        };
    };

    var ParserException = function(message, pos) {
        this.message = message;
        this.pos = pos;
    };

    var Parser = function(tokens, entities) {
        this.tokens = tokens;
        this.entities = entities;
    };

    Parser.prototype.parse = function(tokens) {
        // A couple shorthands
        var Token = this.tokens;
        var Entity = this.entities;

        var rootBlock = createEntity(Entity.Block);
        var blockStack = [rootBlock];

        var currentBlock = blockStack[blockStack.length - 1];
        var currentFunction = null, flushFunction = true;

        var accept_identifier = 1;
        var accept_logicalOp = 0;
        var accept_negator = 1;
        var accept_funcArgs = 0; // Separates function name from its arguments (':')
        var accept_argSeparator = 0; // Separates arguments from each other (',')
        var accept_block = 1;

        for (var i = 0; i < tokens.length; i++) {
            var thisToken = tokens[i];
            var entitiesToPush = [];
            var openNewBlock = false;
            var closeBlock = false;

            if (thisToken.name == Token.Identifier) {
                if ( ! accept_identifier) { throw new ParserException("Unexpected identifier", i); }

                flushFunction = false;

                if (currentFunction) { // Arguments for an already created function
                    currentFunction.funcArgs.push(thisToken.data);

                    accept_identifier   = 0;
                    accept_logicalOp    = 1;
                    accept_funcArgs     = 0;
                    accept_argSeparator = 1;
                    accept_block        = 1;
                    accept_negator      = 0;
                } else { // A new function
                    currentFunction = createEntity(Entity.Func);
                    currentFunction.funcName = thisToken.data;

                    accept_identifier   = 0;
                    accept_logicalOp    = 1;
                    accept_funcArgs     = 1;
                    accept_argSeparator = 0;
                    accept_block        = 0;
                    accept_negator      = 0;
                }
            } else if (thisToken.name == Token.Colon) {
                if ( ! accept_funcArgs) { throw new ParserException("Unexpected function arguments", i); }

                flushFunction = false;

                accept_identifier   = 1;
                accept_logicalOp    = 0;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 0;
                accept_negator      = 0;
            } else if (thisToken.name == Token.Comma) {
                if ( ! accept_argSeparator) { throw new ParserException("Unexpected function argument separator", i); }

                flushFunction = false;

                accept_identifier   = 1;
                accept_logicalOp    = 0;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 0;
                accept_negator      = 0;
            } else if (thisToken.name == Token.LogicalAnd) {
                if ( ! accept_logicalOp) { throw new ParserException("Unexpected logical AND", i); }

                entitiesToPush.push(createEntity(Entity.LogicalAnd));
                flushFunction = true;

                accept_identifier   = 1;
                accept_logicalOp    = 0;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 1;
                accept_negator      = 1;
            } else if (thisToken.name == Token.LogicalOr) {
                if ( ! accept_logicalOp) { throw new ParserException("Unexpected logical OR", i); }

                entitiesToPush.push(createEntity(Entity.LogicalOr));
                flushFunction = true;

                accept_identifier   = 1;
                accept_logicalOp    = 0;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 1;
                accept_negator      = 1;
            } else if (thisToken.name == Token.LogicalNot) {
                if ( ! accept_negator) { throw new ParserException("Unexpected logical NOT", i); }

                entitiesToPush.push(createEntity(Entity.LogicalNot));
                flushFunction = true;

                accept_identifier   = 1;
                accept_logicalOp    = 0;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 1;
                accept_negator      = 0;
            } else if (thisToken.name == Token.BracketOpen) {
                if ( ! accept_block) { throw new ParserException("Unexpected opening bracket", i); }

                openNewBlock = true;
                flushFunction = true;

                accept_identifier   = 1;
                accept_logicalOp    = 0;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 1;
                accept_negator      = 1;
            } else if (thisToken.name == Token.BracketClose) {
                closeBlock = true;
                flushFunction = true;

                accept_identifier   = 0;
                accept_logicalOp    = 1;
                accept_funcArgs     = 0;
                accept_argSeparator = 0;
                accept_block        = 0;
                accept_negator      = 0;
            }

            if (i == tokens.length - 1) {
                flushFunction = true;
            }

            if (flushFunction && currentFunction) {
                entitiesToPush.unshift(currentFunction);
                currentFunction = null;
            }

            if (entitiesToPush.length > 0) {
                for (var a = 0; a < entitiesToPush.length; a++) {
                    currentBlock.sub.push(entitiesToPush[a]);
                }
            }

            if (openNewBlock) {
                var newBlock = createEntity(Entity.Block);
                blockStack.push(newBlock);
                currentBlock.sub.push(newBlock);

                currentBlock = blockStack[blockStack.length - 1];
            }

            if (closeBlock) {
                if (blockStack.length === 1) { throw new ParserException("Can't close the root block.", i); }

                blockStack.pop();
                currentBlock = blockStack[blockStack.length - 1];
            }
        } // End token loop

        if (blockStack.length > 1) { throw new ParserException("All blocks weren't closed."); }

        return rootBlock;
    };

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = {
            create: function(tokens, entities) {
                return new Parser(tokens, entities);
            }
        };
    } else {
        window.pupil = window.pupil || {};
        window.pupil.parser = Parser;
    }
})();;(function(undefined) {
    var tokens              = null;
    var entities            = null;
    var validator_functions = null;

    var lexer               = null;
    var parser              = null;
    var validator           = null;

    var hasInitialized      = false;

    var ruleCache = {};

    var initialize = function() {
        if (typeof module !== 'undefined') {
            tokens              = require('./tokens.js');
            entities            = require('./entities.js');
            validator_functions = require('./validator_functions.js');

            lexer               = require('./lexer.js').create(tokens);
            parser              = require('./parser.js').create(tokens, entities);
            validator           = require('./validator.js').create(validator_functions, entities);
        } else {
            tokens              = window.pupil.tokens;
            entities            = window.pupil.entities;
            validator_functions = window.pupil.validator_functions;

            lexer               = new window.pupil.lexer(tokens);
            parser              = new window.pupil.parser(tokens, entities);
            validator           = new window.pupil.validator(validator_functions, entities);
        }

        hasInitialized = true;
    };

    var addFunction = function(name, callable) {
        if ( ! hasInitialized) {
            initialize();
        }

        validator_functions[name.toLowerCase()] = callable;
    };

    var validate = function(rules, values) {
        if ( ! hasInitialized) {
            initialize();
        }
        
        var results = {};

        for (var index in values) {
            var rule = rules[index],
                tokens, entities;

            if ( ! rule) {
                results[index] = true;
                continue;
            }

            if (ruleCache[rule]) {
                entities = ruleCache[rule];
            } else {
                tokens = lexer.tokenize(rule);
                entities = parser.parse(tokens);

                ruleCache[rule] = entities;
            }

            results[index] = validator.validate(entities.sub, values, index);
        }

        return results;
    };

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = {
            addFunction: addFunction,
            validate: validate
        };
    } else {
        window.pupil = window.pupil || {};
        window.pupil.addFunction = addFunction;
        window.pupil.validate    = validate;
    }
})();;(function(undefined) {
	var tokens = {};

	var addToken = function(name) {
		tokens[name] = {
			name: name,
			toString: function() {
				return name;
			}
		};
	};

	addToken('Identifier');
	addToken('Colon');
	addToken('Comma');
	addToken('LogicalAnd');
	addToken('LogicalOr');
	addToken('LogicalNot');
	addToken('BracketOpen');
	addToken('BracketClose');

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = tokens;
    } else {
        window.pupil = window.pupil || {};
        window.pupil.tokens = tokens;
    }
})();;(function(undefined) {
    var Validator = function(validatorFunctions, entities) {
        this.validatorFunctions = validatorFunctions;
        this.entities = entities;
    };

    Validator.prototype.validate = function(entities, values, valueKey) {
        // A couple shorthands
        var ValidatorFunctions = this.validatorFunctions;
        var Entity = this.entities;

        var validationResult = true;
        var logicalOperator = 1; // 1 = AND, 2 = OR
        var negateNext = false;

        for (var i = 0; i < entities.length; i++) {
            var thisEntity = entities[i];
            var tempResult = true;
            var useTempResult = false;

            if (thisEntity.type == Entity.LogicalAnd) {
                logicalOperator = 1;
            } else if (thisEntity.type == Entity.LogicalOr) {
                logicalOperator = 2;
            } else if (thisEntity.type == Entity.LogicalNot) {
                negateNext = true;
            } else if (thisEntity.type == Entity.Func) {
                var funcName = thisEntity.funcName.toLowerCase(),
                    funcArgs = [];

                // Clone the function arguments so below we don't affect
                // the original arguments in the entity.
                for (var a = 0; a < thisEntity.funcArgs.length; a++) {
                    funcArgs.push(thisEntity.funcArgs[a]);
                }

                if (funcName.substr(0, 5) == 'other') {
                    funcName = funcName.substr(5); // Remove the "other" from the start

                    // Get the values array key of the "other" value
                    var otherValueKey = funcArgs.shift();
                    funcArgs.unshift(values[otherValueKey]);
                } else {
                    funcArgs.unshift(values[valueKey]);
                }

                funcArgs.unshift(values);

                tempResult = ValidatorFunctions[funcName].apply(this, funcArgs);
                useTempResult = true;
            } else if (thisEntity.type == Entity.Block) {
                tempResult = this.validate(thisEntity.sub, values, valueKey);
                useTempResult = true;
            }

            if (useTempResult) {
                if (negateNext) {
                    tempResult = ! tempResult;
                    negateNext = false;
                }

                if (logicalOperator == 1) {
                    validationResult = validationResult && tempResult;
                } else {
                    validationResult = validationResult || tempResult;
                }

                useTempResult = false;
            }
        }

        return validationResult;
    };

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = {
            create: function(validatorFunctions, entities) {
                return new Validator(validatorFunctions, entities);
            }
        };
    } else {
        window.pupil = window.pupil || {};
        window.pupil.validator = Validator;
    }
})();;(function(undefined) {
    var ValidatorFunctions = {};

    var re = {
        alpha: new RegExp('^[a-zA-Z]+$'),
        alphanumeric: new RegExp('^[a-zA-Z0-9]+$'),
        email: new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?/i)
    };

    ValidatorFunctions = {
        equals: function(allValues, value, equalsTo) {
            return value == equalsTo;
        },

        iequals: function(allValues, value, equalsTo) {
            return value.toLowerCase() == equalsTo.toLowerCase();
        },

        sequals: function(allValues, value, equalsTo) {
            return value === equalsTo;
        },

        siequals: function(allValues, value, equalsTo) {
            return value.toLowerCase() === equalsTo.toLowerCase();
        },

        lenmin: function(allValues, value, min) {
            return value.length >= min;
        },

        lenmax: function(allValues, value, max) {
            return value.length <= max;
        },

        min: function(allValues, value, min) {
            return parseFloat(value, 10) >= min;
        },

        max: function(allValues, value, max) {
            return parseFloat(value, 10) <= max;
        },

        between: function(allValues, value, min, max) {
            var numVal = parseFloat(value, 10);
            return ((numVal >= min) && (numVal <= max));
        },

        in: function(allValues, value) {
            var args = Array.prototype.slice.call(arguments);
            args.shift();
            args.shift();

            var inList = args;
            for (var i = 0; i < inList.length; i++) {
                if (inList[i] == value) return true;
            }

            return false;
        },

        required: function(allValues, value) {
            return !!value;
        },

        optional: function(allValues, value) {
            return true;
        },

        numeric: function(allValues, value) {
            // http://stackoverflow.com/a/1830844/316944
            return ! isNaN(parseFloat(value)) && isFinite(value);
        },

        alpha: function(allValues, value) {
            return re.alpha.test(value);
        },

        alphanumeric: function(allValues, value) {
            return re.alphanumeric.test(value);
        },

        email: function(allValues, value) {
            // http://stackoverflow.com/a/2855946/316944
            return re.email.test(value);
        },

        regex: function(allValues, value, regex, flags) {
            flags = flags || "";
            return (new RegExp(regex, flags)).test(value);
        },

        integer: function(allValues, value) {
            return parseInt(value, 10) == value;
        },

        equalsto: function(allValues, value, equalsToKey) {
            return value == allValues[equalsToKey];
        }
    };

    // Export the module
    if (typeof module !== 'undefined') {
        module.exports = ValidatorFunctions;
    } else {
        window.pupil = window.pupil || {};
        window.pupil.validator_functions = ValidatorFunctions;
    }
})();