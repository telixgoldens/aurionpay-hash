// src/utils/tokenUtils.js
// Token formatting and approval utilities

import { ethers } from "ethers";
import { ERC20_ABI } from "../lib/contracts.js";

export function formatUnits(amount, decimals = 6) {
  return ethers.formatUnits(amount, decimals);
}

export function parseUnits(amount, decimals = 6) {
  return ethers.parseUnits(String(amount), decimals);
}

export function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function txLink(txHash) {
  return `https://testnet-explorer.hsk.xyz/tx/${txHash}`;
}

export function contractLink(address) {
  return `https://testnet-explorer.hsk.xyz/address/${address}`;
}

// Check token allowance and approve if needed
export async function ensureAllowance(signer, tokenAddress, spender, amount) {
  const token     = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const owner     = await signer.getAddress();
  const allowance = await token.allowance(owner, spender);

  if (allowance < amount) {
    const tx = await token.approve(spender, amount);
    await tx.wait();
    return true;
  }
  return false;
}

// Get token balance for an address
export async function getTokenBalance(provider, tokenAddress, userAddress) {
  const token   = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await token.balanceOf(userAddress);
  const decimals = await token.decimals();
  return { raw: balance, formatted: ethers.formatUnits(balance, decimals) };
}

// Generate a random bytes32 invoice ID
export function generateInvoiceId() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Strip 0x prefix from hex string
export function stripHex(hex) {
  return hex.startsWith("0x") ? hex.slice(2) : hex;
}

// Pad hex to 32 bytes
export function padHex32(hex) {
  const clean = stripHex(hex);
  return "0x" + clean.padStart(64, "0");
}