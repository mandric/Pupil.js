(function(Pupil, undefined) {
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
                    funcArgs = [];

                // Clone the function arguments so below we don't affect
                // the original arguments in the entity.
                for (var a = 0; a < thisEntity.funcArgs.length; a++) {
                    funcArgs.push(thisEntity.funcArgs[a]);
                }

                if (funcName.substr(0, 5) == 'other') {
                    funcName = funcName.substr(5); // Remove the "other" from the start

                    // Get the values array key of the "other" value
                    var otherValueKey = funcArgs.shift();
                    funcArgs.unshift(values[otherValueKey]);
                } else {
                    funcArgs.unshift(values[valueKey]);
                }

                funcArgs.unshift(values);

                tempResult = ValidatorFunctions[funcName].apply(this, funcArgs);
                useTempResult = true;
            } else if (thisEntity.type == Entity.Block) {
                tempResult = Validator.validate(thisEntity.sub, values, valueKey);
                useTempResult = true;
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

                useTempResult = false;
            }
        }

        return validationResult;
    };
})(window.Pupil = window.Pupil || {});