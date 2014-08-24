angular.module('agile.controllers')
    .controller('Start', ['$scope', 'Api', function($scope, Api) {
        Api.JiraProjects.get({}).then(function(projects) {
            $scope.projects = projects;
        });

        $scope.startProject = function(project) {
            console.log('Starting project: ' + project.key);
            Api.Projects.post({
                project: project
            });
        };
    }]);