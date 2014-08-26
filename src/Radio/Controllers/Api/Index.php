<?php

namespace Radio\Controllers;

use Radio\Core\JsonResponse;
use Radio\Core\Resource;
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
    public function showApiInfoPage()
    {
        return new JsonResponse(
            Response::OK,
            array(
                'api' => array(
                    'version' => '1.0',
                    'description' => 'This is a Symmetrics Agile Tools API.',
                    'resources' => array(
                        'todo' => 'fill'
                    )
                )
            )
        );
    }
}