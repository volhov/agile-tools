<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Projects controller.
 *
 * @uri /api/confidence_reports
 */
class Api_ConfidenceReports extends Core\Resource
{
    /**
     * @method POST
     */
    public function addReport()
    {
        $report = json_decode($this->request->data, true);

        if ($report) {

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];

            try {
                $db->confidenceReports->insert($report);
                return new Core\JsonResponse(Response::OK, array(
                    'message' => 'Confidence Report has been added.'
                ));
            } catch (\MongoDuplicateKeyException $e) {
                return new Core\JsonResponse(Response::FORBIDDEN, array(
                    'message' => 'Such report already exists.'
                ));
            }
        } else {
            return new Core\JsonResponse(Response::BADREQUEST, array(
                'message' => 'Data is not found in request.'
            ));
        }
    }
}