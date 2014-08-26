<?php

namespace Radio\Core;

/**
 * Overridden Tonic resource.
 * - Template handler added.
 *
 * @package Radio\Core
 */
class Resource extends \Tonic\Resource
{
    /** @var Request */
    protected $request;

    /**
     * Template handler.
     * Load a given template and set response body to its content.
     * Use @template key in PHPDoc for action methods.
     *
     * @param string $templateName Template name.
     */
    public function template($templateName)
    {
        $this->after(function ($response) use ($templateName) {
            $appDir = $this->app->container['dir.web.app'];
            $template = file_get_contents($appDir . '/templates/' . $templateName);

            $response->body = $template;
        });
    }
}