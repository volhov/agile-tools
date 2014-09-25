angular.module('agile.controllers')
    .controller('Project', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            $scope.moment = moment; // This is to use moment.js easily in templates.

            Api.get('Project').get($routeParams.projectKey)
                .then(function(project) {
                    $scope.project = project;
                });

            $scope.loadProject = function(callback)
            {
                Api.get('Project').get($routeParams.projectKey)
                    .then(function(project) {
                        $scope.project = project;
                        callback && callback();
                    });
            };

            $scope.saveProject = function(callback)
            {
                Api.get('Project')
                    .put($scope.project._id, $scope.project)
                    .then(function(response) {
                        setAlert('success', response.message);
                        callback && callback();
                    });
            };


            function setAlert(type, message) {
                Helper.setAlert($scope, type, message);
            }
        }]);