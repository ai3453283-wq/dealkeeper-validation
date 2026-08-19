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
  note.textContent = "SurveyCircle participant? Use Real Deal mode with your actual eligible promotion and bill. Your SurveyCircle redeem code will appear after a completed real audit.";
  document.querySelector(".hero")?.appendChild(note);
}

if(acquisitionSource === "surveyswap"){
  const note = document.createElement("div");
  note.className = "hint";
  note.style.marginTop = "14px";
  note.textContent = "SurveySwap participant? Use Real Deal mode with values from your actual eligible promotion and bill. Demo mode is available for learning, but does not issue a SurveySwap completion code.";
  document.querySelector(".hero")?.appendChild(note);
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

let currentMode = "real";
let latestAudit = null;
let latestAuditSubmitted = false;
let latestProtectSubmitted = false;

function event(type, data={}){
  const events = JSON.parse(localStorage.getItem("dk_events_v1") || "[]");
  events.push({
    ts:new Date().toISOString(),
    type,
    data_mode:currentMode,
    price_variant:assignedPrice,
    acquisition_source:acquisitionSource,
    ...data
  });
  localStorage.setItem("dk_events_v1", JSON.stringify(events));
}

event("landing_view");

async function submitResearch(eventType, audit){
  const payload = {
    _subject:`DealKeeper research: ${eventType}`,
    event_type:eventType,
    participant_id:participantId,
    audit_id:audit.audit_id,
    schema:audit.schema,
    qa_version:audit.qa_version,
    created_at:new Date().toISOString(),
    data_mode:audit.data_mode,
    eligible_for_first30:audit.eligible_for_first30,
    synthetic_data:audit.synthetic_data,
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

function money(n){ return `$${Number(n || 0).toFixed(2)}`; }

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
    return {
      status:"WAITING",
      severity:"warn",
      monthlyExpected,
      cumulativeExpected,
      explanation:`You are still within this prototype's conservative activation window for ${carrier}. A missing credit is not treated as an error yet.`
    };
  }

  if(actualCurrent <= .25 && billMonth > grace){
    return {
      status:"MISSING",
      severity:"bad",
      monthlyExpected,
      cumulativeExpected,
      explanation:"No current promotional credit was entered after the conservative activation window. This needs verification against the exact promotion terms before treating it as a carrier error."
    };
  }

  if(actualCumulative < cumulativeExpected - tolerance){
    return {
      status:"SHORTFALL",
      severity:"bad",
      monthlyExpected,
      cumulativeExpected,
      explanation:"Credits received to date are below the simple expected schedule. Catch-up credits, upfront trade-in value and exact offer terms must be checked before escalating."
    };
  }

  if(actualCumulative > cumulativeExpected + tolerance){
    return {
      status:"CHECK",
      severity:"warn",
      monthlyExpected,
      cumulativeExpected,
      explanation:"Credits received are above the simple expected schedule. This can be legitimate catch-up behavior; review the exact offer terms."
    };
  }

  return {
    status:"ON TRACK",
    severity:"good",
    monthlyExpected,
    cumulativeExpected,
    explanation:"The values entered are consistent with a simple monthly credit schedule. Exact promotion terms still control."
  };
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

function clearAuditInputs(){
  $("carrier").value = "";
  $("promised").value = "";
  $("term").value = "";
  $("billMonth").value = "";
  $("instant").value = "";
  $("actualCurrent").value = "";
  $("actualCumulative").value = "";
  $("actualDataConfirm").checked = false;
  $("consent").checked = false;
  $("demoConsent").checked = false;
  $("pdfInput").value = "";
  $("pdfStatus").textContent = "";
  $("textDetails").hidden = true;
  $("extractedText").value = "";
  $("formError").textContent = "";
  $("result").hidden = true;
  $("intentThanks").hidden = true;
  $("surveyCircleCompletion")?.remove();
  $("surveySwapCompletion")?.remove();
  latestAudit = null;
  latestAuditSubmitted = false;
  latestProtectSubmitted = false;
}

function setMode(mode, clear=true){
  currentMode = mode === "demo" ? "demo" : "real";
  if(clear) clearAuditInputs();

  const isDemo = currentMode === "demo";
  $("modeRealBtn").classList.toggle("active", !isDemo);
  $("modeDemoBtn").classList.toggle("active", isDemo);
  $("modeRealBtn").setAttribute("aria-pressed", String(!isDemo));
  $("modeDemoBtn").setAttribute("aria-pressed", String(isDemo));

  $("demoTools").hidden = !isDemo;
  $("realPdfTools").hidden = isDemo;
  $("realConsentBlock").hidden = isDemo;
  $("demoConsentBlock").hidden = !isDemo;

  $("step1Title").textContent = isDemo ? "Invent a promotion scenario" : "Tell us what you were promised";
  $("step1Hint").innerHTML = isDemo
    ? "<strong>Safe demo:</strong> every number may be fictional. Do not enter personal, account, contract or credential information."
    : "<strong>Real audit:</strong> use the financial values from your actual wireless promotion. No identity or contract identifiers are requested.";
  $("step2Title").textContent = isDemo ? "Invent the bill credits" : "Check your current bill";
  $("step2Hint").textContent = isDemo
    ? "Make up the current and cumulative promo credits. DealKeeper will run the same reconciliation logic, but the result is labeled synthetic and excluded from the First 30."
    : "Enter the credit amounts shown on your own bill. Optional PDF extraction runs locally in your browser; the PDF and extracted text are not submitted.";

  $("promised").placeholder = isDemo ? "Make up a value, e.g. 900" : "Enter the promised value";
  $("billMonth").placeholder = isDemo ? "Make up a bill month" : "Enter the current bill month";
  $("actualCurrent").placeholder = isDemo ? "Make up this month's credit" : "Enter the credit on this bill";
  $("actualCumulative").placeholder = isDemo ? "Make up cumulative credits" : "Enter cumulative credits";
  $("auditBtn").textContent = isDemo ? "Run synthetic DealKeeper demo" : "Run my real deal audit";

  $("confidenceLabel").textContent = isDemo ? "Synthetic demo" : "Research estimate";
  $("wtpQuestion").textContent = isDemo
    ? "If you had a real deal like this, would you pay to protect it?"
    : "Would you pay to protect the rest of this deal?";
  $("wtpCopy").textContent = isDemo
    ? "This is a hypothetical willingness-to-pay question. A future DealKeeper service would monitor real bills and flag missing or reduced credits."
    : "A future DealKeeper service would check every bill until your promotion ends and flag missing or reduced credits.";
  $("protectBtn").textContent = isDemo ? "Yes — I would consider this" : "Yes — protect this deal";
  $("researchShareTitle").textContent = isDemo ? "Synthetic demo record" : "Help validate DealKeeper with real bills";
  $("researchShareCopy").textContent = isDemo
    ? "This scenario is marked synthetic and eligible_for_first30=false. It is useful only for product comprehension and willingness-to-pay research."
    : "We are looking for the first 30 U.S. wireless customers with an active device promotion. The research record excludes the PDF, extracted text, name, phone number, address, account number and contract/order ID.";
  $("submissionStatus").textContent = isDemo
    ? "When you run the demo, only the synthetic scenario plus pseudonymous research metadata is submitted. It is never counted as a real-bill audit."
    : "When you run a real audit, a small pseudonymous research record is submitted to our Formspree research endpoint. Your PDF is not included.";

  event("mode_selected",{selected_mode:currentMode});
}

$("modeRealBtn").addEventListener("click", () => setMode("real"));
$("modeDemoBtn").addEventListener("click", () => setMode("demo"));

$("loadDemoBtn").addEventListener("click", () => {
  if(currentMode !== "demo") return;
  $("carrier").value = "T-Mobile";
  $("promised").value = "900";
  $("term").value = "24";
  $("billMonth").value = "5";
  $("instant").value = "0";
  $("actualCurrent").value = "25";
  $("actualCumulative").value = "125";
  event("demo_sample_loaded");
});

function showSurveyCircleCompletion(){
  if(
    acquisitionSource !== "surveycircle" ||
    !latestAudit ||
    latestAudit.data_mode !== "real" ||
    latestAudit.actual_data_confirmed !== true
  ) return;
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
  if(
    acquisitionSource !== "surveyswap" ||
    !latestAudit ||
    latestAudit.data_mode !== "real" ||
    latestAudit.actual_data_confirmed !== true
  ) return;
  if($("surveySwapCompletion")) return;

  const block = document.createElement("div");
  block.id = "surveySwapCompletion";
  block.className = "thankyou";
  block.style.marginTop = "18px";
  block.innerHTML = `
    <strong>SurveySwap completion</strong><br>
    Your real Deal Audit is complete. Claim your SurveySwap Karma with code <strong>${SURVEYSWAP_CODE}</strong>.<br>
    <a href="${SURVEYSWAP_REDEEM_URL}" target="_blank" rel="noopener">Claim SurveySwap Karma</a>
  `;
  $("result")?.appendChild(block);
  event("surveyswap_code_shown",{audit_id:latestAudit.audit_id});
}

$("extractBtn").addEventListener("click", async () => {
  if(currentMode !== "real") return;
  const file = $("pdfInput").files[0];
  if(!file){
    $("pdfStatus").textContent = "Choose a PDF first.";
    return;
  }
  $("pdfStatus").textContent = "Reading locally…";
  try{
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:bytes}).promise;
    let text = "";
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(x => x.str).join(" ") + "\n";
    }
    $("extractedText").value = text;
    $("textDetails").hidden = false;
    $("pdfStatus").textContent = `Extracted ${pdf.numPages} page(s) in your browser. Nothing was submitted.`;
    event("pdf_local_extract",{pages:pdf.numPages});
  }catch(error){
    console.error(error);
    $("pdfStatus").textContent = "Could not extract this PDF. Enter the credit amounts manually.";
    event("pdf_extract_error");
  }
});

