angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_IssueInfo', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            // Todo: Use standard angular cache instead of local variables.

            $scope.template = TEMPLATES_URL + '/version/confidence_report/issue_info.html';

            $scope.getRowClass = function(issueInfo) {
                return (issueInfo.cl > 6) ? 'good' : (issueInfo.cl > 3) ? 'so-so' : 'bad';
            };

            $scope.getStoryAssignees = function(issueInfo) {
                return JiraHelper.getStoryAssignees(issueInfo.issue);
            };
        }]);