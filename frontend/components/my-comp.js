exports.set = function (app) {
  var componentName = 'myComp'; // <------ Edit this
  var componentTemplate = '/components/my-comp.pre.html'; // <------ Edit this
  var module = angular.module(componentName + 'Module', []);
  
  app.requires.push(componentName + 'Module');
  
  module.directive(componentName, function () {
    return {
      restrict: 'E',
      controller: ['$scope', '$element', componentController],
      transclude: true,
      templateUrl: componentTemplate,
      scope: {
        content: "="
      },
      link: function ($scope, $element, $attr) {
        $scope.$broadcast('$' + componentName + 'Loaded', $element);
        ext2.applyReveal();
      }
    };
  
    function componentController($scope, $element) {
      console.log('componentController:' + componentName + ':');
      this.$scope = $scope;
      this.$element = $element;

      $scope.test = '111';
  
      // Your logic here  // <------
    }
  });
}