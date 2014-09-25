angular.module('agile.controllers')
    .controller('Version', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            $scope.tab = 'confidence_report';

            $scope.moment = moment; // This is to use moment.js easily in templates.

            Api.get('Project').get($routeParams.projectKey)
                .then(function(project) {
                    $scope.project = project;
                    $scope.version = getVersion(project, $routeParams.versionName);
                    $scope.versionName = $routeParams.versionName;
                });

            $scope.getTabClass = function(tabName) {
                return $scope.tab == tabName ? 'active' : '';
            };

            // Protected functions

            function getVersion(project, versionName)
            {
                var version = null;
                angular.forEach(project.versions, function(value) {
                    if (value.name == versionName) {
                        version = value;
                    }
                });

                return version;
            }
        }]);