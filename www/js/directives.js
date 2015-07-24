angular.module('PassMan.directives', []).directive('bottomMenu', ['$state', '$log', function ($state, $log) {
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/bottom_menu.html',
        scope: {},
        link: function (scope, element, attr) {
            scope.menuItems = [{
                label: 'Change Master PIN',
                click: function () {
                    $state.go('change_pin');
                }
            }];

            scope.isShown = false;

            scope.toggleShow = function () {
                $log.debug('directives.bottomMenu.toggleShow: start');
                
                scope.isShown = !scope.isShown;
                document.querySelector('.slide_up_button').classList.toggle('slide_up_button_display');
                document.querySelector('.custom_bottom_menu_overlay').classList.toggle('custom_bottom_menu_overlay_stretch');
                
                $log.debug('directives.bottomMenu.toggleShow: end');
            };

            scope.handleMenuItemSelect = function (index) {
                $log.debug('directives.bottomMenu.handleMenuItemSelect: start');

                $log.debug('directives.bottomMenu.handleMenuItemSelect: Index: ' + index);
                scope.toggleShow();
                scope.menuItems[index].click();
                
                $log.debug('directives.bottomMenu.handleMenuItemSelect: end');
            };
        }
    };
}]);