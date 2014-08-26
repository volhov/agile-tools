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
    public function listProjects()
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

    /**
     * @method POST
     */
    public function addProject()
    {
        $data = json_decode($this->request->data, true);

        if ($data && isset($data['project'])) {
            $project = $data['project'];
            $project['_id'] = $project['key'];

            /** @var \MongoDB $jiraApi */
            $db = $this->app->container['database'];

            $db->projects->save($project);

        }
    }
}