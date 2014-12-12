<?php

namespace Radio\Controllers;

use chobie\Jira\Api\UnauthorizedException;
use Radio\Core\Crucible_Api;
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
        $authorizedName = $this->checkJiraAuthorization();
        if ($authorizedName) {
            return new JsonResponse(Response::OK, [
                'message' => 'Already authorized as ' . $authorizedName
            ]);
        }

        $postData = $this->request->getDecodedData();
        try {
            $authorizedName = $this->authorizeInJira($postData['username'], $postData['password']);

            try {
                $crucibleName = $this->authorizeInCrucible($postData['username'], $postData['password']);
            } catch (UnauthorizedException $exception) {
                // Authorization in Crucible is optional, so we still allow access.
            }

            return new JsonResponse(Response::OK, [
                'message' => 'Authorized successfully as ' . $authorizedName
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

    protected function authorizeInJira($username, $password)
    {
        /** @var Jira_Api $api */
        $api = $this->app->container['jira.api'];
        $api->authorize($username, $password);
        $response = $api->checkAuthorization();

        return $response['name'];
    }

    protected function checkJiraAuthorization()
    {
        /** @var Jira_Api $api */
        $api = $this->app->container['jira.api'];

        try {
            $response = $api->checkAuthorization();
            return $response['name'];
        } catch (UnauthorizedException $exception) {
        }

        return null;
    }

    protected function authorizeInCrucible($username, $password)
    {
        /** @var Crucible_Api $api */
        $api = $this->app->container['crucible.api'];
        $api->authorize($username, $password);
        $response = $api->checkAuthorization();

        return $response['userData']['userName'];
    }

    protected function checkCrucibleAuthorization()
    {
        /** @var Crucible_Api $api */
        $api = $this->app->container['crucible.api'];

        try {
            $response = $api->checkAuthorization();
            return $response['userData']['userName'];
        } catch (UnauthorizedException $exception) {
        }

        return null;
    }
}