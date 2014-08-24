<?php

namespace Radio\Controllers;

use Radio\Core\Resource;
use Tonic\Response;

/**
 * Index controller.
 *
 * @uri /
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