<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Users controller.
 *
 * @uri /api/users
 */
class Api_Users extends Core\Resource
{
    /**
     * @method GET
     */
    public function listUsers()
    {
        /** @var \MongoDB $jiraApi */
        $db = $this->app->container['database'];
        /** @var \MongoCursor $cursor */
        $cursor = $db->users->find();

        $users = iterator_to_array($cursor);

        return new Core\JsonResponse(
            Response::OK,
            $users
        );
    }
}