angular.module('agile.filters')
    .filter('storyKey', ['$sce', function($sce) {
        return function(input) {
            input = input || '';
            return $sce.trustAsHtml(
                input.replace(/^([A-Z]+\-([A-Z]+\-)?[0-9]+([a-z])?)([^a-z])/, '<em>$1</em>$4')
            );
        };
    }]);