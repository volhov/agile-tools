angular.module('helper')
    .constant('StatusMap', {
        'Open': 0,
        'Reopened': 0,
        'Resolved': 1,
        'Closed': 1,
        'In Progress': 2,
        'Feedback required': 0, // todo: support 3
        'Feedback available': 0, // todo: support 3
        'On hold': 0 // todo: support 3
    })
    .factory('JiraHelper_Status', ['StatusMap', function(StatusMap) {
        return {
            get: function (issue) {
                return StatusMap[issue.status.name] || 0;
            }
        };
    }]);