angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_IssueInfo', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            // Todo: Use standard angular cache instead of local variables.

            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/edit/issue_info.html';

        }]);