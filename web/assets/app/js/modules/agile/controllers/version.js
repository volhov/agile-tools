angular.module('agile.controllers')
    .controller('Version', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            $scope.tab = $routeParams.tab;//'confidence_report';

            $scope.moment = moment; // This is to use moment.js easily in templates.

            loadProject().then(function() {
                Helper.setTitle($scope.versionName + ' of ' + $scope.project.name);
            });

            $scope.getTabClass = function(tabName) {
                return $scope.tab == tabName ? 'active' : '';
            };

            Helper.setAlert(null, 'warning', 'Test');

            // Protected functions


            function loadProject() {
                return Api.get('Project').get($routeParams.projectKey)
                    .then(function (project) {
                        $scope.project = project;
                        $scope.version = getVersion(project, $routeParams.versionName);
                        $scope.versionName = $routeParams.versionName;
                    });
            }

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