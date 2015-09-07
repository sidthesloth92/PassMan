// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('PassMan', ['ionic', 'PassMan.controllers', 'PassMan.services', 'PassMan.filters', 'PassMan.directives', 'PassMan.utils', 'ngCordova'])

.run(['$ionicPlatform', '$utilityFunctions', '$rootScope', '$ionicConfig', '$log', function($ionicPlatform, $utilityFunctions, $rootScope, $ionicConfig, $log) {
        $ionicPlatform.ready(function() {
            $log.debug('run start');
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
                StatusBar.hide();
            }

            $log.debug('run end');
        });

        $ionicConfig.views.swipeBackEnabled(false);

        //creating the database
        $utilityFunctions.DB.create();
        $utilityFunctions.DB.createTables();

        //setting the initial PIN set value to false
        var isPINSet = $utilityFunctions.localStorage.getItem('isPINSet');

        if (isPINSet === null) {
            $log.debug("PIN not set. Setting to false");
            $utilityFunctions.localStorage.setItem('isPINSet', false);
        }

        $rootScope.masterPIN = '';
        $rootScope.itemList = [];
        $rootScope.time = 0;

        document.addEventListener('click', function() {
            $rootScope.time = 0;  
        })

        document.addEventListener('touch', function() {
            $rootScope.time = 0;
        });

        document.addEventListener('keyup', function() {
            $rootScope.time = 0;
        });

        document.addEventListener("deviceready", $utilityFunctions.deviceReady, false);
    }])
    .config(['$stateProvider', '$urlRouterProvider', '$utilityFunctionsProvider', '$compileProvider', '$logProvider', function($stateProvider, $urlRouterProvider, $utilityFunctionsProvider, $compileProvider, $logProvider) {
        $stateProvider
            .state('unlock', {
                cache : false,
                url: '/unlock',
                templateUrl: 'templates/pages/unlock.html',
                controller: 'UnlockController'
            })
            .state('main_list', {
                cache: false,
                url: '/main_list',
                templateUrl: 'templates/pages/main_list.html',
                controller: 'MainListController'
            }).state('add_item', {
                cache: false,
                url: '/add_item:action:eid',
                templateUrl: 'templates/pages/add_item.html',
                controller: 'AddItemController'
            }).state('change_pin', {
                cache: false,
                url: '/change_pin',
                templateUrl: 'templates/pages/change_pin.html',
                controller: 'ChangePinController'
            });
        $urlRouterProvider.otherwise('/unlock');

        $compileProvider.debugInfoEnabled(false);
        $logProvider.debugEnabled(false);

        $utilityFunctionsProvider.DB.config('PassMan.db');

    }]);
