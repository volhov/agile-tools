angular.module('helper')
    .factory('JiraHelper', ['JiraHelper_IssueState', 'JiraHelper_Assignees', 'JiraHelper_Time',
        function(IssueState, Assignees, Time) {

            return {
                getIssueState: IssueState.get,
                getStoryAssignees: Assignees.getStoryAssignees,
                getDetailedIssueTimeInfo: Time.getDetailedIssueTimeInfo
            };
        }]);