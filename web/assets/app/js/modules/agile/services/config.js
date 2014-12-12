angular.module('agile.services')
    .factory('Config', ['Api', function(Api) {

        var config;

        return {
            load: function(projectKey) {
                return Api.get('Config')
                    .get(projectKey)
                    .then(function(loadedConfig) {
                        config = loadedConfig;
                    });
            },
            value: function(key, section) {
                section = section || 'config';
                if (config && (section in config)) {
                    if (config[section] && key in config[section]) {
                        return config[section][key];
                    }
                }
                return null;
            }
        };
    }]);