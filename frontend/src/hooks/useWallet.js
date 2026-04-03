// src/hooks/useWallet.js
// EVM wallet hook using window.ethereum (MetaMask / any EVM wallet)

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CHAIN_ID, RPC_URL } from "../lib/contracts.js";

const HASHKEY_TESTNET = {
  chainId:          "0x85",
  chainName:        "HashKey Chain Testnet",
  nativeCurrency:   { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls:          [RPC_URL],
  blockExplorerUrls: ["https://testnet-explorer.hsk.xyz"],
};

export function useWallet() {
  const [address,  setAddress]  = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer,   setSigner]   = useState(null);
  const [chainId,  setChainId]  = useState(null);
  const [error,    setError]    = useState(null);

  const isCorrectChain = chainId === CHAIN_ID;

  // Restore session on mount
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) initProvider();
    });
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) disconnect();
      else initProvider();
    });
    window.ethereum.on("chainChanged", () => initProvider());
    return () => {
      window.ethereum?.removeAllListeners?.("accountsChanged");
      window.ethereum?.removeAllListeners?.("chainChanged");
    };
  }, []);

  async function initProvider() {
    try {
      const p        = new ethers.BrowserProvider(window.ethereum);
      const s        = await p.getSigner();
      const addr     = await s.getAddress();
      const network  = await p.getNetwork();
      setProvider(p);
      setSigner(s);
      setAddress(addr);
      setChainId(Number(network.chainId));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No EVM wallet detected. Install MetaMask or OKX Wallet.");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await initProvider();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  const switchToHashKey = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x85" }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method:  "wallet_addEthereumChain",
          params:  [HASHKEY_TESTNET],
        });
      }
    }
  }, []);

  return {
    address,
    provider,
    signer,
    chainId,
    error,
    isCorrectChain,
    connect,
    disconnect,
    switchToHashKey,
  };
}