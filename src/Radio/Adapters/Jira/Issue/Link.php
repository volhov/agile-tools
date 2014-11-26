<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Jira_Issue_Link extends Adapter
{
    protected function adapt()
    {
        $type = isset($this->original['inwardIssue']) ? 'inward' : 'outward';
        $issueKey = $type . 'Issue';

        $linkedIssue = array(
            'type' => $type,
            'link_type' => $this->original['type'][$type],
            'key' => $this->original[$issueKey]['key'],
            'summary' => $this->original[$issueKey]['fields']['summary'],
            'issuetype' => array(
                'id' => $this->original[$issueKey]['fields']['issuetype']['id'],
                'name' => $this->original[$issueKey]['fields']['issuetype']['name'],
            ),
            'priority' => array(
                'id' => $this->original[$issueKey]['fields']['priority']['id'],
                'name' => $this->original[$issueKey]['fields']['priority']['name'],
            ),
            'status' => array(
                'id' => $this->original[$issueKey]['fields']['status']['id'],
                'name' => $this->original[$issueKey]['fields']['status']['name'],
            ),
        );

        $this->adapted = $linkedIssue;
    }
}