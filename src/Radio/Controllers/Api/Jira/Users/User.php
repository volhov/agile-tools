<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;

/**
 * Jira User controller.
 *
 * @uri /api/jira/users/{userKey}
 */
class Api_Jira_Users_User extends Core\Resource
{
    /**
     * @method GET
     */
    public function showUserInfo($userKey)
    {
        /** @var Core\Jira_Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];
        $user = $jiraApi->getUser($userKey);

        $response = new Core\JsonResponse();
        if (isset($user['key'])) {
            $response->code = Response::OK;
            $response->body = $user;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = $user;
        }
        return $response;
    }
}