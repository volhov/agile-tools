angular.module('agile.controllers')
    .controller('Login', ['$scope', '$http', '$location', 'Auth', 'Helper',
        function($scope, $http, $location, Auth, Helper) {

            $scope.signIn = signIn;
            $scope.showLoader = false;

            function signIn(username, password) {
                if (!username.length || !password.length) {
                    return;
                }
                $scope.showLoader = true;
                Auth.signIn(username, password)
                    .success(function(data, status, headers, config) {
                        Helper.setAlert('success', data.message);
                        Auth.redirectAfterLogin();
                    })
                    .error(function(data, status, headers, config) {
                        Helper.setAlert('warning', data.message, true);
                        $scope.showLoader = false;
                    });
            }
        }]);