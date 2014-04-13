angular.module('App.directives.include', [])
.directive('pvInclude', ['$templateCache','$animate',
function pvIncludeFactory($templateCache,  $animate) {
  return {
    terminal: true,
    priority: 400,
    transclude: 'element',
    controller: angular.noop,
    link: function linkFn(scope, $element, $attr, ctrl, $transclude) {
      var currentScope,
          previousElement,
          currentElement;

      scope.$on('remove', remove);
      scope.$on('update', update);

      function remove() {
        if(previousElement) {
          previousElement.remove();
          previousElement = null;
        }
        if(currentScope) {
          currentScope.$destroy();
          currentScope = null;
        }
        if(currentElement) {
          $animate.leave(currentElement, function() {
            previousElement = null;
          });
          previousElement = currentElement;
          currentElement = null;
        }
      }

      function update(evt, promise) {
        var newScope = scope.$new();
        ctrl.template = $templateCache.get($attr.pvInclude);
        ctrl.controller = $attr.controller;
        ctrl.promise = promise;

        var clone = $transclude(newScope, function(clone) {
          remove();
          $animate.enter(clone, null, $element);
        });

        currentScope = newScope;
        currentElement = clone;
      }
    }
  };
}])
.directive('pvInclude', [        '$compile','$controller',
function pvViewFillContentFactory($compile,  $controller) {
  return {
    priority: -400,
    require: 'pvInclude',
    link: function linkFn(scope, $element, $attr, ctrl) {
      $element.html(ctrl.template);

      var locals = {
        $scope: scope,
        promise: ctrl.promise
      };

      var link = $compile($element.contents());
      var controller = $controller(ctrl.controller, locals);
      $element.data('$ngControllerController', controller);
      $element.children().data('$ngControllerController', controller);

      link(scope);
    }
  };
}]);
