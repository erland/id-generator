# Security and integrity review

## Scope

DEV-021 verifies that generated identifiers, secrets, hash input and file contents remain local and are not persisted or transmitted by the application.

## Findings

### Browser storage

- `localStorage` is used only for the explicit theme preference.
- `sessionStorage` is not used.
- IndexedDB is not used.
- Generated identifiers, secrets, hashes and source file contents are not written to browser storage.

### Network and telemetry

- Generator, secret and hashing modules do not use `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSocket or EventSource.
- There are no analytics or third-party scripts.
- Hashing uses local Web Crypto only.
- Clipboard copying is a local user-initiated browser operation.

### URLs and logs

- Generated values are held in React component state and are not written to query parameters, fragments or browser history.
- No generated values are written to console logs.
- A `no-referrer` meta policy is set to avoid leaking page URLs through the Referer header when navigation leaves the app.

### Cache Storage

The service worker was tightened during this review. Runtime caching now accepts only:

- app navigations within the PWA scope, and
- static script, style, image, font and manifest resources.

Requests containing query parameters are not handled by the service worker cache. This prevents future feature changes from accidentally caching identifiers or secrets embedded in URLs. The cache contains only app-shell/static resources needed for offline operation.

## Residual considerations

- Clipboard contents are controlled by the operating system after the user chooses Copy; the app cannot guarantee how long another application or clipboard manager retains them.
- Browser extensions, compromised devices or screen capture are outside the application's trust boundary.
- Theme preference persistence is intentional and contains no generated data.

## Result

PASS with the broader service-worker caching behavior remediated during the review.
