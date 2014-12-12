angular.module('agile.directives')
    .directive('cacheManager', ['$templateCache', 'localStorageService', 'Helper', 'TEMPLATES_URL',
        function($templateCache, Storage, Helper, TEMPLATES_URL) {

            function controller($scope) {
                $scope.clear = function() {
                    $templateCache.removeAll();
                    Storage.clearAll();
                    Helper.setAlert('success', 'Cache has been cleared.')
                }
            }

            return {
                scope: {},
                controller: ['$scope', controller],
                templateUrl: TEMPLATES_URL + '/cache-manager.directive.html'
            };
        }]);