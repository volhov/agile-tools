<?php

$container = new Pimple\Container();

// Path constants.

$container['dir.conf'] = __DIR__ . '/../conf';
$container['dir.src'] =  __DIR__ . '/../src';
$container['dir.var'] =  __DIR__ . '/../var';
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
$container['conf.crucible'] = function($container) {
    $yaml = file_get_contents($container['dir.conf'] . '/crucible.yaml');
    return $container['yaml.parser']->parse($yaml);
};

$container['config'] = function($container) {
    return new \Radio\Core\Config($container);
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

    $api = new Radio\Core\Jira_Api(
        $config['server'],
        new \Radio\Core\Jira_Authentication_Cookies(),
        new \Radio\Core\Jira_Client_CurlCookiesClient($container)
    );

    return $api;
};

$container['jira.walker'] = function($container) {
    $api = $container['jira.api'];
    return new \chobie\Jira\Issues\Walker($api);
};


// Crucible.

$container['crucible.api'] = function($container) {
    $config = $container['conf.crucible'];

    $api = new Radio\Core\Crucible_Api(
        $config['server'],
        new \Radio\Core\Crucible_Authentication_Token(),
        new \Radio\Core\Crucible_Client_CurlClient()
    );

    return $api;
};



return $container;