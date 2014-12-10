angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_IssueInfo', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($scope, TEMPLATES_URL, Api, Helper, JiraHelper) {
            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/edit/issue_info.html';

            $scope.issueIsUpdating = false;

            $scope.updateIssue = function() {
                $scope.issueIsUpdating = true;
                $scope.$parent.updateIssue($scope.issueInfo);
            };

            $scope.removeIssue = function() {
                $scope.$parent.removeIssue($scope.issueInfo);
            };

            $scope.getRowClass = function() {

                return {
                    'good': $scope.issueInfo.cl > 6,
                    'so-so': $scope.issueInfo.cl <= 6 && $scope.issueInfo.cl > 3,
                    'bad': $scope.issueInfo.cl <= 3 || !$scope.issueInfo.cl,
                    'updating': $scope.issueIsUpdating,
                    'wrong-version': !checkIssueVersion()
                };
            };

            function checkIssueVersion()
            {
                if (!$scope.issueInfo.issue) {
                    return true;
                }
                if ($scope.issueInfo.issue.versions) {
                    for (var i = 0; i < $scope.issueInfo.issue.versions.length; i++) {
                        if ($scope.issueInfo.issue.versions[i].id == $scope.version.jira_id) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }]);