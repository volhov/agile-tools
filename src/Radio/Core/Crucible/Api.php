<?php

namespace Radio\Core;

use chobie\Jira\Api;
use chobie\Jira\IssueType;
use Radio\Core\Jira_Authentication_ResetableAuthentication as ResetableAuthentication;

class Crucible_Api extends Api
{
    /**
     * Set Client instance.
     *
     * @param Api\Client\ClientInterface $client Client instance.
     */
    public function setClient(Api\Client\ClientInterface $client)
    {
        $this->client = $client;
    }

    /**
     * Check Jira authorization.
     *
     * @throws \chobie\Jira\Api\UnauthorizedException
     *
     * @return array User data
     */
    public function checkAuthorization()
    {
        if (!$this->checkJiraSession()) {
            throw new Api\UnauthorizedException('Not authorized');
        }
        try {
            $response = $this->api(self::REQUEST_GET, '/rest/auth/1/session', [], true);
            return $response;
        } catch (Api\UnauthorizedException $exception) {
            throw $exception;
        }
    }

    public function authorize($userId, $password)
    {
        $authData = array(
            'userName' => $userId,
            'password' => $password,
        );
        $response = $this->api(self::REQUEST_POST, '/rest-service/auth-v1/login.json', $authData, true);
        // {"token":"max.gopey:1099:3be26285c70ae598c35a00d1fd43caae"}

        if (isset($response['session']) && !isset($response['errorMessages'])) {
            $this->saveJiraSession($response['session']);
            return $response['session'];
        } else {
            $message = isset($response['errorMessages']) ? implode(PHP_EOL, $response['errorMessages']) : '';
            throw new Api\UnauthorizedException($message);
        }
    }

    public function clearAuthorization()
    {
        if (!$this->checkJiraSession()) {
            throw new Api\UnauthorizedException('Not authorized');
        }
        try {
            $this->api(self::REQUEST_DELETE, '/rest/auth/1/session');
            if ($this->authentication instanceof ResetableAuthentication) {
                $this->authentication->reset();
            }
            $this->clearJiraSession();
        } catch (Api\UnauthorizedException $exception) {
            throw $exception;
        }
    }

    protected function saveJiraSession($session)
    {
        $_SESSION['jira-session'] = $session['value'];
    }

    protected function checkJiraSession()
    {
        return isset($_SESSION['jira-session']);
    }

    protected function clearJiraSession()
    {
        unset($_SESSION['jira-session']);
    }
}