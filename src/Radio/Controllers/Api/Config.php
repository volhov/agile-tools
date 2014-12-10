<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Config API controller.
 *
 * @uri /api/config
 * @uri /api/config/{projectKey}
 */
class Api_Config extends Core\Resource
{
    /**
     * @method GET
     */
    public function showConfig($projectKey = null)
    {
        $config = $projectKey ? $this->getProjectConfig($projectKey) : $this->getGlobalConfig();
        $yaml = array(
            'jira_url' => $this->app->container['conf.jira']['server']
        );

        $response = new Core\JsonResponse(Response::OK);
        if ($config || $yaml) {
            $response->body = array(
                'config' => $config,
                'yaml' => $yaml
            );
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = array(
                'message' => 'Configuration can\'t be found.'
            );
        }
        return $response;
    }

    /**
     * @method PUT
     */
    public function saveConfig($projectKey = null)
    {
        $requestData = $this->request->getDecodedData();

        $newConfig = $requestData['config'];
        $originalConfig = $projectKey ? $this->getProjectConfig($projectKey) : $this->getGlobalConfig();

        if ($originalConfig && $newConfig) {
            $config = array_merge($originalConfig, $newConfig);

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];
            $db->config->save($config);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Configuration has been saved.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::NOTFOUND, array(
                'message' => 'Configuration can\'t be found.'
            ));
        }

        return $response;
    }

    protected function getProjectConfig($projectKey)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $globalConfig = $this->getGlobalConfig();

        if ($globalConfig) {
            $projectConfig = $db->config->findOne(array(
                '_id' => $projectKey
            ));
            if (!$projectConfig) {
                $projectConfig = array(
                    '_id' => $projectKey
                );
            }
            return array_merge($globalConfig, $projectConfig);
        }

        return null;
    }

    /**
     * @return array
     */
    protected function getGlobalConfig()
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];
        $globalConfig = $db->config->findOne(array('_id' => 'global'));

        return $globalConfig;
    }


}