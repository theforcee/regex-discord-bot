#!/bin/sh
set -eu

if [ -z "${SEARXNG_SECRET:-}" ]; then
  echo "ERROR: missing SEARXNG_SECRET. Set a long random value in Railway service variables." >&2
  exit 1
fi

if [ "${SEARXNG_SECRET}" = "ultrasecretkey" ]; then
  echo "ERROR: SEARXNG_SECRET must not be the default ultrasecretkey value." >&2
  exit 1
fi

export SEARXNG_SETTINGS_PATH=/tmp/searxng-settings.yml

python3 - <<'PY'
import json
import os
from pathlib import Path

template_path = Path("/etc/searxng/settings.template.yml")
output_path = Path(os.environ["SEARXNG_SETTINGS_PATH"])

secret = os.environ["SEARXNG_SECRET"]
base_url = os.environ.get("SEARXNG_BASE_URL", "").strip()
base_url_line = f"  base_url: {json.dumps(base_url)}" if base_url else "  base_url: false"

content = template_path.read_text(encoding="utf-8")
content = content.replace("__SEARXNG_SECRET_JSON__", json.dumps(secret))
content = content.replace("__SEARXNG_BASE_URL_LINE__", base_url_line)
output_path.write_text(content, encoding="utf-8")
PY

if [ -x /usr/local/searxng/entrypoint.sh ]; then
  exec /usr/local/searxng/entrypoint.sh "$@"
fi

if [ -x ./entrypoint.sh ]; then
  exec ./entrypoint.sh "$@"
fi

echo "ERROR: could not find the original SearXNG entrypoint." >&2
exit 1
