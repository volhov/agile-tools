<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Users controller.
 *
 * @uri /api/users
 */
class Api_Users extends Core\Resource
{
    protected $allowedSortingFields = array(
        'key', 'name'
    );

    /**
     * @method GET
     */
    public function listUsers()
    {
        /** @var \MongoDB $jiraApi */
        $db = $this->app->container['database'];
        /** @var \MongoCursor $cursor */
        $cursor = $db->users->find();
        $this->applySorting($cursor);

        $users = iterator_to_array($cursor, false);

        return new Core\JsonResponse(
            Response::OK,
            $users
        );
    }

    protected function applySorting(\MongoCursor $cursor)
    {
        $sort = $this->request->query('sort');
        $fields = $sort ? explode(',', $sort) : array();

        $allowedFields = array();
        foreach ($fields as $field) {
            if (in_array($field, $this->allowedSortingFields)) {
                $allowedFields[$field] = 1;
            }
        }

        if ($allowedFields) {
            $cursor->sort($allowedFields);
        }
    }
}