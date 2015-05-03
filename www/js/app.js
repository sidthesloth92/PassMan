// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('PassMan', ['ionic', 'PassMan.controllers', 'PassMan.services', 'PassMan.utils'])

    .run(['$ionicPlatform', function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

        });
    }])
    .config(['$stateProvider', '$urlRouterProvider', '$utilityFunctionsProvider', function ($stateProvider, $urlRouterProvider, $utilityFunctionsProvider) {
        console.log("config start");
        $stateProvider
            .state('unlock', {
                url: '/unlock',
                templateUrl: 'templates/unlock.html',
                controller: 'UnlockController'
            })
            .state('main_list', {
                url: '/main_list',
                templateUrl: 'templates/main_list.html',
                controller: 'MainListController'
            }).state('add_item', {
                url: '/add_item',
                templateUrl: 'templates/add_item.html',
                controller: 'AddItemController'
            }
        );

        $urlRouterProvider.otherwise('/unlock');

        //setting the initial PIN set value to false
        var isPINSet = $utilityFunctionsProvider.localStorage.getItem('isPINSet');

        if (isPINSet === null) {
            console.log("PIN not set. Setting to false");
            $utilityFunctionsProvider.localStorage.setItem('isPINSet', false);
        }

        console.log("config end");
    }]);
