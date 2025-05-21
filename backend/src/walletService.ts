import { ethers } from 'ethers'
import { config } from './config'
import { PH2O } from './typechain-types/contracts/PH2O'
import { PH2O__factory } from './typechain-types/factories/contracts/PH2O__factory'

const provider = new ethers.JsonRpcProvider(config.scrollMainnetRpc, {
  chainId: Number(config.scrollMainnetChainId),
  name: 'scroll',
})

const primordialWallet = new ethers.Wallet(
  config.primordialPrivateKey,
  provider
)

export const getWaterBalance = async (address: string) => {
  const tokenContract = PH2O__factory.connect(
    config.ph2oAddress,
    provider
  )
  const balance = await tokenContract.balanceOf(address)
  return ethers.formatUnits(balance, 18)
}

export const mintToAddress = async (address: string, amount: string) => {
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
