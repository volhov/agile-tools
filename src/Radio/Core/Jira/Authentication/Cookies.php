<?php
namespace Radio\Core;

use chobie\Jira\Api\Authentication\AuthenticationInterface;
use Radio\Core\Jira_Authentication_ResetableAuthentication as ResetableAuthentication;

class Jira_Authentication_Cookies implements AuthenticationInterface, ResetableAuthentication
{
    protected $sessionKey = 'jira-credentials';

    public function getCredential()
    {
        if (!isset($_SESSION[$this->sessionKey])) {
            $_SESSION[$this->sessionKey] = md5(time() . ':' . rand(1000, 9999));
        }
        return $_SESSION[$this->sessionKey];
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