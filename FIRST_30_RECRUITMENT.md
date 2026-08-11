# DealKeeper — First 30 Recruitment Copy

Status: LIVE VALIDATION / first 30 U.S. audits.

Public site:
https://ai3453283-wq.github.io/dealkeeper-validation/

Use source-specific links below so Formspree records `acquisition_source` without creating extra submissions.
Do not pretend to be an ordinary consumer if posting as the project operator.
Follow each community's self-promotion and research rules.
Do not unsolicited-DM members of communities that prohibit solicitation.

## Recommended first channels

### r/SampleSize
Tracked link:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_samplesize

Suggested title:
[Casual] Free 2-minute wireless promo audit (US 18+, AT&T / Verizon / T-Mobile customers with an active phone promotion)

Suggested body:
I'm testing a small independent consumer research project called DealKeeper.

If your U.S. wireless carrier promised you a device or trade-in promotion paid through monthly bill credits, the free research beta compares the promotional value you were promised with the credits currently showing on your bill.

Eligibility for this validation cohort:
- age 18+;
- United States;
- AT&T, Verizon or T-Mobile;
- active device/trade-in promotion with at least one current bill.

The beta does not ask for a carrier password. Bill-credit amounts can be entered manually. An optional PDF is read locally in the browser and is not uploaded by this build. The research record excludes direct identifiers such as name, phone number, address and account number.

The purpose is to learn how often real promotions are on track, delayed or mismatched, and whether independent monitoring has enough value to build.

Free audit:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_samplesize

Independent research beta; not affiliated with AT&T, Verizon or T-Mobile.

### r/takemysurvey
Tracked link:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_takemysurvey

Use the same eligibility wording, but follow that community's current requirement to submit the survey/research link in the format its moderators require.

### Direct referral / people you know in the U.S.
Tracked link:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=direct_referral

Copy:
Do you currently have an AT&T, Verizon or T-Mobile phone promotion paid through monthly bill credits?

I'm helping test a free independent tool that checks whether the credits match the deal you were promised. We need the first 30 real U.S. audits before deciding whether to build the product.

It does not need your carrier password. The optional PDF stays in the browser and is not uploaded in this research build.

https://ai3453283-wq.github.io/dealkeeper-validation/?src=direct_referral

## Carrier communities — ask moderators first

Do not post the validation link into a carrier-specific subreddit until its current rules have been checked or moderator permission obtained.

Current research note: r/verizon explicitly prohibits solicitation, including referral-style solicitation, so do NOT recruit there without explicit moderator permission.

Moderator permission request template:

Hello moderators — I'm running a small, no-payment consumer research validation for U.S. wireless customers with active device/trade-in bill-credit promotions. The tool does not ask for carrier credentials and does not upload the optional bill PDF. It produces a simple independent audit and collects a privacy-minimized research record. We are looking for a balanced first cohort, not only people with complaints. Would you allow one clearly labeled research/recruitment post? If yes, I will follow any title/flair/link requirements you specify.

## General community version — only where rules permit research recruitment

**Title:** Looking for AT&T / Verizon / T-Mobile customers with an active phone promo — free independent bill-credit audit

I'm testing a small consumer research project called DealKeeper.

The question is simple: if your carrier promised you $500–$1,500+ in device or trade-in credits over 24–36 months, are the credits on your bill actually matching that promise?

I'm looking for the first 30 U.S. AT&T, Verizon or T-Mobile customers with an active device promotion.

The research beta:
- does not ask for your carrier password;
- can be completed with manually entered bill-credit amounts;
- optionally reads a PDF locally in your browser;
- does not upload the bill PDF in this version;
- is independent and not affiliated with any carrier.

The audit is free. The goal is to learn how often real promotions are delayed, missing or mismatched — and whether people would pay for independent monitoring.

Validation page:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=community

## What NOT to say

Do not claim:
- "We found carrier errors in X% of bills" until the real cohort proves it.
- "We guarantee you will recover money."
- "Your bill is wrong" based only on simplified research rules.
- affiliation with AT&T, Verizon or T-Mobile.
- that full PDFs are centrally stored.

Do not recruit only from complaint threads. That would invalidate the prevalence estimate.

## First-30 cohort mix target

Target exactly:
- 10 AT&T
- 10 Verizon
- 10 T-Mobile

Within each carrier, try to include all three states:
- new promotions still inside the normal activation/grace period;
- mature promotions currently receiving credits normally;
- users who already suspect a mismatch.

A useful first-30 cohort is balanced. It is not a list of 30 known billing complaints.

## Validation data to inspect in Formspree

For each `audit_completed` submission track:
- participant_id
- audit_id
- acquisition_source
- carrier
- result_status
- promised_value
- remaining_value
- price_variant

For `protect_intent`, match on the same `audit_id`.

Primary first-30 outputs:
- completed audits by carrier;
- ON TRACK / WAITING / CHECK / MISSING / SHORTFALL distribution;
- suspected material mismatch rate (requires manual ground-truth review before calling it an error);
- Protect intent conversion by price;
- acquisition source mix.
