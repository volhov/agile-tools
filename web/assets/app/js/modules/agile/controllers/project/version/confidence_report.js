angular.module('agile.controllers')
    .controller('Version_ConfidenceReport', ['$rootScope', '$scope', '$location', 'Api', 'Helper', 'JiraHelper', 'Config',
        function($rootScope, $scope, $location, Api, Helper, JiraHelper, Config) {

            $scope.searchIssue = '';

            $scope.loadConfidenceReport = loadConfidenceReport;
            $scope.saveConfidenceReport = saveConfidenceReport;
            $scope.updateConfidenceReport = updateConfidenceReport;
            $scope.updateIssue = updateIssue;
            $scope.removeIssue = removeIssue;

            $scope.sortableOptions = getSortingOptions();

            $scope.exportConfidenceReport = function() {
                $location.path($location.path() + '/export');
            };

            $scope.$watch('version', function () {
                if ($scope.project && $scope.version) {
                    $scope.loadConfidenceReport().then(function() {
                        initFilterRowFixing();
                    });
                }
            });

            $scope.$on('confidenceReportChanged', function() {
                fillSortedIssues();
            });

            $scope.$on('confidenceReportIssuesUpdated', function() {
                angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                    actualizeIssueState(issueInfo);
                    actualizeIssueAssignees(issueInfo);
                });
            });

            // Protected functions

            function loadConfidenceReport(ignoreCache)
            {
                var reportId = getConfidenceReportKey($scope.project, $scope.version);
                var confidenceReportApi = Api.get('ConfidenceReport');

                var enableCacheAfterLoad = false;
                if (ignoreCache) {
                    confidenceReportApi.disableCache();
                    enableCacheAfterLoad = true;
                }

                var expandWith = ['issues'];
                if (Config.value('import_reviews')) {
                    expandWith.push('reviews');
                }
                var promise = confidenceReportApi.get(reportId, expandWith.join(','))
                    .then(function(confidenceReport) {
                        $scope.confidenceReport = confidenceReport;

                        if (typeof $scope.confidenceReport.issues == 'undefined') {
                            $scope.confidenceReport.issues = [];
                        }
                        injectExpansion($scope.confidenceReport);
                        $scope.$broadcast('confidenceReportChanged');

                    }, function() {
                        createConfidenceReport(reportId);
                        $scope.$broadcast('confidenceReportChanged');
                    });

                if (enableCacheAfterLoad) {
                    confidenceReportApi.enableCache();
                }

                return promise;
            }

            function saveConfidenceReport()
            {
                var confidenceRecordData = $.extend(true, {}, $scope.confidenceReport);
                extractExpansion(confidenceRecordData);
                return Api.get('ConfidenceReport')
                    .put(confidenceRecordData._id, confidenceRecordData)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function updateConfidenceReport()
            {
                var importKeys = [];
                for (var i = 0; i < $scope.confidenceReport.issues.length; i++) {
                    importKeys.push($scope.confidenceReport.issues[i].key);
                }
                if (importKeys.length) {
                    $scope.showUpdateLoader = true;
                    Api.get('IssuesImport').post({
                        keys: importKeys
                    }).then(function(response) {
                        Helper.setAlert('success', response.message);
                        $scope.loadConfidenceReport(true).then(function() {

                            $scope.$broadcast('confidenceReportIssuesUpdated');

                            $scope.saveConfidenceReport();

                            $scope.$broadcast('confidenceReportChanged');

                            $scope.showUpdateLoader = false;
                            Helper.setAlert('success', 'Issues have been updated.');
                        });
                    });
                }
            }


            function updateIssue(issueInfo) {
                Api.get('IssuesImport').post({
                    keys: [issueInfo.key]
                }).then(function(response) {
                    Helper.setAlert('success', response.message);
                    $scope.loadConfidenceReport(true).then(function() {

                        var issueIndex = -1;
                        for (var index = 0; index < $scope.confidenceReport.issues.length; index++) {
                            if ($scope.confidenceReport.issues[index].key == issueInfo.key) {
                                issueIndex = index;
                                break;
                            }
                        }

                        if (issueIndex > -1) {
                            actualizeIssueState($scope.confidenceReport.issues[issueIndex]);
                            actualizeIssueAssignees($scope.confidenceReport.issues[issueIndex]);
                        }

                        $scope.saveConfidenceReport().then(function() {
                            $scope.$broadcast('confidenceReportChanged');
                            Helper.setAlert('success', 'Issue has been updated.');
                        });
                    });
                });
            }

            function removeIssue(issueInfo) {
                if (confirm("Are you sure?")) {
                    var issueIndex = $scope.confidenceReport.issues.indexOf(issueInfo);

                    if (issueIndex > -1) {
                        $scope.confidenceReport.issues.splice(issueIndex, 1);
                        $scope.saveConfidenceReport().then(function() {
                            $scope.$broadcast('confidenceReportChanged');
                            Helper.setAlert('success', 'Issue has been removed.');
                        });
                    }
                }
            }

            function injectExpansion(confidenceReport) {
                angular.forEach(confidenceReport.issues, function (issueInfo) {
                    issueInfo.issue = getIssueFromExpansion(issueInfo.key);
                    if (Config.value('import_reviews')) {
                        issueInfo.reviews = [];
                        angular.forEach(issueInfo.issue.reviews, function (reviewKey) {
                            issueInfo.reviews.push(getReviewFromExpansion(reviewKey));
                        });
                    }
                });
            }

            function extractExpansion(confidenceReport) {
                angular.forEach(confidenceReport.issues, function (issueInfo) {
                    delete issueInfo.issue;
                    if (Config.value('import_reviews')) {
                        delete issueInfo.reviews;
                    }
                });
            }

            function getIssueFromExpansion(issueKey) {
                if ($scope.confidenceReport && $scope.confidenceReport.expansion) {
                    for (var i = 0; i < $scope.confidenceReport.expansion.issues.length; i++) {
                        if ($scope.confidenceReport.expansion.issues[i].key == issueKey) {
                            return $scope.confidenceReport.expansion.issues[i];
                        }
                    }
                }
                return {};
            }

            function getReviewFromExpansion(issueKey) {
                if ($scope.confidenceReport && $scope.confidenceReport.expansion) {
                    for (var i = 0; i < $scope.confidenceReport.expansion.reviews.length; i++) {
                        if ($scope.confidenceReport.expansion.reviews[i].key == issueKey) {
                            return $scope.confidenceReport.expansion.reviews[i];
                        }
                    }
                }
                return {};
            }

            function actualizeIssueState(issueInfo) {
                var issueState = JiraHelper.getIssueState(issueInfo.issue);
                for (var property in issueState) {
                    if (issueState.hasOwnProperty(property)) {
                        issueInfo[property] = issueState[property];
                    }
                }
            }

            function actualizeIssueAssignees(issueInfo) {
                issueInfo.assignees = JiraHelper.getStoryAssignees(issueInfo.issue);
            }

            function getConfidenceReportKey(project, version)
            {
                return project.key + '-' + version.jira_id;
            }

            function createConfidenceReport(reportId)
            {
                $scope.confidenceReport = {
                    '_id': reportId,
                    'project': $scope.project._id,
                    'version': $scope.version.jira_id,
                    'issues': []
                };
                return Api.get('ConfidenceReports')
                    .post($scope.confidenceReport)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            /**
             * Todo: move to directive.
             */
            function initFilterRowFixing()
            {
                var $filter = $('.filter-row');
                if ($filter.length && !$filter.data('row-fixed')) {
                    // Leave a placeholder to prevent changing the window height
                    //  and therefore the scroll event again.
                    $filter.parent('.filter-row-container').height($filter.outerHeight());
                    var initialTopOffset = $filter.offset().top;
                    $(window).scroll(function() {
                        if ($(this).scrollTop() >= initialTopOffset) {
                            $filter.addClass('fixed');
                        } else {
                            $filter.removeClass('fixed');
                        }
                    });
                    $filter.data('row-fixed', true);
                }
            }

            function fillSortedIssues()
            {
                $scope.sortedIssues = {
                    export: [],
                    watch: []
                };
                for (var i = 0; i < $scope.confidenceReport.issues.length; i++) {
                    if ($scope.confidenceReport.issues[i].export) {
                        $scope.sortedIssues.export.push($scope.confidenceReport.issues[i]);
                    } else {
                        $scope.confidenceReport.issues[i].export = false;
                        $scope.sortedIssues.watch.push($scope.confidenceReport.issues[i]);
                    }
                }
            }

            function getSortingOptions()
            {
                return {
                    axis: 'y',
                    delay: 200,
                    connectWith: '.sorting-container',
                    placeholder: 'sorting-placeholder',
                    start: function(e, ui) {
                        ui.item.parents('.sorting-container')
                            .addClass('sorting-active')
                            .find('.sorting-placeholder').height(ui.item.outerHeight());
                        if ($scope.searchIssue.length) {
                            // Cancel sorting if list is filtered.
                            ui.item.sortable.cancel();
                        }
                    },
                    stop: function(e, ui) {
                        ui.item.parents('.sorting-container')
                            .removeClass('sorting-active');
                        applySorting();
                        $scope.saveConfidenceReport().then(function() {
                            $scope.$broadcast('confidenceReportChanged');
                        });
                    }
                };
            }

            function applySorting()
            {
                var i, issues = [];
                for (i = 0; i < $scope.sortedIssues.export.length; i++) {
                    $scope.sortedIssues.export[i].export = true;
                    issues.push($scope.sortedIssues.export[i]);
                }
                for (i = 0; i < $scope.sortedIssues.watch.length; i++) {
                    $scope.sortedIssues.watch[i].export = false;
                    issues.push($scope.sortedIssues.watch[i]);
                }
                $scope.confidenceReport.issues = issues;
            }

        }]);