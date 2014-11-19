angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_IssueInfo', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($scope, TEMPLATES_URL, Api, Helper, JiraHelper) {
            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/edit/issue_info.html';
        }]);