<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Crucible_Review extends Adapter
{
    protected function adapt()
    {
        $review = array(
            '_id' => $this->original['permaId']['id'],
            'crucible_id' => $this->original['permaId']['id'],
            'key' => $this->original['permaId']['id'],
            'name' => $this->original['name'],
            'project' => $this->original['projectKey'],
            'description' => $this->original['description'],
            'author' => array(
                'key' => $this->original['author']['userName'],
                'name' => $this->original['author']['displayName'],
                'avatar_url' => $this->original['author']['avatarUrl'],
            ),
            'state' => $this->original['state'],
            'type' => $this->original['type'],
            'create_date' => $this->original['createDate'],
            'due_date' => $this->original['dueDate'],
            'close_date' => null,
        );

        if ($this->original['closeDate']) {
            $review['close_date'] = $this->original['closeDate'];
        }

        $this->adapted = $review;
    }
}