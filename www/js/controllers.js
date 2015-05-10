angular.module('PassMan.controllers', [])
    .controller('UnlockController', ['$scope', '$utilityFunctions', '$state', '$rootScope', 'UnlockFactory',  function ($scope, $utilityFunctions, $state, $rootScope, UnlockFactory) {
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
            if(pinValue && pinValue.length == 4) {
                UnlockFactory.checkPIN(pinValue).then(function(result) {
                    if(result) {
                        $rootScope.masterPIN = pinValue;
                        $state.go('main_list');
                    }
                }, function(error) {
                    $utilityFunctions.showAlert('Error', 'Sorry some error occurred');
                });
            }
        };

        $scope.pinSettingFormSubmission = function(form) {

            UnlockFactory.pinSettingFormSubmission($scope.pinForm.pin, $scope.pinForm.confirmPin).then(function(result) {
                $scope.isPINSet = true;
                $scope.pinForm.pin = "";
                $scope.pinForm.confirmPin = "";
            }, function(error) {
                $scope.isPINSet = false;
                $scope.pinForm.pin = "";
                $scope.pinForm.confirmPin = "";
            });

        };
    }])
    .controller('MainListController', ['$scope', '$rootScope', 'MainListFactory', function ($scope, $rootScope, MainListFactory) {

        $scope.$on('$ionicView.beforeEnter', function() {
            $rootScope.itemList = [];
            MainListFactory.loadList($rootScope.masterPIN).then(function(itemList) {
                $rootScope.itemList = itemList;
                console.log($rootScope.itemList);
            });

        });

        $scope.$on('$ionicView.beforeLeave', function() {
            console.log("exited");
        });

        $scope.toggleItemShown = function(item) {
            if($scope.isItemShown(item)) {
                $scope.itemShown = null;
            }
            else {
                $scope.itemShown = item;
            }
        }

        $scope.isItemShown = function(item) {
            return $scope.itemShown === item;
        }

    }])
    .controller('AddItemController', ['$scope', '$rootScope', 'AddItemFactory', '$utilityFunctions', function ($scope, $rootScope, AddItemFactory, $utilityFunctions) {

        $scope.addItem =  {
            title : '',
            username : '',
            password : ''
        };

        $scope.addItemFormSubmit = function(form) {
            console.dir(form);
            AddItemFactory.addItemFormSubmit($scope.addItem, $rootScope.masterPIN).then(function(result){
                $utilityFunctions.showAlert("Entry Added", "Entry Added Successfully");
            }, function(error) {
                $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
            });
        }
    }]);
