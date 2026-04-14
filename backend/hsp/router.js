import express  from "express";
import crypto   from "crypto";
import fs       from "fs";
import path     from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function loadPrivateKeyPem() {
  if (process.env.MERCHANT_PRIVATE_KEY_PEM) {
    return process.env.MERCHANT_PRIVATE_KEY_PEM.replace(/\\n/g, "\n");
  }
  const pemPath = path.join(__dirname, "merchant_private_key.pem");
  if (!fs.existsSync(pemPath)) throw new Error("merchant_private_key.pem not found");
  return fs.readFileSync(pemPath, "utf8");
}

function canonicalJSON(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return JSON.stringify(obj);
  const sorted = Object.keys(obj).sort().reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {});
  return "{" + Object.entries(sorted).map(([k, v]) => JSON.stringify(k) + ":" + canonicalJSON(v)).join(",") + "}";
}

function derToJoseSignature(der) {
  let offset = 2;
  if (der[1] & 0x80) offset += (der[1] & 0x7f);
  offset++;
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen); offset += rLen;
  offset++;
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);
  const pad = (buf) => buf.length === 33 && buf[0] === 0 ? buf.slice(1) : buf.length < 32 ? Buffer.concat([Buffer.alloc(32 - buf.length), buf]) : buf;
  return Buffer.concat([pad(r), pad(s)]);
}

function buildES256kJwt(payload, privateKeyPem) {
  const header  = Buffer.from(JSON.stringify({ alg: "ES256K", typ: "JWT" })).toString("base64url");
  const body    = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signing = `${header}.${body}`;
  const key     = crypto.createPrivateKey({ key: privateKeyPem, format: "pem" });
  const sign    = crypto.createSign("SHA256");
  sign.update(signing); sign.end();
  return `${signing}.${derToJoseSignature(sign.sign(key)).toString("base64url")}`;
}

export function createHSPRouter() {
  const router = express.Router();

  router.post("/sign-jwt", (req, res) => {
    try {
      const { cartContents } = req.body;
      if (!cartContents) return res.status(400).json({ error: "cartContents required" });

      const privateKeyPem = loadPrivateKeyPem();
      const cartHash      = crypto.createHash("sha256").update(canonicalJSON(cartContents), "utf8").digest("hex");
      const now           = Math.floor(Date.now() / 1000);
      const merchantName  = process.env.HSP_MERCHANT_NAME || "AurionPay";

      const payload = {
        iss: merchantName, sub: merchantName, aud: "HashkeyMerchant",
        iat: now, exp: now + 3600,
        jti: `JWT-${now}-${crypto.randomBytes(4).toString("hex")}`,
        cart_hash: cartHash,
      };

      const jwt = buildES256kJwt(payload, privateKeyPem);
      res.json({ jwt });
    } catch (err) {
      console.error("JWT signing error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/create-order", (req, res) => {
    res.status(503).json({
      error: "HSP server-side calls blocked by Cloudflare. Use client-side flow.",
      useClientSide: true,
    });
  });

  router.get("/payment-status", async (req, res) => {
    res.status(503).json({ error: "Use client-side queryHSPPaymentDirect()" });
  });

  return router;
}