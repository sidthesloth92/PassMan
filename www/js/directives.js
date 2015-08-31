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
    .directive('keypad', [function() {
        return {
            restrict: 'E',
            templateUrl: 'templates/directives/keypad.html',
            scope: {
                pinElements: '=pinElements',
                active: '=active',
                setMasterPin: '&setMasterPin',
                checkPin : '&checkPin'
            },
            link: function(scope, element, attr) {
                scope.keyPressed = function(value) {
                    if (value === "c") {
                        scope.pinElements[scope.active] = "";
                    } else if (value === "d") {
                        scope.pinElements[scope.active] = scope.pinElements[scope.active].substr(0, (scope.pinElements[scope.active].length - 1));
                    } else {
                        if (scope.pinElements[scope.active].length < 4) {
                            scope.pinElements[scope.active] += value;
                        }
                    }

                    if (scope.active == "pin") {
                        if (scope.pinElements[scope.active].length == 4) {
                            scope.active = "confirmPin";
                        }
                    } else if (scope.active == "confirmPin") {
                        if (value == "d" && (scope.pinElements[scope.active].length == 0)) {
                            scope.active = "pin";
                        }
                    }


                    if (scope.active == "loginPin") {
                        if (scope.pinElements[scope.active].length == 4) {
                            scope.checkPin();
                        }
                    } else {
                        if ((scope.pinElements.pin.length == 4) && (scope.pinElements.confirmPin.length == 4) && (scope.pinElements.pin === scope.pinElements.confirmPin)) {
                            directiveScope = scope;
                            scope.setMasterPin();
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
