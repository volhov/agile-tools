angular.module('agile.directives')
    .directive('agileAssignees', ['$sce', 'assigneeShortFilter', function($sce, assigneeShortFilter) {
        function link($scope, element, attrs) {
            if ($scope.assignees) {
                var names = [];
                for (var index = 0; index < $scope.assignees.length; index++) {
                    if ('name' in $scope.assignees[index]) {
                        names.push(
                            '<span class="name">' + assigneeShortFilter($scope.assignees[index].name) + '</span>'
                        );
                    }
                }
                $scope.names = $sce.trustAsHtml(names.join(', '));
            }
        }

        return {
            scope: {
                assignees: "=agileAssignees"
            },
            link: link,
            template: '<span data-ng-bind-html="names"></span>'
        };
    }]);