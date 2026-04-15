import React, { useState, useCallback, useRef, useEffect } from "react";
import { ethers } from "ethers";
import {
  Users, Lock, Unlock, CheckCircle2, AlertCircle,
  RefreshCw, ArrowUpRight, ArrowDownLeft, ExternalLink,
  ScanLine, Shield, Key, FileWarning, CreditCard,
  ArrowRight, Info, ExternalLink as ExtLink,
} from "lucide-react";
import { useContracts } from "../../hooks/useContracts.js";
import { ADDRESSES, EXPLORER, RELAYER_URL, getAvailableTokens } from "../../lib/contracts.js";
import {
  generateCurveSafeRandom, generateCommitment,
  generateWithdrawProof, parseBackupNote, generateBackupNote,
} from "../../utils/zkutils.js";
import { ensureAllowance, stripHex } from "../../utils/tokenUtils.js";
import { CopyBtn } from "./Dashboard.jsx";
import { useLang } from "../../lib/LanguageContext.jsx";
import { t } from "../../lib/i18n.js";

const BACKEND_URL = RELAYER_URL.replace("/relayer", "");

function Step({ n, label, sub, state }) {
  const bg = state === "done" ? "rgba(16,185,129,0.15)" : state === "active" ? "rgba(99,102,241,0.12)" : "rgba(71,85,105,0.07)";
  const bc = state === "done" ? "rgba(16,185,129,0.3)"  : state === "active" ? "rgba(99,102,241,0.28)"  : "rgba(71,85,105,0.15)";
  return (
    <div className="step-row" style={{ background: bg, borderColor: bc }}>
      <div className="step-num" style={{ background: state === "done" ? "#10b981" : state === "active" ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(71,85,105,0.3)" }}>
        {state === "done" ? <CheckCircle2 size={13} /> : n}
      </div>
      <div>
        <div className="step-text" style={{ color: state === "inactive" ? "var(--text-dim)" : "var(--text)" }}>{label}</div>
        <div className="step-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function Customer({ address, signer, addLog }) {
  const { lang } = useLang();
  const contracts       = useContracts(signer);

  const ZK_STEPS = [
    { n: 1, label: t("s1c", lang), sub: t("s1cs", lang) },
    { n: 2, label: t("s2c", lang), sub: t("s2cs", lang) },
    { n: 3, label: t("s3c", lang), sub: t("s3cs", lang) },
    { n: 4, label: t("s4c", lang), sub: t("s4cs", lang) },
  ];
  const HSP_STEPS = [
    { n: 1, label: t("s1hc", lang), sub: t("s1hcs", lang) },
    { n: 2, label: t("s2hc", lang), sub: t("s2hcs", lang) },
    { n: 3, label: t("s3hc", lang), sub: t("s3hcs", lang) },
    { n: 4, label: t("s4hc", lang), sub: t("s4hcs", lang) },
  ];
  const availableTokens = getAvailableTokens();
  const [mode,           setMode]           = useState(null);
  const [invoiceId,      setInvoiceId]      = useState("");
  const [invoiceAmt,     setInvoiceAmt]     = useState("");
  const [invoiceToken,   setInvoiceToken]   = useState("");
  const [invoiceNote,    setInvoiceNote]    = useState("");
  const [manualInput,    setManualInput]    = useState("");
  const [commitHex,      setCommitHex]      = useState(null);
  const [zkSecrets,      setZkSecrets]      = useState(null);
  const [backupNote,     setBackupNote]     = useState("");
  const [recoveryInput,  setRecoveryInput]  = useState("");
  const [depositDone,    setDepositDone]    = useState(false);
  const [hspUrl,         setHspUrl]         = useState("");
  const [hspUrlInput,    setHspUrlInput]    = useState("");
  const [hspOrderId,     setHspOrderId]     = useState("");
  const [hspRedirected,  setHspRedirected]  = useState(false);
  const [hspConfirmed,   setHspConfirmed]   = useState(false);
  const [paid,           setPaid]           = useState(false);
  const [status,         setStatus]         = useState({ text: t('choosePaymentMode', lang), type: "idle" });
  const fileRef = useRef();
  const hspPollRef = useRef(null);
 
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    let orderId        = params.get("orderId");
    const storedOrder  = sessionStorage.getItem("hsp_pending_order");
    if (!orderId && storedOrder) orderId = storedOrder;
    if (orderId) {
      window.history.replaceState({}, "", window.location.pathname);
      sessionStorage.setItem("hsp_pending_order", orderId);
      setMode("hsp");
      setHspOrderId(orderId);
      setHspRedirected(true);
      setStatus({ text: t('returnedFromHspCheckout', lang), type: "pending" });
    
       let attempts = 0;
       const maxAttempts = 20;
      hspPollRef.current = setInterval(async () => {
        attempts++;
        try {
          const res  = await fetch(`${BACKEND_URL}/hsp/payment-status?orderId=${encodeURIComponent(orderId)}`);
          const data = await res.json();
          if (data?.status?.paid === true) {
            setHspConfirmed(true);
            setPaid(true);
            setStatus({ text: t('hspPaymentConfirmed', lang), type: "success" });
            clearInterval(hspPollRef.current);
            addLog("HSP payment confirmed", orderId);
           return; 
        } 
        
        if (attempts >= maxAttempts) {
            clearInterval(hspPollRef.current);
            setStatus({ text: t('paymentVerificationTimedOut', lang), type: "error" });
          }
        } catch (err) {
          console.warn("[HSP] poll error:", err.message);
        }
      }, 3000);
    }
    return () => clearInterval(hspPollRef.current);
  }, [addLog]);

  const zkCurrentStep  = paid ? 4 : depositDone ? 3 : invoiceId ? 2 : 1;
  const hspCurrentStep = paid ? 4 : hspRedirected ? 3 : hspUrl ? 2 : 1;
  const currentStep    = mode === "hsp" ? hspCurrentStep : zkCurrentStep;
  const stepState      = (n) => n < currentStep ? "done" : n === currentStep ? "active" : "inactive";
  const steps          = mode === "hsp" ? HSP_STEPS : ZK_STEPS;
  const parseQRPayload = (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data.invoiceId) {
        setInvoiceId(data.invoiceId);
        setInvoiceAmt(data.amount || "");
        setInvoiceToken(data.token || "USDT");
         if (data.invoiceNote) setInvoiceNote(data.invoiceNote);
        setStatus({ text: `Invoice loaded \u00B7 ${data.amount || "?"} ${data.token || ""}${data.invoiceNote ? " \u2014 " + data.invoiceNote : ""}`, type: "success" });
        return;
      }
      if (data.hspUrl) {
        setMode("hsp");
        setHspUrl(data.hspUrl);
        setHspOrderId(data.orderId || "");
        setStatus({ text: t('hspCheckoutLoadedFromQR', lang), type: "success" });
        return;
      }
    } catch (_) {}
    const clean = raw.trim();
    if (clean.startsWith("https://pay.hashkey.com") || clean.startsWith("https://merchant-qa.hashkeymerchant.com")) {
      setMode("hsp");
      setHspUrl(clean);
      setStatus({ text: t('hspCheckoutUrlLoaded', lang), type: "success" });
      return;
    }
    const id = clean.startsWith("0x") ? clean : "0x" + clean;
    if (/^0x[0-9a-f]{64}$/i.test(id)) {
      setInvoiceId(id);
      setStatus({ text: t('zkInvoiceLoaded', lang), type: "success" });
    } else {
      setStatus({ text: t('invalidQRPayload', lang), type: "error" });
    }
  };

  const handleQRFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if ("BarcodeDetector" in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const img      = await createImageBitmap(file);
        const codes    = await detector.detect(img);
        if (codes.length > 0) { parseQRPayload(codes[0].rawValue); return; }
      } catch (_) {}
    }
    setStatus({ text: t('qrScanNotSupported', lang), type: "error" });
  }, []);

  const loadManualZK = () => {
    const val = manualInput.trim();
    const id  = val.startsWith("0x") ? val : "0x" + val;
    if (id.length !== 66 || !/^0x[0-9a-f]{64}$/i.test(id)) {
      return setStatus({ text: t('invalidInvoiceIdFormat', lang), type: "error" });
    }
    setInvoiceId(id);
    setManualInput("");
    setStatus({ text: t('invoiceLoaded', lang), type: "success" });
  };

  const loadHSPUrl = () => {
    const url = hspUrlInput.trim();
    if (!url.startsWith("http")) return setStatus({ text: t('enterValidCheckoutUrl', lang), type: "error" });
    setHspUrl(url);
    try {
      const u = new URL(url);
      const id = u.searchParams.get("orderId") || u.pathname.split("/").pop();
      if (id) setHspOrderId(id);
    } catch (_) {}
    setStatus({ text: t('hspCheckoutReadyToPay', lang), type: "success" });
  };

  const recoverFromNote = async () => {
    try {
      setStatus({ text: t('verifyingBackupNote', lang), type: "pending" });
      const { secret, nullifier } = parseBackupNote(recoveryInput.trim());
      const commit = await generateCommitment(secret, nullifier);
      setZkSecrets({ secret: secret.toString(), nullifier: nullifier.toString() });
      setCommitHex(commit);
      setBackupNote(recoveryInput.trim());
      setDepositDone(true);
      setStatus({ text: t('recoveredLoadInvoice', lang), type: "success" });
      addLog("Session recovered from ZK note", null);
    } catch (err) {
      setStatus({ text: t('recoveryFailed', lang) + err.message, type: "error" });
    }
  };

  const deposit = useCallback(async () => {
    if (!address || !contracts) return setStatus({ text: t('connectWalletFirst', lang), type: "error" });
    if (!invoiceId)              return setStatus({ text: t('loadInvoiceFirst', lang), type: "error" });
    try {
      setStatus({ text: t('generatingZKCommitment', lang), type: "pending" });
      const secret    = generateCurveSafeRandom();
      const nullifier = generateCurveSafeRandom();
      const commit    = await generateCommitment(secret, nullifier);
      setZkSecrets({ secret: secret.toString(), nullifier: nullifier.toString() });
      setBackupNote(generateBackupNote(secret, nullifier));
      const inv       = await contracts.paymentGateway.getInvoice(invoiceId);
      const tokenAddr = inv.token;
      const amt       = inv.amount;
      const tokenEntry = Object.values(availableTokens).find(t => t.address.toLowerCase() === tokenAddr.toLowerCase());
      setInvoiceAmt(ethers.formatUnits(amt, tokenEntry?.decimals ?? 6));
      setInvoiceToken(tokenEntry?.symbol ?? "tokens");

      setStatus({ text: t('approvingTokenSpend', lang), type: "pending" });
      await ensureAllowance(signer, tokenAddr, ADDRESSES.privacyPool, amt);

      setStatus({ text: t('awaitingDepositConfirmation', lang), type: "pending" });
      const tx = await contracts.privacyPool.deposit(tokenAddr, "0x" + commit, amt);
      setStatus({ text: t('broadcastingDeposit', lang), type: "pending" });
      await tx.wait();

      setCommitHex(commit);
      setDepositDone(true);
      setStatus({ text: t('committedTx', lang) + tx.hash.slice(0, 16) + "...", type: "success" });
      addLog("Privacy deposit", tx.hash);
    } catch (err) {
      setStatus({ text: t('depositFailed', lang) + (err.reason || err.message), type: "error" });
    }
  }, [address, contracts, signer, invoiceId, addLog, availableTokens]);
 
  const pay = useCallback(async () => {
    if (!zkSecrets) return setStatus({ text: "No ZK secrets  deposit or recover first", type: "error" });
    if (!invoiceId) return setStatus({ text: t('loadInvoiceFirst', lang), type: "error" });
    if (!invoiceAmt || parseFloat(invoiceAmt) <= 0) return setStatus({ text: t('enterValidAmount', lang), type: "error" });
    try {
      setStatus({ text: "Generating ZK proof locally...", type: "pending" });
      const { proof, publicSignals, nullifierHex } = await generateWithdrawProof({
        secret:    BigInt(zkSecrets.secret),
        nullifier: BigInt(zkSecrets.nullifier),
        invoiceId: stripHex(invoiceId),
      });
      setStatus({ text: "Proof generated! Relaying...", type: "pending" });
      const inv = await contracts.paymentGateway.getInvoice(invoiceId);
      const res = await fetch(`${RELAYER_URL}/relay-withdrawal`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof, publicSignals, nullifierHex,
          invoiceIdHex:  stripHex(invoiceId),
          amount:        inv.amount.toString(),
          walletAddress: address,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.details || "Relayer rejected proof");
      setPaid(true);
      setStatus({ text: `Payment relayed privately! tx: ${data.txid?.slice(0, 16)}...`, type: "success" });
      addLog("Private relayed payment", data.txid);
    } catch (err) {
      setStatus({ text: "Payment failed: " + err.message, type: "error" });
    }
  }, [zkSecrets, invoiceId, invoiceAmt, contracts, address, addLog]);

  const reset = () => {
    clearInterval(hspPollRef.current);
    setMode(null);
    setInvoiceId(""); setInvoiceAmt(""); setInvoiceToken(""); setInvoiceNote(""); setManualInput("");
    setCommitHex(null); setZkSecrets(null); setBackupNote(""); setRecoveryInput("");
    setDepositDone(false);
    setHspUrl(""); setHspUrlInput(""); setHspOrderId(""); setHspRedirected(false); setHspConfirmed(false);
    setPaid(false);
    setStatus({ text: t('choosePaymentMode', lang), type: "idle" });
  };

  return (
    <div className="fade-in two-col" style={{ alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div className="action-icon" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}>
              <Users size={18} color="var(--accent2)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>Customer Flow</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                {mode === null ? "Choose how to pay" : mode === "zk" ? "ZK private pool payment" : "HashKey HSP hosted checkout"}
              </div>
            </div>
            {mode && !paid && (
              <button className="btn-secondary" onClick={reset} style={{ marginLeft: "auto", padding: "5px 10px", fontSize: "11px" }}>
                Change
              </button>
            )}
          </div>
          {mode === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              <div className="field-label">{t('howToPay', lang)}</div>
              <div onClick={() => setMode("zk")} style={{ cursor: "pointer", padding: "14px", borderRadius: "12px", border: "2px solid var(--border)", background: "var(--surface)", transition: "all 180ms" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "9px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Shield size={16} color="var(--accent)" />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "13px", color: "var(--text)" }}>{t('zkOption', lang)}</span>
                  <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "var(--accent)" }}>Max Privacy</span>
                </div>
                <p style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.55 }}>
                  Deposit tokens into the ZK pool, generate a Groth16 proof in-browser, and relay payment without exposing your wallet address.
                </p>
              </div>
              <div onClick={() => setMode("hsp")} style={{ cursor: "pointer", padding: "14px", borderRadius: "12px", border: "2px solid var(--border)", background: "var(--surface)", transition: "all 180ms" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "9px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CreditCard size={16} color="var(--accent2)" />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "13px", color: "var(--text)" }}>{t('hspOption', lang)}</span>
                  <span style={{ marginLeft: "auto", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "var(--accent2)" }}>Compliant</span>
                </div>
                <p style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.55 }}>
                  {t('hspOptionDesc', lang)}
                </p>
              </div>
              <button className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ justifyContent: "center", gap: "8px" }}>
                <ScanLine size={15} color="var(--accent2)" /> {t('scanQR', lang)}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQRFile} />
              <div className={`status-bar ${status.type}`}>
                <ScanLine size={13} /><span>{status.text}</span>
              </div>
            </div>
          )}
          {mode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
              {steps.map(s => <Step key={s.n} {...s} state={stepState(s.n)} />)}
            </div>
          )}
          {mode === "zk" && (
            <>
              {!depositDone && (
                <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(245,158,11,0.05)", border: "1px dashed var(--amber)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--amber)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                    <Key size={14} /> {t('resumePayment', lang)}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input className="text-input" value={recoveryInput} onChange={e => setRecoveryInput(e.target.value)}
                      placeholder="Paste your aurion- note here..." style={{ flex: 1, fontSize: "11.5px", background: "rgba(0,0,0,0.2)" }} />
                    <button className="btn-secondary" onClick={recoverFromNote}
                      disabled={!recoveryInput.trim() || status.type === "pending"}
                      style={{ padding: "8px 16px", fontSize: "11px", borderColor: "var(--amber)", color: "var(--amber)" }}>
                      {status.type === "pending" && recoveryInput ? <RefreshCw size={12} className="spin" /> : "Recover"}
                    </button>
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "6px" }}>{t('resumeNote', lang)}</div>
                </div>
              )}
              {!depositDone && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>{t('orStartNew', lang)}</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>
              )}
              {!invoiceId && !depositDone && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ justifyContent: "center", gap: "8px" }}>
                    <ScanLine size={15} color="var(--accent2)" /> {t('scanMerchantQR', lang)}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQRFile} />
                  <div>
                    <div className="field-label">{t('invoiceId', lang)}</div>
                    <input className="text-input" value={manualInput} onChange={e => setManualInput(e.target.value)}
                      placeholder={t('pasteHex', lang)} style={{ fontFamily: "var(--mono)", fontSize: "11.5px" }} />
                  </div>
                  <div className={`status-bar ${status.type}`}><ScanLine size={13} /><span>{status.text}</span></div>
                  <button className="btn-primary" onClick={loadManualZK} disabled={!manualInput.trim()}
                    style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent))" }}>
                    <ArrowDownLeft size={15} /> {t('loadInvoice', lang)}
                  </button>
                </div>
              )}
              {invoiceId && !depositDone && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {invoiceAmt
                    ? <div><div className="field-label">{t('invoiceAmount', lang)}</div><div className="field-value">{invoiceAmt} {invoiceToken}</div></div>
                    : <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Amount fetched from chain on deposit.</div>
                  }
                  {invoiceNote && (
                    <div style={{ padding: "10px 12px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "8px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "3px" }}>{t('invoiceNoteDisplay', lang)}</div>
                      <div style={{ fontSize: "13px", color: "var(--accent2)", fontWeight: 700 }}>{invoiceNote}</div>
                    </div>
                  )}
                  <div className={`status-bar ${status.type}`}>
                    {status.type === "pending" ? <RefreshCw size={13} className="spin" /> : status.type === "success" ? <CheckCircle2 size={13} /> : status.type === "error" ? <AlertCircle size={13} /> : <Lock size={13} />}
                    <span>{status.text}</span>
                  </div>
                  <button className="btn-primary" disabled={!address} onClick={deposit} style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                    <Lock size={15} /> {t('commitDeposit', lang)}
                  </button>
                  <button className="btn-secondary" onClick={reset} style={{ fontSize: "12px" }}>{t('useDifferent', lang)}</button>
                </div>
              )}
              {depositDone && !paid && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="card" style={{ borderColor: "var(--amber)", background: "rgba(245,158,11,0.05)", borderStyle: "dashed" }}>
                    <div style={{ fontSize: "12px", color: "var(--amber)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Shield size={14} /> {t('verifyRecovery', lang)}
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <div className="field-label" style={{ fontSize: "10px", color: "var(--amber)" }}>{t('depositAmount', lang)} ({invoiceToken || "tokens"})</div>
                      <input className="text-input" type="number" value={invoiceAmt} onChange={e => setInvoiceAmt(e.target.value)}
                        placeholder="e.g., 100" style={{ border: "1px solid var(--amber)", background: "rgba(0,0,0,0.2)" }} />
                      <div className="field-note">{t('updateIfEmpty', lang)}</div>
                    </div>
                    {!invoiceId ? (
                      <div>
                        <div className="field-label" style={{ fontSize: "10px", color: "var(--amber)" }}>{t('merchantInvoice', lang)}</div>
                        <input className="text-input" value={manualInput} onChange={e => setManualInput(e.target.value)}
                          placeholder={t('pasteHex', lang)} style={{ border: "1px solid var(--amber)", background: "rgba(0,0,0,0.2)", fontFamily: "var(--mono)", fontSize: "11px" }} />
                        <button className="btn-primary" onClick={loadManualZK}
                          style={{ background: "var(--amber)", color: "black", marginTop: "8px", width: "100%", fontSize: "11px", fontWeight: 700 }}>
                          {t('linkInvoice', lang)}
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: "10px", color: "var(--green)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={10} /> {t('invoiceLinked', lang)}: {invoiceId.slice(0, 14)}...
                      </div>
                    )}
                  </div>
                  <div className={`status-bar ${status.type}`}>
                    {status.type === "pending" ? <RefreshCw size={13} className="spin" /> : <Unlock size={13} />}
                    <span>{status.text}</span>
                  </div>
                  <button className="btn-primary" onClick={pay}
                    disabled={!invoiceId || !invoiceAmt || parseFloat(invoiceAmt) <= 0}
                    style={{ background: "linear-gradient(135deg, var(--accent2), #4f46e5)", opacity: (!invoiceId || !invoiceAmt || parseFloat(invoiceAmt) <= 0) ? 0.5 : 1 }}>
                    <ArrowUpRight size={15} /> Generate Proof & Relay Payment
                  </button>
                </div>
              )}
              {paid && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div className="status-bar success"><CheckCircle2 size={13} /><span>{t('paymentComplete', lang)}</span></div>
                  <button className="btn-secondary" onClick={reset}>{t('anotherPayment', lang)}</button>
                </div>
              )}
            </>
          )}
          {mode === "hsp" && (
            <>
              {!hspUrl && !hspRedirected && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "10px" }}>
                    <div style={{ fontSize: "11.5px", color: "var(--accent2)", fontWeight: 700, marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Info size={13} /> {t('hspNeedUrl', lang)}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>
                      {t('hspUrlDesc', lang)} It starts with <code style={{ fontFamily: "var(--mono)", color: "var(--accent2)" }}>https://pay.hashkey.com/...</code>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ justifyContent: "center", gap: "8px" }}>
                    <ScanLine size={15} color="var(--accent2)" /> {t('scanMerchantQR', lang)}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQRFile} />
                  <div>
                    <div className="field-label">{t('pasteHspUrl', lang)}</div>
                    <input className="text-input" value={hspUrlInput} onChange={e => setHspUrlInput(e.target.value)}
                      placeholder="https://pay.hashkey.com/flow/..." style={{ fontFamily: "var(--mono)", fontSize: "11px" }} />
                  </div>
                  <div className={`status-bar ${status.type}`}><Info size={13} /><span>{status.text}</span></div>
                  <button className="btn-primary" onClick={loadHSPUrl} disabled={!hspUrlInput.trim()}
                    style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent))" }}>
                    <ArrowDownLeft size={15} /> {t('loadCheckout', lang)}
                  </button>
                </div>
              )}
              {hspUrl && !hspRedirected && !paid && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "12px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "10px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--accent2)", marginBottom: "6px" }}>{t('whatHappensNext', lang)}</div>
                    <ol style={{ paddingLeft: "16px", fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 2 }}>
                      <li>{t('hspStep2', lang)}</li>
                      <li>{t('hspStep3', lang)}</li>
                      <li>{t('hspStep4', lang)}</li>
                      <li>{t('hspStep5', lang)}</li>
                    </ol>
                  </div>
                  <div className={`status-bar ${status.type}`}><CheckCircle2 size={13} /><span>{status.text}</span></div>
                  <a href={hspUrl} className="btn-primary"
                    style={{ background: "linear-gradient(135deg, var(--accent2), #0891b2)", textDecoration: "none", justifyContent: "center" }}>
                    <CreditCard size={15} /> {t('goCheckout', lang)} <ArrowRight size={14} />
                  </a>
                  <div style={{ fontSize: "10.5px", color: "var(--text-dim)", textAlign: "center" }}>
                    {t('keepTabOpen', lang)}
                  </div>
                </div>
              )}
              {hspRedirected && !paid && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "14px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: "10px", textAlign: "center" }}>
                    <RefreshCw size={22} color="var(--accent2)" style={{ marginBottom: "8px" }} className="spin" />
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{t('verifyingPayment', lang)}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>{t('pollingHashKey', lang)}</div>
                  </div>
                  <div className={`status-bar ${status.type}`}><RefreshCw size={13} className="spin" /><span>{status.text}</span></div>
                  {hspOrderId && (
                    <div>
                      <div className="field-label">{t('hspOrderId', lang)}</div>
                      <div className="hash-display"><span style={{ flex: 1, fontSize: "11px" }}>{hspOrderId}</span><CopyBtn text={hspOrderId} /></div>
                    </div>
                  )}
                   <button className="btn-secondary" onClick={async () => {
                    try {
                      setStatus({ text: t('checkingPaymentStatus', lang), type: "pending" });
                      const res  = await fetch(`${BACKEND_URL}/hsp/payment-status?orderId=${encodeURIComponent(hspOrderId)}`);
                      const data = await res.json();
                      console.log("[HSP] Manual check:", data);
                      if (data?.isPaid === true) {
                        setHspConfirmed(true); setPaid(true);
                        setStatus({ text: t('paymentConfirmed', lang), type: "success" });
                        clearInterval(hspPollRef.current);
                        sessionStorage.removeItem("hsp_pending_order");
                        addLog("HSP payment confirmed", hspOrderId);
                      } else {
                        setStatus({ text: t('notConfirmedYetRaw', lang) + JSON.stringify(data?.raw || data).slice(0, 80), type: "pending" });
                      }
                    } catch (err) {
                      setStatus({ text: t('checkFailed', lang) + err.message, type: "error" });
                    }
                  }}>
                    <RefreshCw size={13} /> {t('checkNowManually', lang)}
                  </button>
                </div>
              )}
              {paid && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", textAlign: "center" }}>
                    <CheckCircle2 size={28} color="var(--green)" style={{ marginBottom: "8px" }} />
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--green)", marginBottom: "4px" }}>{t('hspPaymentConfirmed', lang)}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>{t('merchantSettledViaHsp', lang)}</div>
                  </div>
                  <button className="btn-secondary" onClick={reset}>{t('makeAnotherPayment', lang)}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {mode === "zk" && backupNote && !paid && (
          <div className="card" style={{ borderColor: "var(--amber)", background: "rgba(245,158,11,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Key size={16} color="var(--amber)" />
              <div className="card-title" style={{ margin: 0, color: "var(--amber)" }}>{t('yourZkBackupNote', lang)}</div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text)", marginBottom: "8px" }}>
              {t('backupNoteWarning', lang)}
            </div>
            <div className="hash-display" style={{ background: "rgba(0,0,0,0.5)", borderColor: "var(--amber)" }}>
              <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px", color: "var(--amber)" }}>{backupNote}</span>
              <CopyBtn text={backupNote} />
            </div>
          </div>
        )}
        {mode === "zk" && invoiceId && (
          <div className="card">
            <div className="card-title">{t('activeInvoice', lang)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div className="field-label">Invoice ID</div>
                <div className="hash-display">
                  <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{invoiceId}</span>
                  <CopyBtn text={invoiceId} />
                </div>
              </div>
              {invoiceAmt && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Amount</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent2)", fontWeight: 700 }}>{invoiceAmt} {invoiceToken}</span>
                </div>
              )}
              {invoiceNote && (
                <div style={{ padding: "8px 10px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "3px" }}>Payment Note</div>
                  <div style={{ fontSize: "12.5px", color: "var(--accent2)", fontWeight: 600 }}>{invoiceNote}</div>
                </div>
              )}
              {commitHex && (
                <div>
                  <div className="field-label">{t('onChainCommitment', lang)}</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{commitHex.slice(0, 32)}...</span>
                    <CopyBtn text={commitHex} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{t('status', lang)}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: paid ? "var(--green)" : depositDone ? "var(--accent2)" : "var(--amber)" }}>
                  {paid ? t('paid', lang) : depositDone ? t('depositCommitted', lang) : t('awaitingDeposit', lang)}
                </span>
              </div>
              <a href={`${EXPLORER}/address/${ADDRESSES.privacyPool}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: "12px" }}>
                <ExternalLink size={13} /> {t('viewPoolOnExplorer', lang)}
              </a>
            </div>
          </div>
        )}
        {mode === "hsp" && (hspUrl || hspOrderId) && (
          <div className="card">
            <div className="card-title">{t('hspOrder', lang)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {hspOrderId && (
                <div>
                  <div className="field-label">{t('orderId', lang)}</div>
                  <div className="hash-display"><span style={{ flex: 1, fontSize: "11px" }}>{hspOrderId}</span><CopyBtn text={hspOrderId} /></div>
                </div>
              )}
              {hspUrl && (
                <div>
                  <div className="field-label">{t('checkoutUrl', lang)}</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{hspUrl.slice(0, 50)}...</span>
                    <CopyBtn text={hspUrl} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{t('status', lang)}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: paid ? "var(--green)" : hspRedirected ? "var(--accent2)" : "var(--amber)" }}>
                  {paid ? t('confirmed', lang) : hspRedirected ? t('verifying', lang) : t('awaitingPayment', lang)}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="card">
          <div className="card-title">{t('paymentModeComparison', lang)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: Shield,     color: "var(--accent)",  label: "ZK Pool",      desc: "Groth16 proof, nullifier-based, relayer hides your wallet. Maximum privacy." },
              { icon: CreditCard, color: "var(--accent2)", label: "HSP Checkout", desc: "EIP-712 signed, KYT compliant, hosted by HashKey. Familiar checkout experience." },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 12px", background: mode === (label === "ZK Pool" ? "zk" : "hsp") ? `${color}08` : "rgba(99,102,241,0.05)", borderRadius: "9px", border: `1px solid ${mode === (label === "ZK Pool" ? "zk" : "hsp") ? color + "40" : "var(--border)"}` }}>
                <div style={{ width: 30, height: 30, borderRadius: "8px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}