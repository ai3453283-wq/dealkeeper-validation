# DealKeeper — First 30 Recruitment Protocol

Status: LIVE VALIDATION / first 30 U.S. real-bill audits.

Public site:
https://ai3453283-wq.github.io/dealkeeper-validation/

DealKeeper now has two explicitly separated modes:
- **Real Deal** — real financial promotion/bill values; eligible for First 30 if all quality gates pass.
- **Safe Demo** — made-up values; useful for product comprehension and hypothetical willingness-to-pay only; never counted as First 30 evidence.

Use source-specific links so Formspree records `acquisition_source`.
Do not pretend to be an ordinary consumer if posting as the project operator.
Follow each community's current self-promotion and research rules.
Do not unsolicited-DM members of communities that prohibit solicitation.

## Clean v4 real-audit gate

Count a submission in the First 30 only when all are true:
- `schema = dealkeeper_research_audit_v4`
- `data_mode = real`
- `eligible_for_first30 = true`
- `synthetic_data = false`
- `actual_data_confirmed = true`
- `event_type = audit_completed`
- `data_quality = self_attested_actual`, unless a manually reviewed exception is explicitly accepted

Exclude:
- all `demo_completed` and `demo_protect_intent` events;
- all internal tests;
- old v2/v3 rows from clean prospective v4 statistics;
- the suspicious old SurveySwap v2 response that matched the prior example values.

## Current baseline — 2026-08-20

- Clean v4 real audits: **0**
- Clean external real protect intents: **0**
- SurveyCircle: **0 participants**
- SurveySwap: **blocked**; do not spend more recruitment time there
- r/SampleSize: **117 views**, roughly **41% U.S.**, **0 completed audits**
- v4 Safe Demo technical QA: **PASS** (`demo_completed` and `demo_protect_intent` are separated and `eligible_for_first30=false`)

## Recommended next channels

### Direct referral / second-degree U.S. contacts — priority 1
Tracked link:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=direct_referral

Suggested copy:

Do you currently have an AT&T, Verizon or T-Mobile phone promotion paid through monthly bill credits?

I'm helping test a free independent tool called DealKeeper that checks whether the credits match the deal that was promised. We are looking for the first few real U.S. audits before deciding whether the product should be built further.

It does not need your carrier login, phone number, account number or contract/order ID. The financial promotion values are enough for the check. An optional bill PDF stays in the browser and is not uploaded by this research build.

If you do not have a current promotion, there is also a Safe Demo using made-up numbers so you can see how DealKeeper works without sharing real bill data.

https://ai3453283-wq.github.io/dealkeeper-validation/?src=direct_referral

### General research-permitted community
Tracked link:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=community_research

Use only where external research links are allowed.

Suggested title:
Free independent wireless promo-credit audit / Safe Demo — AT&T, Verizon, T-Mobile

Suggested body:
I'm testing a small independent consumer research project called DealKeeper.

If you have a current U.S. AT&T, Verizon or T-Mobile device/trade-in promotion paid through monthly bill credits, the Real Deal mode compares the promised promotion with the credits on your bill.

If you do not have a current promotion, the Safe Demo lets you make up a scenario and see the same logic without sharing real bill data.

Privacy design:
- no carrier login required;
- no real phone number, account number or contract/order ID needed;
- optional PDF is processed locally in the browser and is not uploaded in this build;
- synthetic demo records are explicitly separated from real research evidence.

Research page:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=community_research

Independent research beta; not affiliated with AT&T, Verizon or T-Mobile.

### r/SampleSize
Existing tracked link:
https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_samplesize

Existing post produced 117 views but no completed audits. Do not repost the same study immediately. A future repost should only happen if subreddit timing/rules permit and should lead with the new Safe Demo / privacy-reduced flow rather than repeating the prior copy.

## Carrier communities — permission first

Carrier-specific communities contain highly relevant users, but they create strong selection bias and often have anti-solicitation rules.

Do not post a DealKeeper recruitment link into a carrier-specific subreddit until current rules have been checked or moderator permission obtained.

Known rule: r/verizon explicitly prohibits solicitation, including referral codes, direct messages and requests to take conversations to DM. Do not recruit there without moderator permission.

Moderator permission request template:

Hello moderators — I'm running a small independent consumer research validation for U.S. wireless customers. DealKeeper checks device/trade-in bill-credit promotions without asking for carrier login credentials, phone numbers or account numbers. The optional PDF stays in the user's browser. We now also have a Safe Demo using synthetic values for people who only want to understand the tool. Real and synthetic submissions are technically separated. Would you allow one clearly labeled research/recruitment post? If yes, I will follow any title, flair, link and disclosure requirements you specify.

## Current public problem signals — stress-test cohort only

These are evidence that the problem class exists, but they are **not prevalence evidence** because the users are already reporting problems.

T-Mobile:
- https://www.reddit.com/r/T_mobile_/comments/1vnpq50/psa_check_your_tmobile_promo_credits/
- https://www.reddit.com/r/tmobile/comments/1v9n9tc/psa_check_your_free_line_credits_after_the_july/
- https://www.reddit.com/r/tmobile/comments/1t0sebu/agent_confirmed_bill_max_of_282_came_in_at_340/

Verizon:
- https://www.reddit.com/r/verizon/comments/1vnaoky/bill_credits_for_trade/
- https://www.reddit.com/r/verizon/comments/1ub4gpq/did_verizon_just_screw_me_out_of_2600_or_do_i/
- https://www.reddit.com/r/verizon/comments/1q87wu5/verizon_not_applying_trade_in_credits/

AT&T:
- https://www.reddit.com/r/ATT/comments/1sbl4wo/missing_trade_in_credit/
- https://www.reddit.com/r/ATT/comments/1r6fj6h/missing_promotional_credits_and_was_told_i_dont/

Do not use five known-problem cases as the first five audits. Keep this cohort separate from neutral prevalence validation.

## First-5 checkpoint before First 30

Do not chase 30 immediately. First collect 5 clean v4 real audits and review them.

Target mix:
- at least 2 carriers represented;
- at least 2 neutral/non-complaint cases;
- ideally 1 new promotion still in activation/grace period;
- ideally 1 suspected mismatch case;
- remaining cases neutral or mixed.

After five, review:
- completion friction;
- data-quality problems;
- ON TRACK / WAITING / CHECK / MISSING / SHORTFALL mix;
- manual ground truth for any suspected discrepancy;
- protect-intent conversion by price;
- acquisition-source quality.

## What NOT to say

Do not claim:
- "We found carrier errors in X% of bills" until a real reviewed cohort supports it;
- "We guarantee you will recover money";
- "Your bill is wrong" based only on simplified prototype logic;
- affiliation with AT&T, Verizon or T-Mobile;
- that PDFs are centrally stored.

Do not recruit only from complaint threads.

## Formspree review fields

For each clean real `audit_completed` submission track:
- participant_id
- audit_id
- schema
- acquisition_source
- data_mode
- eligible_for_first30
- synthetic_data
- actual_data_confirmed
- data_quality
- carrier
- result_status
- promised_value
- remaining_value
- price_variant

For real `protect_intent`, match on the same `audit_id`.

For demo events, keep separate:
- `demo_completed`
- `demo_protect_intent`

Primary outputs:
- completed clean real audits by carrier;
- result-status distribution;
- manually reviewed suspected discrepancy rate;
- real protect-intent conversion by price;
- demo comprehension / hypothetical WTP separately;
- acquisition-source mix and conversion.
