<?php

$container = new Pimple\Container();

// Path constants.

$container['dir.conf'] = __DIR__ . '/../conf';
$container['dir.src'] =  __DIR__ . '/../src';
$container['dir.web'] =  __DIR__;
$container['dir.web.app'] =  $container['dir.web'] . '/assets/app';

// Configs.

$container['yaml.parser'] = function() {
    return new \Symfony\Component\Yaml\Parser();
};

$container['conf.db'] = function($container) {
    $yaml = file_get_contents($container['dir.conf'] . '/db.yaml');
    return $container['yaml.parser']->parse($yaml);
};
$container['conf.jira'] = function($container) {
    $yaml = file_get_contents($container['dir.conf'] . '/jira.yaml');
    return $container['yaml.parser']->parse($yaml);
};

// Mongo.

$container['mongo.client'] = function($container) {
    $config = $container['conf.db'];

    return new MongoClient($config['server'], $config['options']);
};

$container['mongo.db'] = function($container) {
    $config = $container['conf.db'];
    /** @var MongoClient $client */
    $client = $container['mongo.client'];

    return $client->selectDB($config['database']);
};

$container['database'] = $container['mongo.db'];

// Jira.

$container['jira.api'] = function($container) {
    $config = $container['conf.jira'];

    $api = new chobie\Jira\Api(
        $config['server'],
        new chobie\Jira\Api\Authentication\Basic(
            $config["username"],
            $config["password"]
        )
    );

    return $api;
};

$container['jira.walker'] = function($container) {
    $api = $container['jira.api'];
    return new \chobie\Jira\Issues\Walker($api);
};



return $container;