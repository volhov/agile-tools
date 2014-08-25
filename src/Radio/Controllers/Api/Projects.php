<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Projects controller.
 *
 * @uri /api/projects
 */
class Api_Projects extends Core\Resource
{
    /**
     * @method GET
     */
    function listProjects()
    {
        /** @var \MongoDB $jiraApi */
        $db = $this->app->container['database'];
        /** @var \MongoCursor $cursor */
        $cursor = $db->projects->find();

        $projects = iterator_to_array($cursor);

        return new Core\JsonResponse(
            Response::OK,
            $projects
        );
    }
}