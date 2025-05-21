import dotenv from 'dotenv'

dotenv.config()

const FRONTEND_HOST = process.env.FRONTEND_HOST || 'http://localhost:3000'

const API_SECRET = process.env.API_SECRET
if (!API_SECRET) {
  throw new Error('API_SECRET is not set')
}

const WALLET_GEN_SECRET = process.env.WALLET_GEN_SECRET
if (!WALLET_GEN_SECRET) {
  throw new Error('WALLET_GEN_SECRET is not set')
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

const PRIMORDIAL_PRIVATE_KEY = process.env.PRIMORDIAL_PRIVATE_KEY
const PRIMORDIAL_ADDRESS = process.env.PRIMORDIAL_ADDRESS
if (!PRIMORDIAL_PRIVATE_KEY || !PRIMORDIAL_ADDRESS) {
  throw new Error('PRIMORDIAL_PRIVATE_KEY or PRIMORDIAL_ADDRESS is not set')
}

const SCROLL_MAINNET_RPC = process.env.SCROLL_MAINNET_RPC || 'https://rpc.scroll.io'
const SCROLL_MAINNET_CHAIN_ID = process.env.SCROLL_MAINNET_CHAIN_ID || '534352'

const PH2O_ADDRESS = process.env.PH2O_ADDRESS
if (!PH2O_ADDRESS) {
  throw new Error('PH2O_ADDRESS is not set')
}

export const config = {
  port: process.env.PORT || 3001,
  frontendHost: FRONTEND_HOST,
  apiSecret: API_SECRET,
  walletGenSecret: WALLET_GEN_SECRET,
  openaiApiKey: OPENAI_API_KEY,

  scrollMainnetRpc: SCROLL_MAINNET_RPC,
  scrollMainnetChainId: SCROLL_MAINNET_CHAIN_ID,
  ph2oAddress: PH2O_ADDRESS,
  primordialPrivateKey: PRIMORDIAL_PRIVATE_KEY,
  primordialAddress: PRIMORDIAL_ADDRESS,
}
