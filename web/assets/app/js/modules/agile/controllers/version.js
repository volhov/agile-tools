angular.module('agile.controllers')
    .controller('Version', ['$scope', '$location', '$routeParams', 'Api',
        function($scope, $location, $routeParams, Api) {

            Api.Project.get($routeParams.projectKey).then(function(project) {
                $scope.project = project;
                $scope.versionName = $routeParams.versionName;
            });



        }]);