$("auditBtn").addEventListener("click", async () => {
  $("formError").textContent = "";
  const isDemo = currentMode === "demo";

  if(!isDemo && !$("actualDataConfirm").checked){
    $("formError").textContent = "Please confirm that the financial values came from your actual promotion and bill.";
    return;
  }
  if(!isDemo && !$("consent").checked){
    $("formError").textContent = "Please confirm the real-audit research eligibility and consent first.";
    return;
  }
  if(isDemo && !$("demoConsent").checked){
    $("formError").textContent = "Please confirm that you understand this is a synthetic demo and agree to the demo research submission.";
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
    $("formError").textContent = isDemo
      ? "Enter a complete made-up scenario before running the demo."
      : "Enter valid financial values from your actual promotion and bill before running the audit.";
    return;
  }

  const result = classify(vals);
  const qa = isDemo ? {score:0, flag:false} : exampleMatchQA(vals);
  const receivedTotal = vals.instant + vals.actualCumulative;
  const remaining = Math.max(0, vals.promised - receivedTotal);

  latestAuditSubmitted = false;
  latestProtectSubmitted = false;
  $("surveyCircleCompletion")?.remove();
  $("surveySwapCompletion")?.remove();
  $("intentThanks").hidden = true;

  latestAudit = {
    audit_id:randomId("a"),
    schema:"dealkeeper_research_audit_v4",
    qa_version:"real_demo_split_v1",
    created_at:new Date().toISOString(),
    data_mode:currentMode,
    eligible_for_first30:!isDemo,
    synthetic_data:isDemo,
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
    actual_data_confirmed:!isDemo,
    example_match_flag:qa.flag,
    example_match_score:qa.score,
    data_quality:isDemo ? "synthetic_demo" : (qa.flag ? "example_like_needs_review" : "self_attested_actual"),
    direct_identifiers_included:false
  };

  const pill = $("statusPill");
  pill.className = "pill";
  if(result.severity === "warn") pill.classList.add("warn");
  if(result.severity === "bad") pill.classList.add("bad");
  pill.textContent = result.status;

  $("confidenceLabel").textContent = isDemo ? "Synthetic demo — not a real bill" : "Research estimate";
  $("resultHeadline").textContent =
    result.status === "ON TRACK" ? (isDemo ? "This made-up scenario looks on track." : "Your credits appear to match the simple schedule.") :
    result.status === "WAITING" ? (isDemo ? "This made-up scenario is still in the activation window." : "Your credits may still be inside the activation window.") :
    (isDemo ? "DealKeeper would flag this made-up scenario for a closer check." : "Your numbers need a closer promotion check.");

  $("mPromised").textContent = money(vals.promised);
  $("mReceived").textContent = money(receivedTotal);
  $("mRemaining").textContent = money(remaining);
  $("mExpected").textContent = money(result.monthlyExpected);
  $("explanation").textContent = isDemo
    ? `Synthetic example only. ${result.explanation}`
    : result.explanation;

  $("wtpQuestion").textContent = isDemo
    ? "If you had a real deal like this, would you pay to protect it?"
    : "Would you pay to protect the rest of this deal?";
  $("wtpCopy").textContent = isDemo
    ? "This is a hypothetical willingness-to-pay question. A future DealKeeper service would monitor real bills and flag missing or reduced credits."
    : "A future DealKeeper service would check every bill until your promotion ends and flag missing or reduced credits.";
  $("protectBtn").textContent = isDemo ? "Yes — I would consider this" : "Yes — protect this deal";

  $("result").hidden = false;
  $("result").scrollIntoView({behavior:"smooth",block:"start"});

  const completionEvent = isDemo ? "demo_completed" : "audit_completed";
  event(completionEvent,{
    carrier:vals.carrier,
    status:result.status,
    remaining:+remaining.toFixed(2),
    data_quality:latestAudit.data_quality,
    eligible_for_first30:latestAudit.eligible_for_first30
  });

  $("submissionStatus").textContent = isDemo
    ? "Submitting the synthetic demo research record…"
    : "Submitting the pseudonymous real-audit research record…";

  try{
    await submitResearch(completionEvent, latestAudit);
    latestAuditSubmitted = true;
    if(isDemo){
      $("submissionStatus").textContent = "Synthetic demo record submitted. It is marked eligible_for_first30=false and is not counted as a real-bill audit.";
    }else{
      $("submissionStatus").textContent = qa.flag
        ? "Pseudonymous real-audit record submitted and automatically marked for data-quality review. Your PDF was not uploaded."
        : "Pseudonymous real-audit record submitted. Your PDF was not uploaded.";
    }
  }catch(error){
    console.error(error);
    $("submissionStatus").textContent = isDemo
      ? "The demo worked, but the synthetic research record could not be submitted. You can still download it below."
      : "The audit worked, but the pseudonymous research record could not be submitted. You can still download it below.";
  }

  showSurveyCircleCompletion();
  showSurveySwapCompletion();
});

