angular.module('agile.controllers')
    .controller('Start', ['$scope', '$location', 'Api', function($scope, $location, Api) {
        Api.get('JiraProjects').get({}).then(function(projects) {
            $scope.projects = projects;
        });

        $scope.startProject = function(project) {
            Api.get('ProjectsImport').post({
                key: project.key
            }).then(function(response) {
                $scope.alert = {
                    type: 'success',
                    message: response.message
                };

                Api.get('Project').get(project.key).then(function(project) {
                    $scope.project = project;
                });
            });
        };

        $scope.startProjectVersion = function(version) {
            $location.path('/version/' + $scope.project.key + '/' + version.name + '/confidence_report');
        };
    }]);