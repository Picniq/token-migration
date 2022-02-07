# QFinance/Picniq Migration Details

## Set up

Hardhat is configured to fork the mainnet at block __14142559__ which is the snapshot block (the block in which the liquidity was removed).

Create a .env file and add ETHEREUM_API={YOUR RPC URL} in order to connect. You can get this from Alchemy or Infura.

## Artifacts

1. Included staking contract example to connect to QFI single staking pool.
2. In /scripts we have CSV files holders.csv and stakeraddresses.csv which were exported from Etherscan. Note that a few addresses were removed from holders.csv due to them acquiring QFI after the snapshot block.
3. In /scripts/stakers.ts we have a script that builds the rewards contract and connects it to the QFI single staking pool. It then cross-references the list of addresses from stakeraddresses.csv with the blockchain as of the snapshot block and produces a new CSV called stakers.csv with all deposits + rewards per address.

## Run

Once you have your environment set up, you can run the script as per below:

NPM
```bash
npx hardhat run scripts/stakers.ts
```

or Yarn
```bash
yarn exec hardhat run scripts/stakers.ts
```

It is probably smart to rename either the existing stakers.csv file or the new one you create so you can confirm they are both the same. Note the script removes 0 value stakers as the export from Etherscan contained all addresses that interacted with the pool.