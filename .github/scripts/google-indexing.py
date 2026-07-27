"""Submit changed URLs to Google Indexing API after each deploy.

Compares the current sitemap against a cached snapshot to detect new or
updated URLs, then submits only those. On first run (no cache), submits
all URLs up to the daily quota (200).

Requires GOOGLE_SA_CREDENTIALS env var with the service account JSON.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

import jwt

SITEMAP_URLS = [
    "https://zivvy.xyz/sitemap.xml",
]
DOMAINS = ["https://zivvy.xyz", "https://www.zivvy.xyz"]
API = "https://indexing.googleapis.com/v3/urlNotifications:publish"
CACHE_FILE = ".sitemap-cache.json"
DAILY_QUOTA = 200


def get_access_token(creds: dict) -> str:
    now = int(time.time())
    payload = {
        "iss": creds["client_email"],
        "scope": "https://www.googleapis.com/auth/indexing",
        "aud": creds["token_uri"],
        "iat": now,
        "exp": now + 3600,
    }
    signed = jwt.encode(payload, creds["private_key"], algorithm="RS256")
    data = urllib.parse.urlencode(
        {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": signed,
        }
    ).encode()
    resp = urllib.request.urlopen(
        urllib.request.Request(creds["token_uri"], data=data)
    )
    return json.loads(resp.read())["access_token"]


def fetch_sitemap(url: str) -> dict[str, str]:
    """Return {url: lastmod} from a sitemap."""
    req = urllib.request.Request(url, headers={"User-Agent": "ZivvyIndexBot/1.0"})
    resp = urllib.request.urlopen(req, timeout=15)
    root = ET.fromstring(resp.read())
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    entries = {}
    for url_el in root.findall(".//sm:url", ns):
        loc = url_el.findtext("sm:loc", namespaces=ns)
        lastmod = url_el.findtext("sm:lastmod", namespaces=ns) or ""
        if loc:
            entries[loc.strip()] = lastmod.strip()
    return entries


def load_cache() -> dict[str, str]:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def save_cache(entries: dict[str, str]):
    with open(CACHE_FILE, "w") as f:
        json.dump(entries, f)


def submit_url(token: str, url: str) -> tuple[bool, str]:
    body = json.dumps({"url": url, "type": "URL_UPDATED"}).encode()
    req = urllib.request.Request(
        API,
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        resp = urllib.request.urlopen(req)
        return True, "OK"
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:200]
        if e.code == 429:
            return False, "QUOTA_EXHAUSTED"
        return False, f"HTTP {e.code}: {detail}"


def main():
    creds_json = os.environ.get("GOOGLE_SA_CREDENTIALS")
    if not creds_json:
        print("::error::GOOGLE_SA_CREDENTIALS secret not set")
        sys.exit(1)

    creds = json.loads(creds_json)
    print("Authenticating with Google service account...")
    token = get_access_token(creds)
    print("Authenticated.\n")

    # Fetch current sitemap
    current = {}
    for sitemap_url in SITEMAP_URLS:
        print(f"Fetching {sitemap_url}...")
        entries = fetch_sitemap(sitemap_url)
        current.update(entries)
    print(f"Sitemap contains {len(current)} URLs.\n")

    # Load cached snapshot
    cached = load_cache()
    first_run = len(cached) == 0

    # Detect changed URLs (new or updated lastmod)
    changed_paths = set()
    for url, lastmod in current.items():
        if url not in cached or cached[url] != lastmod:
            path = url.replace("https://zivvy.xyz", "")
            changed_paths.add(path or "/")

    if first_run:
        print(f"First run — submitting all {len(current)} URLs across {len(DOMAINS)} domains.\n")
    elif changed_paths:
        print(f"Changed URLs since last run: {len(changed_paths)}\n")
        for p in sorted(changed_paths)[:20]:
            print(f"  {p}")
        if len(changed_paths) > 20:
            print(f"  ... and {len(changed_paths) - 20} more")
        print()
    else:
        print("No URLs changed since last run. Nothing to submit.\n")
        save_cache(current)
        return

    # Build submission list: changed paths across all domains
    submit_urls = []
    for path in sorted(changed_paths):
        for domain in DOMAINS:
            submit_urls.append(f"{domain}{path}")

    print(f"Submitting {len(submit_urls)} URLs (capped at {DAILY_QUOTA}/day)...\n")

    ok = 0
    errors = 0
    for i, url in enumerate(submit_urls[:DAILY_QUOTA], 1):
        success, msg = submit_url(token, url)
        if success:
            ok += 1
            print(f"  [{i:3d}] OK  {url}")
        elif msg == "QUOTA_EXHAUSTED":
            print(f"\n  Quota exhausted after {ok} submissions.")
            print(f"  Remaining {len(submit_urls) - i} URLs will be picked up tomorrow.")
            break
        else:
            errors += 1
            print(f"  [{i:3d}] ERR {url} — {msg[:80]}")

    # Save cache regardless — next run will only submit genuinely new changes
    save_cache(current)

    print(f"\nDone: {ok} submitted, {errors} errors")
    if len(submit_urls) > DAILY_QUOTA:
        print(f"Note: {len(submit_urls) - DAILY_QUOTA} URLs exceed daily quota and will be submitted on subsequent runs.")


if __name__ == "__main__":
    main()
