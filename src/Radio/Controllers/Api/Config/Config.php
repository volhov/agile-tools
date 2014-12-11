<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Config API controller.
 *
 * @uri /api/configs/{projectKey}
 */
class Api_Configs_Config extends Core\Resource
{
    /**
     * @method GET
     */
    public function showConfig($projectKey = null)
    {
        $config = $projectKey == 'global' ? $this->getGlobalConfig() : $this->getProjectConfig($projectKey);
        $yaml = array(
            'jira_url' => $this->app->container['conf.jira']['server'],
            'crucible_url' => $this->app->container['conf.crucible']['server'],
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
     * @method POST
     */
    public function createConfig($projectKey = null)
    {
        $requestData = $this->request->getDecodedData();

        $newConfig = $requestData['config'];

        if ($newConfig) {
            /** @var \MongoDB $db */
            $db = $this->app->container['database'];
            $db->config->save($newConfig);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Configuration has been created.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::NOTFOUND, array(
                'message' => 'Data can\'t is not found in the request.'
            ));
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
        $originalConfig = $projectKey == 'global' ? $this->getGlobalConfig() : $this->getProjectConfig($projectKey);

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
        /** @var \Radio\Core\Config $config */
        $config = $this->app->container['config'];

        return $config->getProjectConfig($projectKey);
    }

    /**
     * @return array
     */
    protected function getGlobalConfig()
    {
        /** @var \Radio\Core\Config $config */
        $config = $this->app->container['config'];

        return $config->getGlobalConfig();
    }
}