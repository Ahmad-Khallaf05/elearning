<?php

namespace App\Providers;

use App\Events\OrderPaid;
use App\Listeners\RenderInvoice;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [OrderPaid::class => [RenderInvoice::class]];
}
