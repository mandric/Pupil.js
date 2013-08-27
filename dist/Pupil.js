(function(Pupil, undefined) {
	Pupil.entities = {};

	var addEntity = function(name) {
		Pupil.entities[name] = {
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
})(window.Pupil = window.Pupil || {});;(function(Pupil, undefined) {
    var Lexer;
    Pupil.lexer = Lexer = {};

    var Token = Pupil.tokens;

    Lexer.tokenize = function(str) {
        str = str.replace(/([^\\])\s+/g, '$1');

        var chars = str.split(""),
            resultTokens = [],
            i;

        var pushToken = function(name, data) {
            resultTokens.push({
                name: name,
                data: data || null
            });
        };

        // If we're "building" an identifier, store it here until we flush it
        var tempIdentifier = "";

        // When a char is escaped, treat it as an identifier
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

            flushIdentifier = true,
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
})(window.Pupil = window.Pupil || {});;(function(Pupil, undefined) {
    var Parser;
    Pupil.parser = Parser = {};

    var Token  = Pupil.tokens;
    var Entity = Pupil.entities;

    var createEntity = function(type) {
        return {
            type: type,

            // Used for "Block" type entities
            sub: [],

            // Used for "Function" type entities
            funcName: "",
            funcArgs: []
        };
    };

    var ParserException = function(message, pos) {
        this.message = message;
        this.pos = pos;
    };

    Parser.parse = function(tokens) {
        var rootBlock = createEntity(Entity.Block);
        var blockStack = [rootBlock];

        var currentBlock = blockStack[blockStack.length - 1];
        var currentFunction = null, flushFunction = true;

        var accept = {
            identifier: true,
            logicalOp: false,
            funcArgs: false, // Separates function name from its arguments (':')
            argSeparator: false, // Separates arguments from each other (',')
            block: true
        };

        for (var i = 0; i < tokens.length; i++) {
            console.log(currentBlock);

            var thisToken = tokens[i];
            var entitiesToPush = [];
            var openNewBlock = false;
            var closeBlock = false;

            if (thisToken.name == Token.Identifier) {
                if ( ! accept.identifier) { throw new ParserException("Got an identifier, was not expecting one", i); }

                flushFunction = false;

                if (currentFunction) { // Arguments for an already created function
                    currentFunction.funcArgs.push(thisToken.data);

                    accept.identifier   = false;
                    accept.logicalOp    = true;
                    accept.funcArgs     = false;
                    accept.argSeparator = true;
                    accept.block        = true;
                } else { // A new function
                    currentFunction = createEntity(Entity.Func);
                    currentFunction.funcName = thisToken.data;

                    accept.identifier   = false;
                    accept.logicalOp    = true;
                    accept.funcArgs     = true;
                    accept.argSeparator = false;
                    accept.block        = false;
                }
            } else if (thisToken.name == Token.Colon) {
                if ( ! accept.funcArgs) { throw new ParserException("Got function arguments, was not expecting them", i); }

                flushFunction = false;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = false;
            } else if (thisToken.name == Token.Comma) {
                if ( ! accept.funcArgs) { throw new ParserException("Got function arguments, was not expecting them", i); }

                flushFunction = false;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = false;
            } else if (thisToken.name == Token.LogicalAnd) {
                if ( ! accept.logicalOp) { throw new ParserException("Got a logical operator (AND), was not expecting one", i); }

                entitiesToPush.push(createEntity(Entity.LogicalAnd));
                flushFunction = true;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = true;
            } else if (thisToken.name == Token.LogicalOr) {
                if ( ! accept.logicalOp) { throw new ParserException("Got a logical operator (OR), was not expecting one", i); }

                entitiesToPush.push(createEntity(Entity.LogicalOr));
                flushFunction = true;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = true;
            } else if (thisToken.name == Token.LogicalNot) {
                if ( ! accept.logicalOp) { throw new ParserException("Got a logical operator (NOT), was not expecting one", i); }

                entitiesToPush.push(createEntity(Entity.LogicalNot));
                flushFunction = true;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = true;
            } else if (thisToken.name == Token.BracketOpen) {
                if ( ! accept.block) { throw new ParserException("Got an opening bracket, was not expecting one", i); }

                openNewBlock = true;
                flushFunction = true;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = true;
            } else if (thisToken.name == Token.BracketClose) {
                closeBlock = true;
                flushFunction = true;

                accept.identifier   = true;
                accept.logicalOp    = false;
                accept.funcArgs     = false;
                accept.argSeparator = false;
                accept.block        = true;
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
})(window.Pupil = window.Pupil || {});;(function(Pupil, undefined) {
	var ValidatorFunctions = Pupil.validatorFunctions;

	Pupil.addFunction = function(name, callable) {
		ValidatorFunctions[name.toLowerCase()] = callable;
	};
})(window.Pupil = window.Pupil || {});;(function(Pupil, undefined) {
	Pupil.tokens = {};

	var addToken = function(name) {
		Pupil.tokens[name] = {
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
})(window.Pupil = window.Pupil || {});;(function(Pupil, undefined) {
    var Validator;
    Validator = Pupil.validator = {};

    var ValidatorFunctions = Pupil.validatorFunctions;
    var Entity = Pupil.entities;

    Validator.validate = function(entities, values, valueKey) {
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
                    funcArgs = thisEntity.funcArgs;

                if (funcName.substr(0, 5) == 'other') {
                    funcName = substr(5); // Remove the "other" from the start

                    // Get the values array key of the "other" value
                    var otherValueKey = funcArgs.shift();
                    funcArgs.unshift(values[otherValueKey]);
                } else {
                    funcArgs.unshift(values[valueKey]);
                }

                funcArgs.unshift(values);

                tempResult = ValidatorFunctions[funcName].apply(this, funcArgs);
            } else if (thisEntity.type == Entity.Block) {
                tempResult = Validator.validate(thisEntity, values, valueKey);
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
            }
        }

        return validationResult;
    };
})(window.Pupil = window.Pupil || {});;(function(Pupil, undefined) {
	var ValidatorFunctions;
	Pupil.validatorFunctions = ValidatorFunctions = {};

	ValidatorFunctions.min = function(allValues, value, min) {
		return parseInt(value, 10) >= min;
	};

	ValidatorFunctions.max = function(allValues, value, max) {
		return parseInt(value, 10) <= max;
	};
})(window.Pupil = window.Pupil || {});