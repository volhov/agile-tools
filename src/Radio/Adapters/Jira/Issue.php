<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Jira_Issue extends Adapter
{
    protected function adapt()
    {
        $issue = array(
            '_id' => $this->original['key'],
            'jira_id' => $this->original['id'],
            'key' => $this->original['key'],
            'summary' => $this->original['fields']['summary'],
            'project' => $this->original['fields']['project']['key'],
            'time' => array(
                'self' => array(),
                'aggr' => array(),
            ),
            'issuetype' => array(
                'id' => $this->original['fields']['issuetype']['id'],
                'name' => $this->original['fields']['issuetype']['name'],
                'icon_url' => $this->original['fields']['issuetype']['iconUrl'],
                'custom' => null,
            ),
            'priority' => array(
                'id' => $this->original['fields']['priority']['id'],
                'name' => $this->original['fields']['priority']['name'],
            ),
            'status' => array(
                'id' => $this->original['fields']['status']['id'],
                'name' => $this->original['fields']['status']['name'],
            ),
            'subtasks' => array(),
            'versions' => array(),
            'assignee' => array(
                'key' => $this->original['fields']['assignee']['name'],
                'name' => $this->original['fields']['assignee']['displayName'],
            )
        );

        if (isset($this->original['fields']['customfield_10150'])) {
            $issue['issuetype']['custom'] = $this->original['fields']['customfield_10150']['value'];
        }

        foreach ($this->original['fields']['subtasks'] as $subtask) {
            $issue['subtasks'][] = array(
                'key' => $subtask['key'],
                'summary' => $subtask['fields']['summary'],
                'issuetype' => array(
                    'id' => $subtask['fields']['issuetype']['id'],
                    'name' => $subtask['fields']['issuetype']['name'],
                ),
                'priority' => array(
                    'id' => $subtask['fields']['priority']['id'],
                    'name' => $subtask['fields']['priority']['name'],
                ),
                'status' => array(
                    'id' => $subtask['fields']['status']['id'],
                    'name' => $subtask['fields']['status']['name'],
                ),
            );
        }

        foreach ($this->original['fields']['fixVersions'] as $version) {
            $issue['versions'][] = array(
                'id' => $version['id'],
                'name' => $version['name'],
            );
        }

        if (isset($this->original['fields']['timetracking'])) {
            $issue['time']['self'] = array(
                'estimated' => (int) @$this->original['fields']['timetracking']['originalEstimateSeconds'],
                'remaining' => (int) @$this->original['fields']['timetracking']['remainingEstimateSeconds'],
                'spent' => (int) @$this->original['fields']['timetracking']['timeSpentSeconds'],
            );
        } else {
            $issue['time']['self']['estimated'] = (int) @$this->original['fields']['timeoriginalestimate'];
            $issue['time']['self']['remaining'] = (int) @$this->original['fields']['timeestimate'];
            $issue['time']['self']['spent'] = (int) @$this->original['fields']['timespent'];
        }
        $issue['time']['aggr'] = array(
            'estimated' => (int) @$this->original['fields']['aggregatetimeoriginalestimate'],
            'remaining' => (int) @$this->original['fields']['aggregatetimeestimate'],
            'spent' => (int) @$this->original['fields']['aggregatetimespent'],
        );

        $this->adapted = $issue;
    }
}