// src/hooks/useContracts.js
// Returns ethers contract instances connected to the signer

import { useMemo } from "react";
import { ethers } from "ethers";
import {
  ADDRESSES,
  PRIVACY_POOL_ABI,
  PAYMENT_GATEWAY_ABI,
  ERC20_ABI,
} from "../lib/contracts.js";

const isValidAddress = (address) => typeof address === "string" && address.startsWith("0x") && address.length === 42;

export function useContracts(signer) {
  return useMemo(() => {
    if (!signer) return null;

    if (!isValidAddress(ADDRESSES.privacyPool) || !isValidAddress(ADDRESSES.paymentGateway)) {
      console.warn("useContracts: missing contract address in ADDRESSES", ADDRESSES);
      return null;
    }

    return {
      privacyPool:    new ethers.Contract(ADDRESSES.privacyPool,    PRIVACY_POOL_ABI,    signer),
      paymentGateway: new ethers.Contract(ADDRESSES.paymentGateway, PAYMENT_GATEWAY_ABI, signer),
      usdt:           isValidAddress(ADDRESSES.usdt) ? new ethers.Contract(ADDRESSES.usdt, ERC20_ABI, signer) : null,
      usdc:           isValidAddress(ADDRESSES.usdc) ? new ethers.Contract(ADDRESSES.usdc, ERC20_ABI, signer) : null,
      token: (address) => new ethers.Contract(address, ERC20_ABI, signer),
    };
  }, [signer]);
}