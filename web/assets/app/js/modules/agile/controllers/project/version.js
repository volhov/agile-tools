angular.module('agile.controllers')
    .controller('Version', ['$scope', '$routeSegment', '$routeParams', 'Api', 'Helper',
        function($scope, $routeSegment, $routeParams, Api, Helper) {

            $scope.$watch('project', function () {
                if ($scope.project) {
                    $scope.version = getVersion($routeParams.versionName);
                    if ($scope.version) {
                        Helper.setTitle($scope.version.name + ' of ' + $scope.project.name);
                    } else {
                        Helper.setAlert('danger', 'Version "' + $routeParams.versionName + '" not found.')
                    }
                }
            });

            $scope.getTabClass = function(tabName) {
                return {
                    active: $routeSegment.contains(tabName)
                };
            };

            // Protected functions

            function getVersion(versionName)
            {
                for (var i = 0; i < $scope.project.versions.length; i++) {
                    if ($scope.project.versions[i].name == versionName) {
                        return $scope.project.versions[i];
                    }
                }
                return null;
            }
        }]);