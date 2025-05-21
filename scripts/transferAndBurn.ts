import { PH2O } from '../hardhat/typechain-types/contracts/PH2O'
import { PH2O__factory } from '../hardhat/typechain-types/factories/contracts/PH2O__factory'

import dotenv from 'dotenv'
import { ethers, parseEther } from 'ethers'
dotenv.config()

const RPC_URL = process.env.SCROLL_MAINNET_RPC
const PH2O_ADDRESS = process.env.PH2O_ADDRESS

const PRIVATE_KEY = process.env.PrimordialPrivateKey
const TEST_PRIVATE_KEY = process.env.TestPrivateKey

if (!RPC_URL || !PRIVATE_KEY || !TEST_PRIVATE_KEY || !PH2O_ADDRESS) {
  throw new Error('RPC_URL or PRIVATE_KEY is not set')
}

const provider = new ethers.JsonRpcProvider(RPC_URL, {
  chainId: 534352,
  name: 'scroll',
})

const testWallet = new ethers.Wallet(TEST_PRIVATE_KEY, provider)
const primordialWallet = new ethers.Wallet(PRIVATE_KEY, provider)

const tokenContract = PH2O__factory.connect(
  PH2O_ADDRESS,
  primordialWallet
)

const tokenContractForTestAccount = PH2O__factory.connect(
  PH2O_ADDRESS,
  testWallet
)

async function getGasEstimate() {
  const recipientAddress = primordialWallet.address
  const transferAmount = ethers.parseUnits('1', 18)
  const gasEstimate = await tokenContractForTestAccount.transfer.estimateGas(
    recipientAddress, 
    transferAmount
  );
  return gasEstimate
}

async function checkBalance(amount: number) {
  const amountInWei = ethers.parseUnits(amount.toString(), 18)
  const balance = await tokenContract.balanceOf(testWallet.address)
  console.log('Balance:', balance)
  if (balance < amountInWei) {
    throw new Error('Insufficient balance')
  }
}

async function transferAndBurn() {
  await checkBalance(1)

  const gasEstimate = await getGasEstimate()
  console.log('Gas estimate:', gasEstimate)
}

transferAndBurn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
