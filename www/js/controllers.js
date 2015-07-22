angular.module('PassMan.controllers', [])
    .controller('UnlockController', ['$scope', '$utilityFunctions', '$state', '$rootScope', 'UnlockFactory', '$log', function($scope, $utilityFunctions, $state, $rootScope, UnlockFactory, $log) {
        $rootScope.isPINSet = false;
        $scope.pinForm = {
            pin: '',
            confirmPin: ''
        };
        $scope.loginForm = {
            loginPIN: ''
        };

        $scope.$on('$ionicView.beforeEnter', function() {
            $log.debug("UnlockController.beforeEnter start");
            var isPINSet = $utilityFunctions.localStorage.getItem('isPINSet');

            if (isPINSet === "false") {
                $rootScope.isPINSet = false;
            } else {
                $rootScope.isPINSet = true;
            }

            $scope.loginForm.loginPIN = '';

            $log.debug("UnlockController.beforeEnter end");
        });

        $scope.checkPin = function(pinValue) {
            $log.debug("UnlockController.checkPin start");
            if (pinValue && pinValue.length == 4) {
                UnlockFactory.checkPIN(pinValue).then(function(result) {
                    if (result) {
                        $log.debug("PIN matches");
                        $rootScope.masterPIN = pinValue;
                        $state.go('main_list');
                    } else {
                        $log.debug("PIN did not match");
                        $rootScope.masterPIN = '';
                    }
                }, function(error) {
                    $log.error("Error while checking PIN: " + error);
                    
                    $rootScope.masterPIN = '';
                    $utilityFunctions.showAlert('Error', 'Sorry some error occurred');
                });
            }
            $log.debug("UnlockController.checkPin end");
        };

        $scope.pinSettingFormSubmission = function(form) {
             $log.debug("UnlockController.pinSettingFormSubmission start");
             if(form.$valid) {
                if($scope.pinForm.pin === $scope.pinForm.confirmPin) {
                    UnlockFactory.pinSettingFormSubmission($scope.pinForm.pin, $scope.pinForm.confirmPin).then(function(result) {
                        $log.debug("Pin Changed Successfully");
                        
                        $rootScope.isPINSet = true;
                        $scope.pinForm.pin = "";
                        $scope.pinForm.confirmPin = "";
                    }, function(error) {
                        $log.error("Error while setting Master PIN: " + error);
                        
                        $rootScope.isPINSet = false;
                        $scope.pinForm.pin = "";
                        $scope.pinForm.confirmPin = "";
                    });
                }
            }
            $log.debug("UnlockController.pinSettingFormSubmission end");
        };
    }])
    .controller('MainListController', ['$scope', '$rootScope', 'MainListFactory', '$utilityFunctions', '$log', function($scope, $rootScope, MainListFactory, $utilityFunctions, $log) {
        $scope.searchTerm = {
            title: ''
        };

        $scope.$on('$ionicView.beforeEnter', function() {
            $log.debug('MainListController.beforeEnter: start');
            
            $rootScope.itemList = [];
            MainListFactory.loadList($rootScope.masterPIN).then(function(itemList) {
                $rootScope.itemList = itemList;
            });

            $log.debug('MainListController.afterEnter: end');
        });

        $scope.$on('$ionicView.beforeLeave', function() {
            $log.debug('MainListController.beforeLeave: start');
            $log.debug('MainListController.beforeLeave: end');
        });

        $scope.toggleItemShown = function(item) {
            $log.debug('MainListController.toggleItemShown: start');
            if ($scope.isItemShown(item)) {
                $scope.itemShown = null;
            } else {
                $scope.itemShown = item;
            }
            $log.debug('MainListController.toggleItemShown: end');
        };

        $scope.isItemShown = function(item) {
            return $scope.itemShown === item;
        };

        $scope.deleteEntry = function(eid) {
            $log.debug('MainListController.deleteEntry: start');
            
            $utilityFunctions.showConfirm("Confirm Delete", "Are you sure you want to delete the item?").then(function() {
                MainListFactory.deleteEntry(eid).then(function() {
                        $log.debug('MainListController.deleteEntry: deleting item from the list');
                        for (var i = 0; i < $rootScope.itemList.length; i++) {
                            if ($rootScope.itemList[i].eid == eid) {
                                $rootScope.itemList.splice(i, 1);
                                break;
                            }
                        }
                        $utilityFunctions.showAlert("Item Deleted", "Item successfully deleted");
                    },
                    function(error) {
                        $log.debug('MainListController.deleteEntry: Error: ' + error);
                        $utilityFunctions.showAlert("Error", "Error while deleting. Please try again");
                    });
            }, function() {});

            $log.debug('MainListController.deleteEntry: end');
        };
    }])
    .controller('AddItemController', ['$scope', '$rootScope', '$stateParams', '$state', 'AddItemFactory', '$utilityFunctions', '$log', function($scope, $rootScope, $stateParams, $state, AddItemFactory, $utilityFunctions, $log) {
        $scope.addItem = {
            eid: '',
            title: '',
            username: '',
            password: ''
        };

        $scope.action = "";

        $scope.$on('$ionicView.beforeEnter', function() {
            $log.debug('AddItemController.beforeEnter: start');

            var action = $stateParams.action;

            if (action === "edit") {
                //get entry from db and set the item

                AddItemFactory.retrieveEntry($stateParams.eid, $rootScope.masterPIN).then(function(result) {
                    $log.debug('AddItemController.beforeEnter: Item retrieved Successfully: ');
                    $log.debug(result);

                    $scope.addItem.eid = result.eid;
                    $scope.addItem.title = result.title;
                    $scope.addItem.username = result.username;
                    $scope.addItem.password = result.password;
                }, function(error) {
                    $log.debug('AddItemController.beforeEnter: Error: ' + error);
                    $utilityFunctions.showAlert("Error", "Entry retrieval failed");
                });
            }

            $scope.action = action;
            $log.debug('AddItemController.beforeEnter: end');
        });


        $scope.addItemFormSubmit = function(form) {
            $log.debug('AddItemController.addItemFormSubmit: start');

            if ($scope.action === "add") {
                $log.debug('AddItemController.addItemFormSubmit:  User Action: Add');
                AddItemFactory.addItemFormSubmit($scope.addItem, $rootScope.masterPIN).then(function(result) {
                    $log.debug('AddItemController.addItemFormSubmit: Entry added successfully');
                    $utilityFunctions.showAlert("Entry Added", "Entry Added Successfully");
                    $scope.resetAddItemForm(form);
                }, function(error) {
                    $log.debug('AddItemController.addItemFormSubmit: Add Error: ' + error);
                    $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
                });
            } else if ($scope.action === "edit" && $scope.addItem.eid) {
                $log.debug('AddItemController.addItemFormSubmit:  User Action: Edit');
                AddItemFactory.editItemFormSubmit($scope.addItem, $rootScope.masterPIN, $scope.addItem.eid).then(function(result) {
                    $log.debug('AddItemController.addItemFormSubmit: Entry edited successfully');
                    $utilityFunctions.showAlert("Entry Edited", "Entry Edit Success");
                }, function(error) {
                    $log.debug('AddItemController.addItemFormSubmit: Edit Error: ' + error);
                    $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
                });
            }

            $log.debug('AddItemController.addItemFormSubmit: end');
        };

        $scope.resetAddItemForm = function(form) {
            $log.debug('AddItemController.resetAddItemForm: start');

            $scope.addItem.title = '';
            $scope.addItem.username = '';
            $scope.addItem.password = '';
            form.$setPristine();

            $log.debug('AddItemController.resetAddItemForm: end');
        };
    }]).controller('ChangePinController', ['$scope', '$rootScope', '$ionicLoading', '$utilityFunctions', 'UnlockFactory', 'ChangePinFactory', '$log', function($scope, $rootScope, $ionicLoading, $utilityFunctions, UnlockFactory, ChangePinFactory, $log) {

        $scope.changePinForm = {
            oldPin: '',
            newPin: '',
            confirmPin: ''
        };

        $scope.fieldsEnabled = false;


        $scope.checkPin = function(pinValue) {
            $log.debug('ChangePinController.checkPin: start');

            if (pinValue) {
                $log.debug('ChangePinController.checkPin: PINValue: ' + pinValue);
                UnlockFactory.checkPIN(pinValue).then(function(result) {
                    if (result) {
                        $log.debug('ChangePinController.checkPin: success');
                        $scope.fieldsEnabled = true;
                    } else {
                        $log.debug('ChangePinController.checkPin: failed');
                        $scope.fieldsEnabled = false;
                    }
                }, function(error) {
                    $log.debug('ChangePinController.checkPin: error' + error);
                    $utilityFunctions.showAlert('Error', 'Sorry some error occurred');
                });
            }

            $log.debug('ChangePinController.checkPin: end');
        };

        $scope.pinChangingFormSubmission = function(pinChangingForm) {
            $log.debug('ChangePinController.pinChangingFormSubmission: start');

            if(pinChangingForm.$valid) {
                if($scope.changePinForm.newPin === $scope.changePinForm.confirmPin) {
                    
                    ChangePinFactory.changePinFormSubmit($rootScope.masterPIN, $scope.changePinForm.newPin, $scope.changePinForm.confirmPin).then(function(result) {
                        ChangePinFactory.updateMasterPIN($scope.changePinForm.newPin, $scope.changePinForm.newPin).then(function(result) {
                            $log.debug('ChangePinController.pinChangingFormSubmission: Pin changed successfully');
                            $rootScope.masterPIN = $scope.changePinForm.newPin;
                            $scope.clearPinChangingForm();

                            pinChangingForm.$setPristine();
                            $utilityFunctions.showAlert("PIN Updated", "You have successfully updated the master PIN.");
                        }, function(error) {
                            $log.debug('ChangePinController.pinChangingFormSubmission: Error while updating PIN: ' + error);
                        });

                        $ionicLoading.hide();
                    }, function(error) {
                        $log.debug('ChangePinController.pinChangingFormSubmission: Error in changePINFormSubmit: ' + error);
                    }, function(notifyMessage) {
                        $ionicLoading.show({
                            template: '<h3>' + notifyMessage + '</h3><ion-spinner icon="ripple"></ion-spinner>',
                            noBackdrop: true
                        });
                    });
                }
            }

            $log.debug('ChangePinController.pinChangingFormSubmission: end');
        }

        $scope.clearPinChangingForm = function() {
            $log.debug('ChangePinController.clearPinChangingForm: start');

            $scope.changePinForm.oldPin = '';
            $scope.changePinForm.newPin = '';
            $scope.changePinForm.confirmPin = '';

            $log.debug('ChangePinController.clearPinChangingForm: end');
        }
    }]);
