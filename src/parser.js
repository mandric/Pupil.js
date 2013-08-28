(function(undefined) {
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
})();