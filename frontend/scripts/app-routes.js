exports.set = function(app) {
	app.config(function($routeProvider, $sceDelegateProvider, $locationProvider) {
		$routeProvider.
			when('/', 			{ templateUrl: '/intro.pre.html' }).
			when('/main', 		{ templateUrl: '/main.pre.html' }).
			when('/nextTopic',	{ templateUrl: '/nextTopic.pre.html' }).

			otherwise({
				redirectTo: '/'
			});

		$sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('.*')]);
		//$locationProvider.hashPrefix('!');
		$locationProvider.html5Mode(true);
	});

	app.animation('.reveal-animation', function () {
        return {
            enter: function (element, done) {
                element.css('display', 'none');
                element.fadeIn(200, done);
                return function () {
                    element.stop();
                }
            },
            leave: function (element, done) {
                element.fadeOut(200, done)
                return function () {
                    element.stop();
                }
            }
        }
	});

	app.run(function($rootScope, $location, page, $mdSidenav, $timeout) {
		$rootScope.$on("$routeChangeStart", function(event, next, current) {
			//console.log('-------------routeChangeStart');
			//window.scrollTo(0,0);
			//event.stopPropagation();  //if you don't want event to bubble up 
		});

		$rootScope.$on( "$routeChangeSuccess", function(event, next, current) {
			try{
				if (ngGet("$route").current.loadedTemplateUrl != null){
					var curPage = ngGet("$route").current.loadedTemplateUrl.match(/.*\/(.*)\.pre\.html$/)[1].capitalize();
					page.setTitle(curPage);
				}
			}catch(e){
				page.setTitle('Coming Soon');
				//Log.Error("Unable to dynamically set page title", e);
				console.log("Error - Unable to dynamically set page title", e)
			}
		});

		$rootScope.$on('$viewContentLoaded', function(){
			ext2.applyReveal();
			//$("md-content").animate({ scrollTop: 0 }, "fast");
			//jQuery('html, body').animate({ scrollTop: 0 }, 200);
			app.scrollToTop();

			$timeout(function(){
				try{
					ext2.applyReveal();

					var timeSinceStartupSec = (new Date() - ngScopeInline().startupTime) / 1000;
					if (timeSinceStartupSec < 2 && $('md-sidenav:hover').length > 0) return;
					$mdSidenav('menu').close();
				}catch(e){}
			}, 700);
		});
	});
}