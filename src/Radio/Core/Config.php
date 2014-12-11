<?php

namespace Radio\Core;

use Pimple\Container;

class Config
{
    /** @var Container */
    protected $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * Get global config.
     *
     * @return array
     */
    public function getGlobalConfig()
    {
        /** @var \MongoDB $db */
        $db = $this->container['database'];
        $globalConfig = $db->config->findOne(array('_id' => 'global'));

        return $globalConfig;
    }

    /**
     * Get project-specific config.
     *
     * @param $projectKey
     *
     * @return array
     */
    public function getProjectConfig($projectKey)
    {
        /** @var \MongoDB $db */
        $db = $this->container['database'];

        $globalConfig = $this->getGlobalConfig();
        $projectConfig = $db->config->findOne(array(
            '_id' => $projectKey
        ));

        if ($globalConfig) {
            return array_merge($globalConfig, $projectConfig);
        } else {
            return $projectConfig;
        }
    }

    public function getGlobalConfigValue($key)
    {
        $config = $this->getGlobalConfig();
        return isset($config[$key]) ? $config[$key] : null;
    }

    public function getProjectConfigValue($key, $projectKey)
    {
        $config = $this->getProjectConfig($projectKey);
        return isset($config[$key]) ? $config[$key] : null;
    }
}