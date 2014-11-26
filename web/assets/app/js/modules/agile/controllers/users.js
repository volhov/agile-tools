angular.module('agile.controllers')
    .controller('Users', ['$scope', '$location', '$routeParams', 'Api', 'Helper',
        function($scope, $location, $routeParams, Api, Helper) {

            Helper.setTitle('Users');

            $scope.searchUser = '';
            $scope.userTypes = Helper.getUserTypes();
            $scope.addUser = addUser;

            $scope.$watch('searchUser', function(newValue) {
                if (newValue.length > 1) {
                    searchUsers();
                } else {
                    $scope.jiraUsers = [];
                }
            });

            loadUsers();

            function loadUsers()
            {
                return Api.get('Users').get()
                    .then(function(users) {
                        $scope.users = users;
                    });
            }

            function searchUsers()
            {
                return Api.get('JiraUsers')
                    .get({
                        query: $scope.searchUser
                    })
                    .then(function(users) {
                        $scope.jiraUsers = users;
                    });
            }

            function addUser(user)
            {
                // todo: on importing user implement updating if user already exists
                return Api.get('UsersImport').post({
                    key: user.key
                }).then(function(response) {
                    Helper.setAlert('success', response.message);
                    $scope.searchUser = '';
                    Api.get('Users').resetCache();
                    Api.get('JiraUsers').resetCache();
                    loadUsers();
                });
            }
        }]);