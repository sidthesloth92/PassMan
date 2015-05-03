angular.module('PassMan.controllers', [])
    .controller('UnlockController', ['$scope', '$utilityFunctions', '$state', 'UnlockFactory',  function ($scope, $utilityFunctions, $state, UnlockFactory) {
        $scope.isPINSet = false;
        $scope.pinForm = {
            pin : '',
            confirmPin : ''
        };
        $scope.loginPIN = "";

        $scope.$on('$ionicView.beforeEnter', function() {
            var isPINSet = $utilityFunctions.localStorage.getItem('isPINSet');

            if(isPINSet === "false") {
                $scope.isPINSet = false;
            }
            else {
                $scope.isPINSet = true;
            }
        });

        $scope.checkPin = function(pinValue) {
            if(UnlockFactory.checkPIN(pinValue)) {
                $state.go('main_list');
            }
        };

        $scope.pinSettingFormSubmission = function(form) {
            $scope.isPINSet =  UnlockFactory.pinSettingFormSubmission($scope.pinForm.pin, $scope.pinForm.confirmPin);
        };
    }])
    .controller('MainListController', ['$scope', 'MainListFactory', function ($scope, MainListFactory) {

    }])
    .controller('AddItemController', ['$scope', 'AddItemFactory', function ($scope, AddItemFactory) {

    }]);
