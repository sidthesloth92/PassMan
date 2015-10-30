angular.module('PassMan.controllers', [])
    .controller('UnlockController', ['$scope', '$utilityFunctions', '$state', '$rootScope', '$timeout', '$cordovaVibration', 'UnlockFactory', '$log', function($scope, $utilityFunctions, $state, $rootScope, $timeout, $cordovaVibration, UnlockFactory, $log) {
        $rootScope.isPINSet = false;

        $scope.pinElements = {
            pin: '',
            confirmPin: '',
            loginPin: ''
        }
        $scope.active = "";

        $scope.$on('$ionicView.beforeEnter', function() {
            $log.debug("UnlockController.beforeEnter start");
            var isPINSet = $utilityFunctions.localStorage.getItem('isPINSet');

            if (isPINSet === "false") {
                $rootScope.isPINSet = false;
                $scope.active = "pin";
            } else {
                $rootScope.isPINSet = true;
                $scope.active = "loginPin";
            }

            $scope.pinElements.pin = '';
            $scope.pinElements.confirmPin = '';
            $scope.pinElements.loginPin = '';

            $log.debug("UnlockController.beforeEnter end");
        });

        $scope.setMasterPin = function() {
            UnlockFactory.pinSettingFormSubmission($scope.pinElements.pin, $scope.pinElements.confirmPin).then(function(result) {
                $log.debug("Pin Changed Successfully");

                $rootScope.isPINSet = true;
                $scope.pinElements.pin = "";
                $scope.pinElements.confirmPin = "";
                $scope.active = "loginPin";
            }, function(error) {
                $log.error("Error while setting Master PIN: " + error);

                $rootScope.isPINSet = false;
                $scope.pinElements.pin = "";
                $scope.pinElements.confirmPin = "";
            });
        }

        $scope.checkPin = function() {
            $log.debug("UnlockController.checkPin start");

            UnlockFactory.checkPIN($scope.pinElements.loginPin).then(function(result) {
                if (result) {
                    $log.debug("PIN matches");

                    $timeout(function() {
                        $rootScope.masterPIN = $scope.pinElements.loginPin;
                        $scope.pinElements.loginPin = "";
                        $utilityFunctions.timeout();
                        $state.go('main_list');
                    }, 100);
                } else {
                    document.querySelector('.login_pin_indicator .bubble_wrapper').classList.add('shake');
                    $cordovaVibration.vibrate(100);
                    $timeout(function() {
                        $scope.pinElements.loginPin = '';
                        document.querySelector('.login_pin_indicator .bubble_wrapper').classList.remove('shake');
                    }, 1000);

                    $log.debug("PIN did not match");
                    $rootScope.masterPIN = '';
                }
            }, function(error) {
                $log.error("Error while checking PIN: " + error);

                $rootScope.masterPIN = '';
                $utilityFunctions.showAlert('Error', 'Sorry some error occurred');
            });

            $log.debug("UnlockController.checkPin end");
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
                        $log.error('MainListController.deleteEntry: Error: ' + error);
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
                    $log.error('AddItemController.beforeEnter: Error: ' + error);
                    $utilityFunctions.showAlert("Error", "Entry retrieval failed");
                });
            }

            $scope.action = action;
            $log.debug('AddItemController.beforeEnter: end');
        });


        $scope.addItemFormSubmit = function(addItemForm) {
            $log.debug('AddItemController.addItemFormSubmit: start');

            if (addItemForm.$valid) {
                if ($scope.action === "add") {
                    $log.debug('AddItemController.addItemFormSubmit:  User Action: Add');
                    AddItemFactory.addItemFormSubmit($scope.addItem, $rootScope.masterPIN).then(function(result) {
                        $log.debug('AddItemController.addItemFormSubmit: Entry added successfully');
                        $utilityFunctions.showAlert("Entry Added", "Entry Added Successfully");
                        $scope.resetAddItemForm(addItemForm);

                        $state.go('main_list');
                    }, function(error) {
                        $log.error('AddItemController.addItemFormSubmit: Add Error: ' + error);
                        $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
                    });
                } else if ($scope.action === "edit" && $scope.addItem.eid) {
                    $log.debug('AddItemController.addItemFormSubmit:  User Action: Edit');
                    AddItemFactory.editItemFormSubmit($scope.addItem, $rootScope.masterPIN, $scope.addItem.eid).then(function(result) {
                        $log.debug('AddItemController.addItemFormSubmit: Entry edited successfully');
                        $utilityFunctions.showAlert("Entry Edited", "Entry Edit Success");
                    }, function(error) {
                        $log.error('AddItemController.addItemFormSubmit: Edit Error: ' + error);
                        $utilityFunctions.showAlert("Error", "Some error occurred. Please try again.");
                    });
                }
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

        $scope.$on('$ionicView.beforeEnter', function() {
            $log.debug("ChangePinController.beforeEnter start");
            $scope.clearPinChangingForm();
            $scope.fieldsEnabled = false;
            $scope.wrongPin = false;
            $log.debug("ChangePinController.beforeEnter end");
        });


        $scope.checkPin = function(pinValue, pinChangingForm) {
            $log.debug('ChangePinController.checkPin: start');
            console.log('in hrere');
            if (pinValue) {
                $log.debug('ChangePinController.checkPin: PINValue: ' + pinValue);
                UnlockFactory.checkPIN(pinValue).then(function(result) {
                    if (result) {
                        $log.debug('ChangePinController.checkPin: success');
                        $scope.fieldsEnabled = true;
                        $scope.wrongPin = false;
                    } else {
                        $log.debug('ChangePinController.checkPin: failed');
                        $scope.fieldsEnabled = false;
                        $scope.changePinForm.newPin = '';
                        $scope.changePinForm.confirmPin = '';
                        pinChangingForm.newPin.$pristine = true;
                        pinChangingForm.confirmPin.$pristine = true;
                        $scope.wrongPin = true;
                    }
                }, function(error) {
                    $log.error('ChangePinController.checkPin: error' + error);
                    $utilityFunctions.showAlert('Error', 'Sorry some error occurred');
                });
            } else {
                $scope.fieldsEnabled = false;
                $scope.changePinForm.newPin = '';
                $scope.changePinForm.confirmPin = '';
                pinChangingForm.newPin.$pristine = true;
                pinChangingForm.confirmPin.$pristine = true;
                $scope.wrongPin = false;
            }

            $log.debug('ChangePinController.checkPin: end');
        };

        $scope.pinChangingFormSubmission = function(pinChangingForm) {
            $log.debug('ChangePinController.pinChangingFormSubmission: start');

            if (pinChangingForm.$valid) {
                if ($scope.changePinForm.newPin === $scope.changePinForm.confirmPin) {

                    ChangePinFactory.changePinFormSubmit($rootScope.masterPIN, $scope.changePinForm.newPin, $scope.changePinForm.confirmPin).then(function(result) {
                        ChangePinFactory.updateMasterPIN($scope.changePinForm.newPin, $scope.changePinForm.newPin).then(function(result) {
                            $log.debug('ChangePinController.pinChangingFormSubmission: Pin changed successfully');
                            $rootScope.masterPIN = $scope.changePinForm.newPin;
                            $scope.clearPinChangingForm();

                            pinChangingForm.$setPristine();
                            $utilityFunctions.showAlert("PIN Updated", "You have successfully updated the master PIN.");
                        }, function(error) {
                            $log.error('ChangePinController.pinChangingFormSubmission: Error while updating PIN: ' + error);
                        });

                        $ionicLoading.hide();
                    }, function(error) {
                        $log.error('ChangePinController.pinChangingFormSubmission: Error in changePINFormSubmit: ' + error);
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
