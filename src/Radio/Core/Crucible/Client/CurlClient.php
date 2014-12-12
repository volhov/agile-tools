<?php

namespace Radio\Core;

use chobie\Jira\Api\Authentication\AuthenticationInterface;
use chobie\Jira\Api\Authentication\Basic;
use chobie\Jira\Api\Client\ClientInterface;
use chobie\Jira\Api\Exception as ApiException;
use chobie\Jira\Api\UnauthorizedException;
use Tonic\Application;

class Crucible_Client_CurlClient implements ClientInterface
{
    /**
     * Send request to the api server and get the result.
     *
     * @param string                  $method     Request method.
     * @param string                  $url        Api URL to request (without endpoint).
     * @param array                   $data       POST data.
     * @param string                  $endpoint   The API endpoint.
     * @param AuthenticationInterface $credential Credential object.
     * @param bool                    $isFile     Flag: is the expected response a file?
     * @param bool                    $debug      Flag: is debug mode enabled?
     *
     * @throws UnauthorizedException
     * @throws ApiException
     * @throws \Exception
     *
     * @return array|string
     */
    public function sendRequest($method, $url, $data = array(), $endpoint,
                                AuthenticationInterface $credential, $isFile = false, $debug = false)
    {
        if (!($credential instanceof Crucible_Authentication_Token)) {
            throw new \Exception(
                sprintf('This Client does not support %s authentication.', get_class($credential))
            );
        }

        $curl = curl_init();

        if ($method == 'GET' && $data) {
            $url .= '?' . http_build_query($data);
        }

        if ($credential->getCredential()) {
            $authData = [
                'FEAUTH' => $credential->getCredential()
            ];
            $url .= ($method == 'GET' && $data ? '&' : '?') . http_build_query($authData);
        }

        curl_setopt($curl, CURLOPT_URL, $endpoint . $url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_VERBOSE, $debug);
        if ($isFile) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('X-Atlassian-Token: nocheck'));
        } else {
            if ($method == 'POST' && $method == 'PUT') {
                curl_setopt($curl, CURLOPT_HTTPHEADER,
                    array("Content-Type: application/x-www-form-urlencoded;charset=UTF-8"));
            }
        }
        if ($method == "POST") {
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
        } else {
            if ($method == "PUT") {
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
                curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
            }
        }

        $data = curl_exec($curl);

        $errorNumber = curl_errno($curl);
        if ($errorNumber > 0) {
            throw new ApiException(
                sprintf('Crucible request failed: code = %s, "%s"', $errorNumber, curl_error($curl))
            );
        }

        if (curl_getinfo($curl, CURLINFO_HTTP_CODE) == 401) {
            $message = isset($data['errorMessages']) ? implode(PHP_EOL, $data['errorMessages']) : 'Unauthorized';
            throw new UnauthorizedException($message);
        }

        // if empty result and status != "204 No Content"
        if ($data === '' && curl_getinfo($curl, CURLINFO_HTTP_CODE) != 204) {
            throw new ApiException("Crucible Rest server returns unexpected result.");
        }

        if (is_null($data)) {
            throw new ApiException("Crucible Rest server returns unexpected result.");
        }

        return $data;
    }

    protected function getCookieJarPath(AuthenticationInterface $credential)
    {
        $this->checkCookiesDirPath();
        return $this->cookiesDirPath . '/' . $credential->getCredential();
    }

    protected function checkCookiesDirPath()
    {
        if (!is_dir($this->cookiesDirPath)) {
            mkdir($this->cookiesDirPath, 0755, true);
        }
    }
}