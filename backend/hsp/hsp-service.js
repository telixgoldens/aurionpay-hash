import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HSP_BASE_URL  = process.env.HSP_BASE_URL || "https://merchant-qa.hashkeymerchant.com";
const APP_KEY       = process.env.HSP_APP_KEY;
const APP_SECRET    = process.env.HSP_APP_SECRET;
const MERCHANT_NAME = process.env.HSP_MERCHANT_NAME || "AurionPay";

const TOKENS = {
  USDC: { address: "0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6", decimals: 6, network: "hashkey-testnet", chain_id: 133 },
  USDT: { address: "0x372325443233fEbaC1F6998aC750276468c83CC6", decimals: 6, network: "hashkey-testnet", chain_id: 133 },
};

function buildHmacHeaders(method, urlPath, query, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const bodyHash = body
    ? crypto.createHash("sha256").update(JSON.stringify(body), "utf8").digest("hex")
    : "";

  const message = [method.toUpperCase(), urlPath, query || "", bodyHash, timestamp, nonce].join("\n");

  const signature = crypto.createHmac("sha256", APP_SECRET).update(message).digest("hex");

  return {
    "X-App-Key": APP_KEY,
    "X-Signature": signature,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "Content-Type": "application/json",
  };
}

function loadPrivateKeyPem() {
  if (process.env.MERCHANT_PRIVATE_KEY_PEM) {
    return process.env.MERCHANT_PRIVATE_KEY_PEM.replace(/\\n/g, "\n");
  }

  const pemPath = path.join(__dirname, "merchant_private_key.pem");
  if (!fs.existsSync(pemPath)) {
    throw new Error("merchant_private_key.pem not found and MERCHANT_PRIVATE_KEY_PEM env var not set");
  }

  return fs.readFileSync(pemPath, "utf8");
}

function derToJoseSignature(der) {
  let offset = 2;

  if (der[1] & 0x80) offset += der[1] & 0x7f;

  offset++;
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;

  offset++;
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);

  const pad32 = (buf) => {
    if (buf.length === 33 && buf[0] === 0x00) return buf.slice(1);
    if (buf.length < 32) return Buffer.concat([Buffer.alloc(32 - buf.length), buf]);
    return buf;
  };

  return Buffer.concat([pad32(r), pad32(s)]);
}

function buildES256kJwt(payload, privateKeyPem) {
  const header = Buffer.from(JSON.stringify({ alg: "ES256K", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signing = `${header}.${body}`;

  const privateKey = crypto.createPrivateKey({ key: privateKeyPem, format: "pem" });

  const signer = crypto.createSign("SHA256");
  signer.update(signing);
  signer.end();

  const derSig = signer.sign(privateKey);
  const rawSig = derToJoseSignature(derSig);
  const signature = rawSig.toString("base64url");

  return `${signing}.${signature}`;
}

function buildMerchantAuth(cartContents) {
  const privateKeyPem = loadPrivateKeyPem();

  const cartHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(cartContents), "utf8")
    .digest("hex");

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: MERCHANT_NAME,
    sub: MERCHANT_NAME,
    aud: "HashkeyMerchant",
    iat: now,
    exp: now + 3600,
    jti: `JWT-${now}-${crypto.randomBytes(4).toString("hex")}`,
    cart_hash: cartHash,
  };

  return buildES256kJwt(payload, privateKeyPem);
}

export async function createHSPOrder({
  orderId,
  paymentRequestId,
  amount,
  currency,
  payToAddress,
  merchantName,
  redirectUrl,
}) {
  const token = TOKENS[currency.toUpperCase()];
  if (!token) throw new Error(`Unsupported currency: ${currency} (use USDC or USDT)`);

  const amountStr = (Number(amount) / Math.pow(10, token.decimals)).toFixed(2);

  const cartContents = {
    id: orderId,
    user_cart_confirmation_required: true,
    payment_request: {
      method_data: [
        {
          supported_methods: "https://www.x402.org/",
          data: {
            x402Version: 2,
            network: token.network,
            chain_id: token.chain_id,
            contract_address: token.address,
            pay_to: payToAddress,
            coin: currency.toUpperCase(),
          },
        },
      ],
      details: {
        id: paymentRequestId,
        display_items: [
          {
            label: "AurionPay Private Payment",
            amount: { currency: "USD", value: amountStr },
          },
        ],
        total: {
          label: "Total",
          amount: { currency: "USD", value: amountStr },
        },
      },
    },
    cart_expiry: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    merchant_name: merchantName || MERCHANT_NAME,
  };

  const merchantAuth = buildMerchantAuth(cartContents);

  const body = {
    cart_mandate: {
      contents: cartContents,
      merchant_authorization: merchantAuth,
    },
    redirect_url: redirectUrl || "",
  };

  const urlPath = "/api/v1/merchant/orders";
  const headers = buildHmacHeaders("POST", urlPath, "", body);

  const response = await axios.post(`${HSP_BASE_URL}${urlPath}`, body, { headers });

  if (response.data.code !== 0) {
    throw new Error(`HSP Error ${response.data.code}: ${response.data.msg}`);
  }

  return response.data.data;
}

export async function queryHSPPayment(cartMandateId) {
  const urlPath = "/api/v1/merchant/payments";
  const query = `cart_mandate_id=${cartMandateId}`;

  const headers = buildHmacHeaders("GET", urlPath, query, null);

  const response = await axios.get(`${HSP_BASE_URL}${urlPath}?${query}`, { headers });

  if (response.data.code !== 0) {
    throw new Error(`HSP query error: ${response.data.msg}`);
  }

  return response.data.data;
}

export { TOKENS };