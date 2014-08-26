<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Jira_Project extends Adapter
{
    protected function adapt()
    {
        $project = array(
            '_id' => $this->original['key'],
            'jira_id' => $this->original['id'],
            'key' => $this->original['key'],
            'name' => $this->original['name'],
            'avatar_urls' => $this->original['avatarUrls'],
            'versions' => array(),
        );
        if (isset($this->original['versions'])) {

            foreach ($this->original['versions'] as $version) {
                $adaptedVersion = array(
                    'jira_id' => $version['id'],
                    'name' => $version['name'],
                    'archived' => $version['archived'],
                    'released' => $version['released'],
                );
                if (isset($version['startDate'])) {
                    $adaptedVersion['startDate'] = new \DateTime($version['startDate']);
                }
                if (isset($version['releaseDate'])) {
                    $adaptedVersion['releaseDate'] = new \DateTime($version['releaseDate']);
                }
                $project['versions'][] = $adaptedVersion;
            }
        }

        $this->adapted = $project;
    }
}