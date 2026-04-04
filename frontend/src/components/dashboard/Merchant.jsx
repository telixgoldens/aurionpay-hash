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

const BACKEND_URL = RELAYER_URL.replace("/relayer", "");

function generateInvoiceId() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

//  Mode selector card 
function ModeCard({ mode, selected, onSelect }) {
  const isZK  = mode === "zk";
  const color = isZK ? "var(--accent)" : "var(--accent2)";
  const icon  = isZK ? <Shield size={20} color={color} /> : <CreditCard size={20} color={color} />;
  const title = isZK ? "ZK Private Pool"   : "HSP Checkout";
  const desc  = isZK
    ? "Maximum privacy. Customer deposits via ZK commitment, relayer settles  no identity on-chain."
    : "HashKey hosted checkout. Customer signs EIP-712 in wallet, HSP handles KYT compliance.";
  const tags  = isZK
    ? ["Max Privacy", "No KYC", "Groth16 ZK", "Relayer"]
    : ["KYT Compliant", "EIP-712", "HashKey Hosted", "Instant"];

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

//  Steps 
const ZK_STEPS = [
  { n: 1, label: "Set amount & token", sub: "Choose USDT, USDC or WHSK" },
  { n: 2, label: "Create invoice",     sub: "Broadcast to HashKey Chain" },
  { n: 3, label: "Share QR code",      sub: "Customer scans to pay privately" },
  { n: 4, label: "Await settlement",   sub: "Privacy pool settles invoice" },
];
const HSP_STEPS = [
  { n: 1, label: "Set amount & token", sub: "Choose USDT or USDC" },
  { n: 2, label: "Create HSP order",   sub: "Backend registers with HashKey" },
  { n: 3, label: "Share checkout URL", sub: "Customer clicks to pay on HashKey" },
  { n: 4, label: "Await confirmation", sub: "HSP webhook confirms settlement" },
];

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

export default function Merchant({ address, signer, addLog }) {
  const availableTokens = getAvailableTokens();
  const defaultToken    = Object.keys(availableTokens)[0] || "USDT";

  const [mode,       setMode]       = useState(null);       // "zk" | "hsp" | null
  const [amount,     setAmount]     = useState("100");
  const [token,      setToken]      = useState(defaultToken);
  const [invoiceId,  setInvoiceId]  = useState(null);
  const [hspUrl,     setHspUrl]     = useState(null);       // HSP payment_url
  const [hspOrderId, setHspOrderId] = useState(null);
  const [status,     setStatus]     = useState({ text: "Select a settlement mode to begin", type: "idle" });
  const [paid,       setPaid]       = useState(false);
  const [polling,    setPolling]    = useState(false);
  const pollRef = useRef(null);

  const steps      = mode === "hsp" ? HSP_STEPS : ZK_STEPS;
  const currentStep = paid ? 4 : (invoiceId || hspUrl) ? 3 : mode ? 1 : 0;
  const stepState   = (n) => n < currentStep ? "done" : n === currentStep ? "active" : "inactive";

  // Poll payment status
  const checkPaidZK = useCallback(async (id) => {
    if (!signer) return;
    try {
      const gw     = new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer);
      const result = await gw.isPaid(id);
      if (result) { setPaid(true); setPolling(false); setStatus({ text: "Payment confirmed on-chain!", type: "success" }); clearInterval(pollRef.current); }
    } catch (_) {}
  }, [signer]);

  const checkPaidHSP = useCallback(async (orderId) => {
    try {
      const res  = await fetch(`${BACKEND_URL}/hsp/payment-status?orderId=${orderId}`);
      const data = await res.json();
      if (data?.status?.status === "PAID" || data?.status?.paid === true) {
        setPaid(true); setPolling(false);
        setStatus({ text: "HSP payment confirmed!", type: "success" });
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

  //  ZK: Create on-chain invoice 
  const createZKInvoice = useCallback(async () => {
    if (!address || !signer) return setStatus({ text: "Connect wallet first", type: "error" });
    const tokenInfo = availableTokens[token];
    if (!tokenInfo?.address) return setStatus({ text: "Token address not configured", type: "error" });
    let amt;
    try { amt = ethers.parseUnits(amount, tokenInfo.decimals); }
    catch { return setStatus({ text: "Invalid amount", type: "error" }); }
    if (amt === 0n) return setStatus({ text: "Enter a valid amount", type: "error" });
    const id = generateInvoiceId();
    try {
      setStatus({ text: "Awaiting wallet approval...", type: "pending" });
      const gw = new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer);
      const tx = await gw.createInvoice(id, tokenInfo.address, amt);
      setStatus({ text: "Broadcasting...", type: "pending" });
      await tx.wait();
      setInvoiceId(id);
      setStatus({ text: `Invoice live! tx: ${tx.hash.slice(0, 14)}...`, type: "success" });
      addLog("ZK Invoice created", tx.hash);
    } catch (err) {
      setStatus({ text: "Failed: " + (err.reason || err.message), type: "error" });
    }
  }, [address, signer, amount, token, addLog, availableTokens]);

  //  HSP: Create order via backend 
  const createHSPOrder = useCallback(async () => {
    if (!address) return setStatus({ text: "Connect wallet first", type: "error" });
    const tokenInfo = availableTokens[token];
    if (!tokenInfo?.address) return setStatus({ text: "Token not supported by HSP", type: "error" });
    // HSP only supports USDC and USDT (not WHSK)
    if (token === "WHSK") return setStatus({ text: "HSP does not support WHSK  use USDT or USDC", type: "error" });

    const orderId   = "AURION-" + Date.now();
    const payReqId  = "PAY-" + Date.now();
    let amt;
    try { amt = ethers.parseUnits(amount, tokenInfo.decimals); }
    catch { return setStatus({ text: "Invalid amount", type: "error" }); }

    try {
      setStatus({ text: "Creating HSP order...", type: "pending" });
      const res  = await fetch(`${BACKEND_URL}/hsp/create-order`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentRequestId: payReqId,
          amount:           amt.toString(),
          currency:         token,
          payToAddress:     address,
          redirectUrl:      `${window.location.origin}/payment/callback?orderId=${orderId}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "HSP order failed");
      setHspOrderId(orderId);
      setHspUrl(data.paymentUrl);
      setStatus({ text: "HSP order created! Share the checkout link.", type: "success" });
      addLog("HSP Order created", orderId);
    } catch (err) {
      setStatus({ text: "HSP error: " + err.message, type: "error" });
    }
  }, [address, amount, token, addLog, availableTokens]);

  const reset = () => {
    clearInterval(pollRef.current);
    setMode(null); setInvoiceId(null); setHspUrl(null); setHspOrderId(null);
    setPaid(false); setPolling(false);
    setStatus({ text: "Select a settlement mode to begin", type: "idle" });
  };

  const zkQrPayload = invoiceId
    ? JSON.stringify({ invoiceId, amount, token, tokenAddress: availableTokens[token]?.address, network: "hashkey-testnet" })
    : "";

  //  Render 
  return (
    <div className="fade-in two-col" style={{ alignItems: "start" }}>

      {/* LEFT: form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div className="action-icon" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <Store size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>Merchant Flow</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>
                {mode === null ? "Choose how to accept payment" : mode === "zk" ? "ZK private pool settlement" : "HashKey HSP hosted checkout"}
              </div>
            </div>
            {mode && (
              <button className="btn-secondary" onClick={reset}
                style={{ marginLeft: "auto", padding: "5px 10px", fontSize: "11px" }}>
                Change
              </button>
            )}
          </div>

          {/* Mode selector */}
          {mode === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              <div className="field-label">Select Settlement Mode</div>
              <ModeCard mode="zk"  selected={false} onSelect={setMode} />
              <ModeCard mode="hsp" selected={false} onSelect={setMode} />
            </div>
          )}

          {/* Steps (after mode selected) */}
          {mode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
              {steps.map(s => <Step key={s.n} {...s} state={stepState(s.n)} />)}
            </div>
          )}

          {/* Form fields  shown in both modes before order created */}
          {mode && !invoiceId && !hspUrl && (
            <>
              <div>
                <div className="field-label">Payment Token</div>
                <select className="text-input" value={token} onChange={e => setToken(e.target.value)}>
                  {Object.entries(availableTokens)
                    .filter(([k]) => mode === "hsp" ? k !== "WHSK" : true)
                    .map(([key, t]) => (
                      <option key={key} value={key}>{t.name} ({t.symbol})</option>
                    ))}
                </select>
                {mode === "hsp" && (
                  <div className="field-note" style={{ color: "var(--accent2)", display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                    <Info size={11} /> HSP supports USDC and USDT on HashKey testnet
                  </div>
                )}
              </div>
              <div>
                <div className="field-label">Amount ({token})</div>
                <input className="text-input" type="number" min="0.01" step="0.01" value={amount}
                  onChange={e => setAmount(e.target.value)} placeholder="100" />
                <div className="field-note">
                  = {(() => { try { return ethers.parseUnits(amount || "0", availableTokens[token]?.decimals || 6).toString(); } catch { return "0"; } })()} micro-units
                </div>
              </div>

              <div className={`status-bar ${status.type}`} style={{ marginTop: "4px" }}>
                {status.type === "pending" ? <RefreshCw size={13} className="spin" /> :
                 status.type === "success" ? <CheckCircle2 size={13} /> :
                 status.type === "error"   ? <AlertCircle size={13} /> : <Clock size={13} />}
                <span>{status.text}</span>
              </div>

              {mode === "zk" ? (
                <button className="btn-primary" disabled={!address} onClick={createZKInvoice} style={{ marginTop: "4px" }}>
                  <Zap size={15} /> Create Invoice On-Chain
                </button>
              ) : (
                <button className="btn-primary" disabled={!address} onClick={createHSPOrder}
                  style={{ marginTop: "4px", background: "linear-gradient(135deg, var(--accent2), var(--accent))" }}>
                  <CreditCard size={15} /> Create HSP Checkout Order
                </button>
              )}
            </>
          )}

          {/* After creation  status + reset */}
          {(invoiceId || hspUrl) && (
            <>
              <div className={`status-bar ${paid ? "success" : "pending"}`} style={{ marginBottom: "10px" }}>
                {paid ? <CheckCircle2 size={13} /> : polling ? <RefreshCw size={13} className="spin" /> : <Clock size={13} />}
                <span>
                  {paid
                    ? (mode === "hsp" ? "HSP payment confirmed!" : "Payment confirmed on-chain!")
                    : polling
                    ? (mode === "hsp" ? "Polling HSP for payment..." : "Watching for ZK settlement...")
                    : status.text}
                </span>
              </div>
              <button className="btn-secondary" onClick={reset}>
                <FileText size={14} /> Create New Invoice
              </button>
            </>
          )}
        </div>

        {/* HSP info banner */}
        {mode === "hsp" && !paid && (
          <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--accent2)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Info size={13} /> About HSP Checkout
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>
              HashKey's HSP gateway handles EIP-712 signing and KYT compliance. The customer is redirected to HashKey's hosted checkout page, pays there, and is sent back to your app.
              <br /><br />
              Unlike the ZK pool, HSP is <strong style={{ color: "var(--text-mid)" }}>not anonymous</strong>  it is compliance-first. Use it when your customers prefer a familiar checkout experience.
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: QR / checkout link + details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          <div className="card-title">
            {mode === "hsp" ? "HSP Checkout Link" : "Invoice QR Code"}
          </div>

          {/* ZK QR */}
          {mode === "zk" && invoiceId && (
            <div className="qr-wrap">
              <div style={{ padding: "14px", background: "#fff", borderRadius: "12px" }}>
                <QRCodeSVG value={zkQrPayload} size={180} level="M" />
              </div>
              <div className="qr-label">Customer scans to pay via ZK pool</div>
              {paid && <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--green)", fontWeight: 700, fontSize: "13px" }}><CheckCircle2 size={16} /> Settled</div>}
            </div>
          )}

          {/* HSP checkout URL */}
          {mode === "hsp" && hspUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* QR of the checkout URL */}
              <div className="qr-wrap">
                <div style={{ padding: "14px", background: "#fff", borderRadius: "12px" }}>
                  <QRCodeSVG value={hspUrl} size={180} level="M" />
                </div>
                <div className="qr-label">Customer scans or clicks link to pay via HashKey</div>
                {paid && <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--green)", fontWeight: 700, fontSize: "13px" }}><CheckCircle2 size={16} /> Settled</div>}
              </div>
              {/* Checkout link */}
              <div>
                <div className="field-label">Checkout URL</div>
                <div className="hash-display" style={{ wordBreak: "break-all" }}>
                  <span style={{ flex: 1, fontSize: "10px" }}>{hspUrl}</span>
                  <CopyBtn text={hspUrl} />
                </div>
              </div>
              <a href={hspUrl} target="_blank" rel="noreferrer"
                className="btn-primary"
                style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent))", textDecoration: "none" }}>
                <ArrowRight size={15} /> Open HSP Checkout
              </a>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", textAlign: "center" }}>
                Share this link with your customer, or open it yourself to test the flow
              </div>
            </div>
          )}

          {/* Empty state */}
          {!invoiceId && !hspUrl && (
            <div className="qr-wrap" style={{ opacity: 0.4 }}>
              <div style={{ width: 180, height: 180, borderRadius: "12px", background: "rgba(99,102,241,0.08)", border: "2px dashed rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={32} color="var(--accent)" style={{ opacity: 0.4 }} />
              </div>
              <div className="qr-label">
                {mode === null ? "Select a mode to begin" : mode === "hsp" ? "Checkout link appears here" : "QR appears after invoice creation"}
              </div>
            </div>
          )}
        </div>

        {/* Invoice details */}
        {(invoiceId || hspOrderId) && (
          <div className="card">
            <div className="card-title">Order Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {invoiceId && (
                <div>
                  <div className="field-label">Invoice ID (On-Chain)</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{invoiceId}</span>
                    <CopyBtn text={invoiceId} />
                  </div>
                </div>
              )}
              {hspOrderId && (
                <div>
                  <div className="field-label">HSP Order ID</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, fontSize: "11px" }}>{hspOrderId}</span>
                    <CopyBtn text={hspOrderId} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Amount</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent2)", fontWeight: 700 }}>{amount} {token}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Mode</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: mode === "hsp" ? "var(--accent2)" : "var(--accent)" }}>
                  {mode === "hsp" ? "HSP Checkout" : "ZK Private Pool"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Status</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: paid ? "var(--green)" : "var(--amber)" }}>
                  {paid ? "Paid" : "Pending"}
                </span>
              </div>
              {invoiceId && (
                <a href={`${EXPLORER}/address/${ADDRESSES.paymentGateway}`} target="_blank" rel="noreferrer"
                  className="btn-secondary" style={{ fontSize: "12px" }}>
                  <ExternalLink size={13} /> View on Explorer
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}