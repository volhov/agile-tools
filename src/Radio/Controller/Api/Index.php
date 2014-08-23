<?php

namespace Radio\Controller;

use Tonic\Resource;
use Tonic\Response;

/**
 * Api Index controller.
 *
 * @uri /api
 */
class Api_Index extends Resource
{
    /**
     * @method GET
     */
    function showApiInfoPage()
    {
        return new Response(
            Response::OK,
            'This is a Symmetrics Agile Tools API start page.'
        );
    }
}