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