angular.module('PassMan.services', [])
    .factory('UnlockFactory', ['$utilityFunctions', '$q', '$log', function ($utilityFunctions, $q, $log) {
        return {

            checkPIN: function (pinValue) {
                $log.debug('UnlockFactory.checkPIN: start');

                var deferred = $q.defer();
                $utilityFunctions.DB.retrieveMasterPIN().then(function (result) {

                    if (result.length > 0) {
                        var encryptedPIN = result.item(0).password;
                        var decryptedPIN = $utilityFunctions.CRYPT.decrypt(encryptedPIN, pinValue);
                        
                        if (pinValue === decryptedPIN) {
                            $log.debug('UnlockFactory.checkPIN: Master PIN Matches');
                            deferred.resolve(true);
                        }
                        else {
                            $log.debug('UnlockFactory.checkPIN: Master PIN did not match');
                            deferred.resolve(false);
                        }
                    }
                }, function (error) {
                    $log.error('UnlockFactory.checkPIN: Error retrieving PIN: ' + error);
                    deferred.reject();
                });

                $log.debug('UnlockFactory.checkPIN: end');
                return deferred.promise;
            },
            pinSettingFormSubmission: function (initialPIN, confirmPIN) {
                $log.debug('UnlockFactory.pinSettingFormSubmission: start');

                var deferred = $q.defer();
                
                var encryptedText = $utilityFunctions.CRYPT.encrypt(initialPIN, initialPIN);
            
                if (encryptedText) {
                    $utilityFunctions.DB.insertMasterPIN(encryptedText).then(function (result) {
                        $utilityFunctions.localStorage.setItem('isPINSet', true);
                        $utilityFunctions.showAlert('Success', "You have set the Master Pin. Use it to login.");
                        deferred.resolve();
                    }, function (result) {
                        $log.error('UnlockFactory.pinSettingFormSubmission: error');
                        $utilityFunctions.showAlert('Failed', "Some error has occurred. Please try again.");
                        deferred.reject();
                    });
                }
                else {
                    $log.error('UnlockFactory.pinSettingFormSubmission: error');
                    $utilityFunctions.showAlert('Failed', "Some error has occurred. Please try again.");
                    deferred.reject();
                }

                $log.debug('UnlockFactory.pinSettingFormSubmission: end');
                return deferred.promise;
            }
        };
    }])
    .factory('MainListFactory', ['$utilityFunctions', '$q', '$log', function ($utilityFunctions, $q, $log) {
        return {
            loadList: function (key) {
                $log.debug('MainListFactory.loadList: start');
                var deferred = $q.defer();
                var itemList = [];

                $utilityFunctions.DB.retrieveEntries().then(function (result) {
                    $log.debug('MainListFactory.loadList: list retrieved from DB successfully');
                    for (var i = 0; i < result.length; i++) {
                        var newItem = {};
                        var currentItem = result.item(i);

                        newItem.eid = currentItem.eid;
                        newItem.title = currentItem.entry_title;
                        newItem.username = currentItem.entry_username;
                        newItem.password = currentItem.entry_password;
                        newItem.hide = true;

                        itemList.push(newItem);
                    }

                    deferred.resolve(itemList);
                }, function (error) {
                    $log.error('MainListFactory.loadList: Error retrieving list: ' + error);
                    deferred.resolve(itemList);
                });
                $log.debug('MainListFactory.loadList: end');
                return deferred.promise;
            },
            deleteEntry : function(eid) {
                $log.debug('MainListFactory.deleteEntry: start');
                var deferred = $q.defer();

                $utilityFunctions.DB.deleteEntry(eid).then(function() {
                    $log.debug('MainListFactory.loadList: deleted successfully');
                    deferred.resolve();
                }, function() {
                    $log.error('MainListFactory.loadList: delete failed');
                    deferred.reject();
                });
                $log.debug('MainListFactory.deleteEntry: end');
                return deferred.promise;
            }
        };
    }])
    .factory('AddItemFactory', ['$utilityFunctions', '$q', '$log', function ($utilityFunctions, $q, $log) {
        return {
            addItemFormSubmit: function (item, key) {
                $log.debug('AddItemFactory.addItemFormSubmit: start');
                var deferred = $q.defer();

                var encryptedTitle = $utilityFunctions.CRYPT.encrypt(item.title, key);
                var encryptedUsername = $utilityFunctions.CRYPT.encrypt(item.username, key);
                var encryptedPassword = $utilityFunctions.CRYPT.encrypt(item.password, key);

                $utilityFunctions.DB.insertEntry(encryptedTitle, encryptedUsername, encryptedPassword).then(function (result) {
                    $log.debug('AddItemFactory.addItemFormSubmit: Item successfully inserted into DB');
                    deferred.resolve();
                }, function (error) {
                    $log.error('AddItemFactory.addItemFormSubmit: Error: ' + error);
                    deferred.reject();
                });
                $log.debug('AddItemFactory.addItemFormSubmit: end');
                return deferred.promise;
            },
            editItemFormSubmit : function(item, key, eid) {
                $log.debug('AddItemFactory.editItemFormSubmit: start');
                var deferred = $q.defer();

                var encryptedTitle = $utilityFunctions.CRYPT.encrypt(item.title, key);
                var encryptedUsername = $utilityFunctions.CRYPT.encrypt(item.username, key);
                var encryptedPassword = $utilityFunctions.CRYPT.encrypt(item.password, key);

                $utilityFunctions.DB.editEntry(encryptedTitle, encryptedUsername, encryptedPassword, eid).then(function (result) {
                    $log.debug('AddItemFactory.editItemFormSubmit: Item updated successfully in the DB');
                    deferred.resolve();
                }, function (error) {
                    $log.error('AddItemFactory.editItemFormSubmit: Error: ' + error);
                    deferred.reject();
                });
                $log.debug('AddItemFactory.editItemFormSubmit: end');
                return deferred.promise;
            },
            retrieveEntry : function(eid, key) {
                $log.debug('AddItemFactory.retrieveEntry: start');
                var deferred = $q.defer();

                $utilityFunctions.DB.retrieveEntry(eid).then(function(result) {
                    if(result.length > 0) {
                        var returnedItem = result.item(0);
                        var item = {};
                        item.eid = returnedItem.eid;
                        item.title = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_title, key);
                        item.username = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_username, key);
                        item.password = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_password, key);
                        $log.debug('AddItemFactory.retrieveEntry: Successfully retrieved entry from DB ');
                        deferred.resolve(item);
                    }
                    else {
                        $log.error('AddItemFactory.retrieveEntry: Error while retrieving entry from DB: ');
                        deferred.reject();
                    }
                }, function (error) {
                    $log.debug('AddItemFactory.retrieveEntry: Error while retrieving entry from DB: ' + error);
                    deferred.reject();
                });
                $log.debug('AddItemFactory.retrieveEntry: end');
                return deferred.promise;
            },
            deleteEntry : function() {
                $log.debug('AddItemFactory.deleteEntry: start');
                var deferred = $q.defer();

                $utilityFunctions.DB.deleteEntry(eid).then(function(result) {
                    if(result.length > 0) {
                        var returnedItem = result.item(0);
                        var item = {};
                        item.eid = returnedItem.eid;
                        item.title = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_title, key);
                        item.username = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_username, key);
                        item.password = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_password, key);
                        $log.debug('AddItemFactory.deleteEntry: Entry deleted from DB');
                        deferred.resolve(item);
                    }
                    else {
                        $log.debug('AddItemFactory.deleteEntry: some error orccurred while deletion. Length returned was zero');
                        deferred.reject();
                    }
                }, function (error) {
                    $log.debug('AddItemFactory.deleteEntry: Error while deletion: ' + error);
                    deferred.reject();
                });
                $log.debug('AddItemFactory.deleteEntry: end');
                return deferred.promise;
            }
        };
    }])
    .factory('ChangePinFactory', ['$utilityFunctions', '$q', '$log', function($utilityFunctions, $q, $log) {
        return {
            changePinFormSubmit : function(oldPin, newPin, confirmPin) {
                $log.debug('ChangePinFactory.changePinFormSubmit: start');
                var deferred = $q.defer();

                $log.debug('ChangePinFactory.changePinFormSubmit: Getting Entries');
                deferred.notify("Getting Entries");
                $utilityFunctions.DB.retrieveEntries().then(function (result) {
                    itemList = [];
                    for (var i = 0; i < result.length; i++) {
                        var newItem = {};
                        var currentItem = result.item(i);

                        newItem.eid = currentItem.eid;

                        var decryptedTitle = $utilityFunctions.CRYPT.decrypt(currentItem.entry_title, oldPin);
                        newItem.title = $utilityFunctions.CRYPT.encrypt(decryptedTitle, newPin);
                        var decryptedUsername = $utilityFunctions.CRYPT.decrypt(currentItem.entry_username, oldPin);
                        newItem.username = $utilityFunctions.CRYPT.encrypt(decryptedUsername, newPin);
                        var decryptedPassword = $utilityFunctions.CRYPT.decrypt(currentItem.entry_password, oldPin);
                        newItem.password = $utilityFunctions.CRYPT.encrypt(decryptedPassword, newPin);

                        itemList.push(newItem);
                    }

                    $log.debug('ChangePinFactory.changePinFormSubmit: Re-encrypting entries');
                    var updates = [];
                    for(var i = 0 ; i < itemList.length; i++) {
                        updates.push($utilityFunctions.DB.editEntry(itemList[i].title, itemList[i].username, itemList[i].password, itemList[i].eid));
                    }

                    $q.all(updates).then(function(result) {
                        $log.debug('ChangePinFactory.changePinFormSubmit: All rows re-encrypted successfully');
                        deferred.resolve();
                    }, function(error) {
                        $log.error('ChangePinFactory.changePinFormSubmit: Error: ' + error);
                        deferred.reject();
                    });

                }, function (error) {
                    $log.error('ChangePinFactory.changePinFormSubmit: Error: ' + error);
                    deferred.reject();
                });
                $log.debug('ChangePinFactory.changePinFormSubmit: end');
                return deferred.promise;
            },
            updateMasterPIN : function(newPIN, key) {
                $log.debug('ChangePinFactory.updateMasterPIN: start');
                var deferred = $q.defer();


                var encryptedPIN = $utilityFunctions.CRYPT.encrypt(newPIN, key);
                $utilityFunctions.DB.updateMasterPIN(encryptedPIN).then(function(result) {
                    $log.debug('ChangePinFactory.updateMasterPIN: Master PIN updated');
                    deferred.resolve();
                }, function(error) {
                    $log.debug('ChangePinFactory.updateMasterPIN: Error' + error);
                    deferred.reject();
                });
                $log.debug('ChangePinFactory.updateMasterPIN: end');
                return deferred.promise;
            }
        };
    }]);
