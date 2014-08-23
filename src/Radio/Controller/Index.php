<?php

namespace Radio\Controller;

use Tonic\Resource;
use Tonic\Response;

/**
 * Index controller.
 *
 * @uri /
 */
class Index extends Resource
{
    /**
     * @method GET
     */
    function showHomepage()
    {
        $walker = $this->app->container['jira.walker'];
        $walker->push(
            'project = RR AND issuetype = "Bug Report" AND status in (Open, "In Progress", Reopened)'
        );
        foreach ($walker as $issue) {
            var_dump($issue);
            // send custom notification here.
        }

        return new Response(Response::OK, 'Example response');
    }
}