<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Config API controller.
 *
 * @uri /api/config/{projectKey}
 */
class Api_Config extends Core\Resource
{
    /**
     * @method GET
     */
    public function showConfig($projectKey)
    {
        $config = $this->getProjectConfig($projectKey);
        $yaml = array(
            'jira_url' => $this->app->container['conf.jira']['server']
        );

        $response = new Core\JsonResponse();
        if ($config) {
            $response->code = Response::OK;
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
    public function saveConfig($projectKey)
    {
        $requestData = $this->request->getDecodedData();

        $newConfig = $requestData['config'];
        $originalConfig = $this->getProjectConfig($projectKey);

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
        $globalConfig = $db->config->findOne(array(
            '_id' => 'global'
        ));

        if ($globalConfig) {
            $projectConfig = $db->config->findOne(array(
                '_id' => $projectKey
            ));
            if ($projectConfig) {
                $config = array_merge($globalConfig, $projectConfig);
            } else {
                $config = $globalConfig;
            }
            return $config;
        }

        return null;
    }


}