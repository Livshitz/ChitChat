exports.set = function (app) {
	
	// ########### Lazy
	app.config(function($controllerProvider, $compileProvider, $filterProvider, $provide){
		app.lazy = {
			controller : $controllerProvider.register,
			directive  : $compileProvider.directive,
			filter     : $filterProvider.register,
			factory    : $provide.factory,
			service    : $provide.service
		}
	});

	// allow DI for use in controllers, unit tests
	app.constant('_', window._)
		// use in views, ng-repeat="x in _.range(3)"
		.run(function ($rootScope) {
			$rootScope._ = window._;
		});
			
	// ########### Theme
	app.config(function ($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('orange')
			.accentPalette('grey');

		return;

		$mdThemingProvider.definePalette('amazingPaletteName', {
			'50': 'ffebee',
			'100': 'ffcdd2',
			'200': 'ef9a9a',
			'300': 'e57373',
			'400': 'ef5350',
			'500': 'f44336',
			'600': 'e53935',
			'700': 'd32f2f',
			'800': 'c62828',
			'900': 'b71c1c',
			'A100': 'ff8a80',
			'A200': 'ff5252',
			'A400': 'ff1744',
			'A700': 'd50000',
			'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
																					// on this palette should be dark or light

			'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
			'200', '300', '400', 'A100'],
			'contrastLightColors': undefined    // could also specify this if default was 'dark'
		});

		//----
		// Extend the red theme with a different color and make the contrast color black instead of white.
		// For example: raised button text will be black instead of white.
		var newPalette = $mdThemingProvider.extendPalette('orange', {
			'50': '#047aa8',
			'900': '#0277a5',
		});

		// Register the new color palette map with the name <code>neonRed</code>
		$mdThemingProvider.definePalette('my', newPalette);

		//$mdThemingProvider.theme('default').primaryPalette('amazingPaletteName')
		$mdThemingProvider.theme('default')
				.primaryPalette('my', {
					"default": "900",
					"hue-1": "600",
					"hue-2": "300",
					"hue-3": "100"
				}).accentPalette('orange', {
					"default": "A200"
				});//.dark();
	});

	app.config(function ($httpProvider) {
		$httpProvider.defaults.withCredentials = true;
	});
}