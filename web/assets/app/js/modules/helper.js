angular.module('helper', [])
    .factory('Helper', ['$rootScope', function($rootScope) {

        var defaultTitle = 'Agile Tools';

        return {
            setAlert: function(type, message) {
                $rootScope.alert = {
                    type: type,
                    message: message
                };
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