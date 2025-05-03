import * as fs from 'fs';
import { Candle } from '../types';

// Get the input and output file paths from the command-line arguments
const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

if (!inputFilePath || !outputFilePath) {
    console.error('Usage: ts-node scripts/convertToCandle.ts <inputFilePath> <outputFilePath>');
    process.exit(1);
}

// Function to convert data to Candle format
function convertToCandle(inputFile: string, outputFile: string): void {
    try {
        // Read and parse the input JSON file
        const rawData = fs.readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(rawData);

        // Transform the data into the Candle format
        const candles: Candle[] = data.map((entry: any) => ({
            timestamp: new Date(entry.Date).getTime(),
            open: entry.Open,
            high: entry.High,
            low: entry.Low,
            close: entry.Close,
        }));

        // Write the transformed data to the output file
        fs.writeFileSync(outputFile, JSON.stringify(candles, null, 2), 'utf-8');
        console.log(`Converted data has been saved to ${outputFile}`);
    } catch (error) {
        console.error('Error converting data to Candle format:', error);
    }
}

// Execute the conversion
convertToCandle(inputFilePath, outputFilePath);
