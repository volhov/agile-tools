angular.module('agile.directives')
    .directive('confidenceReportFilter', ['$compile', 'TEMPLATES_URL', function($compile, TEMPLATES_URL) {

        var placeholderHint = '(Ctrl + Space to show hint)';
        var hintTemplateUrl = TEMPLATES_URL + '/project/version/confidence_report/filter_hint.directive.html';

        function initFilterHint($scope, $element)
        {
            var $input = $element.find('input[type=search]');
            $input
                .attr('placeholder', $input.attr('placeholder') + ' ' + placeholderHint)
                .after($compile(getHintHtml())($scope))
                .bind('keydown', function(event) {
                    if (event.keyCode == jQuery.ui.keyCode.ESCAPE || event.keyCode == jQuery.ui.keyCode.ENTER) {
                        if ($scope.showHint) {
                            event.preventDefault();
                        }
                        $scope.$apply('showHint = false');
                    } else if (event.ctrlKey && event.keyCode == jQuery.ui.keyCode.SPACE) {
                        event.preventDefault();
                        $scope.$apply('showHint = !showHint; isTransparent = false;');
                    } else {
                        $scope.$apply('isTransparent = true;');
                    }
                });
        }

        function getHintHtml()
        {
            return '<div class="filter-hint-container" ' +
                'data-ng-include="hintTemplateUrl" ' +
                'data-ng-class="{\'transparent\': isTransparent}" ' +
                'data-ng-show="showHint"></div>';
        }

        return {
            scope: {},
            controller: function($scope) {
                $scope.hintTemplateUrl = hintTemplateUrl;
                $scope.showHint = false;
                $scope.isTransparent = false;
            },
            link: function ($scope, $element) {
                initFilterHint($scope, $element);
            }
        };
    }]);