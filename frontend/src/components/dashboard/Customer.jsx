import React, { useState, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  Users, Lock, Unlock, CheckCircle2, AlertCircle,
  RefreshCw, ArrowUpRight, ArrowDownLeft, ExternalLink,
  ScanLine, Shield, Key, FileWarning,
} from "lucide-react";
import { useContracts } from "../../hooks/useContracts.js";
import { ADDRESSES, EXPLORER, RELAYER_URL, getAvailableTokens } from "../../lib/contracts.js";
import {
  generateCurveSafeRandom, generateCommitment,
  generateWithdrawProof, parseBackupNote, generateBackupNote,
} from "../../utils/zkutils.js";
import { ensureAllowance, stripHex } from "../../utils/tokenUtils.js";
import { CopyBtn } from "./Dashboard.jsx";

const STEPS = [
  { n: 1, label: "Load invoice",   sub: "Scan QR or paste invoice ID" },
  { n: 2, label: "Commit deposit", sub: "Register token + ZK hash on-chain" },
  { n: 3, label: "Send payment",   sub: "Generate ZK proof & relay privately" },
  { n: 4, label: "Merchant paid",  sub: "Funds arrive with no identity link" },
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

export default function Customer({ address, signer, addLog }) {
  const contracts      = useContracts(signer);
  const availableTokens = getAvailableTokens();

  const [invoiceId,     setInvoiceId]     = useState("");
  const [invoiceAmt,    setInvoiceAmt]    = useState("");
  const [invoiceToken,  setInvoiceToken]  = useState("");
  const [manualInput,   setManualInput]   = useState("");
  const [commitHex,     setCommitHex]     = useState(null);
  const [zkSecrets,     setZkSecrets]     = useState(null);
  const [backupNote,    setBackupNote]    = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [depositDone,   setDepositDone]   = useState(false);
  const [paid,          setPaid]          = useState(false);
  const [status,        setStatus]        = useState({ text: "Scan a QR or paste an invoice ID", type: "idle" });
  const fileRef = useRef();

  const currentStep = paid ? 4 : depositDone ? 3 : invoiceId ? 2 : 1;
  const stepState   = (n) => n < currentStep ? "done" : n === currentStep ? "active" : "inactive";

  //  QR parsing 
  const parseQRPayload = (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data.invoiceId) {
        setInvoiceId(data.invoiceId);
        setInvoiceAmt(data.amount || "");
        setInvoiceToken(data.token || "USDT");
        setStatus({ text: `Invoice loaded  ${data.amount || "?"} ${data.token || ""}`, type: "success" });
        return;
      }
    } catch (_) {}
    // Support both 0x-prefixed (EVM) and plain hex (legacy)
    const clean = raw.trim();
    if (/^0x[0-9a-f]{64}$/i.test(clean) || /^[0-9a-f]{64}$/i.test(clean)) {
      const id = clean.startsWith("0x") ? clean : "0x" + clean;
      setInvoiceId(id);
      setStatus({ text: "Invoice ID loaded", type: "success" });
    } else {
      setStatus({ text: "Invalid QR payload", type: "error" });
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
    setStatus({ text: "QR scan not supported here  paste invoice ID manually", type: "error" });
  }, []);

  const loadManual = () => {
    const val = manualInput.trim();
    const id  = val.startsWith("0x") ? val : "0x" + val;
    if (id.length !== 66 || !/^0x[0-9a-f]{64}$/i.test(id)) {
      return setStatus({ text: "Invoice ID must be 0x + 64 hex characters", type: "error" });
    }
    setInvoiceId(id);
    setManualInput("");
    setStatus({ text: "Invoice ID loaded", type: "success" });
  };

  //  Recovery from backup note 
  const recoverFromNote = async () => {
    try {
      setStatus({ text: "Verifying backup note...", type: "pending" });
      const { secret, nullifier } = parseBackupNote(recoveryInput.trim());
      const commit = await generateCommitment(secret, nullifier);
      setZkSecrets({ secret: secret.toString(), nullifier: nullifier.toString() });
      setCommitHex(commit);
      setBackupNote(recoveryInput.trim());
      setDepositDone(true);
      setStatus({ text: "Recovered! Now load the merchant invoice to pay.", type: "success" });
      addLog("Session recovered from ZK note", null);
    } catch (err) {
      setStatus({ text: "Recovery failed: " + err.message, type: "error" });
    }
  };

  //  Step 2: deposit 
  const deposit = useCallback(async () => {
    if (!address || !contracts) return setStatus({ text: "Connect wallet first", type: "error" });
    if (!invoiceId)              return setStatus({ text: "Load invoice first", type: "error" });

    try {
      setStatus({ text: "Generating ZK commitment...", type: "pending" });
      const secret    = generateCurveSafeRandom();
      const nullifier = generateCurveSafeRandom();
      const commit    = await generateCommitment(secret, nullifier);

      setZkSecrets({ secret: secret.toString(), nullifier: nullifier.toString() });
      setBackupNote(generateBackupNote(secret, nullifier));

      // Fetch invoice details from chain
      const inv       = await contracts.paymentGateway.getInvoice(invoiceId);
      const tokenAddr = inv.token;
      const amt       = inv.amount;

      // Look up token decimals from supported tokens
      const tokenEntry = Object.values(availableTokens).find(t =>
        t.address.toLowerCase() === tokenAddr.toLowerCase()
      );
      const decimals = tokenEntry?.decimals ?? 6;
      const symbol   = tokenEntry?.symbol   ?? "tokens";

      setInvoiceAmt(ethers.formatUnits(amt, decimals));
      setInvoiceToken(symbol);

      // Approve
      setStatus({ text: "Approving token spend...", type: "pending" });
      await ensureAllowance(signer, tokenAddr, ADDRESSES.privacyPool, amt);

      // Deposit
      setStatus({ text: "Awaiting deposit confirmation...", type: "pending" });
      const tx = await contracts.privacyPool.deposit(tokenAddr, "0x" + commit, amt);
      setStatus({ text: "Broadcasting deposit...", type: "pending" });
      await tx.wait();

      setCommitHex(commit);
      setDepositDone(true);
      setStatus({ text: `Committed! tx: ${tx.hash.slice(0, 16)}...`, type: "success" });
      addLog("Privacy deposit", tx.hash);
    } catch (err) {
      setStatus({ text: "Deposit failed: " + (err.reason || err.message), type: "error" });
    }
  }, [address, contracts, signer, invoiceId, addLog, availableTokens]);

  //  Step 3: prove + relay 
  const pay = useCallback(async () => {
    if (!zkSecrets)  return setStatus({ text: "No ZK secrets  deposit or recover first", type: "error" });
    if (!invoiceId)  return setStatus({ text: "Load the merchant invoice ID first", type: "error" });
    if (!invoiceAmt || parseFloat(invoiceAmt) <= 0)
      return setStatus({ text: "Enter a valid amount", type: "error" });

    try {
      setStatus({ text: "Generating ZK proof locally...", type: "pending" });
      const { proof, publicSignals, nullifierHex } = await generateWithdrawProof({
        secret:    BigInt(zkSecrets.secret),
        nullifier: BigInt(zkSecrets.nullifier),
        invoiceId: stripHex(invoiceId),
      });

      setStatus({ text: "Proof generated! Relaying...", type: "pending" });

      const inv = await contracts.paymentGateway.getInvoice(invoiceId);
      const amt = inv.amount;

      const res = await fetch(`${RELAYER_URL}/relay-withdrawal`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof,
          publicSignals,
          nullifierHex,
          invoiceIdHex:  stripHex(invoiceId),
          amount:        amt.toString(),
          walletAddress: address,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.details || "Relayer rejected proof");

      setPaid(true);
      setStatus({ text: `Payment relayed privately! tx: ${data.txid?.slice(0, 16)}...`, type: "success" });
      addLog("Private relayed payment", data.txid);
    } catch (err) {
      console.error(err);
      setStatus({ text: "Payment failed: " + err.message, type: "error" });
    }
  }, [zkSecrets, invoiceId, invoiceAmt, contracts, address, addLog]);

  const reset = () => {
    setInvoiceId(""); setInvoiceAmt(""); setInvoiceToken(""); setManualInput("");
    setCommitHex(null); setZkSecrets(null); setBackupNote(""); setRecoveryInput("");
    setDepositDone(false); setPaid(false);
    setStatus({ text: "Scan a QR or paste an invoice ID", type: "idle" });
  };

  return (
    <div className="fade-in two-col" style={{ alignItems: "start" }}>

      {/*  LEFT PANEL  */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="card">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div className="action-icon" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}>
              <Users size={18} color="var(--accent2)" />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text)" }}>Customer Flow</div>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>Pay a merchant privately through the zero-knowledge pool</div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
            {STEPS.map(s => <Step key={s.n} {...s} state={stepState(s.n)} />)}
          </div>

          {/*  Recovery box (always visible until deposit done)  */}
          {!depositDone && (
            <div style={{ marginBottom: "20px", padding: "12px", background: "rgba(245,158,11,0.05)", border: "1px dashed var(--amber)", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "var(--amber)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                <Key size={14} /> Resume Private Payment
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input className="text-input" value={recoveryInput} onChange={e => setRecoveryInput(e.target.value)}
                  placeholder="Paste your aurion- note here..."
                  style={{ flex: 1, fontSize: "11.5px", background: "rgba(0,0,0,0.2)" }} />
                <button className="btn-secondary" onClick={recoverFromNote}
                  disabled={!recoveryInput.trim() || status.type === "pending"}
                  style={{ padding: "8px 16px", fontSize: "11px", borderColor: "var(--amber)", color: "var(--amber)" }}>
                  {status.type === "pending" && recoveryInput ? <RefreshCw size={12} className="spin" /> : "Recover"}
                </button>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "6px" }}>
                Use this if you already deposited and need to generate a new proof.
              </div>
            </div>
          )}

          {/* Divider */}
          {!depositDone && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>OR START NEW</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>
          )}

          {/*  Step 1: Load invoice  */}
          {!invoiceId && !depositDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ justifyContent: "center", gap: "8px" }}>
                <ScanLine size={15} color="var(--accent2)" /> Scan Merchant QR
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleQRFile} />
              <div>
                <div className="field-label">Invoice ID</div>
                <input className="text-input" value={manualInput} onChange={e => setManualInput(e.target.value)}
                  placeholder="Paste 0x hex ID..."
                  style={{ fontFamily: "var(--mono)", fontSize: "11.5px" }} />
              </div>
              <div className={`status-bar ${status.type}`}>
                <ScanLine size={13} /><span>{status.text}</span>
              </div>
              <button className="btn-primary" onClick={loadManual} disabled={!manualInput.trim()}
                style={{ background: "linear-gradient(135deg, var(--accent2), var(--accent))" }}>
                <ArrowDownLeft size={15} /> Load Invoice
              </button>
            </div>
          )}

          {/*  Step 2: Deposit  */}
          {invoiceId && !depositDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {invoiceAmt ? (
                <div>
                  <div className="field-label">Invoice Amount</div>
                  <div className="field-value">{invoiceAmt} {invoiceToken || "tokens"}</div>
                </div>
              ) : (
                <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                  Amount will be fetched from chain when you deposit.
                </div>
              )}

              <div className={`status-bar ${status.type}`}>
                {status.type === "pending" ? <RefreshCw size={13} className="spin" /> :
                 status.type === "success" ? <CheckCircle2 size={13} /> :
                 status.type === "error"   ? <AlertCircle size={13} /> :
                 <Lock size={13} />}
                <span>{status.text}</span>
              </div>

              <button className="btn-primary" disabled={!address} onClick={deposit}
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
                <Lock size={15} /> Commit Deposit via ZK
              </button>

              {/* Already deposited inline box */}
              <div style={{ marginTop: "10px", padding: "12px", background: "rgba(245,158,11,0.05)", border: "1px dashed var(--amber)", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "var(--amber)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <FileWarning size={12} /> Already deposited but refreshed the page?
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input className="text-input" value={recoveryInput} onChange={e => setRecoveryInput(e.target.value)}
                    placeholder="Paste Backup Note (aurion-...)"
                    style={{ flex: 1, fontSize: "11px", padding: "6px 8px" }} />
                  <button className="btn-secondary" onClick={recoverFromNote} disabled={!recoveryInput.trim()}
                    style={{ padding: "6px 12px", fontSize: "11px" }}>
                    Recover
                  </button>
                </div>
              </div>

              <button className="btn-secondary" onClick={reset} style={{ fontSize: "12px", marginTop: "4px" }}>
                Use different invoice
              </button>
            </div>
          )}

          {/*  Step 3: Verify + Pay  */}
          {depositDone && !paid && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Verify Recovery Details card */}
              <div className="card" style={{ borderColor: "var(--amber)", background: "rgba(245,158,11,0.05)", borderStyle: "dashed" }}>
                <div style={{ fontSize: "12px", color: "var(--amber)", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={14} /> Verify Recovery Details
                </div>

                {/* Editable amount  needed if recovered from backup note */}
                <div style={{ marginBottom: "12px" }}>
                  <div className="field-label" style={{ fontSize: "10px", color: "var(--amber)" }}>Deposit Amount ({invoiceToken || "tokens"})</div>
                  <input className="text-input" type="number" value={invoiceAmt}
                    onChange={e => setInvoiceAmt(e.target.value)} placeholder="e.g., 100"
                    style={{ border: "1px solid var(--amber)", background: "rgba(0,0,0,0.2)" }} />
                  <div className="field-note">Update this if it was not auto-filled from the invoice.</div>
                </div>

                {/* Link invoice ID if missing (e.g. recovered from backup note) */}
                {!invoiceId ? (
                  <div>
                    <div className="field-label" style={{ fontSize: "10px", color: "var(--amber)" }}>Merchant Invoice ID</div>
                    <input className="text-input" value={manualInput} onChange={e => setManualInput(e.target.value)}
                      placeholder="Paste 0x hex ID..."
                      style={{ border: "1px solid var(--amber)", background: "rgba(0,0,0,0.2)", fontFamily: "var(--mono)", fontSize: "11px" }} />
                    <button className="btn-primary" onClick={loadManual}
                      style={{ background: "var(--amber)", color: "black", marginTop: "8px", width: "100%", fontSize: "11px", fontWeight: 700 }}>
                      Link Invoice ID
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "10px", color: "var(--green)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={10} /> Invoice Linked: {invoiceId.slice(0, 14)}...
                  </div>
                )}
              </div>

              <div className={`status-bar ${status.type}`}>
                {status.type === "pending" ? <RefreshCw size={13} className="spin" /> : <Unlock size={13} />}
                <span>{status.text}</span>
              </div>

              <button className="btn-primary" onClick={pay}
                disabled={!invoiceId || !invoiceAmt || parseFloat(invoiceAmt) <= 0}
                style={{
                  background: "linear-gradient(135deg, var(--accent2), #4f46e5)",
                  opacity: (!invoiceId || !invoiceAmt || parseFloat(invoiceAmt) <= 0) ? 0.5 : 1,
                }}>
                <ArrowUpRight size={15} /> Generate Proof & Relay Payment
              </button>
            </div>
          )}

          {/*  Step 4: Done  */}
          {paid && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="status-bar success">
                <CheckCircle2 size={13} /> <span>Payment complete  merchant received funds</span>
              </div>
              <button className="btn-secondary" onClick={reset}>Make another payment</button>
            </div>
          )}
        </div>
      </div>

      {/*  RIGHT PANEL  */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* Backup note card */}
        {backupNote && !paid && (
          <div className="card" style={{ borderColor: "var(--amber)", background: "rgba(245,158,11,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Key size={16} color="var(--amber)" />
              <div className="card-title" style={{ margin: 0, color: "var(--amber)" }}>Your ZK Backup Note</div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text)", marginBottom: "8px" }}>
              If you close this tab before relaying, you will need this note to recover your funds. Do not share it!
            </div>
            <div className="hash-display" style={{ background: "rgba(0,0,0,0.5)", borderColor: "var(--amber)" }}>
              <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px", color: "var(--amber)" }}>{backupNote}</span>
              <CopyBtn text={backupNote} />
            </div>
          </div>
        )}

        {/* Active invoice card */}
        {invoiceId && (
          <div className="card">
            <div className="card-title">Active Invoice</div>
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
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent2)", fontWeight: 700 }}>
                    {invoiceAmt} {invoiceToken}
                  </span>
                </div>
              )}
              {commitHex && (
                <div>
                  <div className="field-label">On-Chain Commitment Hash</div>
                  <div className="hash-display">
                    <span style={{ flex: 1, wordBreak: "break-all", fontSize: "10px" }}>{commitHex.slice(0, 32)}...</span>
                    <CopyBtn text={commitHex} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Status</span>
                <span style={{ fontSize: "12px", fontWeight: 700,
                  color: paid ? "var(--green)" : depositDone ? "var(--accent2)" : "var(--amber)" }}>
                  {paid ? "Paid" : depositDone ? "Deposit committed" : "Awaiting deposit"}
                </span>
              </div>
              <a href={`${EXPLORER}/address/${ADDRESSES.privacyPool}`} target="_blank" rel="noreferrer"
                className="btn-secondary" style={{ fontSize: "12px" }}>
                <ExternalLink size={13} /> View Pool on Explorer
              </a>
            </div>
          </div>
        )}

        {/* How privacy works card */}
        <div className="card">
          <div className="card-title">How Privacy Works</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: Lock,   color: "var(--accent3)", label: "Commitment", desc: "Your identity is hashed via Poseidon, never stored in plain form on-chain" },
              { icon: Shield, color: "var(--accent)",  label: "ZK Proof",   desc: "Browser generates a Groth16 proof to authorize withdrawal without revealing you" },
              { icon: Unlock, color: "var(--accent2)", label: "Relayer",    desc: "Backend node pays HashKey gas so your wallet address stays hidden from the transaction" },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 12px", background: "rgba(99,102,241,0.05)", borderRadius: "9px", border: "1px solid var(--border)" }}>
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