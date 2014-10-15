angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_Import', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper',
        function($scope, TEMPLATES_URL, Api, Helper) {
            $scope.template = TEMPLATES_URL + '/version/confidence_report/import.html';

            $scope.showImport = false;
            $scope.showImportLoader = false;

            $scope.fetchIssuesForImport = function(issueType, maxResults, additionalFilters) {
                $scope.showImport = true;
                $scope.showImportLoader = false;
                $scope.$parent.hideIssues = true;
                resetImport();
                var query = {
                    max_result: maxResults || 50,
                    fields: 'summary,issuetype,assignee',
                    jql: 'project = "' + $scope.project.key + '"'
                        + ' AND fixVersion = "' + $scope.version.name + '"'
                };
                if (issueType) {
                    query.jql += ' AND issuetype = "' + issueType + '"';
                    if (issueType == 'Bug Report') {
                        query.jql += ' AND status in (Open, "In Progress", Reopened, "Feedback required", "Feedback available")';
                    }
                }
                if (additionalFilters) {
                    query.jql += ' AND ' + additionalFilters;
                }
                var jiraIssuesApi = Api.get('JiraIssues');
                jiraIssuesApi.disableCache();
                jiraIssuesApi.get(query).then(function(issues) {
//                    angular.forEach(issues, function(issue) {
//                        issue.import = true;
//                    });
                    $scope.jiraIssues = issues;
                });
                jiraIssuesApi.enableCache();
            };
            $scope.hideImport = function()
            {
                $scope.showImport = false;
                $scope.showImportLoader = false;
                $scope.$parent.hideIssues = false;
                resetImport();
            };

            $scope.importIssues = function() {
                if ($scope.jiraIssues) {
                    $scope.showImport = false;
                    $scope.showImportLoader = true;
                    var importKeys = [];
                    angular.forEach($scope.jiraIssues, function(issue) {
                        if (issue.import) {
                            importKeys.push(issue.key);
                            if (!crHasIssue(issue.key)) {
                                $scope.$parent.confidenceReport.issues.push({
                                    key: issue.key
                                });
                            }
                        }
                    });
                    if (importKeys.length) {
                        $scope.$parent.saveConfidenceReport(function() {
                            Api.get('IssuesImport').post({
                                keys: importKeys
                            }).then(function(response) {
                                setAlert('success', response.message);
                                $scope.$parent.loadConfidenceReport(function() {
                                    $scope.actualizeIssuesState();
                                    $scope.actualizeIssuesAssignees();
                                    $scope.saveConfidenceReport();
                                    $scope.hideImport();
                                    setAlert('success', 'Issues state has been updated.');
                                });
                            });
                            // Todo: find out if this is really needed. I don't think so.
                            $scope.$parent.saveConfidenceReport();
                        });
                    } else {
                        $scope.hideImport();
                    }
                }
            };

            $scope.checkAll = function() {
                angular.forEach($scope.jiraIssues, function(issue) {
                    issue.import = true;
                });
            };

            $scope.uncheckAll = function() {
                angular.forEach($scope.jiraIssues, function(issue) {
                    issue.import = false;
                });
            };

            $scope.importButtonIsActive = function()
            {
                var isActive = false;
                angular.forEach($scope.jiraIssues, function(issue) {
                    if (issue.import) {
                        isActive = true; // I want a break here.
                    }
                });
                return isActive;
            };


            function crHasIssue(issueKey)
            {
                var issueExists = false;
                angular.forEach($scope.$parent.confidenceReport.issues, function(crIssue) {
                    if (crIssue.key == issueKey) {
                        issueExists = true;
                        // I want a break here.
                    }
                });

                return issueExists;
            }

            function resetImport()
            {
                $scope.jiraIssues = [];
            }

            function setAlert(type, message) {
                Helper.setAlert($scope.$parent.$parent.$parent, type, message);
            }
        }]);