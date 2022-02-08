// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import assert from 'assert';
import { stringify } from 'csv-stringify';
import fs from 'fs';
import { parse } from 'csv-parse';

interface IListItem {
    address: string;
    amount: number;
}

async function main() {

    // const holders = parse(await fs.readFile(__dirname+'/holders.csv'));
    // const stakers = parse(await fs.readFile(__dirname+'/stakers.csv'));
    // const wbtc = parse(await fs.readFile(__dirname+'/wbtcstakers.csv'));

    const process = async (): Promise<IListItem[]> => {
        const records = [];
        const parseHolders = fs.createReadStream(__dirname+'/holders.csv').pipe(parse());
        for await (let item of parseHolders) {
            records.push(item);
        }

        const parseStakers = fs.createReadStream(__dirname+'/stakers.csv').pipe(parse());

        for await (let item of parseStakers) {
            const index = records.findIndex((rec: string[]) => rec[0] === item[0]);
            if (index === -1) {
                records.push(item);
            } else {
                records[index][1] = Number(records[index][1]) + Number(item[1]);
            }
        }

        const parseWBTC = fs.createReadStream(__dirname+'/wbtcstakers.csv').pipe(parse());
        for await (let item of parseWBTC) {
            const index = records.findIndex((rec: string[]) => item[0] === rec[0]);

            if (index === -1) {
                records.push(item);
            } else {
                records[index][1] = Number(records[index][1]) + Number(item[1]);
            }
        }

        return records;
    }

    const list = await process();
    stringify(list, async (err: any, output: any) => {
        fs.promises.writeFile(__dirname + '/full.csv', output);
    });
    
    // holders.on('readable', async () => {
    //     let record: any;
    //     while ((record = await holders.read()) !== null) {
    //         records.push({address: record[0], amount: record[1]});
    //     }
    // });

    // stakers.on('readable', async () => {
    //     let record: any;
    //     while ((record = await stakers.read()) !== null) {
    //         const index = records.findIndex((rec: IListItem) => record[0] === rec.address);
    //         if (index !== -1) {
    //             records[index].amount += record[1];
    //         } else {
    //             records.push({address: record[0], amount: record[1]});
    //         }
    //     }
    // });

    // wbtc.on('readable', async () => {
    //     let record: any;
    //     while ((record = await wbtc.read()) !== null) {
    //         const index = records.findIndex((rec: IListItem) => record[0] === rec.address);
    //         if (index !== -1) {
    //             records[index].amount += record[1];
    //         } else {
    //             records.push({address: record[0], amount: record[1]});
    //         }
    //     }
    // });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });