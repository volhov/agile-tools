<?php

namespace Radio\Core;

use chobie\Jira\Api;
use chobie\Jira\IssueType;
use Radio\Core\Jira_Authentication_ResetableAuthentication as ResetableAuthentication;

class Crucible_Api extends Api
{
    /** @var Crucible_Authentication_Token */
    protected $authentication;

    public function getReviewsForIssue($issuesKey)
    {
        $result = $this->api(self::REQUEST_GET, '/rest-service/search-v1/reviews.json', array('term' => $issuesKey));

        return $result;
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
        if (!$this->checkCrucibleSession()) {
            throw new Api\UnauthorizedException('Not authorized');
        }
        try {
            $username = $this->authentication->getTokenName();
            $response = $this->api(self::REQUEST_GET, '/rest-service/users-v1/' . $username . '.json', [], true);
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

        if (isset($response['token']) && !isset($response['error'])) {
            $this->saveCrucibleSession($response['token']);
            return $response['token'];
        } else {
            $message = isset($response['error']) ? $response['error'] : '';
            throw new Api\UnauthorizedException($message);
        }
    }

    public function clearAuthorization()
    {
        // Crucible API doesn't provide logout ability.
        // So we just get rid of the token.
        $this->clearCrucibleSession();
    }

    protected function saveCrucibleSession($token)
    {
        $this->authentication->setToken($token);
    }

    protected function checkCrucibleSession()
    {
        return !is_null($this->authentication->getCredential());
    }

    protected function clearCrucibleSession()
    {
        if ($this->authentication instanceof ResetableAuthentication) {
            $this->authentication->reset();
        }
    }
}