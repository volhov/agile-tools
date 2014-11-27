angular.module('agile.filters')
    .filter('yaml', [function() {
        return function(input, mode) {
            return mode == 'load' ? jsyaml.safeLoad(input) : jsyaml.safeDump(input);
        }
    }]);