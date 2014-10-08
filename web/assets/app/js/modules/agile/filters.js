angular.module('agile.filters')
    .filter('storyKey', ['$sce', function($sce) {
        return function(input) {
            input = input || '';
            return $sce.trustAsHtml(input.replace(
                /^([A-Z]+\-([A-Z]+\-)?[0-9]+([a-z])?)([^a-z])/,
                '<em>$1</em>$4'));
        };
    }])
    .filter('jiraTime', [function() {
        return function(seconds, useDays) {
            seconds = seconds || 0;
            var result = {
                days: 0,
                hours: 0,
                minutes: 0
            };
            result.minutes = seconds / 60;
            if (result.minutes > 60) {
//                result.hours = parseInt(result.minutes / 60);
//                result.minutes = result.minutes % 60;
                result.hours = result.minutes / 60;
                result.minutes = 0;
                if (useDays && result.hours > 8) {
                    result.days = parseInt(result.hours / 8);
                    result.hours = result.hours % 8;
                }
            }

            var resultStringParts = [];
            if (result.days) {
                resultStringParts.push(parseFloat(result.days.toFixed(2)) + 'd');
            }
            if (result.hours) {
                resultStringParts.push(parseFloat(result.hours.toFixed(2)) + 'h');
            }
            if (result.minutes) {
                resultStringParts.push(parseFloat(result.minutes.toFixed(2)) + 'm');
            }
            return resultStringParts.length ? resultStringParts.join(' ') : 0;
        };
    }])
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
    }])

;