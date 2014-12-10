angular.module('agile.directives')
    .directive('authorization', ['$location', '$interval', '$routeSegment', 'Auth', 'Helper',
        function($location, $interval, $routeSegment, Auth, Helper) {
            var checkingPeriod = 60000;
            var loginUrl = $routeSegment.getSegmentUrl('login', {});
            return {
                controller: function() {
                    $interval(function() {
                        if ($location.path() == loginUrl) {
                            return;
                        }
                        Auth.check().error(function() {
                            Auth.setRedirectTo($location.path());
                            Helper.setAlert('warning', 'Your session has been expired.');
                            $location.path(loginUrl)
                        });
                    }, checkingPeriod);
                }
            };
        }])
    .directive('authInfo', ['$location', 'Auth', 'Helper', 'TEMPLATES_URL',
        function($location, Auth, Helper, TEMPLATES_URL) {
            return {
                controller: ['$scope', function($scope) {
                    $scope.$watch(Auth.getUserInfo, function(userInfo) {
                        $scope.user = userInfo;
                    });
                    $scope.signOut = function() {
                        Auth.signOut().success(function() {
                            Helper.setAlert('success', 'You have signed out successfully.')
                        });
                    };
                }],
                templateUrl: TEMPLATES_URL + '/login/auth_info.directive.html'
            };
        }]);