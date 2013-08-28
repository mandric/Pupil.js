(function(undefined) {
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