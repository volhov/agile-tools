<?php

namespace Radio\Controllers;

use Radio\Adapters;
use Radio\Core;
use Tonic\Response;

/**
 * Import issue controller.
 *
 * @uri /api/issues/import
 */
class Api_Issues_Import extends Core\Resource
{
    /**
     * @method POST
     */
    public function importIssues()
    {
        $keys = $this->getIssueKeys();

        if ($keys) {
            $this->importIssuesByKeys($keys);

            return new Core\JsonResponse(
                Response::OK,
                array(
                    'message' => count($keys) == 1
                        ? 'Issue ' . $keys[0] . ' has been imported.'
                        : count($keys) . ' issues  have been imported.'
                )
            );
        }

        return new Core\JsonResponse(
            Response::BADREQUEST,
            array(
                'message' => 'Issue key is not defined.'
            )
        );
    }

    protected function importIssuesByKeys(array $keys)
    {
        /** @var Core\Jira_Api $jiraApi */
        $jiraApi = $this->app->container['jira.api'];

        if ($keys) {
            $jiraApi->setOptions(0x00);
            $searchResult = $jiraApi->search('key in (' . implode(',', $keys) . ')', 0, 50)
                ->getResult();
            $jiraApi->setOptions(0x01);

            foreach ($searchResult['issues'] as $jiraIssue) {
                $this->importOneIssue($jiraIssue);
            }
        }
    }

    /**
     * Import issue and all it's sub-issues by issue key.
     *
     * @param array $jiraIssue      Jira Issue.
     * @param bool  $importSubtasks Import sub-tasks?
     */
    protected function importOneIssue($jiraIssue, $importSubtasks = true)
    {
        $adapter = new Adapters\Jira_Issue($jiraIssue);
        $issue = $adapter->getAdaptation();

        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $db->issues->save($issue);

        if ($issue['issuetype']['name'] == 'Sub-task') {
            $db->issues->update(
                ['subtasks.key' => $issue['key']],
                ['$set' => [
                    'subtasks.$.assignee' => $issue['assignee'],
                    'subtasks.$.issuetype.custom' => $issue['issuetype']['custom']
                ]]
            );
        }

        if ($importSubtasks && $issue['subtasks']) {
            $subTaskKeys = array();
            foreach ($issue['subtasks'] as $subTaskIssue) {
                $subTaskKeys[] = $subTaskIssue['key'];
            }
            $this->importIssuesByKeys($subTaskKeys);
        }
    }

    /**
     * @return array
     */
    protected function getIssueKeys()
    {
        $requestData = $this->request->getDecodedData();

        $keys = array();
        if (isset($requestData['key'])) {
            $keys = array($requestData['key']);
            return $keys;
        } elseif (isset($requestData['keys'])) {
            $keys = $requestData['keys'];
            return $keys;
        }
        return $keys;
    }
}