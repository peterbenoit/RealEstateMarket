import fetch from 'node-fetch';
import fs from 'fs';

const SERIES_IDS = [
    'ACTLISCOUFL',
    'MEDDAYONMARFL',
    'FLSTHPI'
]
const API_URLS = [
    { name: 'ACTLISCOUFL', url: 'https://api.stlouisfed.org/fred/series/observations?series_id=ACTLISCOUFL&api_key=4aef95261705b5d131c5dba252bbdb45&file_type=json' },
    { name: 'MEDDAYONMARFL', url: 'https://api.stlouisfed.org/fred/series/observations?series_id=MEDDAYONMARFL&api_key=4aef95261705b5d131c5dba252bbdb45&file_type=json' },
    { name: 'ACTLISCOUMMFL', url: 'https://api.stlouisfed.org/fred/series/observations?series_id=FLSTHPI&api_key=4aef95261705b5d131c5dba252bbdb45&file_type=json' },
    { name: 'ACTLISCOUGA', url: 'https://api.stlouisfed.org/fred/series/observations?series_id=FLSTHPI&api_key=4aef95261705b5d131c5dba252bbdb45&file_type=json' },
    { name: 'MEDDAYONMARGA', url: 'https://api.stlouisfed.org/fred/series/observations?series_id=FLSTHPI&api_key=4aef95261705b5d131c5dba252bbdb45&file_type=json' },
    { name: 'ACTLISCOUMMGA', url: 'https://api.stlouisfed.org/fred/series/observations?series_id=FLSTHPI&api_key=4aef95261705b5d131c5dba252bbdb45&file_type=json' }
    // Add other API endpoints as needed
];

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
