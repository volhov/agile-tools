<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api\Result;

/**
 * Jira Users controller.
 *
 * @uri /api/jira/users
 */
class Api_Jira_Users extends Core\Resource
{
    /**
     * @method GET
     */
    public function listUsers()
    {
        $query = $this->request->query('query');
        if (!$query) {
            return new Core\JsonResponse(
                Response::BADREQUEST,
                array(
                    'message' => 'This request requires "query" parameter.'
                )
            );
        }

        /** @var Core\Jira_Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];
        /** @var Result $result */
        $result = $jiraApi->searchUsers($query);

        return new Core\JsonResponse(
            Response::OK,
            $result->getResult()
        );
    }
}