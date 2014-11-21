<?php

namespace Radio\Controllers;

use chobie\Jira\Api\UnauthorizedException;
use Radio\Core\Jira_Api;
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
     */
    public function authorize()
    {
        /** @var Jira_Api $api */
        $api = $this->app->container['jira.api'];

        try {
            $user = $api->checkAuthorization();
            return new Response(Response::OK, 'Already authorized as ' . $user['name']);
        } catch (UnauthorizedException $exception) {

            $config = $this->app->container['conf.jira'];

            try {
                $session = $api->authorize($config["username"], $config["password"]);
                return new Response(Response::OK, 'Authorized successfully as ' . $session['value']);
            } catch (UnauthorizedException $exception) {
                return new Response(Response::OK, $exception->getMessage());
            }
        }
    }
}