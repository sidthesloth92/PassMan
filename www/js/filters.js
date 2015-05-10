angular.module('PassMan.filters', [])
    .filter('decrypt', ['$rootScope', '$utilityFunctions', function ($rootScope, $utilityFunctions) {
        return function(input) {
            return $utilityFunctions.CRYPT.decrypt(input, $rootScope.masterPIN);
        }
    }]);