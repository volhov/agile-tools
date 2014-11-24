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
                        delete editableConfig._id;
                        $scope.yamlConfig = yamlFilter(editableConfig, 'dump');
                    });
            }

            function saveConfig(yamlConfig)
            {
                var config = $scope.config;
                var editableConfig = validateYaml(yamlConfig);
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