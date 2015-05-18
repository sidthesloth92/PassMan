angular.module('PassMan.directives', []).directive('bottomMenu', ['$state', function($state) {
    return {
        restrict: 'E',
        templateUrl : 'templates/directives/bottom_menu.html',
        scope : {},
        link : function(scope, element, attr) {
            scope.menuItems = [{
                label : 'Change Master PIN',
                click : function() {
                    $state.go('change_pin');
                }
            }];

            scope.isShown = false;

            scope.toggleShow = function() {
                scope.isShown = !scope.isShown;
                document.getElementsByClassName('custom_bottom_menu_overlay')[0].classList.toggle('custom_bottom_menu_overlay_stretch');
            };

            scope.handleMenuItemSelect = function(index) {
                scope.toggleShow();
                scope.menuItems[index].click();
            };
        }
    };
}]);