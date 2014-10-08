angular.module('agile.controllers')
    .controller('Version_ConfidenceReport', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            // Todo: Use standard angular cache instead of local variables.
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

                        resetIssueCache();
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
                    // Todo: Implement and run import statuses instead of full import.
                    $scope.showUpdateLoader = true;
                    Api.get('IssuesImport').post({
                        keys: importKeys
                    }).then(function(response) {
                        setAlert('success', response.message);
                        $scope.loadConfidenceReport(function() {

                            actualizeIssuesState();

                            $scope.saveConfidenceReport();
                            $scope.showUpdateLoader = false;
                            setAlert('success', 'Issues state has been updated.');

                        }, true);
                    });
                }
            };

            // Temporary.
            $scope.actualizeIssuesState = actualizeIssuesState;

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

            var issueAggrStateCache = {};
            function getAggrState(issueInfo) {
                if (!issueAggrStateCache[issueInfo.key]) {
                    issueAggrStateCache[issueInfo.key] = JiraHelper.getIssueState(issueInfo.issue);
                }
                return issueAggrStateCache[issueInfo.key];
            }
            function resetIssueAggrStateCache() {
                issueAggrStateCache = {};
            }

            var issueCache = {};
            function getIssue(issueKey) {
                if (!issueCache[issueKey]) {
                    if ($scope.confidenceReport && $scope.confidenceReport.expansion) {
                        angular.forEach($scope.confidenceReport.expansion.issues, function(issue) {
                            if (issue.key == issueKey) {
                                issueCache[issueKey] = issue;
                            }
                        })
                    }
                }
                return issueCache[issueKey] || {};
            }
            function resetIssueCache() {
                issueCache = {};
            }

            function actualizeIssuesState()
            {
                resetIssueAggrStateCache();
                angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                    var issueState = getAggrState(issueInfo);
                    for (var property in issueState) {
                        if (issueState.hasOwnProperty(property)) {
                            issueInfo[property] = issueState[property];
                        }
                    }
                });
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