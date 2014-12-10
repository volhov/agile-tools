angular.module('agile.controllers')
    .controller('Version_ConfidenceReport_Import', ['$scope', 'TEMPLATES_URL', 'Api', 'Helper',
        function($scope, TEMPLATES_URL, Api, Helper) {
            $scope.template = TEMPLATES_URL + '/project/version/confidence_report/import.html';

            $scope.showImport = false;
            $scope.showImportLoader = false;
            $scope.showFetchLoader = false;

            $scope.fetchIssuesForImport = function(issueType, maxResults, additionalFilters) {
                $scope.$parent.hideIssues = true;
                $scope.showImport = false;
                $scope.showImportLoader = false;
                $scope.showFetchLoader = true;
                resetImport();
                var query = {
                    "max_result": maxResults || 50,
                    "_fields": 'summary,issuetype,assignee,status',
                    "jql": 'project = "' + $scope.project.key + '"'
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
                    $scope.jiraIssues = issues;
                    $scope.importedNumber = 0;
                    angular.forEach($scope.jiraIssues, function(issue) {
                        if (crHasIssue(issue.key)) {
                            issue.imported = true;
                            $scope.importedNumber++;
                        }
                    });
                    $scope.showFetchLoader = false;
                    $scope.showImport = true;
                });
                jiraIssuesApi.enableCache();
            };
            $scope.hideImport = function()
            {
                $scope.showImport = false;
                $scope.showImportLoader = false;
                $scope.showFetchLoader = false;
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
                                    key: issue.key,
                                    export: true,       // Initially add issue to "export" section
                                    status: 'Importing' // This status is temporary. It will be overwritten soon
                                                        //  when issue will be imported and reloaded.
                                });
                            }
                        }
                    });
                    if (importKeys.length) {
                        $scope.$parent.saveConfidenceReport().then(function() {
                            Api.get('IssuesImport').post({
                                keys: importKeys
                            }).then(function(response) {
                                Helper.setAlert('success', response.message);
                                $scope.$parent.loadConfidenceReport().then(function() {

                                    $scope.$emit('confidenceReportIssuesUpdated');

                                    $scope.saveConfidenceReport();

                                    $scope.$emit('confidenceReportChanged');

                                    $scope.hideImport();
                                    Helper.setAlert('success', 'Issues state has been updated.');
                                });
                            });
                        });
                    } else {
                        $scope.hideImport();
                    }
                }
            };

            $scope.checkAll = function() {
                angular.forEach($scope.jiraIssues, function(issue) {
                    if (!crHasIssue(issue.key)) {
                        issue.import = true;
                    }
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

        }]);