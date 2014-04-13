angular.module('common.directives.subMenu', [])
.directive('subMenu', ['$animate', function subMenuFactory($animate) {
  return {
    restrict: 'C',
    transclude: true,
    template: '<div ng-transclude></div>',
    scope: {},
    link: function linkFn(scope, element) {
      var $subMenu = element.find('ul');
      var $button  = element.find('button').eq(0);

      function show() {
        if (!$button.prop('disabled')) {
          $animate.removeClass($subMenu, 'ng-hide');
        }
      }

      function hide() {
        $animate.addClass($subMenu, 'ng-hide');
      }

      element.on('mouseenter', show);
      element.on('mouseleave', hide);
      $subMenu.addClass('ng-hide');
    }
  };
}]);
