<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * User api controller.
 *
 * @uri /api/users/{userKey}
 */
class Api_Users_User extends Core\Resource
{
    /**
     * @method GET
     */
    public function showUserInfo($userKey)
    {
        /** @var \MongoDB $jiraApi */
        $db = $this->app->container['database'];
        $user = $db->users->findOne(array(
            '_id' => $userKey
        ));

        $response = new Core\JsonResponse();
        if ($user) {
            $response->code = Response::OK;
            $response->body = $user;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = array(
                'message' => 'User with id "' . $userKey . '" can\'t be found'
            );
        }
        return $response;
    }
}