import { ethers } from 'ethers'
import { config } from './config'
import { PH2O } from './typechain-types/contracts/PH2O'
import { PH2O__factory } from './typechain-types/factories/contracts/PH2O__factory'
import { serialize } from '@ethersproject/transactions'

const provider = new ethers.JsonRpcProvider(config.scrollMainnetRpc, {
  chainId: Number(config.scrollMainnetChainId),
  name: 'scroll',
})

const primordialWallet = new ethers.Wallet(
  config.primordialPrivateKey,
  provider
)

const l1GasOracle = new ethers.Contract(
  config.l1GasOracleAddress,
  config.l1GasOracleAbi,
  primordialWallet
)

export const getWaterBalance = async (address: string) => {
  const tokenContract = PH2O__factory.connect(config.ph2oAddress, provider)
  const balance = await tokenContract.balanceOf(address)
  return ethers.formatUnits(balance, 18)
}

export const mintToAddress = async (address: string, price: string) => {
  const amount = '1'
  const tokenContract = PH2O__factory.connect(
    config.ph2oAddress,
    primordialWallet
  )

  const testAccount = ethers.getAddress(address)
  const amountInWei = ethers.parseUnits(amount, 18)

  const gasPrice = await provider.getFeeData()

  console.log('mint gas price', gasPrice)

  // Call mint function
  const tx = await tokenContract.mint(testAccount, amountInWei, {
    gasLimit: 1000000,
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
  })
  console.log(`Transaction hash: ${tx.hash}`)

  // Wait for transaction to be mined
  await tx.wait()
  return tx.hash
}

interface GasEstimationResult {
  requiredEthers: bigint
  l1Fees: bigint
  l1FeesWithBuffer: bigint
  l2GasEstimate: bigint
  l2GasEstimateWithBuffer: bigint
}

async function estimateGasAndPrepareTransaction(
  contract: PH2O,
  recipientAddress: string,
  transferAmount: bigint
): Promise<GasEstimationResult> {
  const populatedTransaction = await contract.transfer.populateTransaction(
    recipientAddress,
    transferAmount
  )
  const unsignedTransaction = {
    data: populatedTransaction.data,
    to: populatedTransaction.to,
    value: populatedTransaction.value,
    gasLimit: populatedTransaction.gasLimit,
    gasPrice: populatedTransaction.gasPrice,
    nonce: populatedTransaction.nonce,
  }
  const serializedTransaction = serialize(unsignedTransaction)

  const l1Fees = await l1GasOracle.getL1Fee(serializedTransaction)
  const l1FeesWithBuffer = (l1Fees * BigInt(1005)) / BigInt(1000)

  const l2GasEstimate = await contract.transfer.estimateGas(
    recipientAddress,
    transferAmount
  )
  const l2GasEstimateWithBuffer = (l2GasEstimate * BigInt(120)) / BigInt(100)

  const gasPrice = await provider.getFeeData()
  if (!gasPrice.maxFeePerGas) {
    throw new Error('Gas price not found')
  }

  const requiredEthers =
    l1FeesWithBuffer +
    l2GasEstimateWithBuffer * (gasPrice.maxFeePerGas ?? gasPrice.gasPrice)

  return {
    requiredEthers,
    l1Fees,
    l1FeesWithBuffer,
    l2GasEstimate,
    l2GasEstimateWithBuffer,
  }
}

async function ensureWalletHasBalance(
  userWallet: ethers.Wallet,
  requiredEthers: bigint
): Promise<void> {
  const balance = await provider.getBalance(userWallet.address)
  console.log('balance', balance)

  const requiredBalance = requiredEthers - balance
  console.log(
    'required balance',
    requiredBalance,
    ethers.formatEther(requiredBalance)
  )

  if (requiredBalance > 0) {
    const tx = await primordialWallet.sendTransaction({
      to: userWallet.address,
      value: requiredBalance,
    })
    await tx.wait()
  }

  const updatedBalance = await provider.getBalance(userWallet.address)
  console.log('updated balance', updatedBalance)
}

export const buyFromAddress = async (
  userPrivateKey: string,
  amount: string,
  price: string
) => {
  const userWallet = new ethers.Wallet(userPrivateKey, provider)
  const tokenContract = PH2O__factory.connect(config.ph2oAddress, userWallet)
  const transferAmount = ethers.parseUnits(amount, 18)

  const {
    requiredEthers,
    l1Fees,
    l1FeesWithBuffer,
    l2GasEstimate,
    l2GasEstimateWithBuffer,
  } = await estimateGasAndPrepareTransaction(
    tokenContract,
    primordialWallet.address,
    transferAmount
  )

  console.log('l1 fees', l1Fees)
  console.log('l1 fees with buffer', l1FeesWithBuffer)
  console.log('l2 gas estimate', l2GasEstimate)
  console.log('l2 gas estimate with buffer', l2GasEstimateWithBuffer)
  console.log('required ethers', requiredEthers)

  await ensureWalletHasBalance(userWallet, requiredEthers)

  // transfer tokens to primordial wallet
  const tx = await tokenContract.transfer(
    primordialWallet.address,
    transferAmount
  )
  const txReceipt = await tx.wait()
  console.log('tx receipt', txReceipt)
  const gasUsed = txReceipt?.gasUsed
  console.log('gas used', gasUsed)

  // send USDC from primordial wallet to user wallet
  const usdcContract = PH2O__factory.connect(
    config.usdcAddress,
    primordialWallet
  )

  const finalTx = await usdcContract.transfer(
    userWallet.address,
    ethers.parseUnits(price, 6)
  )
  await finalTx.wait()

  return finalTx.hash
}

export const extractUSDCFromAddress = async (
  userPrivateKey: string,
  amount: string,
  recipientAddress: string
) => {
  const userWallet = new ethers.Wallet(userPrivateKey, provider)
  const usdcContract = PH2O__factory.connect(config.usdcAddress, userWallet)
  const transferAmount = ethers.parseUnits(amount, 6)

  const {
    requiredEthers,
    l1Fees,
    l1FeesWithBuffer,
    l2GasEstimate,
    l2GasEstimateWithBuffer,
  } = await estimateGasAndPrepareTransaction(
    usdcContract,
    recipientAddress,
    transferAmount
  )

  console.log('l1 fees', l1Fees)
  console.log('l1 fees with buffer', l1FeesWithBuffer)
  console.log('l2 gas estimate', l2GasEstimate)
  console.log('l2 gas estimate with buffer', l2GasEstimateWithBuffer)
  console.log('required ethers', requiredEthers)

  await ensureWalletHasBalance(userWallet, requiredEthers)

  const tx = await usdcContract.transfer(recipientAddress, transferAmount)
  const txReceipt = await tx.wait()
  console.log('tx receipt', txReceipt)
  const gasUsed = txReceipt?.gasUsed
  console.log('gas used', gasUsed)

  return tx.hash
}

export const sendUSDCToAddress = async (
  amount: string,
  recipientAddress: string
) => {
  const usdcContract = PH2O__factory.connect(
    config.usdcAddress,
    primordialWallet
  )

  const tx = await usdcContract.transfer(
    recipientAddress,
    ethers.parseUnits(amount, 6)
  )
  await tx.wait()

  return tx.hash
}
