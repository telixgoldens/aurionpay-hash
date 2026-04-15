import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Wallet,
  ChevronLeft,
  Menu,
  X,
  Copy,
  CheckCircle2,
  Store,
  Users,
  Brain,
} from "lucide-react";
import { useWallet } from "../../hooks/useWallet.js";
import { formatAddress } from "../../utils/tokenUtils.js";
import { LangToggle, useLang } from "../../lib/LanguageContext.jsx";
import { t } from "../../lib/i18n.js";
import Merchant from "./Merchant.jsx";
import Customer from "./Customer.jsx";
import Overview from "./Overview.jsx";
import AIPanel from "./Aipanel.jsx";
import Logoimg from "../../assets/logo.png";

export {
  ADDRESSES,
  SUPPORTED_TOKENS,
  EXPLORER,
  RELAYER_URL,
  PAYMENT_GATEWAY_ABI,
  ERC20_ABI,
} from "../../lib/contracts.js";

export function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "#10b981" : "#475569",
        padding: "2px",
        flexShrink: 0,
        display: "flex",
      }}
    >
      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function Dashboard() {
  const { lang } = useLang();
  const {
    address,
    signer,
    provider,
    isCorrectChain,
    connect,
    disconnect,
    switchToHashKey,
  } = useWallet();

  const NAV = [
    {
      id: "dashboard",
      label: t("overview", lang),
      icon: LayoutDashboard,
      path: "/app",
    },
    {
      id: "merchant",
      label: t("merchant", lang),
      icon: Store,
      path: "/app/merchant",
    },
    {
      id: "customer",
      label: t("customer", lang),
      icon: Users,
      path: "/app/customer",
    },
    { id: "ai", label: t("aiTools", lang), icon: Brain, path: "/app/ai" },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [txLog, setTxLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aurionpay_txlog") || "[]");
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem("aurionpay_txlog", JSON.stringify(txLog));
    } catch {}
  }, [txLog]);

  const addLog = useCallback((label, txid, type = "success") => {
    setTxLog((prev) => [
      { label, txid, type, ts: Date.now() },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const isActive = (path) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  const pageTitle =
    location.pathname === "/app"
      ? t("overview", lang)
      : location.pathname.includes("merchant")
        ? t("merchant", lang)
        : location.pathname.includes("customer")
          ? t("customer", lang)
          : location.pathname.includes("ai")
            ? t("aiTools", lang)
            : "AurionPay";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #05050d; --surface: #0b0b18;
          --border: rgba(99,102,241,0.18);
          --accent: #6366f1; --accent2: #06b6d4; --accent3: #a855f7;
          --green: #10b981; --amber: #f59e0b; --red: #ef4444;
          --text: #f1f5f9; --text-mid: #94a3b8; --text-dim: #475569;
          --mono: 'JetBrains Mono', monospace; --display: 'Syne', sans-serif;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--display); }
        .dash-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }
        .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 50; width: 220px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; transition: width 280ms ease; flex-shrink: 0; }
        .sidebar.collapsed { width: 60px; }
        .sidebar-logo { height: 60px; display: flex; align-items: center; gap: 10px; padding: 0 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .logo-mark { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(99,102,241,0.45); overflow: hidden; }
        .logo-text { font-size: 15px; font-weight: 800; color: var(--text); white-space: nowrap; letter-spacing: -0.02em; }
        .sidebar-nav { flex: 1; padding: 10px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; border: 1px solid transparent; background: none; color: var(--text-dim); cursor: pointer; transition: all 180ms ease; width: 100%; text-align: left; white-space: nowrap; overflow: hidden; }
        .nav-item:hover { background: rgba(99,102,241,0.08); color: var(--text-mid); }
        .nav-item.active { background: linear-gradient(135deg, rgba(79,70,229,0.22), rgba(124,58,237,0.18)); border-color: rgba(99,102,241,0.28); color: #c4b5fd; }
        .nav-label { font-size: 13px; font-weight: 600; }
        .sidebar-footer { border-top: 1px solid var(--border); padding: 8px; display: flex; flex-direction: column; gap: 4px; }
        .wallet-chip { padding: 8px 10px; border-radius: 8px; background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.18); margin-bottom: 2px; }
        .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; flex-shrink: 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .collapse-btn { display: flex; align-items: center; justify-content: center; padding: 7px; border-radius: 8px; width: 100%; background: none; border: 1px solid transparent; color: var(--text-dim); cursor: pointer; transition: all 180ms; }
        .collapse-btn:hover { background: rgba(99,102,241,0.09); color: var(--accent); }
        .dash-main { display: flex; flex-direction: column; overflow: hidden; flex: 1; transition: margin-left 280ms ease; }
        .topbar { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-bottom: 1px solid var(--border); background: rgba(11,11,24,0.85); backdrop-filter: blur(12px); flex-shrink: 0; position: sticky; top: 0; z-index: 30; }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .page-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .network-badge { font-size: 10px; font-weight: 600; font-family: var(--mono); padding: 3px 8px; border-radius: 20px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: var(--amber); text-transform: uppercase; letter-spacing: 0.06em; }
        .addr-pill { font-family: var(--mono); font-size: 11px; color: var(--text-mid); padding: 5px 10px; border-radius: 20px; background: rgba(99,102,241,0.08); border: 1px solid var(--border); cursor: pointer; transition: all 180ms; }
        .addr-pill:hover { border-color: var(--accent); color: var(--text); }
        .btn-connect { display: flex; align-items: center; gap: 7px; padding: 7px 14px; border-radius: 8px; border: none; font-family: var(--display); font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 180ms; }
        .btn-connect.on  { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
        .btn-connect.off { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; box-shadow: 0 0 18px rgba(99,102,241,0.4); }
        .btn-connect.off:hover { box-shadow: 0 0 28px rgba(99,102,241,0.6); transform: translateY(-1px); }
        .wrong-chain-banner { background: rgba(239,68,68,0.1); border-bottom: 1px solid rgba(239,68,68,0.25); padding: 8px 24px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--red); flex-shrink: 0; }
        .dash-content { flex: 1; overflow-y: auto; padding: 24px; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; transition: border-color 200ms; }
        .card:hover { border-color: rgba(99,102,241,0.3); }
        .card-title { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .card-value { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
        .card-sub { font-size: 11.5px; color: var(--text-dim); margin-top: 5px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
        .action-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .field-label { font-size: 11px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 7px; }
        .field-note  { font-size: 11px; color: var(--text-dim); margin-top: 5px; font-family: var(--mono); }
        .field-value { font-family: var(--mono); font-size: 12px; color: var(--text-mid); padding: 9px 12px; background: rgba(99,102,241,0.06); border: 1px solid var(--border); border-radius: 8px; word-break: break-all; }
        .text-input { width: 100%; padding: 10px 13px; border-radius: 9px; background: rgba(99,102,241,0.06); border: 1px solid var(--border); color: var(--text); font-family: var(--display); font-size: 14px; font-weight: 600; outline: none; transition: border-color 180ms; }
        .text-input:focus { border-color: var(--accent); }
        .text-input::placeholder { color: var(--text-dim); font-weight: 400; }
        select.text-input { appearance: none; cursor: pointer; }
        .hash-display { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 10.5px; color: var(--text-mid); padding: 9px 12px; background: rgba(99,102,241,0.06); border: 1px solid var(--border); border-radius: 8px; }
        .status-bar { display: flex; align-items: center; gap: 9px; padding: 10px 14px; border-radius: 9px; font-size: 12.5px; font-weight: 600; border: 1px solid transparent; transition: all 200ms; }
        .status-bar.idle    { background: rgba(71,85,105,0.15); border-color: rgba(71,85,105,0.2);  color: var(--text-dim); }
        .status-bar.pending { background: rgba(245,158,11,0.1);  border-color: rgba(245,158,11,0.25); color: var(--amber); }
        .status-bar.success { background: rgba(16,185,129,0.1);  border-color: rgba(16,185,129,0.25); color: var(--green); }
        .status-bar.error   { background: rgba(239,68,68,0.1);   border-color: rgba(239,68,68,0.25);  color: var(--red); }
        .btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; border-radius: 10px; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; font-family: var(--display); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 200ms; letter-spacing: -0.01em; box-shadow: 0 4px 20px rgba(99,102,241,0.35); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(99,102,241,0.5); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-secondary { display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 16px; border-radius: 9px; background: rgba(99,102,241,0.08); border: 1px solid var(--border); color: var(--text-mid); font-family: var(--display); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 180ms; }
        .btn-secondary:hover { background: rgba(99,102,241,0.16); border-color: var(--accent); color: var(--text); }
        .pool-bar { height: 4px; background: rgba(99,102,241,0.12); border-radius: 4px; margin-top: 14px; overflow: hidden; }
        .pool-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #4f46e5, #06b6d4); transition: width 1s ease; }
        .activity-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(99,102,241,0.07); }
        .activity-row:last-child { border-bottom: none; }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .activity-label { font-size: 12.5px; font-weight: 600; color: var(--text-mid); }
        .fade-in { animation: fadeIn 220ms ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .qr-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 24px; background: rgba(99,102,241,0.05); border: 1px solid var(--border); border-radius: 12px; }
        .qr-label { font-size: 11px; color: var(--text-dim); font-family: var(--mono); text-align: center; }
        .step-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(99,102,241,0.05); border: 1px solid var(--border); }
        .step-num { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #4f46e5, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; }
        .step-text { font-size: 13px; font-weight: 600; color: var(--text-mid); }
        .step-sub  { font-size: 11px; color: var(--text-dim); margin-top: 2px; font-family: var(--mono); }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mobile-menu-btn { display: none !important; }
        @media(max-width:900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:700px) { .two-col { grid-template-columns: 1fr; } }
        @media(max-width:1023px) {
          .mobile-menu-btn { display: flex !important; }
          .sidebar { transform: translateX(-100%); transition: transform 280ms ease, width 280ms ease; }
          .sidebar.mobile-open { transform: translateX(0); }
          .dash-main { margin-left: 0 !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      <div className="dash-layout">
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
              zIndex: 40,
            }}
          />
        )}

        <aside
          className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        >
          <div className="sidebar-logo">
            <div>
              <img
                src={Logoimg}
                alt="AurionPay Logo"
                className="w-8 h-8 rounded-sm"
              />
            </div>
            {!collapsed && <span className="logo-text">AurionPay</span>}
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
          <nav className="sidebar-nav">
            {NAV.map(({ id, label, icon: Icon, path }) => (
              <button
                key={id}
                className={`nav-item ${isActive(path) ? "active" : ""}`}
                title={collapsed ? label : undefined}
                onClick={() => {
                  navigate(path);
                  setMobileOpen(false);
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && <span className="nav-label">{label}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            {address && !collapsed && (
              <div className="wallet-chip">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "5px",
                  }}
                >
                  <div className="pulse-dot" />
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--green)",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                    }}
                  >
                    {t("connected", lang).toUpperCase()}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "10px",
                    color: "var(--text-dim)",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                  }}
                >
                  {address.slice(0, 10)}...{address.slice(-6)}
                </div>
              </div>
            )}
            <button
              className="collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft
                size={15}
                style={{
                  transition: "transform 280ms",
                  transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          </div>
        </aside>
        <div
          className="dash-main"
          style={{ marginLeft: collapsed ? "60px" : "220px" }}
        >
          {address && !isCorrectChain && (
            <div className="wrong-chain-banner">
              <span>{t("wrongChain", lang)}</span>
              <button
                className="btn-secondary"
                style={{ fontSize: "11px", padding: "4px 12px" }}
                onClick={switchToHashKey}
              >
                {t("switchNet", lang)}
              </button>
            </div>
          )}
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="mobile-menu-btn btn-secondary"
                style={{ padding: "7px" }}
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={18} />
              </button>
              <span className="page-title">{pageTitle}</span>
              <span className="network-badge">{t("network", lang)}</span>
            </div>
            <div className="topbar-right">
              <LangToggle />
              {address ? (
                <>
                  <div
                    className="addr-pill"
                    onClick={() => navigator.clipboard.writeText(address)}
                    title="Click to copy"
                  >
                    {formatAddress(address)}
                  </div>
                  <button className="btn-connect on" onClick={disconnect}>
                    <div
                      className="pulse-dot"
                      style={{ width: "6px", height: "6px" }}
                    />
                    {t("connected", lang)}
                  </button>
                </>
              ) : (
                <button className="btn-connect off" onClick={connect}>
                  <Wallet size={14} /> {t("connect", lang)}
                </button>
              )}
            </div>
          </header>
          <div className="dash-content">
            <Routes>
              <Route
                path="/"
                element={
                  <Overview
                    txLog={txLog}
                    address={address}
                    signer={signer}
                    provider={provider}
                  />
                }
              />
              <Route
                path="/merchant"
                element={
                  <Merchant address={address} signer={signer} addLog={addLog} />
                }
              />
              <Route
                path="/customer"
                element={
                  <Customer address={address} signer={signer} addLog={addLog} />
                }
              />
              <Route path="/ai" element={<AIPanel address={address} />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}
