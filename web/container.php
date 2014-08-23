<?php

$container = new Pimple\Container();

$container['dir.conf'] = __DIR__ . '/../conf';
$container['dir.src'] =  __DIR__ . '/../src';

$container['yaml.parser'] = function() {
    return new \Symfony\Component\Yaml\Parser();
};

$container['database'] = function($container) {
    $yaml = file_get_contents($container['dir.conf'] . '/db.yaml');
    $config = $container['yaml.parser']->parse($yaml);

    return new MongoClient($config['server'], $config['options']);
};

$container['jira.api'] = function($container) {
    $yaml = file_get_contents($container['dir.conf'] . '/jira.yaml');
    $config = $container['yaml.parser']->parse($yaml);

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