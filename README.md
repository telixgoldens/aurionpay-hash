# AurionPay

**Zero-Knowledge Private Payment Protocol on HashKey Chain**

AurionPay enables merchants to receive stablecoin payments (USDC, USDT, WHSK) while completely unlinking the payer's identity from the transaction. Built for the HashKey Chain On-Chain Horizon Hackathon  PayFi + ZKID tracks.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://aurionpay-hash.vercel.app |
| Backend/Relayer | https://backend-pay-production.up.railway.app |
| Network | HashKey Chain Testnet (Chain ID 133) |
| Explorer | https://testnet-explorer.hsk.xyz |

---

## The Problem

Every on-chain payment today is fully public. Anyone can see who paid who, how much, and when. This creates real problems:

- Customers expose their financial history to merchants and anyone watching
- Merchants leak sensitive commercial relationships on-chain
- Businesses cannot use blockchain payments without competitive intelligence risks

---

## The Solution

AurionPay uses a commitment-nullifier architecture with Groth16 ZK proofs:

1. **Merchant** creates an invoice on-chain specifying token and amount
2. **Customer** deposits tokens into the privacy pool using a Poseidon hash commitment  identity never stored
3. **ZK proof** generated locally in-browser proves ownership of the commitment without revealing the depositor
4. **Relayer** verifies the proof and broadcasts the settlement  only the relayer's address appears on-chain
5. **Merchant** receives USDC/USDT directly, settled in ~2 seconds

**Additionally**, AurionPay integrates HashKey's HSP payment gateway as a second settlement mode for merchants who want KYT compliance and a hosted checkout experience.

---

## Architecture

```

                        FRONTEND                              
  React + Vite + ethers.js + snarkjs (Groth16 in-browser)   
                                                             
  Dashboard  Merchant  Customer  AI Tools                 
  Two payment modes: ZK Private Pool | HSP Checkout          

                                     
        ZK Relay                       HSP Order
                                     

                        BACKEND (Node.js)                     
                                                             
  /relayer   ZK proof verify + ethers.js broadcast          
  /ai        OpenAI anomaly detection + invoice assistant   
  /hsp       HashKey HSP order creation + status            

                                     
    HashKey Chain                      HashKey HSP Gateway
                                     
  
   SMART CONTRACTS             HSP API                      
                                                           
   PrivacyPool.sol             merchant-qa.hashkeymerchant  
   PaymentGateway.sol          EIP-712 signed checkout      
   Groth16Verifier.sol         KYT compliance               
  
```

---

## Smart Contracts (HashKey Testnet)

| Contract | Address |
|---|---|
| PrivacyPool | `0xfe52E1FeDc1721Ef449821776AC2372493262E9d` |
| PaymentGateway | `0x71241A21e09986014269D84bb188D2630d905e80` |
| Groth16Verifier | `0xEba8c1C0929dbee4B5E702451e908A9C2Df26E09` |

**Supported tokens:**
- USDC: `0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6`
- USDT: `0x372325443233fEbaC1F6998aC750276468c83CC6`

---

## Getting Started

### Prerequisites

