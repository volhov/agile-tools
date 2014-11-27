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
    const SEARCH_MAXRESULT = 50;

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
            $fields = Adapters\Jira_Issue::getRequiredFields();
            $searchResult = $jiraApi->search(
                'key in (' . implode(',', $keys) . ')',
                0,
                self::SEARCH_MAXRESULT,
                implode(',', $fields)
            )->getResult();
            $jiraApi->setOptions(0x01);

            if (isset($searchResult['issues'])) {
                foreach ($searchResult['issues'] as $jiraIssue) {
                    $this->importOneIssue($jiraIssue);
                }
            }
        }
    }

    /**
     * Import issue and all it's sub-issues by issue key.
     *
     * @param array $jiraIssue      Jira Issue.
     * @param bool  $importSubtasks Import sub-tasks?
     */
    protected function importOneIssue($jiraIssue, $importSubtasks = true, $importLinks = true)
    {
        $adapter = new Adapters\Jira_Issue($jiraIssue);
        $issue = $adapter->getAdaptation();

        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $db->issues->save($issue);

        if ($issue['issuetype']['name'] == 'Sub-task') {
            $this->updateSubtasksData($issue);
        }
        if ($issue['issuetype']['name'] == 'Bug Report') {
            $this->updateLinkedBugsData($issue);
        }

        if ($importSubtasks && isset($issue['subtasks']) && count($issue['subtasks'])) {
            $subTaskKeys = array();
            foreach ($issue['subtasks'] as $subTaskIssue) {
                $subTaskKeys[] = $subTaskIssue['key'];
            }
            $this->importIssuesByKeys($subTaskKeys);
        }

        if ($importLinks && isset($issue['links']) && count($issue['links'])
            && $issue['issuetype']['name'] == 'Story') {
            $linksKeys = array();
            foreach ($issue['links'] as $linkedIssue) {
                $linksKeys[] = $linkedIssue['key'];
            }
            $this->importIssuesByKeys($linksKeys);
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

    /**
     * Update subtask data in issues after importing subtask.
     *
     * @param array $issue Imported Issue data.
     */
    protected function updateSubtasksData($issue)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $db->issues->update(
            ['subtasks.key' => $issue['key']],
            ['$set' => [
                'subtasks.$.assignee' => $issue['assignee'],
                'subtasks.$.time' => $issue['time'],
                'subtasks.$.issuetype.custom' => $issue['issuetype']['custom']
            ]]
        );
    }


    /**
     * Update linked bugs data in issues after importing linked bugs.
     *
     * @param array $issue Imported Issue data.
     */
    protected function updateLinkedBugsData($issue)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $db->issues->update(
            ['links.key' => $issue['key']],
            ['$set' => [
                'links.$.assignee' => $issue['assignee'],
                'links.$.time' => $issue['time'],
            ]]
        );
    }
}