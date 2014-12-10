angular.module('helper')
    .factory('Helper', ['$rootScope', '$timeout', function($rootScope, $timeout) {

        var defaultTitle = 'Agile Tools';
        var alertTimeoutPromise;

        return {
            setAlert: function(type, message, persistant) {
                $rootScope.alert = {
                    type: type,
                    message: message
                };
                if (alertTimeoutPromise) {
                    $timeout.cancel(alertTimeoutPromise);
                }
                if (!persistant) {
                    alertTimeoutPromise = $timeout(function() {
                        $rootScope.alert = null;
                        alertTimeoutPromise = null;
                    }, 5000);
                }
            },
            setTitle: function(title, skipDefault)
            {
                if (skipDefault) {
                    document.title = title;
                } else {
                    document.title = title + ' | ' + defaultTitle;
                }
            },
            getUserTypes: function() {
                return [{
                        key: 'BE',
                        name: 'Backend'
                    }, {
                        key: 'FE',
                        name: 'Frontend'
                    }, {
                        key: 'QA',
                        name: 'QA'
                    }];
            }
        };
    }])
    ;