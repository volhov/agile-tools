<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Api Index controller.
 *
 * @uri /api/jira/projects
 */
class Api_Jira_Projects extends Core\Resource
{
    /**
     * @method GET
     */
    function listProjects()
    {
        /** @var Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];
        /** @var Api\Result $result */
        $result = $jiraApi->getProjects();

        return new Core\JsonResponse(
            Response::OK,
            $result->getResult()
        );
    }
}