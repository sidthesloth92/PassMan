angular.module('PassMan.services', [])
    .factory('UnlockFactory', ['$utilityFunctions', '$q', function ($utilityFunctions, $q) {
        return {

            checkPIN: function (pinValue) {
                var deferred = $q.defer();
                $utilityFunctions.DB.retrieveMasterPIN().then(function (result) {

                    if (result.length > 0) {
                        var encryptedPIN = result.item(0).password;
                        console.log(encryptedPIN);
                        var decryptedPIN = $utilityFunctions.CRYPT.decrypt(encryptedPIN, pinValue);
                        console.log(decryptedPIN);

                        if (pinValue === decryptedPIN) {
                            console.log("Master PIN matches");
                            deferred.resolve(true);
                        }
                        else {
                            deferred.resolve(false);
                        }
                    }
                }, function (error) {

                    console.log("Error retrieving PIN");
                    deferred.reject();
                });

                return deferred.promise;
            },
            pinSettingFormSubmission: function (initialPIN, confirmPIN) {
                var deferred = $q.defer();
                if (initialPIN === confirmPIN) {

                    var encryptedText = $utilityFunctions.CRYPT.encrypt(initialPIN, initialPIN);
                    console.log("while submissoin");
                    console.log(encryptedText);
                    if (encryptedText) {
                        $utilityFunctions.DB.insertMasterPIN(encryptedText).then(function (result) {
                            $utilityFunctions.localStorage.setItem('isPINSet', true);
                            //$utilityFunctions.localStorage.setItem('masterPIN', Sha256.hash(initialPIN));
                            $utilityFunctions.showAlert('Success', "You have set the Master Pin. Use it to login.");
                            deferred.resolve();
                        }, function (result) {
                            $utilityFunctions.showAlert('Failed', "Some error has occurred. Please try again.");
                            deferred.reject();
                        });
                    }
                    else {
                        $utilityFunctions.showAlert('Failed', "Some error has occurred. Please try again.");
                        deferred.reject();
                    }
                }
                else {
                    $utilityFunctions.showAlert('Retry', "The PIN's do not match");
                    deferred.reject();
                }
                return deferred.promise;
            }
        };
    }])
    .factory('MainListFactory', ['$utilityFunctions', '$q', function ($utilityFunctions, $q) {
        return {
            loadList: function (key) {
                var deferred = $q.defer();
                var itemList = [];

                $utilityFunctions.DB.retrieveEntries().then(function (result) {

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
                    console.log("Error retrieving List");
                    deferred.resolve(itemList);
                });

                return deferred.promise;
            },
            deleteEntry : function(eid) {
                var deferred = $q.defer();

                $utilityFunctions.DB.deleteEntry(eid).then(function() {
                    deferred.resolve();
                }, function() {
                    deferred.reject();
                });

                return deferred.promise;
            }
        };
    }])
    .factory('AddItemFactory', ['$utilityFunctions', '$q', function ($utilityFunctions, $q) {
        return {
            addItemFormSubmit: function (item, key) {
                var deferred = $q.defer();

                var encryptedTitle = $utilityFunctions.CRYPT.encrypt(item.title, key);
                var encryptedUsername = $utilityFunctions.CRYPT.encrypt(item.username, key);
                var encryptedPassword = $utilityFunctions.CRYPT.encrypt(item.password, key);

                $utilityFunctions.DB.insertEntry(encryptedTitle, encryptedUsername, encryptedPassword).then(function (result) {
                    deferred.resolve();
                }, function (error) {
                    deferred.reject();
                });

                return deferred.promise;
            },
            editItemFormSubmit : function(item, key, eid) {
                var deferred = $q.defer();

                var encryptedTitle = $utilityFunctions.CRYPT.encrypt(item.title, key);
                var encryptedUsername = $utilityFunctions.CRYPT.encrypt(item.username, key);
                var encryptedPassword = $utilityFunctions.CRYPT.encrypt(item.password, key);

                $utilityFunctions.DB.editEntry(encryptedTitle, encryptedUsername, encryptedPassword, eid).then(function (result) {
                    deferred.resolve();
                }, function (error) {
                    deferred.reject();
                });

                return deferred.promise;
            },
            retrieveEntry : function(eid, key) {
                var deferred = $q.defer();

                $utilityFunctions.DB.retrieveEntry(eid).then(function(result) {
                    if(result.length > 0) {
                        var returnedItem = result.item(0);
                        var item = {};
                        item.eid = returnedItem.eid;
                        item.title = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_title, key);
                        item.username = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_username, key);
                        item.password = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_password, key);
                        deferred.resolve(item);
                    }
                    else {
                        deferred.reject();
                    }
                }, function (error) {
                    deferred.reject();
                });

                return deferred.promise;
            },
            deleteEntry : function() {
                var deferred = $q.defer();

                $utilityFunctions.DB.deleteEntry(eid).then(function(result) {
                    if(result.length > 0) {
                        var returnedItem = result.item(0);
                        var item = {};
                        item.eid = returnedItem.eid;
                        item.title = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_title, key);
                        item.username = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_username, key);
                        item.password = $utilityFunctions.CRYPT.decrypt(returnedItem.entry_password, key);
                        deferred.resolve(item);
                    }
                    else {
                        deferred.reject();
                    }
                }, function (error) {
                    deferred.reject();
                });

                return deferred.promise;
            }
        };
    }])
    .factory('ChangePinFactory', ['$utilityFunctions', '$q', function($utilityFunctions, $q) {
        return {
            changePinFormSubmit : function(oldPin, newPin, confirmPin) {
                var deferred = $q.defer();

                if(newPin === confirmPin) {
                    deferred.notify("Getting Entries");
                    $utilityFunctions.DB.retrieveEntries().then(function (result) {
                        console.dir(result.item(0));
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
                        console.log("re-encrypted list");
                        console.log(itemList);

                        var updates = [];
                        for(var i = 0 ; i < itemList.length; i++) {
                            updates.push($utilityFunctions.DB.editEntry(itemList[i].title, itemList[i].username, itemList[i].password, itemList[i].eid));
                        }

                        $q.all(updates).then(function(result) {
                            console.log("all rows updated");
                            deferred.resolve();
                        }, function(error) {
                            console.log("error white updating rows");
                            console.dir(error);
                            deferred.reject();
                        });

                    }, function (error) {
                        console.log("Error retrieving List");
                        deferred.reject();
                    });
                }
                else {
                    $utilityFunctions.showAlert('Retry', "The PIN's do not match");
                    deferred.reject();
                }

                return deferred.promise;
            },
            updateMasterPIN : function(newPIN, key) {
                var deferred = $q.defer();


                var encryptedPIN = $utilityFunctions.CRYPT.encrypt(newPIN, key);
                $utilityFunctions.DB.updateMasterPIN(encryptedPIN).then(function(result) {
                    deferred.resolve();
                }, function(error) {
                    console.log(error);
                    deferred.reject();
                });

                return deferred.promise;
            }
        };
    }]);
