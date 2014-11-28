angular.module('api')
    .factory('Factory', ['$resource', '$q', 'API_URL', 'localStorageService',
        function($resource, $q, API_URL, Storage) {

            var collectionServiceProducer = function(resourcePath, resourceDefaults) {
                var resource = $resource(API_URL + '/' + resourcePath, resourceDefaults || {});
                var useCache = true;
                var cacheKeys = [];
                var cacheKeyPrefix = resourcePath.replace('/\//g', '.') + '.';

                function getCacheKey(query) {
                    return cacheKeyPrefix + JSON.stringify(query || {});
                }

                return {
                    get: function(query) {
                        var deferred = $q.defer();

                        var cacheKey = getCacheKey(query);
                        var cached = useCache && Storage.get(cacheKey);
                        if (cached) {
                            deferred.resolve(cached);
                        } else {
                            resource.query(query, function(collection) {
                                if (collection.length) {
                                    Storage.add(cacheKey, collection);
                                    cacheKeys.push(cacheKey);
                                }
                                deferred.resolve(collection);
                            }, function(response) {
                                deferred.reject(response);
                            });
                        }

                        return deferred.promise;
                    },
                    post: function(item) {
                        var deferred = $q.defer();

                        resource.save(item, function(response) {
                            deferred.resolve(response);
                        }, function(response) {
                            deferred.reject(response);
                        });

                        if (useCache) {
                            angular.forEach(cacheKeys, function(cacheKey) {
                                Storage.remove(cacheKey);
                            });
                        }

                        return deferred.promise;
                    },
                    enableCache: function() {
                        useCache = true;

                        return this;
                    },
                    disableCache: function() {
                        useCache = false;

                        return this;
                    },
                    resetCache: function(query) {
                        var cacheKey = getCacheKey(query);
                        if (query) {
                            Storage.remove(cacheKey);
                        } else {
                            cacheKey = cacheKey.replace(/\{\}$/,'.*');
                            cacheKey = cacheKey.replace(/\./,'\\.');
                            console.log(cacheKey);
                            Storage.clearAll(cacheKey);
                        }

                        return this;
                    }
                };
            };

            var itemServiceProducer = function(resourcePath, resourceDefaults)
            {
                var resource = $resource(API_URL + '/' + resourcePath,
                    resourceDefaults, {update: {method: 'PUT'}});

                return {
                    get: function(id, expand) {
                        var deferred = $q.defer();
                        var query = {id: id};
                        if (expand) {
                            query.expand = expand;
                        }
                        resource.get(query, function(item) {
                            deferred.resolve(item);
                        }, function(response) {
                            deferred.reject(response);
                        });

                        return deferred.promise;
                    },
                    put: function(id, data) {
                        var deferred = $q.defer();

                        data.id = id;

                        resource.update(data, function(response) {
                            deferred.resolve(response);
                        }, function(response) {
                            deferred.reject(response);
                        });

                        return deferred.promise;
                    },
                    'delete': function(id) {
                        var deferred = $q.defer();
                        resource.delete({id: id}, function(response) {
                            deferred.resolve(response);
                        }, function(response) {
                            deferred.reject(response);
                        });

                        return deferred.promise;
                    },
                    enableCache: function() {
                        // Just a plug for a moment. Cache is not used for items
                        return this;
                    },
                    disableCache: function() {
                        // Just a plug for a moment. Cache is not used for items
                        return this;
                    },
                    resetCache: function(query) {
                        Storage.clearAll();
                        return this;
                    }
                };
            };

            return {
                collection: collectionServiceProducer,
                item: itemServiceProducer
            };
        }]);