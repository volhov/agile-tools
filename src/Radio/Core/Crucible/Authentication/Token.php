<?php
namespace Radio\Core;

use chobie\Jira\Api\Authentication\AuthenticationInterface;
use Radio\Core\Jira_Authentication_ResetableAuthentication as ResetableAuthentication;

class Crucible_Authentication_Token implements AuthenticationInterface, ResetableAuthentication
{
    protected $sessionKey = 'cru-token';

    public function getCredential()
    {
        if (!isset($_SESSION[$this->sessionKey])) {
            return null;
        }
        return $_SESSION[$this->sessionKey];
    }

    public function setToken($token)
    {
        $_SESSION[$this->sessionKey] = $token;
    }

    public function getTokenName()
    {
        $token = $this->getCredential();
        // "max.gopey:1099:3be26285c70ae598c35a00d1fd43caae"
        if ($token) {
            return substr($token, 0, strpos($token, ':'));
        }
        return null;
    }

    public function reset()
    {
        unset($_SESSION[$this->sessionKey]);
    }

    public function getId()
    {
        return null;
    }

    public function getPassword()
    {
        return null;
    }
}