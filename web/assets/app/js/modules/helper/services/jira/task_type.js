angular.module('helper')
    .constant('TaskTypeMap', {
        'Backend Development': 'dev',
        'Frontend Development': 'dev',
        'Integration Development': 'dev',
        'System Administration': 'dev',
        'Investigate': 'inv',
        'Code Review': 'cr',
        'Documentation': 'doc',
        'Testing by Developer': 'tbd',
        'QA: Test cases': 'tc',
        'QA: Testing': 'qa',
        'QA: Performace': 'perf'
    })
    .factory('JiraHelper_TaskType', ['TaskTypeMap', function(TaskTypeMap) {
        return {
            get: function (task) {
                var customType = task.issuetype.custom || task.summary;
                return TaskTypeMap[customType] || 'dev';
            }
        };
    }]);