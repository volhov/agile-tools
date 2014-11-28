<?php

namespace Radio\Controllers;

use Radio\Core\Resource;
use Tonic\Response;

/**
 * Index controller.
 *
 * @uri /
 * @uri /start
 * @uri /config
 * @uri /config/.*
 * @uri /users
 * @uri /users/.*
 * @uri /project/.*
 * @uri /projects
 * @uri /performance/.*
 */
class Index extends Resource
{
    /**
     * @method GET
     * @template index.html
     */
    public function showHomepage()
    {
        return new Response(Response::OK);
    }
}