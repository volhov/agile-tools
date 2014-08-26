<?php

namespace Radio\Core;

abstract class Adapter
{
    /** @var mixed Original data. */
    protected $original;

    /** @var mixed Adapted data. */
    protected $adapted;

    /**
     * Set original data.
     *
     * @param mixed|null $original
     */
    public function __construct($original = null)
    {
        $this->setOriginal($original);
    }

    /**
     * @param mixed $original
     */
    public function setOriginal($original)
    {
        $this->original = $original;
    }

    /**
     * Run adaptation.
     *
     * @return void
     */
    abstract protected function adapt();

    /**
     * Get Adapted data.
     *
     * @throws \Radio\Exceptions\Adapter
     * @return mixed
     */
    public function getAdaptation()
    {
        if ($this->adapted === null) {
            if ($this->original === null) {
                throw new \Radio\Exceptions\Adapter('Original data is not set.');
            }
            $this->adapt();
        }

        return $this->adapted;
    }
}