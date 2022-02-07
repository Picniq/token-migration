// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { parse } from "csv-parse";
import { BigNumber } from "ethers";
import { stringify } from 'csv-stringify';
const fs = require('fs').promises;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const StakePool = await ethers.getContractFactory("QPoolRewards");
  const qfipool = StakePool.attach('0x88f11399FA461285D857Bb6BEEae56cC58dcbdf0');
  const wbtcpool = StakePool.attach('0x725F7F1AeBA0c542be98a32611827D3372be1198');

  const fileContent = await fs.readFile(__dirname+'/stakeraddresses.csv');
  parse(fileContent, {columns: false}, async (err: any, records: any): Promise<void> => {
      const lines = records.toString().split(',');
      const items = await lines.reduce(async (prev: any[], curr: string) => {
        const item = await prev;
        const staked = await qfipool.balanceOf(curr).then((res: BigNumber) => Number(ethers.utils.formatEther(res.toString())));
        const rewards = await qfipool.earned(curr).then((res: BigNumber) => Number(ethers.utils.formatEther(res.toString())));   
        if (staked + rewards < 5) return prev;
        item.push({address: curr, amount: Math.floor(staked + rewards)});
        return item;
      }, []);

      stringify(items, (err: any, output: any) => {
        fs.writeFile(__dirname+'/stakers.csv', output);
      })
  });

  const wbtcFile = await fs.readFile(__dirname+'/wbtcpool.csv');
  parse(wbtcFile, { columns: false}, async (err: any, records: any): Promise<void> => {
    const lines = records.toString().split(',');
    const items = await lines.reduce(async (prev: any[], curr: string) => {
      const item = await prev;
      const rewards = await wbtcpool.earned(curr).then((res: BigNumber) => Number(ethers.utils.formatEther(res.toString())));
      if (rewards < 5) return prev;
      item.push({address: curr, amount: Math.floor(rewards)});
      return item;
    }, []);

    stringify(items, (err: any, output: any) => {
      fs.writeFile(__dirname+'/wbtcstakers.csv', output);
    });
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
