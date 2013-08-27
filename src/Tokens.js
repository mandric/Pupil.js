(function(Pupil, undefined) {
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
})(window.Pupil = window.Pupil || {});