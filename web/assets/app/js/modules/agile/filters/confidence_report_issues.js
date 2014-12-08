angular.module('agile.filters')
    .filter('confidenceReportIssues', ['$filter', function($filter) {

        function matching(text, expression) {
            var expressions = expression.split(',');
            var subject = String(text).toLowerCase();
            for (var j = 0; j < expressions.length; j++) {
                if (!expressions[j].length) {
                    continue;
                }
                if (subject.indexOf(expressions[j].trim()) >= 0) {
                    return true;
                }
            }
            return false;
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
                                    break;
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
        }, {
            key: 'tp:',
            handler: function(input, expression) {
                var results = [];
                for (var i = 0; i < input.length; i++) {
                    if (matching(input[i].issue.issuetype.name, expression)) {
                        results.push(input[i]);
                    }
                }
                return results;
            }
        }, {
            key: 'c:',
            handler: function(input, expression) {
                var results = [];
                for (var i = 0; i < input.length; i++) {
                    if (input[i].issue.components) {
                        for (var k = 0; k < input[i].issue.components.length; k++) {
                            if (matching(input[i].issue.components[k].name, expression)) {
                                results.push(input[i]);
                                break;
                            }
                        }
                    }
                }
                return results;
            }
        }, {
            key: 'cl:',
            handler: function(input, expression) {
                var results = [];
                expression = expression.trim();
                var operation, cl, clMin, clMax, execResult;
                if (/^[0-9]+$/.test(expression)) {
                    cl = parseInt(expression);
                    operation = '=';
                } else if (execResult = /^([<>])\s*([0-9]+)?$/.exec(expression)) {
                    cl = execResult[2];
                    operation = execResult[1];
                } else if (execResult = /^([0-9]+)\s*\-\s*([0-9]+)$/.exec(expression)) {
                    clMin = parseInt(execResult[1]);
                    clMax = parseInt(execResult[2]);
                    operation = '><';
                }
                if (!cl && !clMin && !clMax) {
                    if (operation) {
                        // The operation is defined we just still don't know the value to match with.
                        return input;
                    } else {
                        // The cl "query" is broken. We show empty result set to let user know that something is wrong.
                        return results;
                    }
                }
                for (var i = 0; i < input.length; i++) {
                    var matches = false;
                    switch (operation) {
                        case '=':
                            matches = (input[i].cl == cl);
                            break;
                        case '<':
                            matches = (input[i].cl < cl);
                            break;
                        case '>':
                            matches = (input[i].cl > cl);
                            break;
                        case '><':
                            matches = (input[i].cl >= clMin && input[i].cl <= clMax);
                            break;
                    }
                    if (matches) {
                        results.push(input[i]);
                    }
                }
                return results;
            }
        }];

        function runFilter(input, expression)
        {
            if (!expression || !expression.length || expression.length < 3) {
                return input;
            }

            for (var i = 0; i < filters.length; i++) {
                if (expression.indexOf(filters[i].key) === 0) {
                    var realExpression = expression.substr(filters[i].key.length);
                    if (realExpression.trim().length < 2) {
                        return input;
                    }
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
        }

        return function(input, expression) {
            if (!expression || !expression.length || expression.length < 3) {
                return input;
            }
            if (expression.indexOf('&') >= 0) {
                var expressions = expression.split('&');
                var filteredInput = input;
                for (var exprIndex = 0; exprIndex < expressions.length; exprIndex++) {
                    filteredInput = runFilter(filteredInput, expressions[exprIndex].trim());
                }
                return filteredInput;
            } else {
                return runFilter(input, expression);
            }
        }
    }]);