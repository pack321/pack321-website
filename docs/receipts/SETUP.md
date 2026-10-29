# Pack website receipt submissions

The form lives at `https://pack321wi.org/receipts/` in this repository. It uses the Pack's existing Cloudflare Pages hosting, CSS, navigation, logo and footer. There is no ChatGPT dependency or visitor ChatGPT sign-in. A Resources card links to the form.

## Current activation state

The UI works as a filing preview. Submissions fail closed until the Pack-owned Google service and Cloudflare variables below are configured and tested. No real receipt, Drive file, notification or mailbox has been created by this change.

## Google service

1. In the Pack Google account, create an Apps Script project containing `Code.gs` and `Rules.gs` from this folder. The account needs write access to Drive folder `1zYcK335PXOdCA0F4Ve30RUv2W_SO76Z4`.
2. Generate a strong random signing secret of at least 32 characters. Set the script properties `RECEIPTS_SIGNING_SECRET` and `RECEIPTS_ENABLED=true`. Keep secrets out of Git, browser code and screenshots.
3. Deploy the script as a web app executing as the Pack account. The endpoint must accept requests from the Pages server; application-level access is enforced with the shared HMAC signing secret and five-minute timestamp window. Unsigned requests cannot write or send mail.
4. Verify `receipts@pack321wi.org` exists and forwards to the intended Pack inbox before enabling notifications.

The script saves original uploads and a JSON purchase record to the specified root / financial year / event. It generates `Receipt-EventName-$42.18`. Financial years run August 1–July 31 using the receipt purchase date. Folder creation is locked, and a durable submission marker protects against automatic duplicate retries. Partial upload or uncertain email delivery requires reference-based review. No Drive sharing permissions are changed. The receipt email contains purchase details, original attachments and saved-file links. Replies go to the submitter; no submitter confirmation email is sent.

## Cloudflare Pages

Configure a Turnstile widget for `pack321wi.org` and, if used, `receipts.pack321wi.org`. Store these production runtime variables:

| Variable | Value |
| --- | --- |
| RECEIPTS_SCRIPT_URL | Deployed Pack Google Apps Script `/exec` URL |
| RECEIPTS_SIGNING_SECRET | Secret matching the Apps Script property; store encrypted |
| RECEIPTS_TURNSTILE_SITE_KEY | Turnstile public site key |
| RECEIPTS_TURNSTILE_SECRET | Turnstile secret key; store encrypted |
| RECEIPTS_ENABLED | `true` only for controlled acceptance and after required checks pass |

Redeploy after setting variables. The browser fetches only availability and the public Turnstile site key from GET `/api/receipts`. POST requires same-origin submission, a validated Turnstile token with matching hostname/action, a bounded request body and server signing. Credentials are never returned to the browser. The server confirms matching submission references before displaying success; network errors never become success. Attachment and receipt details are validated again inside the Google service.

Run controlled acceptance with a marked synthetic receipt: confirm original file, metadata, correct year/event folder, actual inbox arrival, and no duplicate files or email on retry. Test July 31 and August 1, missing configuration, invalid files and email failure. Local tests do not prove live Google access, email delivery or DNS.

## Requested subdomain

Attach `receipts.pack321wi.org` to the existing **Pack website Cloudflare Pages project**, not to the former ChatGPT preview. Add the DNS records returned by Cloudflare. Configure a hostname-specific redirect from its root to `https://pack321wi.org/receipts/` (preserve path `/receipts/` if desired). The canonical route is the Pack website page; do not replace the Pack root homepage or add a domain-wide redirect.

DNS, Google deployment and mailbox routing are account configuration steps, not repository code. The unrelated private preview's custom-domain reservation should be removed before activating the Pack-hosted subdomain. No unrelated ScoutHQ or leadership service settings should change.

## Short receipt references

New receipts use `R-2627-0001`: Pack financial year 2026–2027 and a sequential receipt number across all events in that financial year. The counter is a Script Property named `RECEIPT_SEQUENCE_2026–2027`; never reset or delete it. Gaps after failed saves are permitted. The existing script lock serializes counter allocation. Internal request UUIDs remain the duplicate-submission keys; retries retain their allocated reference. Old receipt records retain their original references. The receipt email body, confirmation and new attachment filenames use the short reference. The agreed email subject format remains unchanged.

The script's notification recipient is `wicubscoutpack321@gmail.com`, sent directly to avoid the Cloudflare forward-back-to-sender path. `receipts@pack321wi.org` remains the address for manually emailed receipts. After copying the updated Code.gs into Apps Script, save and update the existing deployment using **New version** so the `/exec` URL remains unchanged. Deploy the website's compatible bridge before the new Google script.
