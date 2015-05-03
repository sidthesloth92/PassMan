/**
 * Created by 916804 on 03/05/15.
 */
angular.module('PassMan.utils', [])
    .provider('$utilityFunctions', [function () {
        return {
            localStorage: {
                setItem: function (key, value) {
                    window.localStorage.setItem(key, value);
                },
                getItem: function (key) {
                    return window.localStorage.getItem(key);
                },
                setObject: function (key, value) {
                    window.localStorage.setItem(key, JSON.stringify(value));
                },
                getObject: function (key) {
                    return JSON.parse(window.localStorage.getItem(key));
                }
            },
            $get: ['$ionicPopup', function ($ionicPopup) {
                return {
                    localStorage: {
                        setItem: function (key, value) {
                            window.localStorage.setItem(key, value);
                        },
                        getItem: function (key) {
                            return window.localStorage.getItem(key);
                        },
                        setObject: function (key, value) {
                            window.localStorage.setItem(key, JSON.stringify(value));
                        },
                        getObject: function (key) {
                            return JSON.parse(window.localStorage.getItem(key));
                        },
                    },
                    showAlert: function (title, template) {
                        $ionicPopup.alert({
                            title: title,
                            template: template
                        });
                    }

                };
            }]
        }
    }]);
