angular.module('agile.controllers')
    .controller('Start', ['$scope', '$location', 'Api', 'Helper', function($scope, $location, Api, Helper) {

        Helper.setTitle('Start');

        Api.get('JiraProjects').get({}).then(function(projects) {
            $scope.projects = projects;
        });

        $scope.startProject = function(project) {
            Api.get('ProjectsImport').post({
                key: project.key
            }).then(function(response) {
                Helper.setAlert('success', response.message);

                Api.get('Project').get(project.key).then(function(project) {
                    $scope.project = project;
                });
            });
        };
    }]);