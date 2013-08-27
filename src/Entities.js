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
})(window.Pupil = window.Pupil || {});