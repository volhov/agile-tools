angular.module('agile.controllers')
    .controller('Project', ['$scope', '$location', '$routeParams', 'Api', 'Helper', 'Config',
        function($scope, $location, $routeParams, Api, Helper, Config) {

            Config.load($routeParams.projectKey).then(function() {
                loadProject().then(function() {
                    Helper.setTitle($scope.project.name);
                })
            });

            $scope.config = Config;
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

            function loadProject()
            {
                return Api.get('Project').get($routeParams.projectKey)
                    .then(function(project) {
                        $scope.project = project;
                    });
            }
        }]);