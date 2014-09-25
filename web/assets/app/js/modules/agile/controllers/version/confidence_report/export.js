angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_Export', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper',
        function($scope, TEMPLATES_URL, Api, Helper) {
            $scope.template = TEMPLATES_URL + '/version/confidence_report/export.html';

            $scope.showExport = false;
            $scope.clDates = [];

            $scope.showExportPage = function() {
                $scope.showExport = true;
                $scope.$parent.hideIssues = true;
            };
            $scope.hideExportPage = function() {
                $scope.showExport = false;
                $scope.$parent.hideIssues = false;
            };

            $scope.$watch('confidenceReport', function () {
                if ($scope.confidenceReport && $scope.confidenceReport.issues) {
                    angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                        if (issueInfo.cl_by_day) {
                            angular.forEach(issueInfo.cl_by_day, function(cl, clDate) {
                                if ($scope.clDates.indexOf(clDate) < 0) {
                                    $scope.clDates.push(clDate);
                                }
                            });
                        }
                    });
                }
            });

            function setAlert(type, message) {
                Helper.setAlert($scope.$parent.$parent.$parent, type, message);
            }
        }]);