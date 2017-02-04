exports.set = function (app) {
    /* ---------- Compenents ----------- */
    myRequire('/components/my-comp.js').set(app);
    myRequire('/components/my-login.js').set(app);
    /* --------------------------------- */

    app.directive('errSrc', function () {
        return {
            link: function (scope, element, attrs) {
                element.bind('error', function () {
                    if (attrs.src != attrs.errSrc) {
                        attrs.$set('src', attrs.errSrc);
                    }
                });
            }
        }
    });

    var cookie_user_displayName = new fd.Cookie('chitchat-anon-displayName');

    // Profile
    app.run(function ($rootScope) {
        app.profile = {};
        app.profile.data = {
            profilePicUrl: '/images/profile_placeholder.png',
            displayName: null,
            userId: null
        };

        app.profile.get = function () {
            if (fd.Helpers.Token == null) return;

            return fd.Helpers.HttpGet("/getUser").Then(function (user) {
                console.log('user', user);
                $rootScope.user = user;

                $rootScope.$apply();
            });
        };

        app.profile.logout = function () {
            $location.path('/');
        }

        app.profile.get();

        app.profile.signInGoogle = function () {
            // Sign in Firebase using popup auth and Google as the identity provider.
            var provider = new firebase.auth.GoogleAuthProvider();
            app.firebase.auth.signInWithPopup(provider);
        };

        app.profile.signInFacebook = function () {
            // Sign in Firebase using popup auth and Google as the identity provider.
            var provider = new firebase.auth.FacebookAuthProvider();
            app.firebase.auth.signInWithPopup(provider);
        };

        app.profile.signInAnon = function (displayName) {
            app.firebase.auth.signInAnonymously().then(function () {
                cookie_user_displayName.Set(displayName);
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
            });
        };

        app.profile.signOut = function () {
            // Sign out of Firebase.
            app.firebase.auth.signOut();
        };

        app.profile.isSignedIn = function () {
            return app.firebase.auth.currentUser != null;
        }

        $rootScope.isSignedIn = app.profile.isSignedIn;
    });

    // Firebase
    app.run(function ($rootScope, $mdDialog) {
        // Sets up shortcuts to Firebase features and initiate firebase auth.
        app.profile.onAuthStateChanged = function (user) {
            console.log('onAuthStateChanged!', user);
            $mdDialog.hide('myLoginModule');

            if (!user) {
                app.profile.data = {
                    profilePicUrl: '/images/profile_placeholder.png',
                    displayName: null,
                    userId: null
                };
                $rootScope.$apply();
                return;
            }

            if (!user.isAnonymous) {
                app.profile.data.profilePicUrl = user.photoURL; // Only change these two lines!
                app.profile.data.displayName = user.displayName;   // Only change these two lines!
            } else {
                if (user.displayName == null) app.profile.data.displayName = cookie_user_displayName.Get();
            }
            app.profile.data.userId = user.uid;
            $rootScope.$apply();
        }

        // Shortcuts to Firebase SDK features.
        app.firebase = {};
        app.firebase.auth = firebase.auth();
        app.firebase.database = firebase.database();
        app.firebase.storage = firebase.storage();
        // Initiates Firebase auth and listen to auth state changes.
        app.firebase.auth.onAuthStateChanged(app.profile.onAuthStateChanged.bind(this));
    });

    // ########### Run
    app.run(function ($rootScope, $location, $http, $cookies, $window, page, $mdDialog, $route, $localStorage, utils) {
        $rootScope.app = app;
        app.history = [];

        $rootScope.timePerTopic = 1; // mins

        app.webapi = Liv.Infra.SimpleIoC.Container().get_Instance().Get$1(Liv.Infra.IWebApi, false);
        app.webapi.SetApiServerUrl('https://backend-dot-chitchat-157309.appspot.com/', 'http://dev.feedox.com:8081/', true)

        fd.Helpers.Token = fd.Cookies.Get('token');

        // Firebase log-in widget
        app.configureFirebaseLoginWidget = function () {
            var uiConfig = {
                'signInSuccessUrl': '/',
                'signInOptions': [
                    // Leave the lines as is for the providers you want to offer your users.
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                    firebase.auth.GithubAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID
                ],
                // Terms of service url
                'tosUrl': '<your-tos-url>',
            };

            var ui = new firebaseui.auth.AuthUI(firebase.auth());
            ui.start('#firebaseui-auth-container', uiConfig);
        }

        if (window.ngScope) {
            window.ngScopeInline().$destroy();
            //angular.element('[ng-controller="inlineController"]').empty();
        }

        setTimeout(function () {
            if (typeof ngScope === 'undefined') {
                console.log('Lazy-angular detected. Manually initializing angular');
                angular.bootstrap(document, ['myApp']);
            }
        }, 500);

        $rootScope.storage = $localStorage;

        page.setAppName(app.name, '');

        var standalone = window.navigator.standalone,
            userAgent = window.navigator.userAgent.toLowerCase(),
            safari = /safari/.test(userAgent),
            ios = /iphone|ipod|ipad/.test(userAgent);

        if (ios) {
            if (!standalone && safari) {
                //browser
            } else if (standalone && !safari) {
                //standalone
            } else if (!standalone && !safari) {
                //uiwebview (Facebook in-app browser)
                //alert('גולש יקר, זהינו שהתחברת דרך הדפדפן הפנימי של פייסבוק בiOS. זמנית זה לא ניתמך, אנא פתח את האתר בדפדפן רגיל של הנייד. עמך הסליחה.');
            }
            ;
        } else {
            //not iOS
        }
        ;


    });

    app.showDialog = function (dialogName, dialogTemplate, dlg, locals, onHide) {
        app.lazy.controller(dialogName, function ($scope, $mdDialog, locals) {
            $scope.hide = function () {
                //console.log('Dialog:' + dialogName + ': Hidel!');
                //$('.md-dialog-container').hide();
                //$mdDialog.hide();
                $mdDialog.cancel();
            };
            $scope.cancel = function () {
                console.log('Dialog:' + dialogName + ': Cancel!');
                $mdDialog.cancel();
            };

            $scope.locals = locals;

            //ngInjector().invoke(dlg, $scope)
            dlg($scope);
        });

        return function () {
            ngGet('$mdDialog').show({
                controller: dialogName,
                templateUrl: dialogTemplate,
                locals: locals,
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    console.log('Dialog:' + dialogName + ': dialog successfull');
                }, function () {
                    console.log('Dialog:' + dialogName + ': dialog cancelled');
                    if (onHide) onHide();
                });
        }
    }

    app.showConfirm = function (msg) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = ngGet('$mdDialog').confirm()
            .title('Confirm')
            .textContent(msg)
            //.targetEvent(ev)
            .ok('Continue')
            .cancel('Cancel');

        return ngGet('$mdDialog').show(confirm);
    }

    app.uploadFile = function (files, callback) {
        console.log('uploadFile', files);

        var formData = new FormData();
        formData.append('file', files[0]);

        var apiUrl = app.webapi.get_GetApiServerUrl();
        fd.Helpers.UploadFile(apiUrl + "/upload/image", formData).Then(function (res) {
            console.log('uploadFile:success', res);
            callback(apiUrl + "/uploads/images/" + res, files[0]);
        }).Catch(function (ex) {
            alert("File upload failed!");
            console.error('File upload failed', ex);
        });
    };

    app.tryGotoNext = function () {
        var next = fd.Helpers.GetQueryString("next");
        if (!String.prototype.isEmpty(next)) {
            ngGet('$location').search('next', null)
            ngGet('$location').path(next);
            ngScopeInline().$apply();
            //window.location = next;
            return true;
        }
        else {
            return false;
        }
    }

    app.alert = function (msg, title) {
        //window.scrollTo(0, 0);
        ngGet('$mdDialog').show(
            ngGet('$mdDialog').alert()
            //.targetEvent(originatorEv)
                .clickOutsideToClose(true)
                .title(title || 'Alert')
                .textContent(msg)
                .ok('OK')
        );
    }

    app.scrollToTop = function () {
        var toolbar = $('md-toolbar:first').height();
        var curY = $(window).scrollTop();
        var scrollTo = toolbar - 5;

        if (curY <= toolbar) scrollTo = 0;

        $("html, body").animate({scrollTop: scrollTo}, "fast");
    }

    app.scrollTo = function (selector) {
        var scrollTo = $(selector).offset().top;
        $("html, body").animate({scrollTop: scrollTo}, "slow");
    }

    // Stats
    app.run(function ($rootScope) {
        app.stats = {};
        $rootScope.stats = app.status;

        app.stats.getLiveSessionsAsync = function(){
            return app.webapi.GetJson('/getActiveUsers').Then(function (res) {
                app.stats.liveSessions = res;
                $scope.safeApply();
            });
        };

        app.stats.getLiveSessionsForTopic = function(topic){
            return _.filter(app.stats.liveSessions, function(e) { return e.topic == topic })
        };

        app.stats.getLiveSessionsAsync();
    });

    // Google Analitics
    app.run(function () {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m);
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        if (!window.location.host.contains('dev')) {
            ga('create', 'UA-28562498-17', 'auto');  // <------- Put your Google Analytics ID here!
            ga('send', 'pageview');
        }
    });
}