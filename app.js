import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs";

const $ = (id) => document.getElementById(id);
const prices = [7.99, 12.99, 19.99];
const assignedPrice = Number(localStorage.getItem("dk_price_v1")) || prices[Math.floor(Math.random() * prices.length)];
localStorage.setItem("dk_price_v1", assignedPrice);
$("price").textContent = `$${assignedPrice.toFixed(2)}/year`;

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjybwwbv";
const SURVEYCIRCLE_CODE = "V2AL-KHJP-5H71-9A52";
const SURVEYCIRCLE_REDEEM_URL = "https://www.surveycircle.com/V2AL-KHJP-5H71-9A52/";
const SURVEYSWAP_CODE = "L35G-K98B-MFYW";
const SURVEYSWAP_REDEEM_URL = "https://surveyswap.io/sr/L35G-K98B-MFYW";
const sourceParam = new URLSearchParams(location.search).get("src");
const cleanSource = (sourceParam || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
if(cleanSource) localStorage.setItem("dk_acquisition_source_v1", cleanSource);
const acquisitionSource = localStorage.getItem("dk_acquisition_source_v1") || "direct";

if(acquisitionSource === "surveycircle"){
  const note = document.createElement("div");
  note.className = "hint";
  note.style.marginTop = "14px";
  note.textContent = "SurveyCircle participant? Complete the audit and your personal SurveyCircle redeem code will appear on the result page.";
  const hero = document.querySelector(".hero");
  hero?.appendChild(note);
}

if(acquisitionSource === "surveyswap"){
  const note = document.createElement("div");
  note.className = "hint";
  note.style.marginTop = "14px";
  note.textContent = "SurveySwap participant? Complete the Deal Audit using values from your actual promotion and bill. Your SurveySwap completion link/code will then appear on the result page so you can claim Karma.";
  const hero = document.querySelector(".hero");
  hero?.appendChild(note);
}

function randomId(prefix){
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${value}`;
}

let participantId = localStorage.getItem("dk_participant_id_v1");
if(!participantId){
  participantId = randomId("p");
  localStorage.setItem("dk_participant_id_v1", participantId);
}

let latestAudit = null;
let latestAuditSubmitted = false;
let latestProtectSubmitted = false;

function event(type, data={}) {
  const events = JSON.parse(localStorage.getItem("dk_events_v1") || "[]");
  events.push({ts:new Date().toISOString(), type, price_variant:assignedPrice, acquisition_source:acquisitionSource, ...data});
  localStorage.setItem("dk_events_v1", JSON.stringify(events));
}
event("landing_view");

async function submitResearch(eventType, audit){
  const payload = {
    _subject: `DealKeeper research: ${eventType}`,
    event_type:eventType,
    participant_id:participantId,
    audit_id:audit.audit_id,
    schema:audit.schema,
    qa_version:audit.qa_version,
    created_at:new Date().toISOString(),
    carrier:audit.carrier,
    promised_value:audit.promised_value,
    instant_value:audit.instant_value,
    term_months:audit.term_months,
    bill_month:audit.bill_month,
    actual_current_credit:audit.actual_current_credit,
    cumulative_recurring_credit:audit.cumulative_recurring_credit,
    result_status:audit.result_status,
    expected_monthly_credit:audit.expected_monthly_credit,
    remaining_value:audit.remaining_value,
    price_variant:audit.price_variant,
    acquisition_source:acquisitionSource,
    actual_data_confirmed:audit.actual_data_confirmed,
    data_quality:audit.data_quality,
    example_match_flag:audit.example_match_flag,
    example_match_score:audit.example_match_score,
    direct_identifiers_included:false,
    pdf_uploaded:false,
    source_host:location.host
  };

  const response = await fetch(FORMSPREE_ENDPOINT,{
    method:"POST",
    headers:{"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify(payload)
  });
  if(!response.ok) throw new Error(`Formspree ${response.status}`);
}

function money(n){return `$${Number(n||0).toFixed(2)}`}

function graceFor(carrier){
  if(carrier === "AT&T") return 4;
  if(carrier === "Verizon") return 3;
  return 2;
}

function classify({carrier,promised,instant,term,billMonth,actualCurrent,actualCumulative}){
  const recurring = Math.max(0, promised - instant);
  const monthlyExpected = recurring / term;
  const cumulativeExpected = monthlyExpected * billMonth;
  const tolerance = Math.max(.25, monthlyExpected * .03);
  const grace = graceFor(carrier);

  if(billMonth <= grace && actualCurrent <= .25){
    return {status:"WAITING", severity:"warn", monthlyExpected, cumulativeExpected,
      explanation:`You are still within this prototype's conservative activation window for ${carrier}. A missing credit is not treated as an error yet.`};
  }

  if(actualCurrent <= .25 && billMonth > grace){
    return {status:"MISSING", severity:"bad", monthlyExpected, cumulativeExpected,
      explanation:`No current promotional credit was entered after the conservative activation window. This needs verification against the exact promotion terms before treating it as a carrier error.`};
  }

  if(actualCumulative < cumulativeExpected - tolerance){
    return {status:"SHORTFALL", severity:"bad", monthlyExpected, cumulativeExpected,
      explanation:`Credits received to date are below the simple expected schedule. Catch-up credits, upfront trade-in value and exact offer terms must be checked before escalating.`};
  }

  if(actualCumulative > cumulativeExpected + tolerance){
    return {status:"CHECK", severity:"warn", monthlyExpected, cumulativeExpected,
      explanation:`Credits received are above the simple expected schedule. This can be legitimate catch-up behavior; review the exact offer terms.`};
  }

  return {status:"ON TRACK", severity:"good", monthlyExpected, cumulativeExpected,
    explanation:`The values you entered are consistent with a simple monthly credit schedule. Exact promotion terms still control.`};
}

