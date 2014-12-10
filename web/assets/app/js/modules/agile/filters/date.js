angular.module('agile.filters')
    .filter('dateFormat', [function() {
        return function(date, format) {
            date = (date === 'now' ? undefined : date);
            return moment(date).format(format);
        }
    }])
    .filter('dateDiff', [function() {
        return function(date1, date2) {
            date1 = (date1 === 'now' ? undefined : date1);
            date2 = (date2 === 'now' ? undefined : date2);
            return moment(date1).diff(date2);
        }
    }]);