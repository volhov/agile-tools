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
    .filter('confidenceLevelsFilter', ['$filter', function($filter) {

        function matching(text, expression) {
            return String(text).toLowerCase().indexOf(expression) >= 0;
        }

        var filters = [{
            key: 'a:',
            handler: function(input, expression) {
                var results = [];
                for (var i = 0; i < input.length; i++) {
                    try {
                        var assignees = input[i].assignees;
                        if (assignees.devs) {
                            for (var j = 0; j < assignees.devs.length; j++) {
                                if (matching(assignees.devs[j].name, expression)) {
                                    results.push(input[i]);
                                }
                            }
                        }
                    } catch(e) {}
                }
                return results;
            }
        }, {
            key: 't:',
            handler: function(input, expression) {
                var results = [];
                for (var i = 0; i < input.length; i++) {
                    try {
                        if (matching(input[i].assignees.tbd.name, expression)) {
                            results.push(input[i]);
                        }
                    } catch (e) {}
                }
                return results;
            }
        }, {
            key: 's:',
            handler: function(input, expression) {
                var results = [];
                for (var i = 0; i < input.length; i++) {
                    if (matching(input[i].status, expression)) {
                        results.push(input[i]);
                    }
                }
                return results;
            }
        }];

        return function(input, expression) {

            if (!expression || !expression.length || expression.length < 3) {
                return input;
            }

            for (var i = 0; i < filters.length; i++) {
                if (expression.indexOf(filters[i].key) === 0) {
                    return filters[i].handler(input, expression.substr(filters[i].key.length))
                }
            }

            return (function(input, expression) {
                var results = [];
                for (var i = 0; i < input.length; i++) {
                    if (matching(input[i].key, expression)) {
                        results.push(input[i]);
                    } else if (matching(input[i].note, expression)) {
                        results.push(input[i]);
                    } else if (matching(input[i].status, expression)) {
                        results.push(input[i]);
                    } else if (matching(input[i].progress, expression)) {
                        results.push(input[i]);
                    } else if (matching(input[i].issue.summary, expression)) {
                        results.push(input[i]);
                    }
                }
                return results;
            })(input, expression);

            //return $filter('filter')(input, advancedExpression);
        };
    }])
;