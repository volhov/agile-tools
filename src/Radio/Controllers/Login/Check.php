<?php

namespace Radio\Controllers;

use chobie\Jira\Api\UnauthorizedException;
use Radio\Core\Jira_Api;
use Radio\Core\JsonResponse;
use Radio\Core\Resource;
use Tonic\Response;

/**
 * Login check controller.
 *
 * @uri /login/check
 */
class Login_Check extends Resource
{
    /**
     * @method GET
     */
    public function check()
    {
        /** @var Jira_Api $api */
        $api = $this->app->container['jira.api'];

        try {
            $user = $api->checkAuthorization();
            return new JsonResponse(Response::OK, [
                'message' => 'Already authorized as ' . $user['name'],
                'user' => $user
            ]);
        } catch (UnauthorizedException $exception) {
            return new JsonResponse(Response::UNAUTHORIZED, [
                'message' => $exception->getMessage()
            ]);
        }
    }
}