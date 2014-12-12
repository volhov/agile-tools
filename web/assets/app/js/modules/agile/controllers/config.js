angular.module('agile.controllers')
    .controller('Config', ['$scope', '$routeParams', 'yamlFilter', 'Api', 'Helper',
        function($scope, $routeParams, yamlFilter, Api, Helper) {

            $scope.saveConfig = saveConfig;
            $scope.validateYaml = validateYaml;

            Helper.setTitle('Config');
            loadConfig($routeParams.projectKey || 'global');

            function loadConfig(projectKey) {
                Api.get('Config')
                    .get(projectKey)
                    .then(function (config) {
                        var editableConfig;
                        if (!config.config) {
                            createConfig(projectKey).then(function() {
                                loadConfig(projectKey);
                            });
                        } else {
                            editableConfig = angular.copy(config.config);
                            var customCss = '';
                            delete editableConfig._id;
                            if ('custom_css' in editableConfig) {
                                customCss = editableConfig.custom_css;
                                delete editableConfig.custom_css;
                            }
                            var yamlConfig =  yamlFilter(editableConfig, 'dump').trim();

                            $scope.config = config;
                            $scope.yamlConfig = yamlConfig == '{}' ? '' : yamlConfig;
                            $scope.customCss = customCss;
                        }
                    });
            }

            function saveConfig(yamlConfig, customCss)
            {
                var config = $scope.config;
                var editableConfig = validateYaml(yamlConfig);
                editableConfig.custom_css = customCss;
                if (!editableConfig) {
                    Helper.setAlert('danger', 'Config is not valid.');
                    return;
                }
                for (var key in editableConfig) {
                    if (editableConfig.hasOwnProperty(key)) {
                        config.config[key] = editableConfig[key];
                    }
                }
                Api.get('Config')
                    .put(config.config._id, config)
                    .then(function (response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function createConfig(projectKey)
            {
                return Api.get('Configs')
                    .post({
                        config: {
                            '_id': projectKey
                        }
                    })
                    .then(function (response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function validateYaml(yamlConfig)
            {
                try {
                    if (yamlConfig == '') {
                        return {};
                    }
                    var loadedConfig = yamlFilter(yamlConfig, 'load');
                    return typeof loadedConfig == 'object' ? loadedConfig : null;
                } catch (e) {
                    return null;
                }
            }

        }]);