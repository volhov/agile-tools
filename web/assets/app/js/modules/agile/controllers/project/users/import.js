angular.module('agile.controllers')
    .controller('Project_Users_Import', ['$scope', '$timeout', 'TEMPLATES_URL', 'Api', 'Helper',
        function($scope, $timeout, TEMPLATES_URL, Api, Helper) {
            $scope.template = TEMPLATES_URL + '/project/users/import.html';


            $scope.showImport = false;
            $scope.showImportLoader = false;

            var searchPromise;
            $scope.searchUser = function(userQuery) {
                if (userQuery) {
                    if (searchPromise) {
                        $timeout.cancel(searchPromise);
                    }
                    searchPromise = $timeout(function() {
                        searchPromise = null;
                        Api.get('JiraUsers').get({
                            query: userQuery
                        }).then(function(users) {
                            $scope.jiraUsers = users;
                        });
                    }, 150);
                } else {
                    $scope.jiraUsers = [];
                }
            };

            $scope.openImportForm = function()
            {
                $scope.showImport = true;
                $scope.showImportLoader = false;
                $scope.$parent.hideUsers = true;
                resetImport();
            };

            $scope.hideImport = function()
            {
                $scope.userQuery = '';
                $scope.showImport = false;
                $scope.showImportLoader = false;
                $scope.$parent.hideUsers = false;
                resetImport();
            };

            $scope.addUser = function(jiraUser) {
                if (jiraUser) {
                    $scope.showImport = false;
                    $scope.showImportLoader = true;

                    addUserToProject(jiraUser);

                    $scope.$parent.saveProject().then(function() {
                        Api.get('UsersImport').post({
                            key: jiraUser.key
                        }).then(function(response) {
                            Helper.setAlert('success', response.message);
                            $scope.$parent.loadProject()
                                .then(function() {
                                    $scope.hideImport();
                                });
                        });
                    });
                }
            };

            $scope.checkAll = function() {
                angular.forEach($scope.jiraUsers, function(user) {
                    user.import = true;
                });
            };

            $scope.uncheckAll = function() {
                angular.forEach($scope.jiraUsers, function(user) {
                    user.import = false;
                });
            };

            $scope.importButtonIsActive = function()
            {
                var isActive = false;
                angular.forEach($scope.jiraUsers, function(user) {
                    if (user.import) {
                        isActive = true; // I want a break here.
                    }
                });
                return isActive;
            };

            function addUserToProject(user)
            {
                if (!$scope.$parent.project.users) {
                    $scope.$parent.project.users = [];
                }
                if (!projectHasUser(user.key)) {
                    $scope.$parent.project.users.push({
                        key: user.key,
                        name: user.displayName
                    });
                }
            }

            function projectHasUser(userKey)
            {
                var userExists = false;
                angular.forEach($scope.$parent.project.users, function(projectUser) {
                    if (projectUser.key == userKey) {
                        userExists = true;
                        // I want a break here.
                    }
                });

                return userExists;
            }

            function resetImport()
            {
                $scope.jiraUsers = [];
            }
        }]);