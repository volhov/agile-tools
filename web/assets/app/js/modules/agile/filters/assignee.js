angular.module('agile.filters')
    .filter('assigneeShort', [function() {
        return function(fullName) {
            fullName = fullName || '';
            return fullName.replace(/^([A-Z])[^ ]+\s/, '$1. ');
        };
    }])
    .filter('assigneeInitials', [function() {
        return function(fullName) {
            fullName = fullName || '';
            return fullName.replace(/[^A-Z]/g, '');
        };
    }]);