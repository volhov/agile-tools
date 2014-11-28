angular.module('agile.controllers')
    .controller('Projects', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            Helper.setTitle('Projects');
            $scope.searchProject = '';

            loadProjects();

            function loadProjects()
            {
                return Api.get('Projects').get()
                    .then(function(projects) {
                        $scope.projects = projects;
                    });
            }
        }]);