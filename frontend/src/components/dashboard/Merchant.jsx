import React, { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { QRCodeSVG } from "qrcode.react";
import {
  FileText, Zap, CheckCircle2, Clock,
  RefreshCw, ExternalLink, AlertCircle, Store,
} from "lucide-react";
import {
  ADDRESSES, EXPLORER, PAYMENT_GATEWAY_ABI, getAvailableTokens,
} from "../../lib/contracts.js";
import { CopyBtn } from "./Dashboard.jsx";

function generateInvoiceId() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

const STEPS = [
  { n: 1, label: "Set amount & token", sub: "Choose USDT, USDC or WHSK and enter amount" },
  { n: 2, label: "Create on-chain",    sub: "Broadcast invoice to HashKey Chain" },
  { n: 3, label: "Share QR code",      sub: "Customer scans to pay privately" },
  { n: 4, label: "Await payment",      sub: "Invoice settled via privacy pool" },
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

  const [amount,    setAmount]    = useState("100");
  const [token,     setToken]     = useState(defaultToken);
  const [invoiceId, setInvoiceId] = useState(null);
  const [status,    setStatus]    = useState({ text: "Enter amount to begin", type: "idle" });
  const [paid,      setPaid]      = useState(false);
  const [polling,   setPolling]   = useState(false);
  const pollRef = useRef(null);

  const currentStep = paid ? 4 : invoiceId ? 3 : 1;
  const stepState   = (n) => n < currentStep ? "done" : n === currentStep ? "active" : "inactive";

  const checkPaid = useCallback(async (id) => {
    if (!signer) return;
    try {
      const gateway = new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer);
      const result  = await gateway.isPaid(id);
      if (result) {
        setPaid(true);
        setPolling(false);
        setStatus({ text: "Payment confirmed on-chain!", type: "success" });
        clearInterval(pollRef.current);
      }
    } catch (_) {}
  }, [signer]);

  useEffect(() => {
    if (invoiceId && !paid) {
      setPolling(true);
      pollRef.current = setInterval(() => checkPaid(invoiceId), 6000);
    }
    return () => clearInterval(pollRef.current);
  }, [invoiceId, paid, checkPaid]);

  const createInvoice = useCallback(async () => {
    if (!address || !signer) return setStatus({ text: "Connect wallet first", type: "error" });
    const tokenInfo = availableTokens[token];
    if (!tokenInfo?.address) return setStatus({ text: "Token address not configured", type: "error" });
    let amt;
    try {
      amt = ethers.parseUnits(amount, tokenInfo.decimals);
    } catch {
      return setStatus({ text: "Invalid amount", type: "error" });
    }
    if (amt === 0n) return setStatus({ text: "Enter a valid amount", type: "error" });
    const id = generateInvoiceId();
    try {
      setStatus({ text: "Awaiting wallet approval...", type: "pending" });
      const gateway = new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer);
      const tx      = await gateway.createInvoice(id, tokenInfo.address, amt);
      setStatus({ text: "Broadcasting to HashKey Chain...", type: "pending" });
      await tx.wait();
      setInvoiceId(id);
      setStatus({ text: `Invoice live! tx: ${tx.hash.slice(0, 16)}...`, type: "success" });
      addLog("Invoice created", tx.hash);
    } catch (err) {
      setStatus({ text: "Failed: " + (err.reason || err.message), type: "error" });
    }
  }, [address, signer, amount, token, addLog, availableTokens]);

  const reset = () => {
    clearInterval(pollRef.current);
    setInvoiceId(null); setPaid(false); setPolling(false);
    setStatus({ text: "Enter amount to begin", type: "idle" });
  };

  const qrPayload = invoiceId
    ? JSON.stringify({
        invoiceId,
        amount,
        token,
        tokenAddress: availableTokens[token]?.address,
        network: "hashkey-testnet",
      })
    : "";

  return (
    <div className="fade-in two-col" style={{ alignItems: "start" }}>
      {/* Left: Steps + form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div className="action-icon" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <Store size={18} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>Merchant Flow</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>Create a payable invoice and wait for private settlement</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
            {STEPS.map(s => <Step key={s.n} {...s} state={stepState(s.n)} />)}
          </div>

          {!invoiceId ? (
            <>
              <div>
                <div className="field-label">Payment Token</div>
                <select className="text-input" value={token} onChange={e => setToken(e.target.value)}>
                  {Object.entries(availableTokens).map(([key, t]) => (
                    <option key={key} value={key}>{t.name} ({t.symbol})</option>
                  ))}
                </select>
                {availableTokens[token]?.note && (
                  <div className="field-note" style={{ color: "var(--amber)" }}>{availableTokens[token].note}</div>
                )}
              </div>
              <div>
                <div className="field-label">Invoice Amount ({token})</div>
                <input className="text-input" type="number" min="0.000001" step="0.01" value={amount}
                  onChange={e => setAmount(e.target.value)} placeholder="100" />
                <div className="field-note">
                  = {(() => {
                    try { return ethers.parseUnits(amount || "0", availableTokens[token]?.decimals || 6).toString(); }
                    catch { return "0"; }
                  })()} micro-units ({availableTokens[token]?.decimals} decimals)
                </div>
              </div>

              <div className={`status-bar ${status.type}`} style={{ marginTop: "4px" }}>
                {status.type === "pending" ? <RefreshCw size={13} className="spin" /> :
                 status.type === "success" ? <CheckCircle2 size={13} /> :
                 status.type === "error"   ? <AlertCircle size={13} /> :
                 <Clock size={13} />}
                <span>{status.text}</span>
              </div>
              <button className="btn-primary" disabled={!address} onClick={createInvoice} style={{ marginTop: "4px" }}>
                <Zap size={15} /> Create Invoice On-Chain
              </button>
            </>
          ) : (
            <>
              <div className={`status-bar ${paid ? "success" : "pending"}`} style={{ marginBottom: "10px" }}>
                {paid ? <CheckCircle2 size={13} /> : polling ? <RefreshCw size={13} className="spin" /> : <Clock size={13} />}
                <span>{paid ? "Payment received!" : polling ? "Watching for payment..." : status.text}</span>
              </div>
              <button className="btn-secondary" onClick={reset}>
                <FileText size={14} /> Create New Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right: QR + details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          <div className="card-title">Invoice QR Code</div>
          {invoiceId ? (
            <div className="qr-wrap">
              <div style={{ padding: "14px", background: "#fff", borderRadius: "12px" }}>
                <QRCodeSVG value={qrPayload} size={180} level="M" />
              </div>
              <div className="qr-label">Customer scans this to pay via privacy pool</div>
              {paid && (
                <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "var(--green)", fontWeight: 700, fontSize: "13px" }}>
                  <CheckCircle2 size={16} /> Settled
                </div>
              )}
            </div>
          ) : (
            <div className="qr-wrap" style={{ opacity: 0.4 }}>
              <div style={{ width: 180, height: 180, borderRadius: "12px", background: "rgba(99,102,241,0.08)", border: "2px dashed rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={32} color="var(--accent)" style={{ opacity: 0.4 }} />
              </div>
              <div className="qr-label">QR appears after invoice creation</div>
            </div>
          )}
        </div>

        {invoiceId && (
          <div className="card">
            <div className="card-title">Invoice Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div className="field-label">Invoice ID</div>
                <div className="hash-display">
                  <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{invoiceId}</span>
                  <CopyBtn text={invoiceId} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Amount</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent2)", fontWeight: 700 }}>{amount} {token}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Token</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-mid)" }}>
                  {availableTokens[token]?.address?.slice(0, 10)}...
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Status</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: paid ? "var(--green)" : "var(--amber)" }}>
                  {paid ? "Paid" : "Pending"}
                </span>
              </div>
              <a href={`${EXPLORER}/address/${ADDRESSES.paymentGateway}`} target="_blank" rel="noreferrer"
                className="btn-secondary" style={{ marginTop: "2px", fontSize: "12px" }}>
                <ExternalLink size={13} /> View on Explorer
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}