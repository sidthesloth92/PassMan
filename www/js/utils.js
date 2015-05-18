/**
 * Created by 916804 on 03/05/15.
 */
angular.module('PassMan.utils', [])
    .provider('$utilityFunctions', [function () {
        dbName = '';
        db = '';
        return {
            DB: {
                config: function (name) {
                    dbName = name;
                    console.log(dbName);
                }
            },
            $get: ['$ionicPopup', '$q', function ($ionicPopup, $q) {
                return {
                    localStorage: {
                        setItem: function (key, value) {
                            window.localStorage.setItem(key, value);
                        },
                        getItem: function (key) {
                            return window.localStorage.getItem(key);
                        },
                        setObject: function (key, value) {
                            window.localStorage.setItem(key, JSON.stringify(value));
                        },
                        getObject: function (key) {
                            return JSON.parse(window.localStorage.getItem(key));
                        }
                    },
                    showAlert: function (title, template) {
                        $ionicPopup.alert({
                            title: title,
                            template: template
                        });
                    },
                    showConfirm: function (title, template) {
                        var deferred = $q.defer();
                        $ionicPopup.alert({
                            title: title,
                            template: template,
                            buttons: [
                                {
                                    text: 'Delete',
                                    onTap : function() {
                                        deferred.resolve();
                                    }
                                },
                                {
                                    text: 'Cancel',
                                    onTap : function() {
                                        deferred.reject();
                                    }
                                }
                            ]
                        });
                        return deferred.promise;
                    },
                    DB: {
                        create: function () {
                            if (window.sqlitePlugin) {
                                console.log('window.sqlitePlugin present');
                                db = window.sqlitePlugin.openDatabase({
                                    name: dbName,
                                    location: 2,
                                    androidDatabaseImplementation: 2,
                                    androidLockWorkaround: 1
                                });
                            }
                            else {
                                console.log('window.sqlitePlugin is not present');
                                db = openDatabase(dbName, '1.0', 'PassMan DB', 2 * 1024 * 1024);
                            }
                        },
                        createTables: function () {
                            db.transaction(function (tx) {
                                //tx.executeSql("DROP TABLE IF EXISTS TABLE_MASTER_PASS");
                                //tx.executeSql("DROP TABLE IF EXISTS TABLE_ENTRY");
                                //console.log("Tables deleted successfully");

                                tx.executeSql("CREATE TABLE IF NOT EXISTS TABLE_MASTER_PASS (id integer primary key, password text)");
                                tx.executeSql("CREATE TABLE IF NOT EXISTS TABLE_ENTRY (eid integer primary key, entry_title text, entry_username text, entry_password text)");
                                console.log('Tables created successfully');
                            });
                        },
                        insertMasterPIN: function (pin) {
                            var deferred = $q.defer();
                            db.transaction(function (tx) {
                                tx.executeSql("INSERT INTO TABLE_MASTER_PASS (password) values(?)", [pin], function (tx, result) {
                                    console.log("Master Password inserted with row Id: " + result.insertId);
                                    deferred.resolve();
                                }, function (tx, error) {
                                    console.log("Master password insertion failed: " + error);
                                    deferred.reject();
                                });
                            });

                            return deferred.promise;
                        },
                        retrieveMasterPIN: function () {
                            var deferred = $q.defer();
                            db.transaction(function (tx) {
                                tx.executeSql("SELECT password as password FROM TABLE_MASTER_PASS WHERE id = ?", [1], function (tx, result) {
                                    console.log("Getting master pass from database success");
                                    deferred.resolve(result.rows);
                                }, function (tx, error) {
                                    console.log("Getting master pass from database failed");
                                    deferred.reject();
                                });
                            });
                            return deferred.promise;
                        },
                        insertEntry: function (title, username, password) {
                            var deferred = $q.defer();

                            db.transaction(function (tx) {
                                tx.executeSql("INSERT INTO TABLE_ENTRY (entry_title, entry_username, entry_password) VALUES (?, ?, ?)", [title, username, password], function (tx, result) {
                                    console.log("Entry added with id :" + result.insertId);
                                    deferred.resolve();
                                }, function (tx, error) {
                                    console.log("Entry insertion failed");
                                    deferred.reject();
                                });
                            });

                            return deferred.promise;
                        },
                        editEntry: function (title, username, password, eid) {
                            var deferred = $q.defer();

                            db.transaction(function (tx) {
                                tx.executeSql("UPDATE TABLE_ENTRY SET entry_title = ? , entry_username = ?, entry_password = ? WHERE eid = ?", [title, username, password, eid], function (tx, result) {
                                    console.log("Entry edited with id :" + result);
                                    deferred.resolve();
                                }, function (tx, error) {
                                    console.log("Entry edit failed");
                                    console.dir(error);
                                    deferred.reject();
                                });
                            });

                            return deferred.promise;
                        },
                        retrieveEntries: function () {
                            var deferred = $q.defer();

                            db.transaction(function (tx) {
                                tx.executeSql("SELECT * FROM TABLE_ENTRY", [], function (tx, result) {
                                    deferred.resolve(result.rows);
                                }, function (error) {
                                    deferred.reject();
                                })
                            });

                            return deferred.promise;
                        },
                        retrieveEntry: function (eid) {
                            var deferred = $q.defer();

                            db.transaction(function (tx) {
                                tx.executeSql("SELECT * FROM TABLE_ENTRY WHERE eid = ?", [eid], function (tx, result) {
                                    deferred.resolve(result.rows);
                                }, function (error) {
                                    deferred.reject();
                                })
                            });

                            return deferred.promise;
                        },
                        deleteEntry: function (eid) {
                            var deferred = $q.defer();

                            db.transaction(function (tx) {
                                tx.executeSql("DELETE FROM TABLE_ENTRY WHERE eid = ?", [eid], function (tx, result) {
                                    deferred.resolve();
                                }, function (error) {
                                    deferred.reject();
                                })
                            });

                            return deferred.promise;
                        }
                    },
                    CRYPT: {
                        encrypt: function (plainText, key) {
                            var encryptedText;
                            encryptedText = CryptoJS.AES.encrypt(plainText, key);
                            return encryptedText;
                        },
                        decrypt: function (encryptedText, key) {
                            var decryptedText;
                            var decrypted = CryptoJS.AES.decrypt(encryptedText, key);
                            return decrypted.toString(CryptoJS.enc.Utf8);
                        }
                    },
                    COMMON: {}
                };
            }]
        }
    }]);
