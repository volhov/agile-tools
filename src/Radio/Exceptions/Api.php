<?php

namespace Radio\Exceptions;

class Api extends \Exception
{
    public function getResponseData()
    {
        return array(
            'code' => $this->getCode(),
            'message' => $this->getMessage()
        );
    }
}