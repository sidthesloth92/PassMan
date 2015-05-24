angular.module('PassMan.filters', [])
    .filter('decrypt', ['$rootScope', '$utilityFunctions', function ($rootScope, $utilityFunctions) {
        return function(input) {
            return $utilityFunctions.CRYPT.decrypt(input, $rootScope.masterPIN);
        }
    }])
    .filter('customSearchFilter', ['$rootScope', '$utilityFunctions', function($rootScope, $utilityFunctions) {
        return function(entries, searchTerm) {
            var returnArray = [];

            for(var i = 0; i < entries.length; i++) {
                var decryptedTitle =  $utilityFunctions.CRYPT.decrypt(entries[i].title, $rootScope.masterPIN);
                console.log(decryptedTitle);
                if(decryptedTitle.indexOf(searchTerm) !=  -1) {
                    returnArray.push(entries[i]);
                }
            }
            console.log('asfs');
            console.dir(returnArray);
            return returnArray;
        }
    }]);