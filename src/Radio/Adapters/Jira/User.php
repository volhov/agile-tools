<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Jira_User extends Adapter
{
    protected function adapt()
    {
        $user = array(
            '_id' => $this->original['key'],
            'key' => $this->original['key'],
            'name' => $this->original['displayName'],
            'avatar_urls' => $this->original['avatarUrls'],
        );

        $this->adapted = $user;
    }
}