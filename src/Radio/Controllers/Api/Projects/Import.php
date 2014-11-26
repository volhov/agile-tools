<?php

namespace Radio\Controllers;

use Radio\Adapters;
use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Projects controller.
 *
 * @uri /api/projects/import
 */
class Api_Projects_Import extends Core\Resource
{
    /**
     * @method POST
     */
    public function importProject()
    {
        $requestData = $this->request->getDecodedData();

        if (isset($requestData['key'])) {
            /** @var Api $jiraApi */
            $jiraApi = $this->app->container['jira.api'];
            $jiraProject = $jiraApi->getProject($requestData['key']);

            $adapter = new Adapters\Jira_Project($jiraProject);
            $project = $adapter->getAdaptation();

            $this->updateProject($project);

            return new Core\JsonResponse(
                Response::OK,
                array(
                    'message' => 'Project ' . $project['name'] . ' has been imported.'
                )
            );
        }
        return new Core\JsonResponse(
            Response::BADREQUEST,
            array(
                'message' => 'Project key is not defined.'
            )
        );
    }

    /**
     * @param $project
     */
    protected function updateProject($project)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $existingProject = $db->projects->findOne([
            'key' => $project['key']
        ]);

        if ($existingProject) {
            foreach ($project as $key => $value) {
                $existingProject[$key] = $value;
            }
        } else {
            $existingProject = $project;
        }

        $db->projects->save($existingProject);
    }
}