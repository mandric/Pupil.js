(function(Pupil, undefined) {
	var ValidatorFunctions;
	Pupil.validatorFunctions = ValidatorFunctions = {};

	ValidatorFunctions.equals = function(allValues, value, equalsTo) {
		return value == equalsTo;
	};

	ValidatorFunctions.iequals = function(allValues, value, equalsTo) {
		return value.toLowerCase() == equalsTo.toLowerCase();
	};

	ValidatorFunctions.sequals = function(allValues, value, equalsTo) {
		return value === equalsTo;
	};

	ValidatorFunctions.siequals = function(allValues, value, equalsTo) {
		return value.toLowerCase() === equalsTo.toLowerCase();
	};

	ValidatorFunctions.lenmin = function(allValues, value, min) {
		return value.length >= min;
	};

	ValidatorFunctions.lenmax = function(allValues, value, max) {
		return value.length <= max;
	};

	ValidatorFunctions.min = function(allValues, value, min) {
		return parseInt(value, 10) >= min;
	};

	ValidatorFunctions.max = function(allValues, value, max) {
		return parseInt(value, 10) <= max;
	};
})(window.Pupil = window.Pupil || {});