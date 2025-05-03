import * as fs from 'fs';
import { identifyZones } from '../lib/identifyZones';
import { Candle } from '../types';

const filePath = process.argv[2];

if (!filePath) {
    console.error('Please provide the path to a JSON file containing candles.');
    process.exit(1);
}

try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const candles: Candle[] = JSON.parse(fileContent);

    const { supplyZones, demandZones } = identifyZones(candles);

    console.log('Supply Zones:', supplyZones);
    console.log('Demand Zones:', demandZones);
} catch (error) {
    console.error('Error processing the file:', error);
    process.exit(1);
};
