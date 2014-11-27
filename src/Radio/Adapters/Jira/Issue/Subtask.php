<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Jira_Issue_Subtask extends Adapter
{
    protected function adapt()
    {
        $subtask = array(
            'key' => $this->original['key'],
            'summary' => $this->original['fields']['summary'],
            'issuetype' => array(
                'id' => $this->original['fields']['issuetype']['id'],
                'name' => $this->original['fields']['issuetype']['name'],
            ),
            'priority' => array(
                'id' => $this->original['fields']['priority']['id'],
                'name' => $this->original['fields']['priority']['name'],
            ),
            'status' => array(
                'id' => $this->original['fields']['status']['id'],
                'name' => $this->original['fields']['status']['name'],
            ),
        );

        $this->adapted = $subtask;
    }
}