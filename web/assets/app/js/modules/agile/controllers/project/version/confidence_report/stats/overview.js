angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_Stats_Overview', ['$scope', 'TEMPLATES_URL', 'JiraHelper',
        function($scope, TEMPLATES_URL, JiraHelper) {
            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/stats/overview.html';

            $scope.info = {};
            $scope.detailsDisplayType = 'relative';

            $scope.$watch('confidenceReport', function() {
                if ($scope.confidenceReport) {
                    $scope.info = getTotalEstimated();
                }
            });

            function getTotalEstimated()
            {
                var totalTimeInfo = {};
                if ($scope.confidenceReport) {
                    angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                        var timeInfo = JiraHelper.getDetailedIssueTimeInfo(issueInfo.issue);
                        totalTimeInfo = appendTimeInfo(timeInfo, totalTimeInfo);
                    });
                }
                return totalTimeInfo;
            }

            function appendTimeInfo(timeInfo, totalTimeInfo)
            {
                for (var section in timeInfo) {
                    if (timeInfo.hasOwnProperty(section)) {
                        if (!totalTimeInfo[section]) {
                            totalTimeInfo[section] = {};
                        }
                        for (var issueType in timeInfo[section]) {
                            if (timeInfo[section].hasOwnProperty(issueType)) {
                                if (!totalTimeInfo[section][issueType]) {
                                    totalTimeInfo[section][issueType] = 0;
                                }
                                totalTimeInfo[section][issueType] += timeInfo[section][issueType];
                            }
                        }
                    }
                }
                return totalTimeInfo;
            }
        }]);