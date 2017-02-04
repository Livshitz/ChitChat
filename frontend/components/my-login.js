exports.set = function (app) {
  var componentName = 'myLogin'; // <------ Edit this
  var componentTemplate = '/components/my-login.pre.html'; // <------ Edit this
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

      // Your logic here  // <------
      $scope.app = app;
      $scope.showAnonLoginDialog = app.showDialog('anon-login', 'template-anon-login', function ($scope, s) {
          $scope.submit = function (arg) {
              console.log('submit')
              //$mdDialog.cancel();
              app.profile.signInAnon($scope.form.displayName);
              this.cancel();
          };
      }, {m: $scope.m, s: $scope});

    }
  });
}