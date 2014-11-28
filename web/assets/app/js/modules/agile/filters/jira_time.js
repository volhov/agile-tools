angular.module('agile.filters')
    .filter('jiraTime', [function() {
        return function(seconds, useDays) {
            var sign = seconds < 0 ? '−' : '';
            seconds = Math.abs(seconds) || 0;
            var result = {
                days: 0,
                hours: 0,
                minutes: 0
            };
            result.minutes = seconds / 60;
            if (result.minutes >= 60) {
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
            return sign + (resultStringParts.length ? resultStringParts.join(' ') : 0);
        };
    }])