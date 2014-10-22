angular.module('agile.controllers')
    .controller('Version_Resources', ['$rootScope', '$scope', 'TEMPLATES_URL', 'Api', 'Helper', 'JiraHelper',
        function($rootScope, $scope, TEMPLATES_URL, Api, Helper, JiraHelper) {

            $scope.template = TEMPLATES_URL + '/version/resources.html';


            $scope.$watch('project', function () {
                if ($scope.project) {
                    loadResourcesPlan();
                    loadConfig();
                }
            });

            $scope.loadResourcesPlan = loadResourcesPlan;

            function loadResourcesPlan(ignoreCache)
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
                    }, function() {
                        //createResourcesPlan(reportId);
                    });

                if (enableCacheAfterLoad) {
                    resourcesPlanApi.enableCache();
                }

                return promise;
            }


            function getResourcesPlanKey(project, version)
            {
                return project.key + '-' + version.jira_id;
            }

            function loadConfig() {
                Api.get('Config')
                    .get($scope.project.key)
                    .then(function (config) {
                        $scope.config = config;
                    });
            }

        }]);