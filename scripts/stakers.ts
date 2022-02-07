// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { parse, Parser } from "csv-parse";
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
  const pool = StakePool.attach('0x88f11399FA461285D857Bb6BEEae56cC58dcbdf0');

  // const parser = parse({columns: false}, async (err: any, records: string[]) => {
  //   console.log(records[0][0]);
  //   const staked = await pool.balanceOf(records[0][0]).then((res: BigNumber) => ethers.utils.formatEther(res.toString()));
  //   const rewards = await pool.earned(records[0][0]).then((res: BigNumber) => ethers.utils.formatEther(res.toString()));
  //   return [records[0], staked + rewards];
  // });

  const fileContent = await fs.readFile(__dirname+'/stakeraddresses.csv');
  parse(fileContent, {columns: false}, async (err: any, records: any): Promise<void> => {
      const lines = records.toString().split(',');
      const items = await lines.reduce(async (prev: any[], curr: string) => {
        const item = await prev;
        const staked = await pool.balanceOf(curr).then((res: BigNumber) => Number(ethers.utils.formatEther(res.toString())));
        const rewards = await pool.earned(curr).then((res: BigNumber) => Number(ethers.utils.formatEther(res.toString())));   
        if (staked + rewards < 5) return prev;
        item.push({address: curr, amount: Math.floor(staked + rewards)});
        return item;
      }, []);

      stringify(items, (err: any, output: any) => {
        fs.writeFile(__dirname+'/stakers.csv', output)
      })
  });

  // const output = fs.createReadStream(__dirname+'/stakers.csv').pipe(parser);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
