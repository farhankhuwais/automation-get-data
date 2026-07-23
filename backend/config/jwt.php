<?php

return [

    'jwt_secret' => env('JWT_SECRET'),

    'jwt_secret_key' => env('JWT_SECRET_KEY'),

    'jwt_public_key' => env('JWT_PUBLIC_KEY'),

    'jwt_passphrase' => env('JWT_PASSPHRASE'),

    'jwt_algo' => env('JWT_ALGO', 'HS256'),

    'jwt_ttl' => env('JWT_TTL', 15),

    'jwt_refresh_ttl' => env('JWT_REFRESH_TTL', 20160),

    'jwt_leeway' => env('JWT_LEEWAY', 0),

    'jwt_required_claims' => [
        'iss',
        'iat',
        'exp',
        'nbf',
        'sub',
        'jti',
    ],

    'jwt_maybe_leeway' => env('JWT_MAYBE_LEEWAY', 0),

    'jwt_blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    'jwt_blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 0),

    'jwt_decrypt_cookies' => false,

    'jwt_providers' => [
        'jwt' => Tymon\JWTAuth\Providers\JWT\Lcobucci::class,
        'firebase' => Tymon\JWTAuth\Providers\Firebase::class,
        'lexik' => Tymon\JWTAuth\Providers\LexikJWT::class,
    ],

];
