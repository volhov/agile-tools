angular.module('agile.controllers')
    .controller('Project', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            loadConfig($routeParams.projectKey).then(function() {
                loadProject($routeParams.projectKey).then(function() {
                    Helper.setTitle($scope.project.name);
                })
            });

            $scope.loadProject = loadProject;
            $scope.userTypes = Helper.getUserTypes();

            $scope.saveProject = function()
            {
                return Api.get('Project')
                    .put($scope.project._id, $scope.project)
                    .then(function(response) {
                        Helper.setAlert('success', response.message);
                    });
            };

            function loadProject(projectKey)
            {
                return Api.get('Project').get(projectKey)
                    .then(function(project) {
                        $scope.project = project;
                    });
            }

            function loadConfig(projectKey) {
                return Api.get('Config')
                    .get(projectKey)
                    .then(function (config) {
                        $scope.config = config;
                    });
            }
        }]);