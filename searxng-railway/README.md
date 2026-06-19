# SearXNG for Railway

This directory contains a Railway-ready SearXNG service for the Discord bot's
`.img` command.

## Railway deploy

1. Create a new Railway service from this repository.
2. In the service settings, set **Root Directory** to:

   ```txt
   searxng-railway
   ```

3. Railway should detect the `Dockerfile`.
4. Set these variables on the SearXNG service:

   ```env
   PORT=8080
   TZ=Asia/Ho_Chi_Minh
   GRANIAN_HOST=0.0.0.0
   GRANIAN_PORT=8080
   SEARXNG_SECRET=<generate-a-long-random-string>
   ```

   `SEARXNG_SECRET` is required at container startup. Generate a random string
   without angle brackets, for example:

   ```bash
   openssl rand -hex 32
   ```

5. Generate a Railway public domain for the SearXNG service.
6. After you have the domain, set this variable on the SearXNG service:

   ```env
   SEARXNG_BASE_URL=https://your-searxng-service.up.railway.app
   ```

7. Test the JSON image API:

   ```bash
   curl "https://your-searxng-service.up.railway.app/search?q=test&categories=images&format=json"
   ```

   The response should be JSON and include a `results` array.

8. Set the same URL on the Discord bot service:

   ```env
   SEARXNG_BASE_URL=https://your-searxng-service.up.railway.app
   ```

9. Redeploy/restart the Discord bot service.

If the SearXNG service was already crashed before variables were added, trigger
a fresh redeploy after saving the variables.

## Defaults

- Timezone: `Asia/Ho_Chi_Minh` (UTC+7)
- Search language/region: `vi-VN`
- UI locale: `vi`
- JSON output: enabled
- Image proxy: enabled
- Image search prioritizes `google images`, with `bing images` and
  `duckduckgo images` kept as fallback engines.
- Per-engine language overrides are intentionally not set because some image
  engines, including `duckduckgo images`, do not support `vi-VN` at startup.
- Slower/less relevant image engines (`qwant images`, `brave.images`,
  `yandex images`) are disabled by default.

## Discord bot image tuning

The bot defaults to:

```env
SEARXNG_IMAGE_ENGINES=google images;bing images,duckduckgo images
SEARXNG_LANGUAGE=vi-VN
```

Semicolon (`;`) separates retry groups. With the default above, the bot tries
Google Images first. If that returns no usable image results or times out, it
tries Bing Images + DuckDuckGo Images.

If Google Images becomes slow or blocked from Railway, change the bot service
variable to a direct fallback group and redeploy:

```env
SEARXNG_IMAGE_ENGINES=bing images,duckduckgo images
```

For ambiguous Vietnamese queries like `binz`, SearXNG still does not have
Google's personal/location signals. More specific queries such as `binz ca sĩ`
or `binz rapper` will be more reliable. If this bot is mostly used for
Vietnamese people/topics, you can also set:

```env
SEARXNG_QUERY_SUFFIX=việt nam
```

The bot will first search the original query, then retry with the suffix only if
the original query has no usable image result.

## Notes

Public hosting providers can still be rate-limited or challenged by upstream
search engines. If image results become unreliable, check the SearXNG service
logs and `/stats/errors`.
