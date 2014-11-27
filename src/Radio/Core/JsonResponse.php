<?php

namespace Radio\Core;

/**
 * Json response.
 * - Override the output method to render json.
 *
 * @package Radio\Core
 */
class JsonResponse extends \Tonic\Response
{
    /**
     * @const string Json content type and charset.
     */
    const JSON_CONTENT_TYPE = 'application/json;charset=UTF-8';

    /**
     * Output the response.
     * - Set the Json content type header.
     * - Encode the response body via JSON.
     */
    public function output()
    {
        $this->headers['content-type'] = self::JSON_CONTENT_TYPE;

        foreach ($this->headers as $name => $value) {
            header($name.': '.$value, true, $this->responseCode());
        }
        echo json_encode($this->body);
    }
}