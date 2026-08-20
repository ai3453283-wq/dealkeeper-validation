# DealKeeper Recruitment Radar — 2026-08-20

Purpose: live lead map for acquiring the first 5 clean v4 real audits without mixing problem-biased evidence into the prevalence cohort.

## Technical gate
A clean real audit must have:
- `schema = dealkeeper_research_audit_v4`
- `data_mode = real`
- `eligible_for_first30 = true`
- `synthetic_data = false`
- `actual_data_confirmed = true`

Synthetic demo events are tracked separately and never counted as First 30 evidence.

## Current research baseline
- Clean v4 real audits: 0
- Clean external real protect intents: 0
- SurveyCircle: 0 participants
- SurveySwap: blocked; one old suspicious v2 external row remains pending QA and excluded from clean sample
- r/SampleSize: 117 views, about 41% US, 0 completed audits
- v4 demo path: PASS (`demo_completed` and `demo_protect_intent` separated correctly)

## Fresh public problem signals
These are not prevalence evidence. They are examples showing the class of failure exists and may provide future stress-test candidates where community rules permit.

### T-Mobile
1. Aug 13, 2026 — two device promo credits reportedly disappeared 22 months into a 24-month promotion; user says escalation produced the remaining $160 credit.
   https://www.reddit.com/r/T_mobile_/comments/1vnpq50/psa_check_your_tmobile_promo_credits/

2. Jul 29, 2026 — users report migration-related credit mismatch ($36 vs $41 per free line) and catch-up-credit discussion.
   https://www.reddit.com/r/tmobile/comments/1v9n9tc/psa_check_your_free_line_credits_after_the_july/

3. May 1, 2026 — plan change / revert allegedly caused a device trade-in promo to disappear, leaving a $37.50 monthly device payment without offset.
   https://www.reddit.com/r/tmobile/comments/1t0sebu/agent_confirmed_bill_max_of_282_came_in_at_340/

### Verizon
1. Aug 13, 2026 — trade-in bill credit allegedly missing after more than two months; support reportedly said twice it was fixed.
   https://www.reddit.com/r/verizon/comments/1vnaoky/bill_credits_for_trade/

2. Jun 20, 2026 — two promised $1,300 trade-in promotions disputed months later.
   https://www.reddit.com/r/verizon/comments/1ub4gpq/did_verizon_just_screw_me_out_of_2600_or_do_i/

3. Jan 9, 2026 — trade-in accepted but promo credit allegedly still absent after multiple billing cycles and support contacts.
   https://www.reddit.com/r/verizon/comments/1q87wu5/verizon_not_applying_trade_in_credits/

### AT&T
1. Apr 3, 2026 — $1,100 trade-in credit reportedly disappeared from a later bill.
   https://www.reddit.com/r/ATT/comments/1sbl4wo/missing_trade_in_credit/

2. Feb 16, 2026 — user expected two $1,100 promotions, later saw much smaller credits; update says FCC escalation led to a compensating credit.
   https://www.reddit.com/r/ATT/comments/1r6fj6h/missing_promotional_credits_and_was_told_i_dont/

## Recruitment links
- Neutral direct referral:
  https://ai3453283-wq.github.io/dealkeeper-validation/?src=direct_referral
- General community research:
  https://ai3453283-wq.github.io/dealkeeper-validation/?src=community_research
- AT&T research source:
  https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_att_research
- Verizon research source:
  https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_verizon_research
- T-Mobile research source:
  https://ai3453283-wq.github.io/dealkeeper-validation/?src=reddit_tmobile_research

## Anti-bias rules
- Do not count demo users as real evidence.
- Do not recruit only people already complaining about promo failures.
- First 5 should include at least two neutral/non-complaint cases.
- Prefer at least two carriers in the first 5.
- Problem-thread candidates are for diagnostic stress testing, not prevalence estimation.

## Community compliance
- r/verizon explicitly prohibits solicitation, including referral codes, DMs and requests to move to DMs. Do not recruit there without moderator permission.
- Do not cold-DM users from carrier communities where solicitation is prohibited.
- Check each community's current rules immediately before any research post or link drop.

## Next acquisition order
1. Neutral direct referrals / second-degree U.S. contacts.
2. Research-permitted survey/community channels that accept external studies.
3. Carrier communities only with explicit moderator permission where required.
4. Problem-biased threads only as a separate stress-test cohort.

## Success condition
Stop and review once 5 clean v4 real audits are collected. Match any `protect_intent` by `audit_id`, manually review data quality, and then decide whether to expand to 10–15 or change acquisition/UX.
