<?php
namespace Radio\Core;

use chobie\Jira\Api\Authentication\AuthenticationInterface;

class Jira_Authentication_Cookies implements AuthenticationInterface
{
    private $userId;
    private $password;

    public function __construct($userId, $password)
    {
        $this->userId = $userId;
        $this->password = $password;
    }

    public function getCredential()
    {
        return md5($this->userId . ':' . $this->password);
    }

    public function getId()
    {
        return $this->userId;
    }

    public function getPassword()
    {
        return $this->password;
    }
}