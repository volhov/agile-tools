<?php

namespace Radio\Controllers;

use Radio\Core\Resource;
use Tonic\Response;

/**
 * Import controller.
 *
 * @uri /import
 */
class Import extends Resource
{
    /**
     * @method GET
     * @template import.html
     */
    public function showHomepage()
    {
        return new Response(Response::OK);
    }

    public function testJiraClient()
    {
        $walker = $this->app->container['jira.walker'];
        $walker->push(
            'project = RR AND issuetype = "Bug Report" AND status in (Open, "In Progress", Reopened)'
        );
        foreach ($walker as $issue) {
            var_dump($issue);
            // send custom notification here.
        }
    }
}