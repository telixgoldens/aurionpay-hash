import React, { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import {
  FileText, Zap, CheckCircle2, Clock,
  RefreshCw, ExternalLink, AlertCircle, Store,
  Shield, CreditCard, ArrowRight, Info,
} from "lucide-react";
import {
  ADDRESSES, EXPLORER, PAYMENT_GATEWAY_ABI, getAvailableTokens, RELAYER_URL,
} from "../../lib/contracts.js";
import { CopyBtn } from "./Dashboard.jsx";
import { useLang } from "../../lib/LanguageContext.jsx";
import { t } from "../../lib/i18n.js";

const BACKEND_URL = RELAYER_URL.replace("/relayer", "");

function generateInvoiceId() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function ModeCard({ mode, selected, onSelect }) {
  const { lang }        = useLang();
  const isZK  = mode === "zk";
  const color = isZK ? "var(--accent)" : "var(--accent2)";
  const icon  = isZK ? <Shield size={20} color={color} /> : <CreditCard size={20} color={color} />;
  const title = isZK ? t("zkPrivatePool", lang)   : t("hspCheckout", lang);
  const desc  = isZK
    ? t("maximumPrivacy", lang)
    : t("hashkeyHostedCheckout", lang);
  const tags  = isZK
    ? [t("maxPrivacy", lang), t("noKyc", lang), t("groth16Zk", lang), t("relayer", lang)]
    : [t("kytCompliant", lang), t("eip712", lang), t("hashkeyHosted", lang), t("instant", lang)];

  const borderColor = selected
    ? (isZK ? "rgba(99,102,241,0.6)" : "rgba(6,182,212,0.6)")
    : "var(--border)";
  const bg = selected
    ? (isZK ? "rgba(99,102,241,0.08)" : "rgba(6,182,212,0.08)")
    : "var(--surface)";

  return (
    <div onClick={() => onSelect(mode)}
      style={{ cursor: "pointer", padding: "16px", borderRadius: "12px", border: `2px solid ${borderColor}`, background: bg, transition: "all 180ms", position: "relative" }}>
      {selected && (
        <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 size={12} color="#fff" />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text)" }}>{title}</span>
      </div>
      <p style={{ fontSize: "11.5px", color: "var(--text-dim)", lineHeight: 1.55, marginBottom: "10px" }}>{desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {tags.map(t => (
          <span key={t} style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: `${color}12`, border: `1px solid ${color}25`, color }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Merchant({ address, signer, addLog }) {
  const availableTokens = getAvailableTokens();
  const defaultToken    = Object.keys(availableTokens)[0] || "USDT";
  const { lang }        = useLang();
  const ZK_STEPS = [
  { n: 1, label: t("setAmountToken", lang), sub: t("chooseUsdtUsdcOrWhsk", lang) },
  { n: 2, label: t("createInvoice", lang),     sub: t("broadcastToHashkeyChain", lang) },
  { n: 3, label: t("shareQrCode", lang),      sub: t("customerScansToPayPrivately", lang) },
  { n: 4, label: t("awaitSettlement", lang),   sub: t("privacyPoolSettlesInvoice", lang) },
];
const HSP_STEPS = [
  { n: 1, label: t("setAmountToken", lang), sub: t("chooseUsdtOrUsdc", lang) },
  { n: 2, label: t("createHspOrder", lang),   sub: t("backendRegistersWithHashkey", lang) },
  { n: 3, label: t("shareCheckoutUrl", lang), sub: t("customerClicksToPayOnHashkey", lang) },
  { n: 4, label: t("awaitConfirmation", lang), sub: t("hspWebhookConfirmsSettlement", lang) },
];

  const [mode,       setMode]       = useState(null);       
  const [amount,     setAmount]     = useState("100");
  const [token,      setToken]      = useState(defaultToken);
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceId,  setInvoiceId]  = useState(null);
  const [hspUrl,     setHspUrl]     = useState(null);       
  const [hspOrderId, setHspOrderId] = useState(null);
  const [status,     setStatus]     = useState({ text: t("selectModeToBegin", lang), type: "idle" });
  const [paid,       setPaid]       = useState(false);
  const [polling,    setPolling]    = useState(false);
  const pollRef = useRef(null);

  const steps      = mode === "hsp" ? HSP_STEPS : ZK_STEPS;
  const currentStep = paid ? 4 : (invoiceId || hspUrl) ? 3 : mode ? 1 : 0;
  const stepState   = (n) => n < currentStep ? "done" : n === currentStep ? "active" : "inactive";
  const checkPaidZK = useCallback(async (id) => {
    if (!signer) return;
    try {
      const gw     = new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer);
      const result = await gw.isPaid(id);
      if (result) { setPaid(true); setPolling(false); setStatus({ text: t("paymentConfirmedOnChain", lang), type: "success" }); clearInterval(pollRef.current); }
    } catch (_) {}
  }, [signer]);

  const checkPaidHSP = useCallback(async (orderId) => {
    try {
      const res  = await fetch(`${BACKEND_URL}/hsp/payment-status?orderId=${orderId}`);
      const data = await res.json();
      if (data?.status?.status === "PAID" || data?.status?.paid === true) {
        setPaid(true); setPolling(false);
        setStatus({ text: t("hspPaymentConfirmed", lang), type: "success" });
        clearInterval(pollRef.current);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!paid) {
      if (invoiceId && mode === "zk") {
        setPolling(true);
        pollRef.current = setInterval(() => checkPaidZK(invoiceId), 6000);
      } else if (hspOrderId && mode === "hsp") {
        setPolling(true);
        pollRef.current = setInterval(() => checkPaidHSP(hspOrderId), 6000);
      }
    }
    return () => clearInterval(pollRef.current);
  }, [invoiceId, hspOrderId, paid, mode, checkPaidZK, checkPaidHSP]);

  const createZKInvoice = useCallback(async () => {
    if (!address || !signer) return setStatus({ text: t("connectWalletFirst", lang), type: "error" });
    const tokenInfo = availableTokens[token];
    if (!tokenInfo?.address) return setStatus({ text: t("tokenAddressNotConfigured", lang), type: "error" });
    let amt;
    try { amt = ethers.parseUnits(amount, tokenInfo.decimals); }
    catch { return setStatus({ text: t("invalidAmount", lang), type: "error" }); }
    if (amt === 0n) return setStatus({ text: t("enterValidAmount", lang), type: "error" });
    const id = generateInvoiceId();
    try {
      setStatus({ text: t("awaitingWalletApproval", lang), type: "pending" });
      const gw = new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer);
      const tx = await gw.createInvoice(id, tokenInfo.address, amt);
      setStatus({ text: t("broadcasting", lang), type: "pending" });
      await tx.wait();
      setInvoiceId(id);
      setStatus({ text: `${t("invoiceLive", lang)} tx: ${tx.hash.slice(0, 14)}...`, type: "success" });
      addLog("ZK Invoice created", tx.hash);
    } catch (err) {
      setStatus({ text: t("failed", lang) + (err.reason || err.message), type: "error" });
    }
  }, [address, signer, amount, token, addLog, availableTokens]);
 
  const createHSPOrder = useCallback(async () => {
    if (!address) return setStatus({ text: "Connect wallet first", type: "error" });
    const tokenInfo = availableTokens[token];
    if (!tokenInfo?.address) return setStatus({ text: t('tokenNotSupportedByHsp', lang), type: "error" });
    if (token === "WHSK") return setStatus({ text: t('hspDoesNotSupportWhsk', lang), type: "error" });

    const orderId   = "AURION-" + Date.now();
    const payReqId  = "PAY-" + Date.now();
    let amt;
    try { amt = ethers.parseUnits(amount, tokenInfo.decimals); }
    catch { return setStatus({ text: "Invalid amount", type: "error" }); }

    try {
      setStatus({ text: t('creatingHspOrder', lang), type: "pending" });
      const res  = await fetch(`${BACKEND_URL}/hsp/create-order`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentRequestId: payReqId,
          amount:           amt.toString(),
          currency:         token,
          payToAddress:     address,
          invoiceNote:      invoiceNote || "AurionPay Payment",
          redirectUrl:      `${window.location.origin}/payment/callback?orderId=${orderId}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "HSP order failed");
      setHspOrderId(orderId);
      setHspUrl(data.paymentUrl);
      setStatus({ text: t('hspOrderCreated', lang), type: "success" });
      addLog("HSP Order created", orderId);
    } catch (err) {
      setStatus({ text: t('hspError', lang) + err.message, type: "error" });
    }
  }, [address, amount, token, invoiceNote, addLog, availableTokens]);

  const reset = () => {
    clearInterval(pollRef.current);
    setMode(null); setInvoiceId(null); setHspUrl(null); setHspOrderId(null);
    setInvoiceNote(""); setPaid(false); setPolling(false);
    setStatus({ text: t("selectModeToBegin", lang), type: "idle" });
  };

  const zkQrPayload = invoiceId
    ? JSON.stringify({ invoiceId, amount, token, invoiceNote, tokenAddress: availableTokens[token]?.address, network: "hashkey-testnet" })
    : "";

  return (
    <div className="fade-in two-col" style={{ alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div className="action-icon" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <Store size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>{t("merchantFlow", lang)}</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                {mode === null ? t("chooseHowToAcceptPayment", lang) : mode === "zk" ? t("zkPrivatePoolSettlement", lang) : t("hashkeyHspHostedCheckout", lang)}
              </div>
            </div>
            {mode && (
              <button className="btn-secondary" onClick={reset}
                style={{ marginLeft: "auto", padding: "5px 10px", fontSize: "11px" }}>
                {t("change", lang)}
              </button>
            )}
          </div>
          {mode === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              <div className="field-label">{t("selectSettlementMode", lang)}</div>
              <ModeCard mode="zk"  selected={false} onSelect={setMode} />
              <ModeCard mode="hsp" selected={false} onSelect={setMode} />
            </div>
          )}
          {mode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
              {steps.map(s => <Step key={s.n} {...s} state={stepState(s.n)} />)}
            </div>
          )}
          {mode && !invoiceId && !hspUrl && (
            <>
              <div>
                <div className="field-label">{t("paymentToken", lang)}</div>
                <select className="text-input" value={token} onChange={e => setToken(e.target.value)}>
                  {Object.entries(availableTokens)
                    .filter(([k]) => mode === "hsp" ? k !== "WHSK" : true)
                    .map(([key, t]) => (
                      <option key={key} value={key}>{t.name} ({t.symbol})</option>
                    ))}
                </select>
                {mode === "hsp" && (
                  <div className="field-note" style={{ color: "var(--accent2)", display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                    <Info size={11} /> {t("hspSupportsUsdcUsdt", lang)}
                  </div>
                )}
              </div>
              <div>
                <div className="field-label">{t("amountInToken", lang).replace("{token}", token)}</div>
                <input className="text-input" type="number" min="0.01" step="0.01" value={amount}
                  onChange={e => setAmount(e.target.value)} placeholder="100" />
                <div className="field-note">
                  = {(() => { try { return ethers.parseUnits(amount || "0", availableTokens[token]?.decimals || 6).toString(); } catch { return "0"; } })()} {t("microUnits", lang)}
                </div>
              </div>
               <div>
                <div className="field-label">{t("invoiceNoteLabel", lang)}</div>
                <input className="text-input" value={invoiceNote} onChange={e => setInvoiceNote(e.target.value)}
                  placeholder={t("invoiceNotePlaceholder", lang)} />
                <div className="field-note" style={{ color: "var(--accent2)" }}>{t("invoiceNoteHint", lang)}</div>
              </div>
              <div className={`status-bar ${status.type}`} style={{ marginTop: "4px" }}>
                {status.type === "pending" ? <RefreshCw size={13} className="spin" /> :
                 status.type === "success" ? <CheckCircle2 size={13} /> :
                 status.type === "error"   ? <AlertCircle size={13} /> : <Clock size={13} />}
                <span>{status.text}</span>
              </div>
              {mode === "zk" ? (
                <button className="btn-primary" disabled={!address} onClick={createZKInvoice} style={{ marginTop: "4px" }}>
                  <Zap size={15} /> {t("createInvoice", lang)}
                </button>
              ) : (
                <button className="btn-primary" disabled={!address} onClick={createHSPOrder}
                  style={{ marginTop: "4px", background: "linear-gradient(135deg, var(--accent2), var(--accent))" }}>
                  <CreditCard size={15} /> {t("createHspOrder", lang)}
                </button>
              )}
            </>
          )}
          {(invoiceId || hspUrl) && (
            <>
              <div className={`status-bar ${paid ? "success" : "pending"}`} style={{ marginBottom: "10px" }}>
                {paid ? <CheckCircle2 size={13} /> : polling ? <RefreshCw size={13} className="spin" /> : <Clock size={13} />}
                <span>
                  {paid
                    ? (mode === "hsp" ? t("hspConfirmed", lang)  : t("paymentReceived", lang))
                    : polling
                    ? (mode === "hsp" ? t('pollingHspForPayment', lang) : t("watchingPayment", lang))
                    : status.text}
                </span>
              </div>
              {invoiceNote && (
                <div style={{ padding: "8px 12px", background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "8px", fontSize: "12px", color: "var(--accent2)", display: "flex", gap: "8px", alignItems: "center" }}>
                  <FileText size={13} />
                  <span><strong>{t("invoiceNoteDisplay", lang)}:</strong> {invoiceNote}</span>
                </div>
              )}
              <button className="btn-secondary" onClick={reset}>
                <FileText size={14} /> {t("newInvoice", lang)}
              </button>
            </>
          )}
        </div>
        {mode === "hsp" && !paid && (
          <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--accent2)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Info size={13} /> {t("aboutHspCheckout", lang)}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>
              {t("hspCheckoutDescription", lang)}
              <br /><br />
              {t("notAnonymous", lang)} {t("complianceFirst", lang)}. {t("familiarCheckoutExperience", lang)}.
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          <div className="card-title">
            {mode === "hsp" ? t("hspCheckoutLink", lang) : t("invoiceQrCode", lang)}
          </div>
          {mode === "zk" && invoiceId && (
            <div className="qr-wrap">
              <div style={{ padding: "14px", background: "#fff", borderRadius: "12px" }}>
                <QRCodeSVG value={zkQrPayload} size={180} level="M" />
              </div>
              <div className="qr-label">{t("customerScansToPayViaZkPool", lang)}</div>
              {paid && <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--green)", fontWeight: 700, fontSize: "13px" }}><CheckCircle2 size={16} /> {t("settled", lang)}</div>}
            </div>
          )}
          {mode === "hsp" && hspUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="qr-wrap">
                <div style={{ padding: "14px", background: "#fff", borderRadius: "12px" }}>
                  <QRCodeSVG value={hspUrl} size={180} level="M" />
                </div>
                <div className="qr-label">{t("customerScansOrClicksLinkToPayViaHashkey", lang)}</div>
                {paid && <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--green)", fontWeight: 700, fontSize: "13px" }}><CheckCircle2 size={16} /> {t("settled", lang)}</div>}
              </div>
              <div>
                <div className="field-label">{t("checkoutUrl", lang)}</div>
                <div className="hash-display" style={{ wordBreak: "break-all" }}>
                  <span style={{ flex: 1, fontSize: "10px" }}>{hspUrl}</span>
                  <CopyBtn text={hspUrl} />
                </div>
              </div>
              <a href={hspUrl} target="_blank" rel="noreferrer"
                className="btn-primary"
                style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent))", textDecoration: "none" }}>
                <ArrowRight size={15} /> {t("openHspCheckout", lang)}
              </a>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center" }}>
                {t("shareLinkWithCustomer", lang)}
              </div>
            </div>
          )}
          {!invoiceId && !hspUrl && (
            <div className="qr-wrap" style={{ opacity: 0.4 }}>
              <div style={{ width: 180, height: 180, borderRadius: "12px", background: "rgba(99,102,241,0.08)", border: "2px dashed rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={32} color="var(--accent)" style={{ opacity: 0.4 }} />
              </div>
              <div className="qr-label">
                {mode === null ? t("selectModeToBegin", lang) : mode === "hsp" ? t("checkoutLinkAppearsHere", lang) : t("qrAppearsAfterInvoiceCreation", lang)}
              </div>
            </div>
          )}
        </div>
        {(invoiceId || hspOrderId) && (
          <div className="card">
            <div className="card-title">{t("orderDetails", lang)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {invoiceId && (
                <div>
                  <div className="field-label">{t("invoiceIdOnChain", lang)}</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{invoiceId}</span>
                    <CopyBtn text={invoiceId} />
                  </div>
                </div>
              )}
              {hspOrderId && (
                <div>
                  <div className="field-label">{t("hspOrderId", lang)}</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, fontSize: "11px" }}>{hspOrderId}</span>
                    <CopyBtn text={hspOrderId} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{t("amount", lang)}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent2)", fontWeight: 700 }}>{amount} {token}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{t("mode", lang)}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: mode === "hsp" ? "var(--accent2)" : "var(--accent)" }}>
                  {mode === "hsp" ? t("hspCheckout", lang) : t("zkPrivatePool", lang)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{t("status", lang)}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: paid ? "var(--green)" : "var(--amber)" }}>
                  {paid ? t("paid", lang) : t("pending", lang)}
                </span>
              </div>
              {invoiceId && (
                <a href={`${EXPLORER}/address/${ADDRESSES.paymentGateway}`} target="_blank" rel="noreferrer"
                  className="btn-secondary" style={{ fontSize: "12px" }}>
                  <ExternalLink size={13} /> {t("viewOnExplorer", lang)}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}