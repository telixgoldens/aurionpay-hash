export const CHAIN_ID    = 133;
export const NETWORK     = "hashkey-testnet";
export const RPC_URL     = "https://testnet.hsk.xyz";
export const EXPLORER    = "https://testnet-explorer.hsk.xyz";
const relayerEnvUrl = import.meta.env.VITE_RELAYER_URL || "http://localhost:3000/relayer";

export const RELAYER_URL = relayerEnvUrl.endsWith("/relayer")
  ? relayerEnvUrl.replace(/\/+$/, "")
  : relayerEnvUrl.replace(/\/+$/, "") + "/relayer";

export const ADDRESSES = {
  privacyPool:    import.meta.env.VITE_PRIVACY_POOL_ADDRESS    || "",
  paymentGateway: import.meta.env.VITE_PAYMENT_GATEWAY_ADDRESS || "",
  usdt:   import.meta.env.VITE_USDT_ADDRESS || "0x372325443233fEbaC1F6998aC750276468c83CC6",
  usdc:   import.meta.env.VITE_USDC_ADDRESS || "0x8FE3cB719Ee4410E236Cd6b72ab1fCDC06eF53c6",
  whsk:   import.meta.env.VITE_WHSK_ADDRESS || "",
};

export const SUPPORTED_TOKENS = {
  USDT: {
    address:  ADDRESSES.usdt,
    decimals: 6,
    symbol:   "USDT",
    name:     "Tether USD",
    color:    "#26A17B",
    faucet:   "https://testnet-explorer.hsk.xyz",
  },
  USDC: {
    address:  ADDRESSES.usdc,
    decimals: 6,
    symbol:   "USDC",
    name:     "USD Coin",
    color:    "#2775CA",
    faucet:   "https://testnet-explorer.hsk.xyz",
  },
  WHSK: {
    address:  ADDRESSES.whsk,
    decimals: 18,
    symbol:   "WHSK",
    name:     "Wrapped HSK",
    color:    "#F59E0B",
    faucet:   null,
    note:     "Wrap native HSK first",
  },
};

export function getAvailableTokens() {
  return Object.entries(SUPPORTED_TOKENS)
    .filter(([, t]) => t.address && t.address !== "")
    .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
}

export const PRIVACY_POOL_ABI = [
  "function deposit(address token, bytes32 commitment, uint256 amount) external",
  "function withdrawAndPay(bytes32 nullifier, bytes32 invoiceId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[5] publicSignals) external",
  "function isSpent(bytes32 nullifier) external view returns (bool)",
  "function getCommitment(bytes32 commitment) external view returns (address depositor, address token, uint256 amount, bool exists)",
  "function poolBalance(address token) external view returns (uint256)",
  "function supportedTokens(address token) external view returns (bool)",
  "event Deposited(bytes32 indexed commitment, address indexed depositor, address indexed token, uint256 amount)",
  "event WithdrawalRelayed(bytes32 indexed nullifier, bytes32 indexed invoiceId, address indexed merchant, address token, uint256 amount)",
];

export const PAYMENT_GATEWAY_ABI = [
  "function createInvoice(bytes32 invoiceId, address token, uint256 amount) external",
  "function getInvoice(bytes32 invoiceId) external view returns (address merchant, address token, uint256 amount, bool paid, bool exists)",
  "function getAmount(bytes32 invoiceId) external view returns (uint256)",
  "function getToken(bytes32 invoiceId) external view returns (address)",
  "function getMerchant(bytes32 invoiceId) external view returns (address)",
  "function isPaid(bytes32 invoiceId) external view returns (bool)",
  "event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, address token, uint256 amount)",
  "event InvoicePaid(bytes32 indexed invoiceId, address indexed merchant, address token, uint256 amount)",
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
];

export const WHSK_ABI = [
  ...ERC20_ABI,
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
];