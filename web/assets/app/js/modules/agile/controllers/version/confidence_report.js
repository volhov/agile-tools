angular.module('agile.controllers')
    .controller('Version_ConfidenceReport', ['$rootScope', '$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($rootScope, $scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            $scope.template = TEMPLATES_URL + '/version/confidence_report.html';

            $scope.$watch('project', function () {
                if ($scope.project) {
                    $scope.loadConfidenceReport();
                    Api.get('Config')
                        .get($scope.project.key)
                        .then(function(config) {
                            $scope.config = config;
                        });
                }
            });

            $scope.loadConfidenceReport = function(callback, ignoreCache)
            {
                var reportId = getConfidenceReportKey($scope.project, $scope.version);
                var confidenceReportApi = Api.get('ConfidenceReport');

                var enableCacheAfterLoad = false;
                if (ignoreCache) {
                    confidenceReportApi.disableCache();
                    enableCacheAfterLoad = true;
                }

                confidenceReportApi
                    .get(reportId, 'issues')
                    .then(function(confidenceReport) {
                        $scope.confidenceReport = confidenceReport;

                        if (typeof $scope.confidenceReport.issues == 'undefined') {
                            $scope.confidenceReport.issues = [];
                        }

                        injectExpansion($scope.confidenceReport);

                        callback && callback();
                    }, function() {
                        createConfidenceReport(reportId, callback);
                    });

                if (enableCacheAfterLoad) {
                    confidenceReportApi.enableCache();
                }
            };

            $scope.saveConfidenceReport = function(callback)
            {
                var confidenceRecordData = $.extend(true, {}, $scope.confidenceReport);
                extractExpansion(confidenceRecordData);
                Api.get('ConfidenceReport')
                    .put(confidenceRecordData._id, confidenceRecordData)
                    .then(function(response) {
                        setAlert('success', response.message);
                        callback && callback();
                    });
            };

            $scope.updateConfidenceReport = function(reloadAfterSave)
            {
                var importKeys = [];
                for (var i = 0; i < $scope.confidenceReport.issues.length; i++) {
                    importKeys.push($scope.confidenceReport.issues[i].key);
                }
                if (importKeys.length) {
                    Api.get('IssuesImport').post({
                        keys: importKeys
                    }).then(function(response) {
                        setAlert('success', response.message);
                        $scope.loadConfidenceReport(function() {

                            actualizeIssuesState();
                            actualizeIssuesAssignees();

                            $scope.saveConfidenceReport();
                            setAlert('success', 'Issues have been updated.');

                        }, true);
                    });
                }
            };

            $scope.updateIssue = function(issueInfo) {
                markIssueAsUpdating(issueInfo);
                Api.get('IssuesImport').post({
                    keys: [issueInfo.key]
                }).then(function(response) {
                    setAlert('success', response.message);
                    $scope.loadConfidenceReport(function() {

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

                        $scope.saveConfidenceReport();

                        unmarkIssueAsUpdating(issueInfo);

                        setAlert('success', 'Issue has been updated.');

                    }, true);
                });
            };

            $scope.removeIssue = function(issueInfo) {
                if (confirm("Are you sure?")) {
                    var issueIndex = $scope.confidenceReport.issues.indexOf(issueInfo);

                    if (issueIndex > -1) {
                        $scope.confidenceReport.issues.splice(issueIndex, 1);
                        $scope.saveConfidenceReport();
                        setAlert('success', 'Issue has been removed.');
                    }
                }
            };

            $scope.getRowClass = function(issueInfo) {
                var classes = [];

                classes.push((issueInfo.cl > 6) ? 'good' : (issueInfo.cl > 3) ? 'so-so' : 'bad');

                if (issueIsUpdating(issueInfo)) {
                    classes.push('updating');
                }

                return classes;
            };

            $rootScope.$on('draggable:start', function(event, args) {
                var container = args.element.parents('.cl-report-row');
                args.element.css({
                    width: container.width(),
                    left: container.offset().left
                });
            });
            $rootScope.$on('draggable:move', function(event, args) {
                var container = args.element.parents('.cl-report-row');
                args.element.css({
                    left: container.offset().left
                });
            });
            $rootScope.$on('draggable:end', function(event, args) {
                args.element.css({width: '100%'});
            });
            $scope.onDropComplete = function(index, issueInfo) {
                var oldIndex = $scope.confidenceReport.issues.indexOf(issueInfo);
                if (index == oldIndex) {
                    return;
                }
                var removed = $scope.confidenceReport.issues.splice(oldIndex, 1);
                if (index == 'last') {
                    $scope.confidenceReport.issues.push(removed[0]);
                } else {
                    $scope.confidenceReport.issues.splice(oldIndex < index ? index - 1 : index, 0, removed[0]);
                }
                $scope.saveConfidenceReport();
            };

            $scope.issueIsUpdating = issueIsUpdating;

            // Temporary.
            $scope.actualizeIssuesState = actualizeIssuesState;
            $scope.actualizeIssuesState = actualizeIssuesState;
            $scope.actualizeIssuesAssignees = actualizeIssuesAssignees;

            // Protected functions

            function injectExpansion(confidenceReport) {
                angular.forEach(confidenceReport.issues, function (issueInfo) {
                    issueInfo.issue = getIssue(issueInfo.key);
                });
            }

            function extractExpansion(confidenceReport) {
                angular.forEach(confidenceReport.issues, function (issueInfo) {
                    delete issueInfo.issue;
                });
            }

            function getIssue(issueKey) {
                if ($scope.confidenceReport && $scope.confidenceReport.expansion) {
                    for (var i = 0; i < $scope.confidenceReport.expansion.issues.length; i++) {
                        if ($scope.confidenceReport.expansion.issues[i].key == issueKey) {
                            return $scope.confidenceReport.expansion.issues[i];
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

            function actualizeIssuesState()
            {
                angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                    actualizeIssueState(issueInfo);
                });
            }

            function actualizeIssueAssignees(issueInfo) {
                issueInfo.assignees = JiraHelper.getStoryAssignees(issueInfo.issue);
            }

            function actualizeIssuesAssignees()
            {
                angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                    actualizeIssueAssignees(issueInfo);
                });
            }

            updatingIssues = [];
            function markIssueAsUpdating(issueInfo) {
                updatingIssues.push(issueInfo.key);
            }
            function unmarkIssueAsUpdating(issueInfo) {
                var updatingIssueIndex = updatingIssues.indexOf(issueInfo.key);
                if (updatingIssueIndex >= 0) {
                    updatingIssues.splice(updatingIssueIndex, 1);
                }
            }
            function issueIsUpdating(issueInfo) {
                return updatingIssues.indexOf(issueInfo.key) >= 0
            }

            function getConfidenceReportKey(project, version)
            {
                return project.key + '-' + version.jira_id;
            }

            function createConfidenceReport(reportId, callback)
            {
                $scope.confidenceReport = {
                    '_id': reportId,
                    'project': $scope.project._id,
                    'version': $scope.version.jira_id,
                    'issues': []
                };
                Api.get('ConfidenceReports')
                    .post($scope.confidenceReport)
                    .then(function(response) {
                        callback && callback();
                        setAlert('success', response.message);
                    });
            }

            function setAlert(type, message) {
                Helper.setAlert($scope.$parent, type, message);
            }
        }]);