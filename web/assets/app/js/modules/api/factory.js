angular.module('api')
    .factory('Factory', ['$resource', '$q', 'API_URL', 'localStorageService',
        function($resource, $q, API_URL, Storage) {

            var collectionServiceProducer = function(resourcePath, resourceDefaults) {
                var resource = $resource(API_URL + '/' + resourcePath, resourceDefaults || {});
                var useCache = true;
                var cacheKeys = [];
                var cacheKeyPrefix = resourcePath.replace('/\//g', '.') + '.';

                return {
                    get: function(query) {
                        var deferred = $q.defer();

                        var cacheKey = cacheKeyPrefix + JSON.stringify(query || {});
                        var cached = useCache && Storage.get(cacheKey);
                        if (cached) {
                            deferred.resolve(cached);
                        } else {
                            resource.query(query, function(collection) {
                                Storage.add(cacheKey, collection);
                                cacheKeys.push(cacheKey);
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
                    },
                    disableCache: function() {
                        useCache = false;
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
                    },
                    disableCache: function() {
                        // Just a plug for a moment. Cache is not used for items
                    }
                };
            };

            return {
                collection: collectionServiceProducer,
                item: itemServiceProducer
            };
        }]);