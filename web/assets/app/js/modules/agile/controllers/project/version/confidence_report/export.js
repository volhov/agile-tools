angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_Export', ['$scope', '$location', 'Api', 'Helper',
        function($scope, $location, Api, Helper) {

            $scope.clDates = [];

            $scope.hideExportPage = function() {
                $location.path('/project/' + $scope.project.key
                    + '/' + $scope.version.name + '/confidence_report');
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
                    sortClDates();
                }
            });

            function sortClDates()
            {
                $scope.clDates.sort(function(a, b) {
                    var aDate = moment(a);
                    var bDate = moment(b);
                    if (aDate < bDate) {
                        return 1;
                    } else if (aDate > bDate) {
                        return -1;
                    }
                    return 0
                });
            }
        }]);