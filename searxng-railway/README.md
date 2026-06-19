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

## Defaults

- Timezone: `Asia/Ho_Chi_Minh` (UTC+7)
- Search language/region: `vi-VN`
- UI locale: `vi`
- JSON output: enabled
- Image proxy: enabled

## Notes

Public hosting providers can still be rate-limited or challenged by upstream
search engines. If image results become unreliable, check the SearXNG service
logs and `/stats/errors`.
