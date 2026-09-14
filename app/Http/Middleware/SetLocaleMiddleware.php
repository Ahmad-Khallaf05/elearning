<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $requested = $request->header('X-Locale');
        $accepted = $request->getLanguages();
        $user = $request->user() ?? auth('sanctum')->user() ?? auth('web')->user();
        $userLocale = $user?->preferred_locale;
        $locale = $this->normalize($requested)
            ?? $this->normalize($accepted[0] ?? null)
            ?? $this->normalize($userLocale)
            ?? config('app.locale', 'ar');

        App::setLocale($locale);
        $request->attributes->set('locale', $locale);

        $response = $next($request);
        $response->headers->set('Content-Language', $locale);

        return $response;
    }

    private function normalize(?string $locale): ?string
    {
        $locale = strtolower(substr((string) $locale, 0, 2));
        return in_array($locale, ['ar', 'en'], true) ? $locale : null;
    }
}
