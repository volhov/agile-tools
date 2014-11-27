angular.module('agile.controllers')
    .controller('Config', ['$scope', '$routeParams', 'yamlFilter', 'Api', 'Helper',
        function($scope, $routeParams, yamlFilter, Api, Helper) {

            $scope.saveConfig = saveConfig;
            $scope.validateYaml = validateYaml;

            Helper.setTitle('Config');
            loadConfig($routeParams.projectKey);

            function loadConfig(projectKey) {
                Api.get('Config')
                    .get(projectKey)
                    .then(function (config) {
                        $scope.config = config;
                        var editableConfig = angular.copy(config.config);
                        var customCss = null;
                        delete editableConfig._id;
                        if ('custom_css' in editableConfig) {
                            customCss = editableConfig.custom_css;
                            delete editableConfig.custom_css;
                        }
                        delete editableConfig._id;
                        $scope.yamlConfig = yamlFilter(editableConfig, 'dump');
                        $scope.customCss = customCss;
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
                    .put(config.config.id, config)
                    .then(function (response) {
                        Helper.setAlert('success', response.message);
                    });
            }

            function validateYaml(yamlConfig)
            {
                try {
                    return yamlFilter(yamlConfig, 'load');
                } catch (e) {
                    return null;
                }
            }
        }]);