- Node.js v18+
- MetaMask or any EVM wallet
- Testnet HSK (from https://faucet.hsk.xyz)
- Testnet USDC/USDT (from https://testnet-explorer.hsk.xyz)

### Clone and install

```bash
git clone https://github.com/telixgoldens/aurionpay-hash
cd aurionpay-hash

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### Configure environment

**Backend**  create `backend/.env`:
```
RELAYER_PRIVATE_KEY=0x...
PRIVACY_POOL_ADDRESS=0x...
PAYMENT_GATEWAY_ADDRESS=0x...
USDT_ADDRESS=0x372325443233fEbaC1F6998aC750276468c83CC6
USDC_ADDRESS=0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6
OPENAI_API_KEY=sk-ant-...
HSP_APP_KEY=...
HSP_APP_SECRET=...
HSP_MERCHANT_NAME=AurionPay
HSP_BASE_URL=https://merchant-qa.hashkeymerchant.com
RAILWAY_EXTERNAL_URL=https://backend-pay-production.up.railway.app
```

**Frontend**  create `frontend/.env.local`:
```
VITE_PRIVACY_POOL_ADDRESS=0x...
VITE_PAYMENT_GATEWAY_ADDRESS=0x...
VITE_USDT_ADDRESS=0x372325443233fEbaC1F6998aC750276468c83CC6
VITE_USDC_ADDRESS=0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6
VITE_RELAYER_URL=http://localhost:3000/relayer
```

### Run locally

```bash
# Terminal 1  backend
cd backend && node index.js

# Terminal 2  frontend
cd frontend && npm run dev
```

### Deploy contracts

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network hashkeyTestnet
```

---

## ZK Circuit

The circuit (`withdraw.circom`) proves:
- `nullifierHash = Poseidon(nullifier)`  prevents double spending
- `commitment = Poseidon(secret, nullifier)`  proves deposit ownership
- `invoiceId` is bound to the proof  prevents replay attacks

```circom
component main {public [nullifierHash, invoiceId]} = Withdraw();
```

Circuit files required in `frontend/public/`:
- `withdraw.wasm`
- `withdraw_final.zkey`

---

## HSP Integration

AurionPay integrates HashKey's HSP (HashKey Stablecoin Payment) protocol for the PayFi track.

**Registration:** Email `hsp_hackathon@hashkey.com` with your org name, admin email, public key, and supported tokens.

**Generate merchant key:**
```bash
openssl ecparam -name secp256k1 -genkey -noout -out merchant_private_key.pem
openssl ec -in merchant_private_key.pem -pubout -out merchant_public_key.pem
```

**Supported HSP tokens on testnet:**
- USDC: `0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6`
- USDT: `0x372325443233fEbaC1F6998aC750276468c83CC6`

**Placing `merchant_private_key.pem` on Render:**
See the Deployment section below.

---

## AI Features

All AI features are powered by Anthropic's OPENAI API via the `/ai` backend endpoint.

| Feature | Endpoint | Description |
|---|---|---|
| Risk Scanner | `POST /ai/check-anomaly` | Scores wallet + payment for fraud risk (0100). Runs automatically before every relayer broadcast. |
| Invoice Assistant | `POST /ai/generate-invoice` | Natural language  structured invoice params |
| ZK Explainer | `POST /ai/explain-tx` | Explains a completed ZK transaction in plain English |

---

## Deployment

### Backend on Render

1. Connect your GitHub repo to Render
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `node index.js`
4. Add all environment variables from `backend/.env`

**For `merchant_private_key.pem`**  do not commit this file to git. Instead:
- In Render dashboard  **Environment**  Add environment variable:
  ```
  MERCHANT_PRIVATE_KEY_PEM=-----BEGIN EC PRIVATE KEY-----\nMHQCAQEE...\n-----END EC PRIVATE KEY-----
  ```
- In `hsp/hsp-service.js`, read it as:
  ```js
  const privateKeyPem = process.env.MERCHANT_PRIVATE_KEY_PEM
    ? process.env.MERCHANT_PRIVATE_KEY_PEM.replace(/\\n/g, "\n")
    : fs.readFileSync(path.join(__dirname, "merchant_private_key.pem"), "utf8");
  ```

### Frontend on Vercel

1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `frontend`
3. Add all `VITE_` environment variables
4. Add `vercel.json` at repo root:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

---

## Testing

```bash
cd backend
node scripts/test-contracts.js
```

Tests: network connectivity, MockUSDT, PaymentGateway (create/query/duplicate), PrivacyPool (deposit/commitment/nullifier), backend health, AI endpoints.

---

## Project Structure

```
aurionpay-hash/
 backend/
    index.js              Main Express server
    relayer/
       router.js         ZK proof verify + HashKey broadcast
    ai/
       ai-service.js     OpenAI API integration
       router.js         AI endpoints
    hsp/
        hsp-service.js    HSP HMAC + ES256K JWT
        router.js         HSP order endpoints
 contracts/
    PrivacyPool.sol       Core ZK pool contract
    PaymentGateway.sol    Invoice registry
    Verifier.sol          Groth16 on-chain verifier
 frontend/
    public/
       withdraw.wasm     ZK circuit binary
       withdraw_final.zkey  Proving key
    src/
        lib/contracts.js  ABIs + addresses
        hooks/            useWallet, useContracts
        utils/            zkUtils, tokenUtils
        Dashboard.jsx     Layout + wallet + routing
        Merchant.jsx      Invoice creation (ZK + HSP modes)
        Customer.jsx      Payment flow (ZK + HSP modes)
        Overview.jsx      Activity log
        AIPanel.jsx       AI tools UI
 circuits/
     withdraw.circom       ZK circuit source
```

---

## License

MIT