function approx(value, target, tolerance){
  return Math.abs(Number(value) - target) <= tolerance;
}

function exampleMatchQA(vals){
  let score = 0;
  if(vals.carrier === "AT&T") score += 1;
  if(approx(vals.promised, 1100, 0.01)) score += 1;
  if(vals.term === 36) score += 1;
  if(vals.billMonth === 6) score += 1;
  if(approx(vals.actualCurrent, 30.56, 0.05)) score += 1;
  if(approx(vals.actualCumulative, 183.34, 0.20) || approx(vals.actualCumulative, 183.36, 0.20)) score += 1;
  return {score, flag:score >= 5};
}

function showSurveyCircleCompletion(){
  if(acquisitionSource !== "surveycircle" || !latestAudit || latestAudit.actual_data_confirmed !== true) return;
  if($("surveyCircleCompletion")) return;

  const block = document.createElement("div");
  block.id = "surveyCircleCompletion";
  block.className = "thankyou";
  block.style.marginTop = "18px";
  block.innerHTML = `
    <strong>SurveyCircle completion</strong><br>
    Redeem your SurveyCircle points with code <strong>${SURVEYCIRCLE_CODE}</strong>.<br>
    <a href="${SURVEYCIRCLE_REDEEM_URL}" target="_blank" rel="noopener">Redeem Survey Code with one click</a>
  `;

  $("result")?.appendChild(block);
  event("surveycircle_code_shown",{audit_id:latestAudit.audit_id});
}

function showSurveySwapCompletion(){
  if(acquisitionSource !== "surveyswap" || !latestAudit || latestAudit.actual_data_confirmed !== true) return;
  if($("surveySwapCompletion")) return;

  const block = document.createElement("div");
  block.id = "surveySwapCompletion";
  block.className = "thankyou";
  block.style.marginTop = "18px";
  block.innerHTML = `
    <strong>SurveySwap completion</strong><br>
    Your Deal Audit is complete. Claim your SurveySwap Karma with code <strong>${SURVEYSWAP_CODE}</strong>.<br>
    <a href="${SURVEYSWAP_REDEEM_URL}" target="_blank" rel="noopener">Claim SurveySwap Karma</a>
  `;

  $("result")?.appendChild(block);
  event("surveyswap_code_shown",{audit_id:latestAudit.audit_id});
}

$("extractBtn").addEventListener("click", async () => {
  const file = $("pdfInput").files[0];
  if(!file){ $("pdfStatus").textContent = "Choose a PDF first."; return; }
  $("pdfStatus").textContent = "Reading locally…";
  try{
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
    let text = "";
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(x=>x.str).join(" ") + "\n";
    }
    $("extractedText").value = text;
    $("textDetails").hidden = false;
    $("pdfStatus").textContent = `Extracted ${pdf.numPages} page(s) in your browser. Nothing was submitted.`;
    event("pdf_local_extract",{pages:pdf.numPages});
  }catch(e){
    console.error(e);
    $("pdfStatus").textContent = "Could not extract this PDF. Enter the credit amounts manually.";
    event("pdf_extract_error");
  }
});

