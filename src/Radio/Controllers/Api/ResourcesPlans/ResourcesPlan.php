<?php

namespace Radio\Controllers;

use Radio\Core;
use Tonic\Response;
use chobie\Jira\Api;

/**
 * ResourcesPlan api controller.
 *
 * @uri /api/resources_plans/{resourcesPlanKey}
 */
class Api_ResourcesPlans_ResourcesPlan extends Core\Resource
{
    /**
     * @method GET
     */
    public function showResourcesPlanInfo($resourcesPlanKey)
    {
        /** @var \MongoDB $db */
        $db = $this->app->container['database'];
        $resourcesPlan = $db->resourcesPlans->findOne(array(
            '_id' => $resourcesPlanKey
        ));

        if ($resourcesPlan) {
            $this->expandPlan($resourcesPlan);

            return new Core\JsonResponse(
                Response::OK,
                $resourcesPlan
            );
        } else {
            return new Core\JsonResponse(
                Response::NOTFOUND,
                array(
                    'message' => 'Resources Plan with id "' . $resourcesPlanKey . '" can\'t be found.'
                )
            );
        }
    }

    /**
     * @method PUT
     */
    public function saveResourcesPlan($resourcesPlanKey)
    {
        $plan = $this->request->getDecodedData();

        if ($plan) {
            unset($plan['id']);
            unset($plan['expansion']);

            /** @var \MongoDB $db */
            $db = $this->app->container['database'];
            $db->resourcesPlans->save($plan);

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

    protected function expandPlan(&$report)
    {
        /*
        $expand = $this->request->query('expand');
        if ($expand) {
            $report['expansion'] = array();
            $fields = explode(',', $expand);
            foreach($fields as $field) {

            }
        }
        */
    }
}