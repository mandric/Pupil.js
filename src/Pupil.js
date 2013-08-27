(function(Pupil, undefined) {
	var ValidatorFunctions = Pupil.validatorFunctions;
	var Lexer = Pupil.lexer;
	var Parser = Pupil.parser;
	var Validator = Pupil.validator;

	var ruleCache = {};

	Pupil.addFunction = function(name, callable) {
		ValidatorFunctions[name.toLowerCase()] = callable;
	};

	Pupil.validate = function(rules, values) {
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
})(window.Pupil = window.Pupil || {});