angular.module('agile.controllers')
    .controller('Version_Resources', ['$rootScope', '$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($rootScope, $scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            $scope.template = TEMPLATES_URL + '/version/resources.html';
            $scope.$watch('project', function () {
                if ($scope.project) {
                    $scope.loadResourcesPlan();
                    loadConfig();
                }
            });

            $scope.loadResourcesPlan = function(ignoreCache)
            {
                var reportId = getResourcesPlanKey($scope.project, $scope.version);
                var resourcesPlanApi = Api.get('ResourcesPlan');

                var enableCacheAfterLoad = false;
                if (ignoreCache) {
                    resourcesPlanApi.disableCache();
                    enableCacheAfterLoad = true;
                }

                var promise = resourcesPlanApi.get(reportId, 'issues')
                    .then(function(resourcesPlan) {
                        $scope.resourcesPlan = resourcesPlan;

                        if (typeof $scope.resourcesPlan.issues == 'undefined') {
                            $scope.resourcesPlan.issues = [];
                        }
                        injectExpansion($scope.resourcesPlan);

                    }, function() {
                        createResourcesPlan(reportId);
                    });

                if (enableCacheAfterLoad) {
                    resourcesPlanApi.enableCache();
                }

                return promise;
            };

            $scope.saveResourcesPlan = function()
            {
                var confidenceRecordData = $.extend(true, {}, $scope.resourcesPlan);
                extractExpansion(confidenceRecordData);
                return Api.get('ResourcesPlan')
                    .put(confidenceRecordData._id, confidenceRecordData)
                    .then(function(response) {
                        setAlert('success', response.message);
                    });
            };

            $scope.updateResourcesPlan = function(reloadAfterSave)
            {
                var importKeys = [];
                for (var i = 0; i < $scope.resourcesPlan.issues.length; i++) {
                    importKeys.push($scope.resourcesPlan.issues[i].key);
                }
                if (importKeys.length) {
                    $scope.showUpdateLoader = true;
                    Api.get('IssuesImport').post({
                        keys: importKeys
                    }).then(function(response) {
                        setAlert('success', response.message);
                        $scope.loadResourcesPlan(true).then(function() {

                            actualizeIssuesState();
                            actualizeIssuesAssignees();

                            $scope.saveResourcesPlan();
                            $scope.showUpdateLoader = false;
                            setAlert('success', 'Issues have been updated.');

                        });
                    });
                }
            };

            $scope.updateIssue = function(issueInfo) {
                markIssueAsUpdating(issueInfo);
                Api.get('IssuesImport').post({
                    keys: [issueInfo.key]
                }).then(function(response) {
                    setAlert('success', response.message);
                    $scope.loadResourcesPlan(true).then(function() {

                        var issueIndex = -1;
                        for (var index = 0; index < $scope.resourcesPlan.issues.length; index++) {
                            if ($scope.resourcesPlan.issues[index].key == issueInfo.key) {
                                issueIndex = index;
                                break;
                            }
                        }

                        if (issueIndex > -1) {
                            actualizeIssueState($scope.resourcesPlan.issues[issueIndex]);
                            actualizeIssueAssignees($scope.resourcesPlan.issues[issueIndex]);
                        }

                        $scope.saveResourcesPlan();

                        unmarkIssueAsUpdating(issueInfo);
                        setAlert('success', 'Issue has been updated.');
                    });
                });
            };

            $scope.removeIssue = function(issueInfo) {
                if (confirm("Are you sure?")) {
                    var issueIndex = $scope.resourcesPlan.issues.indexOf(issueInfo);

                    if (issueIndex > -1) {
                        $scope.resourcesPlan.issues.splice(issueIndex, 1);
                        $scope.saveResourcesPlan();
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
                container.height(args.element.height());
            });
            $rootScope.$on('draggable:move', function(event, args) {
                var container = args.element.parents('.cl-report-row');
                args.element.css({
                    left: container.offset().left
                });
            });
            $rootScope.$on('draggable:end', function(event, args) {
                var container = args.element.parents('.cl-report-row');
                args.element.css({width: '100%'});
                container.css({height: 'auto'});
            });
            $scope.onDropComplete = function(index, issueInfo) {
                var oldIndex = $scope.resourcesPlan.issues.indexOf(issueInfo);
                if (index == oldIndex) {
                    return;
                }
                var removed = $scope.resourcesPlan.issues.splice(oldIndex, 1);
                if (index == 'last') {
                    $scope.resourcesPlan.issues.push(removed[0]);
                } else {
                    $scope.resourcesPlan.issues.splice(oldIndex < index ? index - 1 : index, 0, removed[0]);
                }
                $scope.saveResourcesPlan();
            };

            $scope.issueIsUpdating = issueIsUpdating;

            // Temporary.
            $scope.actualizeIssuesState = actualizeIssuesState;
            $scope.actualizeIssuesAssignees = actualizeIssuesAssignees;

            // Protected functions

            function injectExpansion(resourcesPlan) {
                angular.forEach(resourcesPlan.issues, function (issueInfo) {
                    issueInfo.issue = getIssue(issueInfo.key);
                });
            }

            function extractExpansion(resourcesPlan) {
                angular.forEach(resourcesPlan.issues, function (issueInfo) {
                    delete issueInfo.issue;
                });
            }

            function getIssue(issueKey) {
                if ($scope.resourcesPlan && $scope.resourcesPlan.expansion) {
                    for (var i = 0; i < $scope.resourcesPlan.expansion.issues.length; i++) {
                        if ($scope.resourcesPlan.expansion.issues[i].key == issueKey) {
                            return $scope.resourcesPlan.expansion.issues[i];
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
                angular.forEach($scope.resourcesPlan.issues, function(issueInfo) {
                    actualizeIssueState(issueInfo);
                });
            }

            function actualizeIssueAssignees(issueInfo) {
                issueInfo.assignees = JiraHelper.getStoryAssignees(issueInfo.issue);
            }

            function actualizeIssuesAssignees()
            {
                angular.forEach($scope.resourcesPlan.issues, function(issueInfo) {
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

            function getResourcesPlanKey(project, version)
            {
                return project.key + '-' + version.jira_id;
            }

            function createResourcesPlan(reportId)
            {
                $scope.resourcesPlan = {
                    '_id': reportId,
                    'project': $scope.project._id,
                    'version': $scope.version.jira_id,
                    'issues': []
                };
                return Api.get('ResourcesPlans')
                    .post($scope.resourcesPlan)
                    .then(function(response) {
                        setAlert('success', response.message);
                    });
            }


            function loadConfig() {
                Api.get('Config')
                    .get($scope.project.key)
                    .then(function (config) {
                        $scope.config = config;
                    });
            }

            function setAlert(type, message) {
                Helper.setAlert($scope.$parent, type, message);
            }
        }]);