<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Jira Project controller.
 *
 * @uri /api/jira/projects/{projectKey}
 */
class Api_Jira_Projects_Project extends Core\Resource
{
    /**
     * @method GET
     */
    public function showProjectInfo($projectKey)
    {
        /** @var Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];
        $project = $jiraApi->getProject($projectKey);

        $response = new Core\JsonResponse();
        if (isset($project['key'])) {
            $response->code = Response::OK;
            $response->body = $project;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = $project;
        }
        return $response;
    }
}