$("protectBtn").addEventListener("click", async () => {
  if(!latestAudit) return;
  const isDemo = latestAudit.data_mode === "demo";
  const intentEvent = isDemo ? "demo_protect_intent" : "protect_intent";
  event(intentEvent,{
    status:latestAudit.result_status,
    remaining:latestAudit.remaining_value,
    data_quality:latestAudit.data_quality,
    eligible_for_first30:latestAudit.eligible_for_first30
  });
  $("intentThanks").hidden = false;
  $("intentThanks").textContent = isDemo
    ? "Hypothetical interest recorded. No payment was taken, and this demo is not counted as a real-bill audit."
    : "Purchase intent recorded. No payment was taken.";

  if(latestProtectSubmitted) return;
  try{
    await submitResearch(intentEvent, latestAudit);
    latestProtectSubmitted = true;
    $("intentThanks").textContent = isDemo
      ? "Hypothetical demo interest submitted. No payment was taken."
      : "Purchase intent submitted. Thank you — no payment was taken.";
  }catch(error){
    console.error(error);
    $("intentThanks").textContent = isDemo
      ? "Hypothetical interest was recorded on this device but could not be submitted. No payment was taken."
      : "Purchase intent was recorded on this device but could not be submitted. No payment was taken.";
  }
});

function auditBlob(){
  if(!latestAudit) return null;
  return new Blob([JSON.stringify(latestAudit,null,2)],{type:"application/json"});
}

$("downloadBtn").addEventListener("click", () => {
  const blob = auditBlob();
  if(!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dealkeeper-${latestAudit.data_mode}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  event("pseudonymous_record_download",{audit_id:latestAudit.audit_id});
});

$("copyBtn").addEventListener("click", async () => {
  if(!latestAudit) return;
  await navigator.clipboard.writeText(JSON.stringify(latestAudit,null,2));
  $("copyBtn").textContent = "Copied";
  event("pseudonymous_record_copy",{audit_id:latestAudit.audit_id});
});

setMode("real", false);
