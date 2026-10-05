## Shop Beispiel

- Site: http://127.0.0.1:4317/
- Scanned: 2026-10-05T09:32:58.008Z
- Status: findings

### Not in the consent config (2)

- `connect.facebook.net` (host) (catalog knows: facebook-embed, meta-pixel)
- `www.facebook.com` (host) (catalog knows: meta-pixel)

To do: add the service to the config, mark it as accepted in the sites file, or ignore the host.

### Active before consent was given (4)

- `_ga_DEMO123456` (cookie, first-party) -> google-analytics-4 [statistics]
- `_ga` (cookie, first-party) -> google-analytics-4 [statistics]
- `region1.google-analytics.com` (host) -> google-analytics-4 [statistics]
- `www.googletagmanager.com` (host) -> google-analytics-4 [statistics]

To do: check that the script is gated by ConsentScript / data-consent markup and that no tag manager loads it regardless of consent.

### Accepted (1)

- `fonts.googleapis.com` (host) (catalog knows: google-fonts) Note: Fonts are loaded on purpose; the client decided.

Observations from an automated scan, not a legal assessment.
