import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.FRED_API_KEY;
const apiUrl = 'https://api.stlouisfed.org/fred/series/observations?series_id=';

const SERIES_IDS = [
    'ACTLISCOUFL',
    'MEDDAYONMARFL',
    'FLSTHPI',
    'ACTLISCOUGA',
    'MEDDAYONMARGA',
    'ACTLISCOUMMGA'
];

const createApiUrls = (baseUrl, apiKey) => {
    return SERIES_IDS.map(seriesId => ({
        name: seriesId,
        url: `${baseUrl}${seriesId}&api_key=${apiKey}&file_type=json`
    }));
};

const API_URLS = createApiUrls(apiUrl, apiKey);

API_URLS.forEach(async (api) => {
    try {
        const response = await fetch(api.url);
        const data = await response.json();
        fs.writeFileSync(`./public/API/${api.name}.json`, JSON.stringify(data, null, 2));
        console.log(`Saved ${api.name} data locally.`);
    } catch (error) {
        console.error(`Failed to fetch ${api.name}:`, error);
    }
});
