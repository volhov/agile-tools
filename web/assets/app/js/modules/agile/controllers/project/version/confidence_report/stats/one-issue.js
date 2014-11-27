angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_Stats_OneIssue', ['$scope', 'TEMPLATES_URL', 'JiraHelper',
        function($scope, TEMPLATES_URL, JiraHelper) {

            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/stats/one-issue.html';

            $scope.info = {};

            $scope.init = function(issueInfo) {
                $scope.info = JiraHelper.getDetailedIssueTimeInfo(issueInfo.issue);
            };
        }]);