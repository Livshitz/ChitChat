var appServices = angular.module('myAppServices', ['ngResource']);
var app = angular.module('myApp', [
	'utilsService',
	'ngRoute',
	'ngCookies',
	'myAppServices',
	'ngMaterial',
	'ngAnimate',
	'ngStorage',
	'ngWebSocket'
]);
app.name = 'Chit Chat';

var scrollRefreshHandle = 0;
/* --------------------- */
app.controller('layout', function ($scope, $rootScope, $location, page, utils, $timeout, $mdSidenav, $mdUtil, $log, 
		$mdDialog, $window, $cookies, $document, $route) {

	$scope.startupTime = new Date();
	$scope.utils = utils;
	$scope.page = page;

	$scope.isPopup = function(){
		if (window.opener) return true;
		else return false;
	}

	$rootScope.appReady = true;
	fd.Helpers.Yield();

	$scope.toggleMenu = buildToggler('menu');
	$scope.toggleRight = buildToggler('right');
	$scope.toggleLeft = buildToggler('left');

	function buildToggler(componentId) {
	  return function() {
		$mdSidenav(componentId).toggle();
	  }
	}

	$scope.refresh = function(){
		$route.reload();
	}

	angular.element($window).on("scroll", function() {
		$rootScope.scroll = window.scrollY;
		if (scrollRefreshHandle != 0) return;
		scrollRefreshHandle = setTimeout(function(){
			$rootScope.$apply();
			scrollRefreshHandle = 0;
		}, 100);
	});
});

app.controller('menu', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
		console.log('MenuCtrl: close!');
		$mdSidenav('menu').close()
			.then(function () {
				$log.debug("close MENU is done");
			});
	};
});

/* ---------- Extensions (Your custimization) ----------- */
myRequire('/scripts/app-extensions.js?rnd=' + fd.ext.randomNumber()).set(app);

/* ---------- Config ----------- */
myRequire('/scripts/app-routes.js?rnd='+fd.ext.randomNumber()).set(app);
myRequire('/scripts/app-config.js?rnd='+fd.ext.randomNumber()).set(app);

