<?php

namespace Radio\Core;

use chobie\Jira\Api;

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
}