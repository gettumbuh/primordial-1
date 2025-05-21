import { ethers } from 'ethers'
import { PH2O } from '../hardhat/typechain-types/contracts/PH2O'
import { PH2O__factory } from '../hardhat/typechain-types/factories/contracts/PH2O__factory'

import dotenv from 'dotenv'
dotenv.config()

const RPC_URL = process.env.SCROLL_MAINNET_RPC
const PRIVATE_KEY = process.env.PrimordialPrivateKey || ''
if (!RPC_URL || !PRIVATE_KEY) {
  throw new Error('RPC_URL or PRIVATE_KEY is not set')
}

const TEST_ACCOUNT = process.env.TestAddress || ''
const CONTRACT_ADDRESS = process.env.PH2O_ADDRESS || ''

async function mintTokens() {
  try {
    // Network configuration (replace with your network details)
    const rpcUrl = RPC_URL

    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl, {
      chainId: 534352,
      name: 'scroll',
    })

    // Connect using private key (NEVER hardcode in production code)
    const privateKey = PRIVATE_KEY
    const wallet = new ethers.Wallet(privateKey, provider)

    // Contract details
    const tokenContractAddress = CONTRACT_ADDRESS

    // Create contract instance using TypeChain
    const tokenContract = PH2O__factory.connect(
      tokenContractAddress,
      wallet
    )

    // Parameters for minting
    if (!TEST_ACCOUNT) {
      throw new Error('TestAddress is not set')
    }

    const testAccount = ethers.getAddress(TEST_ACCOUNT)
    const amount = ethers.parseUnits('1', 18) // Amount to mint (100 tokens with 18 decimals)

    console.log(
      `Minting ${ethers.formatUnits(
        amount,
        18
      )} tokens to ${testAccount}...`
    )

    const gasPrice = await provider.getFeeData();

    console.log("gasPrice", gasPrice)

    // Call mint function
    const tx = await tokenContract.mint(testAccount, amount, {
      gasLimit: 1000000,
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    })
    console.log(`Transaction hash: ${tx.hash}`)

    // Wait for transaction to be mined
    const receipt = await tx.wait()
    console.log(`Transaction confirmed in block ${receipt?.blockNumber}`)

    // Get the updated balance
    const balance = await tokenContract.balanceOf(testAccount)
    console.log(
      `New balance of ${testAccount}: ${ethers.formatUnits(
        balance,
        18
      )} tokens`
    )
  } catch (error) {
    console.error('Error minting tokens:', error)
  }
}

// Execute the function
mintTokens()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
