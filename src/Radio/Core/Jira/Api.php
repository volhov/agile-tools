<?php

namespace Radio\Core;

use chobie\Jira\Api;
use chobie\Jira\IssueType;

class Jira_Api extends Api
{
    /**
     * Get Jira User by user key.
     *
     * @api /rest/api/2/user?username={userKey}
     *
     * @param string $userKey User Key.
     *
     * @return array
     */
    public function getUser($userKey)
    {
        $result = $this->api(self::REQUEST_GET, '/rest/api/2/user/', array('username' => $userKey), true);

        return $result;
    }

    /**
     * Use Jira user picker to search users.
     *
     * @api /rest/api/2/user/picker?query={query}
     *
     * @param string $query Query.
     *
     * @return Api\Result
     */
    public function pickUsers($query)
    {
        $result = $this->api(self::REQUEST_GET, '/rest/api/2/user/picker', array('query' => $query));

        return $result;
    }

    public function getIssueTypes($asArray = false)
    {
        $result = array();
        $types = $this->api(self::REQUEST_GET, "/rest/api/2/issuetype", array(), true);

        if (!$asArray) {
            foreach ($types as $issue_type) {
                $result[] = new IssueType($issue_type);
            }
            return $result;
        } else {
            return $types;
        }
    }

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
        try {
            $response = $this->api(self::REQUEST_GET, '/rest/auth/1/session', array(), true);
            return $response;
        } catch (Api\UnauthorizedException $exception) {
            throw $exception;
        }
    }

    public function authorize($userId, $password)
    {
        $authData = array(
            'username' => $userId,
            'password' => $password,
        );
        $response = $this->api(self::REQUEST_POST, '/rest/auth/1/session', $authData, true);
        // {"session":{"name":"JSESSIONID","value":"3ADB1E97670174358EAFB16C3C2B95FC"},"loginInfo":{"failedLoginCount":6,"loginCount":5922,"lastFailedLoginTime":"2014-03-18T10:51:45.220+0100","previousLoginTime":"2014-11-21T11:14:59.724+0100"}}

        if (isset($response['session']) && !isset($response['errorMessages'])) {
            return $response['session'];
        } else {
            $message = isset($response['errorMessages']) ? implode(PHP_EOL, $response['errorMessages']) : '';
            throw new Api\UnauthorizedException($message);
        }
    }
}