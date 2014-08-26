<?php

namespace Radio\Core;

/**
 * Overridden Tonic request.
 * - Support for working with $_GET / $_POST added.
 *
 * @package Radio\Core
 */
class Request extends \Tonic\Request
{
    /**
     * @var array GET query params.
     */
    protected $_get;

    /**
     * @var array POST params.
     */
    protected $_post;

    public function __construct($options = array(), $get = null, $post = null)
    {
        parent::__construct($options);

        $this->_get = ($get === null) ? $_GET : $get;
        $this->_post = ($post === null) ? $_POST : $post;
    }

    public function query($key = null)
    {
        if ($key === null) {
            return $this->_get;
        } else {
            return isset($this->_get[$key]) ? $this->_get[$key] : null;
        }
    }

    public function post($key = null)
    {
        if ($key === null) {
            return $this->_post;
        } else {
            return isset($this->_post[$key]) ? $this->_post[$key] : null;
        }
    }

    public function getDecodedData()
    {
        return json_decode($this->data, true);
    }
}