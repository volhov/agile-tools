<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Jira Issue controller.
 *
 * @uri /api/jira/issues/{issueKey}
 */
class Api_Jira_Issues_Issue extends Core\Resource
{
    /**
     * @method GET
     */
    public function showIssueInfo($issueKey)
    {
        /** @var Core\Jira_Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];
        /** @var Api\Result $result */
        $result = $jiraApi->getIssue($issueKey);

        $issue = $result->getResult();

        $response = new Core\JsonResponse();
        if (isset($issue['key'])) {
            $response->code = Response::OK;
            $response->body = $issue;
        } else {
            $response->code = Response::NOTFOUND;
            $response->body = $issue;
        }
        return $response;
    }
}