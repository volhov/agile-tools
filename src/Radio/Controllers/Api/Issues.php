<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Issues controller.
 *
 * @uri /api/issues
 * @param project
 * @param type
 * @param status
 * @param version
 * @param assignee
 */
class Api_Issues extends Core\Resource
{
    /**
     * @method GET
     */
    public function listIssues()
    {
        /** @var \MongoDB $jiraApi */
        $db = $this->app->container['database'];
        /** @var \MongoCursor $cursor */
        $cursor = $this->applyFilters($db->issues);

        $issues = iterator_to_array($cursor, false);

        return new Core\JsonResponse(
            Response::OK,
            $issues
        );
    }

    /**
     * @param \MongoCollection $issues
     *
     * @return \MongoCursor
     */
    protected function applyFilters(\MongoCollection $issues)
    {
        $filter = array();
        if ($this->request->query('project')) {
            $filter['project'] = $this->request->query('project');
        }
        if ($this->request->query('type')) {
            $filter['issuetype.name'] = $this->request->query('type');
        }
        if ($this->request->query('status')) {
            $filter['status.name'] = $this->request->query('status');
        }
        if ($this->request->query('version')) {
            $filter['versions.name'] = $this->request->query('version');
        }
        if ($this->request->query('assignee')) {
            $filter['assignee.key'] = $this->request->query('assignee');
        }

        return $issues->find($filter);
    }
}