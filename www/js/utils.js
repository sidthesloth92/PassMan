/**
 * Created by 916804 on 03/05/15.
 */
angular.module('PassMan.utils', [])
    .provider('$utilityFunctions', [function() {
        dbName = '';
        db = '';
        return {
            DB: {
                config: function(name) {
                    dbName = name;
                }
            },
            $get: ['$ionicPopup', '$q', '$ionicHistory', '$rootScope', '$state', '$interval', '$log', function($ionicPopup, $q, $ionicHistory, $rootScope, $state, $interval, $log) {
                return {
                    deviceReady: function() {
                        document.addEventListener("pause", function() {
                            $log.debug("deviceReady: App paused: start");
                            $state.go('unlock');
                            $ionicHistory.clearHistory();
                            $rootScope.masterPIN = '';
                            $log.debug("deviceReady: App paused: end");
                        }, false);
                        document.addEventListener("resume", function() {
                            $log.debug("deviceReady: App resumed: start");
                            $log.debug("deviceReady: App resumed: end");
                        }, false);
                    },
                    localStorage: {
                        setItem: function(key, value) {
                            window.localStorage.setItem(key, value);
                        },
                        getItem: function(key) {
                            return window.localStorage.getItem(key);
                        },
                        setObject: function(key, value) {
                            window.localStorage.setItem(key, JSON.stringify(value));
                        },
                        getObject: function(key) {
                            return JSON.parse(window.localStorage.getItem(key));
                        }
                    },
                    showAlert: function(title, template) {
                        $ionicPopup.alert({
                            title: title,
                            template: template
                        });
                    },
                    showConfirm: function(title, template) {
                        var deferred = $q.defer();
                        $ionicPopup.alert({
                            title: title,
                            template: template,
                            buttons: [{
                                text: 'Delete',
                                onTap: function() {
                                    deferred.resolve();
                                }
                            }, {
                                text: 'Cancel',
                                onTap: function() {
                                    deferred.reject();
                                }
                            }]
                        });
                        return deferred.promise;
                    },
                    DB: {
                        create: function() {
                            $log.debug("utils.DB.create start");
                            if (window.sqlitePlugin) {
                                $log.debug("utils.DB: sqlitePlugin is present");
                                db = window.sqlitePlugin.openDatabase({
                                    name: dbName,
                                    location: 2,
                                    androidDatabaseImplementation: 2,
                                    androidLockWorkaround: 1
                                });
                            } else {
                                $log.debug('utils.DB: window.sqlitePlugin is not present');
                                db = openDatabase(dbName, '1.0', 'PassMan DB', 2 * 1024 * 1024);
                            }
                            $log.debug("utils.DB.create end");
                        },
                        createTables: function() {
                            $log.debug("utils.DB.createTables start");
                            db.transaction(function(tx) {
                                // tx.executeSql("DROP TABLE IF EXISTS TABLE_MASTER_PASS");
                                // tx.executeSql("DROP TABLE IF EXISTS TABLE_ENTRY");
                                // console.log("Tables deleted successfully");

                                tx.executeSql("CREATE TABLE IF NOT EXISTS TABLE_MASTER_PASS (id integer primary key, password text)");
                                tx.executeSql("CREATE TABLE IF NOT EXISTS TABLE_ENTRY (eid integer primary key, entry_title text, entry_username text, entry_password text)");
                                $log.debug('utils.DB.createTables: Tables created successfully');
                            });
                            $log.debug("utils.DB.createTables end");
                        },
                        insertMasterPIN: function(pin) {
                            $log.debug("utils.DB.insertMasterPIN start");
                            var deferred = $q.defer();
                            db.transaction(function(tx) {
                                tx.executeSql("INSERT INTO TABLE_MASTER_PASS (password) values(?)", [pin], function(tx, result) {
                                    $log.debug("utils.insertMasterPinMaster Password inserted with row Id: " + result.insertId);
                                    deferred.resolve();
                                }, function(tx, error) {
                                    $log.debug("utils.DB.insertMasterPINMaster password insertion failed: " + error);
                                    deferred.reject();
                                });
                            });
                            $log.debug("utils.DB.insertMasterPIN end");
                            return deferred.promise;
                        },
                        retrieveMasterPIN: function() {
                            var deferred = $q.defer();
                            $log.debug("utils.DB.retrieveMasterPIN start");
                            db.transaction(function(tx) {
                                tx.executeSql("SELECT password as password FROM TABLE_MASTER_PASS WHERE id = ?", [1], function(tx, result) {
                                    $log.debug("utils.DB.retrieveMasterPIN: Getting master pass from database success");
                                    deferred.resolve(result.rows);
                                }, function(tx, error) {
                                    $log.error("utils.DB.retrieveMasterPIN: Getting master pass from database failed" + error);
                                    deferred.reject();
                                });
                            });
                            $log.debug("utils.DB.retrieveMasterPIN end");
                            return deferred.promise;
                        },
                        updateMasterPIN: function(newPin) {
                            $log.debug("utils.DB.updateMasterPIN start");
                            var deferred = $q.defer();

                            db.transaction(function(tx) {
                                tx.executeSql("UPDATE TABLE_MASTER_PASS SET password = ? where id = 1", [newPin], function(tx, result) {
                                    $log.debug("utils.DB.updateMasterPIN: Master PIN updated successfully");
                                    deferred.resolve();
                                }, function(tx, error) {
                                    $log.error("utils.DB.updateMasterPIN: Error: " + error);
                                    deferred.reject();
                                })
                            });
                            $log.debug("utils.DB.updateMasterPIN end");
                            return deferred.promise;
                        },
                        insertEntry: function(title, username, password) {
                            $log.debug("utils.DB.insertEntry start");
                            var deferred = $q.defer();

                            db.transaction(function(tx) {
                                tx.executeSql("INSERT INTO TABLE_ENTRY (entry_title, entry_username, entry_password) VALUES (?, ?, ?)", [title, username, password], function(tx, result) {
                                    $log.debug("utils.DB.insertEntry: Entry added with id :" + result.insertId);
                                    deferred.resolve();
                                }, function(tx, error) {
                                    $log.error("utils.DB.insertEntry: Error: insertion failed: " + error);
                                    deferred.reject();
                                });
                            });
                            $log.debug("utils.DB.insertEntry end");
                            return deferred.promise;
                        },
                        editEntry: function(title, username, password, eid) {
                            $log.debug("utils.DB.editEntry start");
                            var deferred = $q.defer();

                            db.transaction(function(tx) {
                                tx.executeSql("UPDATE TABLE_ENTRY SET entry_title = ? , entry_username = ?, entry_password = ? WHERE eid = ?", [title, username, password, eid], function(tx, result) {
                                    $log.debug("utils.DB.editEntry: Entry edited with id :" + result);
                                    deferred.resolve();
                                }, function(tx, error) {
                                    $log.error("utils.DB.editEntry: Error: " + error);
                                    deferred.reject();
                                });
                            });
                            $log.debug("utils.DB.editEntry end");
                            return deferred.promise;
                        },
                        retrieveEntries: function() {
                            $log.debug("utils.DB.retrieveEntries start");
                            var deferred = $q.defer();

                            db.transaction(function(tx) {
                                tx.executeSql("SELECT * FROM TABLE_ENTRY", [], function(tx, result) {
                                    $log.debug("utils.DB.retrieveEntries: Entries retrieved");
                                    deferred.resolve(result.rows);
                                }, function(error) {
                                    $log.error("utils.DB.retrieveEntries: Error:" + error);
                                    deferred.reject();
                                })
                            });
                            $log.debug("utils.DB.retrieveEntries end");
                            return deferred.promise;
                        },
                        retrieveEntry: function(eid) {
                            $log.debug("utils.DB.retrieveEntry start");
                            var deferred = $q.defer();

                            db.transaction(function(tx) {
                                tx.executeSql("SELECT * FROM TABLE_ENTRY WHERE eid = ?", [eid], function(tx, result) {
                                    $log.debug("utils.DB.retrieveEntry: Entries retireved");
                                    deferred.resolve(result.rows);
                                }, function(error) {
                                    $log.error("utils.DB.retrieveEntry: Error : " + error);
                                    deferred.reject();
                                })
                            });
                            $log.debug("utils.DB.retrieveEntry end");
                            return deferred.promise;
                        },
                        deleteEntry: function(eid) {
                            $log.debug("utils.DB.deleteEntry start");
                            var deferred = $q.defer();

                            db.transaction(function(tx) {
                                tx.executeSql("DELETE FROM TABLE_ENTRY WHERE eid = ?", [eid], function(tx, result) {
                                    $log.debug("utils.DB.deleteEntry: Entry deleted");
                                    deferred.resolve();
                                }, function(error) {
                                    $log.error("utils.DB.deleteEntry: Error: " + error);
                                    deferred.reject();
                                })
                            });
                            $log.debug("utils.DB.deleteEntry end");
                            return deferred.promise;
                        }
                    },
                    CRYPT: {
                        encrypt: function(plainText, key) {
                            var encryptedText;
                            $log.debug("Encryption Key: " + key);
                            encryptedText = CryptoJS.AES.encrypt(plainText, key);
                            return encryptedText.toString();
                        },
                        decrypt: function(encryptedText, key) {
                            var decryptedText = CryptoJS.AES.decrypt(encryptedText, key);
                            $log.debug("Decryption Key: " + key);
                            return decryptedText.toString(CryptoJS.enc.Utf8);
                        }
                    },
                    COMMON: {},
                    timeout: function() {
                        var interval = $interval(function() {
                            $rootScope.time++;
                            console.log($rootScope.time);
                            if ($rootScope.time == PassMan.TIME_OUT) {
                                $interval.cancel(interval);
                                console.dir(this);
                                $ionicPopup.alert({
                                    "title" : "Timeout", 
                                    "template" : "Your session has expired. Please try again."
                                });
                                $state.go('unlock');
                                $ionicHistory.clearHistory();
                            }
                        }, 1000);
                    }
                };
            }]
        }
    }]);
