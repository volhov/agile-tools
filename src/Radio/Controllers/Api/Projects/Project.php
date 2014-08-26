<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Import project controller.
 *
 * @uri /api/projects/{projectKey}
 */
class Api_Projects_Project extends Core\Resource
{
    /**
     * @method GET
     */
    public function showProjectInfo($projectKey)
    {
        /** @var \MongoDB $jiraApi */
        $db = $this->app->container['database'];
        $project = $db->projects->findOne(array(
            '_id' => $projectKey
        ));

        $response = new Core\JsonResponse();
        if ($project) {
            $response->code = Response::OK;
            $response->body = $project;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = array(
                'message' => 'Project with id "' . $projectKey . '" can\'t be found'
            );
        }
        return $response;
    }
}