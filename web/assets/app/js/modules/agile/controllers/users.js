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
                        $scope.jiraUsers = filterJiraUsers(users);
                    });
            }

            function userExists(user)
            {
                for (var i = 0; i < $scope.users.length; i++) {
                    if ($scope.users[i].key == user.key) {
                        return true;
                    }
                }
                return false;
            }

            function addUser(user)
            {
                return Api.get('UsersImport').post({
                    key: user.key
                }).then(function(response) {
                    Helper.setAlert('success', response.message);
                    Api.get('Users').resetCache();
                    Api.get('JiraUsers').resetCache();
                    loadUsers().then(function() {
                        $scope.jiraUsers = filterJiraUsers($scope.jiraUsers);
                    });
                });
            }

            function filterJiraUsers(users)
            {
                var filteredUsers = [];
                for (var i = 0; i < users.length; i++) {
                    if (!userExists(users[i])) {
                        filteredUsers.push(users[i]);
                    }
                }
                return filteredUsers;
            }
        }]);