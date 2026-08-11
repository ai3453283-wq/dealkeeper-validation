# DealKeeper Public Validation Site v1

## Purpose

This is a **research validation site**, not the production DealKeeper product.

It tests:
1. whether U.S. users can complete a simple carrier-promotion audit;
2. whether the audit finds meaningful mismatch cases;
3. whether users express willingness to pay at $7.99 / $12.99 / $19.99 per year.

## Privacy architecture

- No carrier password.
- Optional PDF is parsed in-browser with PDF.js.
- The PDF is not uploaded by this build.
- A downloadable research JSON intentionally excludes obvious PII.
- There is no backend or central submission endpoint in v1.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `privacy.html`
- `terms.html`
- `research.html`

## Local preview

Run any static server, e.g.

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

A server is recommended because ES modules may not work correctly from a `file://` URL.

## Publish for $0 with GitHub Pages

1. Create a separate public repository, e.g. `dealkeeper-validation`.
2. Upload these files to the repository root.
3. Repository Settings → Pages.
4. Deploy from branch `main`, folder `/ (root)`.
5. GitHub will provide the public Pages URL.

Keep this repository separate from FORS AI OS and from any future private DealKeeper product repository.

## Central collection

Before recruiting real users, connect one explicit submission route. Options:
- a dedicated research email (manual, zero-cost);
- a free form endpoint;
- a tiny privacy-preserving backend.

Do **not** silently collect full bill PDFs.

## Before real payment

This build does not accept payment. A real checkout/preorder test requires:
- actual merchant/payment account;
- clear beta/preorder disclosure;
- final pricing;
- refund/cancellation terms;
- updated privacy/terms.

## Experiment target

Stage 1: 30 real U.S. Deal Audits.
Then 100.
Only after the parser and funnel perform should the project target 300+ accounts.
