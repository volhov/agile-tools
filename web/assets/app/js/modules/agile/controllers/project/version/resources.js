angular.module('agile.controllers')
    .controller('Version_Resources', ['$rootScope', '$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($rootScope, $scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            $scope.template = TEMPLATES_URL + '/version/resources.html';

            $scope.$watch('project', function () {
                if ($scope.project) {
                    loadResourcesPlan();
                }
            });

            $scope.loadResourcesPlan = loadResourcesPlan;

            function loadResourcesPlan(ignoreCache)
            {
                var planId = getResourcesPlanKey($scope.project, $scope.version);
                var resourcesPlanApi = Api.get('ResourcesPlan');

                var enableCacheAfterLoad = false;
                if (ignoreCache) {
                    resourcesPlanApi.disableCache();
                    enableCacheAfterLoad = true;
                }

                var promise = resourcesPlanApi.get(planId, 'issues')
                    .then(function(resourcesPlan) {
                        $scope.resourcesPlan = resourcesPlan;
                    }, function() {
                        createResourcesPlan(planId);
                    });

                if (enableCacheAfterLoad) {
                    resourcesPlanApi.enableCache();
                }

                return promise;
            }

            function createResourcesPlan(planId)
            {
                $scope.resourcesPlan = {
                    '_id': planId,
                    'project': $scope.project._id,
                    'version': $scope.version.jira_id,
                    'users': $scope.project.users
                };
                return Api.get('ResourcesPlans')
                    .post($scope.resourcesPlan)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function getResourcesPlanKey(project, version) {
                return project.key + '-' + version.jira_id;
            }
        }]);