import { ethers } from 'ethers'

const wallet = ethers.Wallet.createRandom()
console.log(`PrivateKey=${wallet.privateKey}`)
console.log(`PublicKey=${wallet.publicKey}`)
console.log(`Address=${wallet.address}`)

