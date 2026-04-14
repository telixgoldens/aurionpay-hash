
const HSP_BASE_URL   = "https://merchant-qa.hashkeymerchant.com";
const APP_KEY        = import.meta.env.VITE_HSP_APP_KEY;
const APP_SECRET     = import.meta.env.VITE_HSP_APP_SECRET;
const MERCHANT_NAME  = import.meta.env.VITE_HSP_MERCHANT_NAME || "AurionPay";

function canonicalJSON(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }
  const sorted = Object.keys(obj).sort().reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {});
  return "{" + Object.entries(sorted).map(([k, v]) => JSON.stringify(k) + ":" + canonicalJSON(v)).join(",") + "}";
}

async function hmacSHA256(secret, message) {
  const enc     = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);
  const key     = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig     = await crypto.subtle.sign("HMAC", key, msgData);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(message) {
  const enc  = new TextEncoder();
  const data = enc.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function buildHmacHeaders(method, urlPath, query, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce     = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join("");
  const bodyHash  = body ? await sha256(canonicalJSON(body)) : "";
  const message   = [method.toUpperCase(), urlPath, query || "", bodyHash, timestamp, nonce].join("\n");
  const signature = await hmacSHA256(APP_SECRET, message);
  return {
    "X-App-Key":    APP_KEY,
    "X-Signature":  signature,
    "X-Timestamp":  timestamp,
    "X-Nonce":      nonce,
    "Content-Type": "application/json",
  };
}

async function buildCartMandateJWT(cartContents) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
    || import.meta.env.VITE_RELAYER_URL?.replace("/relayer", "")
    || "http://localhost:3000";

  const res  = await fetch(`${BACKEND_URL}/hsp/sign-jwt`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ cartContents }),
  });
  const data = await res.json();
  if (!data.jwt) throw new Error("JWT signing failed: " + (data.error || "unknown"));
  return data.jwt;
}

export async function createHSPOrderDirect({
  orderId, paymentRequestId, amount, currency,
  payToAddress, merchantName, redirectUrl, invoiceNote,
}) {
  const TOKENS = {
    USDC: { address: "0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6", decimals: 6, network: "hashkey-testnet", chain_id: 133 },
    USDT: { address: "0x372325443233fEbaC1F6998aC750276468c83CC6", decimals: 6, network: "hashkey-testnet", chain_id: 133 },
  };

  const token     = TOKENS[currency.toUpperCase()];
  if (!token) throw new Error(`Unsupported currency: ${currency}`);
  const amountStr = (Number(amount) / Math.pow(10, token.decimals)).toFixed(2);
  const label     = invoiceNote || "AurionPay Private Payment";

  const cartContents = {
    id: orderId,
    user_cart_confirmation_required: true,
    payment_request: {
      method_data: [{
        supported_methods: "https://www.x402.org/",
        data: {
          x402Version: 2, network: token.network, chain_id: token.chain_id,
          contract_address: token.address, pay_to: payToAddress, coin: currency.toUpperCase(),
        },
      }],
      details: {
        id: paymentRequestId,
        display_items: [{ label, amount: { currency: "USD", value: amountStr } }],
        total: { label: "Total", amount: { currency: "USD", value: amountStr } },
      },
    },
    cart_expiry:   new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    merchant_name: merchantName || MERCHANT_NAME,
  };

  const merchantAuth = await buildCartMandateJWT(cartContents);
  const body         = {
    cart_mandate: { contents: cartContents, merchant_authorization: merchantAuth },
    redirect_url: redirectUrl || "",
  };

  const urlPath = "/api/v1/merchant/orders";
  const headers = await buildHmacHeaders("POST", urlPath, "", body);

  const res = await fetch(`${HSP_BASE_URL}${urlPath}`, {
    method:  "POST",
    headers,
    body:    JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    if (text.includes("Just a moment") || text.includes("Cloudflare")) {
      throw new Error("HSP checkout temporarily unavailable (Cloudflare). Please use ZK payment mode.");
    }
    throw new Error("Unexpected HSP response: " + text.slice(0, 100));
  }

  const data = await res.json();
  if (data.code !== 0) throw new Error(`HSP error ${data.code}: ${data.msg}`);
  return data.data;
}

export async function queryHSPPaymentDirect(cartMandateId) {
  const urlPath = "/api/v1/merchant/payments";
  const query   = `cart_mandate_id=${cartMandateId}`;
  const headers = await buildHmacHeaders("GET", urlPath, query, null);

  const res  = await fetch(`${HSP_BASE_URL}${urlPath}?${query}`, { headers });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`HSP query error: ${data.msg}`);
  return data.data;
}