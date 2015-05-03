angular.module('PassMan.services', [])
    .factory('UnlockFactory', ['$utilityFunctions', function ($utilityFunctions) {
        return {

            checkPIN : function(pinValue) {
                var hashedPIN = $utilityFunctions.localStorage.getItem('masterPIN');
                if(Sha256.hash(pinValue) === $utilityFunctions.localStorage.getItem('masterPIN')) {
                    return true;
                }
                else {
                    return false;
                }
            },
            pinSettingFormSubmission : function(initialPIN, confirmPIN) {

                if(initialPIN === confirmPIN) {
                    $utilityFunctions.localStorage.setItem('isPINSet', true);
                    $utilityFunctions.localStorage.setItem('masterPIN', Sha256.hash(initialPIN));
                    $utilityFunctions.showAlert('Success', "You have set the Master Pin. Use it to login.")
                    return true;
                }
                else {
                    $utilityFunctions.showAlert('Retry', "The PIN's do not match");
                    return false;
                }
            }
        };
    }])
    .factory('MainListFactory', [function () {
        return {};
    }])
    .factory('AddItemFactory', [function () {
        return {};
    }]);
