import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, FileText, Lock, Shield, Activity, ExternalLink, Store, Users } from "lucide-react";
import { ADDRESSES, SUPPORTED_TOKENS, EXPLORER, RELAYER_URL, PAYMENT_GATEWAY_ABI, ERC20_ABI } from "./Dashboard.jsx";

function StatCard({ title, value, sub, accent, icon: Icon }) {
  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 12, right: 14, opacity: 0.12 }}>
        <Icon size={30} color={accent || "var(--accent)"} />
      </div>
      <div className="card-title">{title}</div>
      <div className="card-value" style={{ color: accent || "#f1f5f9" }}>{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

export default function Overview({ txLog, address }) {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <StatCard title="Wallet"          value={address ? "Live" : "—"}  sub={address ? `${address.slice(0,10)}...` : "Not connected"} accent="var(--green)"   icon={Wallet}   />
        <StatCard title="Invoices"        value={txLog.filter(t => t.label === "Invoice created").length}  sub="This session"    accent="var(--accent)"  icon={FileText} />
        <StatCard title="Private Payments" value={txLog.filter(t => t.label === "Private payment").length} sub="Nullifiers spent" accent="var(--accent2)" icon={Lock}     />
        <StatCard title="Commitments"     value={txLog.filter(t => t.label === "Privacy deposit").length}  sub="Deposits logged" accent="var(--accent3)" icon={Shield}   />
      </div>

      <div className="two-col" style={{ marginBottom: "14px" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Privacy Pool</div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div className="pulse-dot" />
              <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700 }}>Active</span>
            </div>
          </div>
          {[
            { label: "Pool",    value: `${ADDRESSES.privacyPool.slice(0,8)}...${ADDRESSES.privacyPool.slice(-6)}` },
            { label: "Gateway", value: `...${ADDRESSES.paymentGateway.slice(-6)}` },
            { label: "Network", value: "Hashkey Testnet" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(99,102,241,0.07)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "10.5px", color: "var(--text-mid)" }}>{value}</span>
            </div>
          ))}
          <div className="pool-bar" style={{ marginTop: "14px" }}>
            <div className="pool-fill" style={{ width: `${Math.min(txLog.filter(t => t.label === "Privacy deposit").length * 20 + 10, 95)}%` }} />
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>Anonymity set growing</div>
        </div>
        <div className="card">
          <div className="card-title">Recent Activity</div>
          {txLog.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-dim)", fontSize: "12px" }}>
              <Activity size={24} style={{ margin: "0 auto 8px", display: "block", opacity: 0.25 }} />
              No transactions yet
            </div>
          ) : txLog.slice(0, 6).map((entry, i) => (
            <div key={i} className="activity-row">
              <div className="activity-dot" style={{ background: entry.type === "success" ? "var(--green)" : "var(--red)" }} />
              <div style={{ flex: 1 }}>
                <div className="activity-label">{entry.label}</div>
                {entry.txid && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-dim)", marginTop: "2px" }}>
                    {entry.txid.slice(0, 22)}...
                  </div>
                )}
              </div>
              {entry.txid && (
                <a href={`https://explorer.hiro.so/txid/${entry.txid}?chain=testnet`} target="_blank" rel="noreferrer"
                  style={{ color: "var(--text-dim)", display: "flex", transition: "color 150ms" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--accent2)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">Quick Start</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
          <button className="btn-secondary" style={{ padding: "14px", flexDirection: "column", gap: "8px", height: "auto" }}
            onClick={() => navigate("/app/merchant")}>
            <Store size={20} color="var(--accent)" />
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Merchant Flow</span>
            <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: 400 }}>Create invoice · Generate QR · Receive payment</span>
          </button>
          <button className="btn-secondary" style={{ padding: "14px", flexDirection: "column", gap: "8px", height: "auto" }}
            onClick={() => navigate("/app/customer")}>
            <Users size={20} color="var(--accent2)" />
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Customer Flow</span>
            <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: 400 }}>Scan QR · Deposit · Pay privately</span>
          </button>
        </div>
      </div>
    </div>
  );
}