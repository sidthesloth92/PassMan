angular.module('PassMan.directives', []).directive('bottomMenu', ['$state', '$log', function($state, $log) {
        return {
            restrict: 'E',
            templateUrl: 'templates/directives/bottom_menu.html',
            scope: {},
            link: function(scope, element, attr) {
                scope.menuItems = [{
                    label: 'Change Master PIN',
                    click: function() {
                        $state.go('change_pin');
                    }
                }];

                scope.isShown = false;

                scope.toggleShow = function() {
                    $log.debug('directives.bottomMenu.toggleShow: start');

                    scope.isShown = !scope.isShown;
                    document.querySelector('.slide_up_button').classList.toggle('slide_up_button_display');
                    document.querySelector('.custom_bottom_menu_overlay').classList.toggle('custom_bottom_menu_overlay_stretch');

                    $log.debug('directives.bottomMenu.toggleShow: end');
                };

                scope.handleMenuItemSelect = function(index) {
                    $log.debug('directives.bottomMenu.handleMenuItemSelect: start');

                    $log.debug('directives.bottomMenu.handleMenuItemSelect: Index: ' + index);
                    scope.toggleShow();
                    scope.menuItems[index].click();

                    $log.debug('directives.bottomMenu.handleMenuItemSelect: end');
                };
            }
        };
    }])
    .directive('keypad', ['$timeout', '$cordovaVibration', function($timeout, $cordovaVibration) {
        return {
            restrict: 'E',
            templateUrl: 'templates/directives/keypad.html',
            scope: {
                pinElements: '=pinElements',
                active: '=active',
                setMasterPin: '&setMasterPin',
                checkPin: '&checkPin'
            },
            link: function(scope, element, attr) {
                scope.keyPressed = function(value) {
                    if (value === "c") {
                        if ((scope.active == "confirmPin") && (scope.pinElements[scope.active].length == 0)) {
                            scope.active = "pin";
                        }
                        scope.pinElements[scope.active] = "";
                    } else if (value === "d") {
                        if ((scope.active == "confirmPin") && (scope.pinElements[scope.active].length == 0)) {
                            scope.active = "pin";
                        }
                        scope.pinElements[scope.active] = scope.pinElements[scope.active].substr(0, (scope.pinElements[scope.active].length - 1));
                    } else {
                        if (scope.pinElements[scope.active].length < 4) {
                            scope.pinElements[scope.active] += value;
                        }

                        if (scope.active == "pin") {
                            if (scope.pinElements[scope.active].length == 4) {
                                scope.active = "confirmPin";
                            }
                        }
                    }

                    if (scope.active == "loginPin") {
                        if (scope.pinElements[scope.active].length == 4) {
                            scope.checkPin();
                        }
                    } else {
                        if ((scope.pinElements.pin.length == 4) && (scope.pinElements.confirmPin.length == 4)) {
                            if(scope.pinElements.pin === scope.pinElements.confirmPin) {
                                scope.setMasterPin();
                            }
                            else {
                                
                                document.querySelector('.pin_indicator .bubble_wrapper').classList.add('shake');
                                document.querySelector('.confirm_pin_indicator .bubble_wrapper').classList.add('shake');
                                $cordovaVibration.vibrate(100);
                                $timeout(function() {
                                    scope.pinElements.pin = "";
                                    scope.pinElements.confirmPin = "";
                                    document.querySelector('.pin_indicator .bubble_wrapper').classList.remove('shake');
                                    document.querySelector('.confirm_pin_indicator .bubble_wrapper').classList.remove('shake');
                                }, 1000)
                                scope.active = "pin";
                            }
                        }
                    }
                }
            }
        };
    }])
    .directive('keyIndicator', [function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                value: '=value'
            },
            templateUrl: 'templates/directives/key_indicator.html',
            link: function(scope, element, attr) {

            }
        }
    }]);
