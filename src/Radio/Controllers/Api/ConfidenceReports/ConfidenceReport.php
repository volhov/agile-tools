<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * ConfidenceReport api controller.
 *
 * @uri /api/confidence_reports/{confidenceReportKey}
 */
class Api_ConfidenceReports_ConfidenceReport extends Core\Resource
{
    /**
     * @method GET
     */
    public function showConfidenceReportInfo($confidenceReportKey)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];
        $confidenceReport = $db->confidenceReports->findOne(array(
            '_id' => $confidenceReportKey
        ));

        if ($confidenceReport) {
            $this->expandReport($confidenceReport);

            return new Core\JsonResponse(
                Response::OK,
                $confidenceReport
            );
        } else {
            return new Core\JsonResponse(
                Response::NOTFOUND,
                array(
                    'message' => 'Confidence Report with id "' . $confidenceReportKey . '" can\'t be found.'
                )
            );
        }
    }

    /**
     * @method PUT
     */
    public function saveConfidenceReport($confidenceReportKey)
    {
        $report = $this->request->getDecodedData();

        if ($report) {
            unset($report['id']);
            unset($report['expansion']);

            $this->updateIssuesCL($report);

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];
            $db->confidenceReports->save($report);

            $response = new Core\JsonResponse(Response::OK, array(
                'message' => 'Confidence Report has been saved.'
            ));
        } else {
            $response = new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Confidence Report data can\'t be found in the request.'
            ));
        }

        return $response;
    }

    protected function expandReport(&$report)
    {
        $expand = $this->request->query('expand');
        if ($expand) {
            $report['expansion'] = array();
            $fields = explode(',', $expand);
            foreach($fields as $field) {
                switch ($field) {
                    case 'issues':
                        $this->expandReportWithIssues($report);
                        break;
                    case 'reviews':
                        $this->expandReportWithReviews($report);
                        break;
                }
            }
        }
    }

    protected function expandReportWithIssues(&$report)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $report['expansion']['issues'] = array();

        foreach ($report['issues'] as $issueInfo) {
            $issueKey = $issueInfo['key'];
            $issue = $db->issues->findOne(array('_id' => $issueKey));
            if ($issue) {
                $report['expansion']['issues'][] = $issue;
            }
        }
    }

    protected function expandReportWithReviews(&$report)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];

        $report['expansion']['reviews'] = array();

        foreach ($report['issues'] as $issueInfo) {
            $issueKey = $issueInfo['key'];
            $reviews = $db->reviews->find(array('linked_issues' => $issueKey));
            if ($reviews) {
                foreach ($reviews as $review) {
                    $skipReview = false;
                    foreach ($report['expansion']['reviews'] as $addedReview) {
                        if ($addedReview['key'] == $review['key']) {
                            $skipReview = true;
                            break;
                        }
                    }
                    if (!$skipReview) {
                        $report['expansion']['reviews'][] = $review;
                    }
                }
            }
        }
    }

    /**
     * @param array $report Report Data.
     */
    protected function updateIssuesCL(&$report)
    {
        $today = new \DateTime();
        $todayKey = $today->format('Y-m-d');
        foreach ($report['issues'] as &$r) {
            if (isset($r['cl'])) {
                if (!isset($r['cl_by_day'])) {
                    $r['cl_by_day'] = array();
                }
                $r['cl_by_day'][$todayKey] = $r['cl'];
            }
        }
    }
}