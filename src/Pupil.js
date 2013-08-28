(function(undefined) {
	var Tokens             = null;
	var Entities           = null;
	var ValidatorFunctions = null;

	var Lexer              = null;
	var Parser             = null;
	var Validator          = null;

	var hasInitialized     = false;

	var ruleCache = {};

	var Pupil = {};

	var initialize = function() {
		if (typeof module !== 'undefined') {
			Tokens             = require('./Tokens.js');
			Entities           = require('./Entities.js');
			ValidatorFunctions = require('./ValidatorFunctions.js');

			Lexer              = require('./Lexer.js').create(Tokens);
			Parser             = require('./Parser.js').create(Tokens, Entities);
			Validator          = require('./Validator.js').create(ValidatorFunctions, Entities);
		} else {
			Tokens             = window.Pupil.Tokens;
			Entities           = window.Pupil.Entities;
			ValidatorFunctions = window.Pupil.ValidatorFunctions;

			Lexer              = new window.Pupil.Lexer(Tokens);
			Parser             = new window.Pupil.Parser(Tokens, Entities);
			Validator          = new window.Pupil.Validator(ValidatorFunctions, Entities);
		}

		hasInitialized = true;
	};

	Pupil.addFunction = function(name, callable) {
		if ( ! hasInitialized) {
			initialize();
		}

		ValidatorFunctions[name.toLowerCase()] = callable;
	};

	Pupil.validate = function(rules, values) {
		if ( ! hasInitialized) {
			initialize();
		}
		
		var results = {};

		for (var index in values) {
			var rule = rules[index],
			    tokens, entities;

			if ( ! rule) {
				continue;
			}

			if (ruleCache[rule]) {
				entities = ruleCache[rule];
			} else {
				tokens = Lexer.tokenize(rule);
				entities = Parser.parse(tokens);

				ruleCache[rule] = entities;
			}

			results[index] = Validator.validate(entities.sub, values, index);
		}

		return results;
	};

    // Export the module
    if (typeof module.exports !== 'undefined') {
        module.exports = Pupil;
    } else {
        window.Pupil = window.Pupil || {};
        window.Pupil.addFunction = Pupil.addFunction;
        window.Pupil.validate = Pupil.validate;
    }
})();