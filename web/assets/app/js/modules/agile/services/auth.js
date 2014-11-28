angular.module('agile.services')
//    .config(['$httpProvider', function($httpProvider) {
//        $httpProvider.interceptors.push(function($q) {
//            return {
//                'responseError': function(response) {
//                    console.log(response);
//                    return response;
//                }
//            };
//        });
//    }])
    .factory('Auth', ['$http', '$location', '$routeSegment', '$window',
        function($http, $location, $routeSegment, $window) {
        var redirectTo = null;
        var userInfo = {};
        var loginUrl = $routeSegment.getSegmentUrl('login', {});
        var startUrl = $routeSegment.getSegmentUrl('projects', {});
        return {
            signIn: function(username, password) {
                var postData = {
                    username: username,
                    password: password
                };
                return $http.post(loginUrl, postData);
            },
            signOut: function() {
                userInfo = {};
                return $http.delete(loginUrl).success(function() {
                    $location.path(loginUrl);
                });
            },
            check: function(redirect) {
                return $http.get(loginUrl + '/check').success(function(data) {
                    if ('user' in data) {
                        userInfo = data.user;
                    }
                }).error(function() {
                    userInfo = {};
                    if (redirect) {
                        $location.path(loginUrl);
                    }
                });
            },
            setRedirectTo: function(url) {
                redirectTo = url;
            },
            redirectAfterLogin: function() {
                if (redirectTo) {
                    $location.path(redirectTo);
                } else {
                    if ($location.path() == loginUrl) {
                        $location.path(startUrl);
                    } else {
                        $window.location.reload();
                    }
                }
                redirectTo = null;
            },
            getUserInfo: function()
            {
                return userInfo;
            }
        };
    }]);