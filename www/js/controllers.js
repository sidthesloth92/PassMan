angular.module('PassMan.controllers', [])
    .controller('UnlockController', ['$scope', '$utilityFunctions', '$state', '$rootScope', 'UnlockFactory', function ($scope, $utilityFunctions, $state, $rootScope, UnlockFactory) {
        $scope.isPINSet = false;
        $scope.pinForm = {
            pin: '',
            confirmPin: ''
        };
        $scope.loginPIN = "";

        $scope.$on('$ionicView.beforeEnter', function () {
            var isPINSet = $utilityFunctions.localStorage.getItem('isPINSet');

            if (isPINSet === "false") {
                $scope.isPINSet = false;
            }
            else {
                $scope.isPINSet = true;
            }
        });

        $scope.checkPin = function (pinValue) {
            if (pinValue && pinValue.length == 4) {
                UnlockFactory.checkPIN(pinValue).then(function (result) {
                    if (result) {
                        $rootScope.masterPIN = pinValue;
                        $state.go('main_list');
                    }
                }, function (error) {
                    $utilityFunctions.showAlert('Error', 'Sorry some error occurred');
                });
            }
        };

        $scope.pinSettingFormSubmission = function (form) {

            UnlockFactory.pinSettingFormSubmission($scope.pinForm.pin, $scope.pinForm.confirmPin).then(function (result) {
                $scope.isPINSet = true;
                $scope.pinForm.pin = "";
                $scope.pinForm.confirmPin = "";
            }, function (error) {
                $scope.isPINSet = false;
                $scope.pinForm.pin = "";
                $scope.pinForm.confirmPin = "";
            });

        };
    }])
    .controller('MainListController', ['$scope', '$rootScope', 'MainListFactory', '$utilityFunctions', function ($scope, $rootScope, MainListFactory, $utilityFunctions) {

        $scope.$on('$ionicView.beforeEnter', function () {
            $rootScope.itemList = [];
            MainListFactory.loadList($rootScope.masterPIN).then(function (itemList) {
                $rootScope.itemList = itemList;
                console.log($rootScope.itemList);
            });

        });

        $scope.$on('$ionicView.beforeLeave', function () {
            console.log("exited");
        });

        $scope.toggleItemShown = function (item) {
            if ($scope.isItemShown(item)) {
                $scope.itemShown = null;
            }
            else {
                $scope.itemShown = item;
            }
        };

        $scope.isItemShown = function (item) {
            return $scope.itemShown === item;
        };

        $scope.deleteEntry = function (eid) {

            $utilityFunctions.showConfirm("Confirm Delete", "Are you sure you want to delete the item?").then(function () {
                MainListFactory.deleteEntry(eid).then(function () {
                    for (var i = 0; i < $rootScope.itemList.length; i++) {
                        if ($rootScope.itemList[i].eid == eid) {
                            $rootScope.itemList.splice(i, 1);
                            break;
                        }
                    }
                    $utilityFunctions.showAlert("Item Deleted", "Item successfully deleted");
                },
                function () {
                    $utilityFunctions.showAlert("Error", "Error while deleting. Please try again");
                });
            }, function () {
            });
        };

    }])
    .controller('AddItemController', ['$scope', '$rootScope', '$stateParams', '$state', 'AddItemFactory', '$utilityFunctions', function ($scope, $rootScope, $stateParams, $state, AddItemFactory, $utilityFunctions) {

        $scope.addItem = {
            eid: '',
            title: '',
            username: '',
            password: ''
        };

        $scope.action = "";

        $scope.$on('$ionicView.beforeEnter', function () {
            console.dir($stateParams);
            var action = $stateParams.action;

            if (action === "edit") {
                //get entry from db and set the item

                AddItemFactory.retrieveEntry($stateParams.eid, $rootScope.masterPIN).then(function (result) {
                    console.log(" item retrieved successfully");
                    console.dir(result);
                    $scope.addItem.eid = result.eid;
                    $scope.addItem.title = result.title;
                    $scope.addItem.username = result.username;
                    $scope.addItem.password = result.password;
                }, function (error) {
                    $utilityFunctions.showAlert("Error", "Entry retrieval failed");
                    console.dir($state);
                });
            }

            $scope.action = action;
        });


        $scope.addItemFormSubmit = function (form) {
            console.dir(form);
            console.log($scope.action + " " + $scope.addItem.eid.length);
            console.dir($scope.addItem);
            if ($scope.action === "add") {
                AddItemFactory.addItemFormSubmit($scope.addItem, $rootScope.masterPIN).then(function (result) {
                    $utilityFunctions.showAlert("Entry Added", "Entry Added Successfully");
                    $scope.resetAddItemForm();
                }, function (error) {
                    $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
                });
            }
            else if ($scope.action === "edit" && $scope.addItem.eid) {

                AddItemFactory.editItemFormSubmit($scope.addItem, $rootScope.masterPIN, $scope.addItem.eid).then(function (result) {
                    $utilityFunctions.showAlert("Entry Edited", "Entry Edit Success");
                }, function (error) {
                    $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
                });
            }
        };

        $scope.resetAddItemForm = function () {
            $scope.addItem.title = '';
            $scope.addItem.username = '';
            $scope.addItem.password = '';
        };
    }]).controller('ChangePinController', ['$scope', '$rootScope', '$utilityFunctions', function($scope, $rootScope, $utilityFunctions) {

    }]);