$("auditBtn").addEventListener("click", async () => {
  $("formError").textContent = "";
  if(!$("actualDataConfirm").checked){
    $("formError").textContent = "Please confirm that you entered values from your actual promotion and bill, not example or invented numbers.";
    return;
  }
  if(!$("consent").checked){
    $("formError").textContent = "Please confirm the research-beta consent first.";
    return;
  }
  const promisedRaw = $("promised").value.trim();
  const termRaw = $("term").value.trim();
  const billMonthRaw = $("billMonth").value.trim();
  const instantRaw = $("instant").value.trim();
  const actualCurrentRaw = $("actualCurrent").value.trim();
  const actualCumulativeRaw = $("actualCumulative").value.trim();
  const vals = {
    carrier:$("carrier").value,
    promised:+promisedRaw,
    instant:instantRaw === "" ? 0 : +instantRaw,
    term:+termRaw,
    billMonth:+billMonthRaw,
    actualCurrent:+actualCurrentRaw,
    actualCumulative:+actualCumulativeRaw
  };
  if(
    !["AT&T","Verizon","T-Mobile"].includes(vals.carrier) ||
    !promisedRaw || !termRaw || !billMonthRaw || !actualCurrentRaw || !actualCumulativeRaw ||
    !Number.isFinite(vals.promised) || vals.promised <= 0 ||
    !Number.isFinite(vals.instant) || vals.instant < 0 || vals.instant > vals.promised ||
    ![24,36].includes(vals.term) ||
    !Number.isInteger(vals.billMonth) || vals.billMonth < 1 || vals.billMonth > vals.term ||
    !Number.isFinite(vals.actualCurrent) || vals.actualCurrent < 0 ||
    !Number.isFinite(vals.actualCumulative) || vals.actualCumulative < 0
  ){
    $("formError").textContent = "Enter valid values from your actual promotion and bill before running the audit.";
    return;
  }

  const result = classify(vals);
  const qa = exampleMatchQA(vals);
  const receivedTotal = vals.instant + vals.actualCumulative;
  const remaining = Math.max(0, vals.promised - receivedTotal);

  latestAuditSubmitted = false;
  latestProtectSubmitted = false;
  $("surveyCircleCompletion")?.remove();
  $("surveySwapCompletion")?.remove();
  latestAudit = {
    audit_id:randomId("a"),
    schema:"dealkeeper_research_audit_v3",
    qa_version:"example_copy_guard_v1",
    created_at:new Date().toISOString(),
    carrier:vals.carrier,
    promised_value:vals.promised,
    instant_value:vals.instant,
    term_months:vals.term,
    bill_month:vals.billMonth,
    actual_current_credit:vals.actualCurrent,
    cumulative_recurring_credit:vals.actualCumulative,
    result_status:result.status,
    expected_monthly_credit:+result.monthlyExpected.toFixed(2),
    remaining_value:+remaining.toFixed(2),
    price_variant:assignedPrice,
    acquisition_source:acquisitionSource,
    actual_data_confirmed:true,
    example_match_flag:qa.flag,
    example_match_score:qa.score,
    data_quality:qa.flag ? "example_like_needs_review" : "self_attested_actual",
    direct_identifiers_included:false
  };

  const pill = $("statusPill");
  pill.className = "pill";
  if(result.severity==="warn") pill.classList.add("warn");
  if(result.severity==="bad") pill.classList.add("bad");
  pill.textContent = result.status;

  $("resultHeadline").textContent =
    result.status==="ON TRACK" ? "Your credits appear to match the simple schedule." :
    result.status==="WAITING" ? "Your credits may still be inside the activation window." :
    "Your numbers need a closer promotion check.";

  $("mPromised").textContent = money(vals.promised);
  $("mReceived").textContent = money(receivedTotal);
  $("mRemaining").textContent = money(remaining);
  $("mExpected").textContent = money(result.monthlyExpected);
  $("explanation").textContent = result.explanation;

  $("result").hidden = false;
  $("result").scrollIntoView({behavior:"smooth",block:"start"});
  event("audit_completed",{
    carrier:vals.carrier,
    status:result.status,
    remaining:+remaining.toFixed(2),
    data_quality:latestAudit.data_quality,
    example_match_flag:latestAudit.example_match_flag
  });

  $("submissionStatus").textContent = "Submitting the pseudonymous research record…";
  try{
    await submitResearch("audit_completed", latestAudit);
    latestAuditSubmitted = true;
    $("submissionStatus").textContent = qa.flag
      ? "Pseudonymous audit record submitted and automatically marked for data-quality review. Your PDF was not uploaded."
      : "Pseudonymous audit record submitted. Your PDF was not uploaded.";
  }catch(err){
    console.error(err);
    $("submissionStatus").textContent = "The audit worked, but the pseudonymous research record could not be submitted. You can still download it below.";
  }

  showSurveyCircleCompletion();
  showSurveySwapCompletion();
});

$("protectBtn").addEventListener("click", async () => {
  if(!latestAudit) return;
  event("protect_intent",{
    status:latestAudit.result_status,
    remaining:latestAudit.remaining_value,
    data_quality:latestAudit.data_quality,
    example_match_flag:latestAudit.example_match_flag
  });
  $("intentThanks").hidden = false;
  if(latestProtectSubmitted) return;
  try{
    await submitResearch("protect_intent", latestAudit);
    latestProtectSubmitted = true;
    $("intentThanks").textContent = "Purchase intent submitted. Thank you — no payment was taken.";
  }catch(err){
    console.error(err);
    $("intentThanks").textContent = "Purchase intent was recorded on this device, but could not be submitted. No payment was taken.";
  }
});

function auditBlob(){
  if(!latestAudit) return null;
  return new Blob([JSON.stringify(latestAudit,null,2)],{type:"application/json"});
}
$("downloadBtn").addEventListener("click", () => {
  const blob = auditBlob(); if(!blob) return;
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=u; a.download=`dealkeeper-audit-${Date.now()}.json`; a.click();
  URL.revokeObjectURL(u);
  event("anonymous_record_download");
});
$("copyBtn").addEventListener("click", async () => {
  if(!latestAudit) return;
  await navigator.clipboard.writeText(JSON.stringify(latestAudit,null,2));
  $("copyBtn").textContent = "Copied";
  event("anonymous_record_copy");
});
