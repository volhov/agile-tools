<?php

namespace Radio\Controllers;

use chobie\Jira\Api\UnauthorizedException;
use Radio\Core\Jira_Api;
use Radio\Core\JsonResponse;
use Radio\Core\Resource;
use Tonic\Response;

/**
 * Login controller.
 *
 * @uri /login
 */
class Login extends Resource
{
    /**
     * @method GET
     * @template index.html
     */
    public function showLoginForm()
    {
        return new Response(Response::OK);
    }

    /**
     * @method POST
     */
    public function authorize()
    {
        /** @var Jira_Api $api */
        $api = $this->app->container['jira.api'];
        $postData = $this->request->getDecodedData();

        try {
            $user = $api->checkAuthorization();
            return new JsonResponse(Response::OK, [
                'message' => 'Already authorized as ' . $user['name']
            ]);
        } catch (UnauthorizedException $exception) {
        }

        try {
            $session = $api->authorize($postData['username'], $postData['password']);
            $user = $api->checkAuthorization();
            return new JsonResponse(Response::OK, [
                'message' => 'Authorized successfully as ' . $user['name']
            ]);
        } catch (UnauthorizedException $exception) {
            return new JsonResponse(Response::UNAUTHORIZED, [
                'message' => 'Username or password is incorrect.',
                'systemMessage' => $exception->getMessage()
            ]);
        }
    }

    /**
     * @method DELETE
     */
    public function logOut()
    {
        /** @var Jira_Api $api */
        $api = $this->app->container['jira.api'];

        try {
            $api->clearAuthorization();
            return new JsonResponse(Response::OK, [
                'message' => 'You are now not authorized.'
            ]);
        } catch (UnauthorizedException $exception) {
            return new JsonResponse(Response::UNAUTHORIZED, [
                'message' => 'You are not authorized.',
                'systemMessage' => $exception->getMessage()
            ]);
        }

    }
}