<?php

namespace Radio\Controllers;

use Radio\Core\JsonResponse;
use Radio\Core\Resource;
use Tonic\Response;

/**
 * Jira Api Index controller.
 *
 * @uri /api/jira
 */
class Api_Jira_Index extends Resource
{
    /**
     * @method GET
     */
    public function showApiInfoPage()
    {
        $jiraConf = $this->app->container['conf.jira'];

        return new JsonResponse(
            Response::OK,
            array(
                'api' => array(
                    'version' => '1.0',
                    'description' => 'This is a proxy for the Jira Api.',
                    'jira_server' => $jiraConf['server'],
                    'resources' => array(
                        'Projects' => '/api/jira/projects',
                        'Projects.Project' => '/api/jira/projects/{projectKey}'
                    )
                )
            )
        );
    }
}