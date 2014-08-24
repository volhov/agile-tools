angular.module('agile.controllers')
    .controller('Projects', ['$scope', 'Api', function($scope, Api) {
        Api.JiraProjects.get({}).then(function(projects) {
            $scope.projects = projects;
        });

        Api.JiraProject.get('BEAM').then(function(project) {
            $scope.project = project;
        });
    }]);