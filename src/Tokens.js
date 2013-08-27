(function(Pupil, undefined) {
	Pupil.token = {};

	var addToken = function(name) {
		Pupil.token[name] = {
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