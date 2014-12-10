<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Exceptions;
use Tonic\Response;

/**
 * Jira IssueTypes controller.
 *
 * @uri /api/jira/issue_types
 */
class Api_Jira_IssueTypes extends Core\Resource
{
    /**
     * Get list of issue_types.
     *
     * @method GET
     */
    public function listIssueTypes()
    {
        /** @var Core\Jira_Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];

        try {
            $issueTypes = $jiraApi->getIssueTypes(true);

            return new Core\JsonResponse(
                Response::OK,
                $issueTypes
            );
        } catch(Exceptions\Api $e) {
            return new Core\JsonResponse(
                Response::BADREQUEST,
                $e->getResponseData()
            );
        }
    }
}