<?php

namespace Radio\Controllers;

use Radio\Core;
use Radio\Exceptions;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * Crucible Reviews controller.
 *
 * @uri /api/crucible/reviews
 */
class Api_Crucible_Reviews extends Core\Resource
{
    /**
     * Get list of issues.
     *
     * @method GET
     */
    public function listReviews()
    {
        /** @var Core\Crucible_Api $crucibleApi */
        $crucibleApi = $this->app->container['crucible.api'];

        try {
            $result = $this->applyFilters($crucibleApi);

            return new Core\JsonResponse(
                Response::OK,
                $result->getResult()['reviewData']
            );
        } catch(Exceptions\Api $e) {
            return new Core\JsonResponse(
                Response::BADREQUEST,
                $e->getResponseData()
            );
        }
    }

    /**
     * @param Core\Crucible_Api $crucibleApi Crucible API Client.
     *
     * @throws \Radio\Exceptions\Api
     * @return Api\Result
     */
    protected function applyFilters(Core\Crucible_Api $crucibleApi)
    {
        $issueKey = $this->request->query('issue_key');

        if ($issueKey) {
            $result = $crucibleApi->getReviewsForIssue($issueKey);

            return $result;
        } else {
            throw new Exceptions\Api('No Issue Key provided.');
        }
    }
}