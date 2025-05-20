const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

export default buildModule('PH2OModule', (m: any) => {
  // Get the deployer address from parameters or use a default value
  // const deployer = m.getParameter('deployer')

  // Deploy PH2O token contract
  const ph2o = m.contract('PH2O', [ ])

  return { ph2o }
})

// npx hardhat ignition deploy ignition/modules/PH2O.ts --network scrollMainnet
