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
    if (typeof module.exports !== 'undefined') {
        module.exports = entities;
    } else {
        window.Pupil = window.Pupil || {};
        window.Pupil.entities = entities;
    }
})();