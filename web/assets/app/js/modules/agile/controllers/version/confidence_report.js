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

            $scope.getRowClass = function(issue) {
                var issueInfo = $scope.getIssueInfo(issue.key);
                return (issueInfo.cl > 6) ? 'good' : (issueInfo.cl > 3) ? 'so-so' : 'bad';
            };

            var issueInfoCache = {};
            $scope.getIssueInfo = function(issueKey) {
                if (!issueInfoCache[issueKey]) {
                    if ($scope.confidenceReport && $scope.confidenceReport.issues) {
                        angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                            if (issueInfo.key == issueKey) {
                                issueInfoCache[issueKey] = issueInfo;
                            }
                        })
                    }
                }
                return issueInfoCache[issueKey];
            };

            var issueCache = {};
            $scope.getIssue = function(issueKey) {
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
            };

            $scope.loadConfidenceReport = function(callback)
            {
                var reportId = getConfidenceReportKey($scope.project, $scope.version);
                Api.get('ConfidenceReport')
                    .get(reportId, 'issues')
                    .then(function(confidenceReport) {
                        $scope.confidenceReport = confidenceReport;
                        if (typeof $scope.confidenceReport.issues == 'undefined') {
                            $scope.confidenceReport.issues = [];
                        }
                        callback && callback();
                    }, function() {
                        createConfidenceReport(reportId, callback);
                    });
            };

            $scope.saveConfidenceReport = function(callback)
            {
                Api.get('ConfidenceReport')
                    .put($scope.confidenceReport._id, $scope.confidenceReport)
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
                            $scope.actualizeIssuesState();
                            $scope.saveConfidenceReport();
                            $scope.showUpdateLoader = false;
                            setAlert('success', 'Issues state has been updated.');
                        });
                    });
                }
            };

            $scope.actualizeIssuesState = function() {
                resetIssueAggrStateCache();
                angular.forEach($scope.confidenceReport.issues, function(issueInfo) {
                    var issueState = $scope.getAggrState(issueInfo.key);
                    for (var property in issueState) {
                        if (issueState.hasOwnProperty(property)) {
                            issueInfo[property] = issueState[property];
                        }
                    }
                });
            };

            var issueAggrStateCache = {};
            $scope.getAggrState = function(issueKey) {
                var issue = $scope.getIssue(issueKey);
                if (!issueAggrStateCache[issue.key]) {
                    issueAggrStateCache[issue.key] = JiraHelper.getIssueState(issue);
                }

                return issueAggrStateCache[issue.key];
            };

            $scope.getStoryAssignees = function(issueKey) {
                var issue = $scope.getIssue(issueKey);

                return JiraHelper.getStoryAssignees(issue);
            };

            function resetIssueAggrStateCache() {
                issueAggrStateCache = {};
            }

            // Protected functions

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