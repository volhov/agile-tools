angular.module('agile.directives')
    .directive('timeStats', ['$sce', 'TEMPLATES_URL', function($sce, TEMPLATES_URL) {


        return {
            scope: {
                info: "=",
                title: "=",
                issueType: "=",
                displayType: "="
            },
            controller: ['$scope', function ($scope)
            {
                $scope.getSectionStyles = getSectionStyles;
                $scope.getDeltaType = function(issueType) {
                    return $scope.info.overspent[issueType] > 0 ? 'over' : 'under';
                };

                function getSectionStyles(section, issueType)
                {
                    var width = getSectionWidth(section, issueType);
                    var styles = {
                        width: width + '%'
                    };
                    if (section == 'overspent') {
                        var estimatedWidth = getSectionWidth('estimated', issueType);
                        styles.left = ($scope.info.overspent[issueType] > 0 ? estimatedWidth : estimatedWidth - width) + '%'
                    }

                    return styles;
                }

                function getSectionWidth(section, issueType) {
                    if (!$scope.info[section]) {
                        return 0;
                    }
                    var max = $scope.displayType == 'relative' ? getMaxTime('total') : getMaxTime(issueType);
                    return max ? Math.abs($scope.info[section][issueType] / (max / 100)) : 0;
                }

                function getMaxTime(issueType)
                {
                    if (typeof $scope.info.spent == 'undefined') {
                        return 0;
                    }
                    return Math.max(
                        $scope.info.spent[issueType] + $scope.info.remaining[issueType],
                        $scope.info.estimated[issueType]
                            + ($scope.info.overspent[issueType] > 0 ? $scope.info.overspent[issueType] : 0)
                    );
                }

            }],
            templateUrl: TEMPLATES_URL + '/project/version/confidence_report/stats/time_stats.directive.html'
        };
    }]);