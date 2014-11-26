<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Exceptions;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Jira Issues controller.
 *
 * @uri /api/jira/issues
 */
class Api_Jira_Issues extends Core\Resource
{
    /**
     * Get list of issues.
     *
     * @method GET
     */
    public function listIssues()
    {
        /** @var Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];

        try {
            $result = $this->applyFilters($jiraApi);

            return new Core\JsonResponse(
                Response::OK,
                $result->getResult()['issues']
            );
        } catch(Exceptions\Api $e) {
            return new Core\JsonResponse(
                Response::BADREQUEST,
                $e->getResponseData()
            );
        }
    }

    /**
     * Todo: add more human params not just a jql.
     *
     * @param \chobie\Jira\Api $jiraApi Jira API Client.
     *
     * @throws \Radio\Exceptions\Api
     * @return Api\Result
     */
    protected function applyFilters(Api $jiraApi)
    {
        $jql = $this->request->query('jql');
        $startAt = $this->request->query('start_at') ?: 0;
        $maxResult = $this->request->query('max_result') ?: 20;
        $fields = $this->request->query('_fields') ?: '*navigable';

        if ($jql) {
            $jiraApi->setOptions(0x00);
            $result = $jiraApi->search($jql, $startAt, $maxResult, $fields);
            $jiraApi->setOptions(0x01);

            return $result;
        } else {
            throw new Exceptions\Api('No JQL provided.');
        }
    }
}