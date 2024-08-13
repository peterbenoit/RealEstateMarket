// class HousingMarket {
//     constructor(config, states) {
//         this.apiUrl = config.apiUrl;
//         this.apiKey = config.apiKey;
//         this.fields = config.fields;
//         this.states = states;
//     }

//     // Method to build the API URL for multiple states
//     buildUrl() {
//         const stateCodes = this.states.map(state => state.code).join(',');
//         return `${this.apiUrl}?get=${this.fields}&for=state:${stateCodes}&key=${this.apiKey}`;
//     }

//     // Method to fetch data from the API
//     async fetchData() {
//         const url = this.buildUrl();
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             return data.slice(1); // Skip the headers row
//         } catch (error) {
//             console.error('Error fetching data:', error);
//         }
//     }

//     // Method to process the data for Chart.js
//     processData(data) {
//         const labels = [];
//         const housingUnits = [];

//         data.forEach(row => {
//             labels.push(row[0]);  // Assuming the first element is the label (e.g., year)
//             housingUnits.push(parseInt(row[1], 10));  // Convert housing units to number
//         });

//         return { labels, housingUnits };
//     }

//     // Method to render the chart using Chart.js
//     renderChart(data) {
//         const { labels, housingUnits } = this.processData(data);

//         const ctx = document.getElementById('housingChart').getContext('2d');
//         new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: labels,
//                 datasets: [{
//                     label: `Housing Units in ${this.states.map(state => state.name).join(', ')}`,
//                     data: housingUnits,
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                     borderColor: 'rgba(75, 192, 192, 1)',
//                     borderWidth: 1,
//                     fill: false
//                 }]
//             },
//             options: {
//                 scales: {
//                     y: {
//                         beginAtZero: true
//                     }
//                 }
//             }
//         });
//     }

//     // Method to initialize the data fetching and chart rendering
//     async init() {
//         const data = await this.fetchData();
//         if (data) {
//             this.renderChart(data);
//         }
//     }
// }

// // Load the configuration and initialize the HousingMarket class
// fetch('config.json')
//     .then(response => response.json())
//     .then(config => {
//         // Example of passing state names and codes
//         const states = [
//             { name: 'Florida', code: '12' },
//             // Add more states if needed
//         ];

//         const housingMarket = new HousingMarket(config, states);
//         housingMarket.init();
//     })
//     .catch(error => console.error('Error loading config:', error));


class HousingMarket {
    constructor(config, states) {
        this.apiUrl = config.apiUrl;
        this.apiKey = config.apiKey;
        this.fields = config.fields;
        this.states = states;
        this.years = this.getLastYears();  // Generate the last few years
    }

    // Generate an array of the last few years
    getLastYears() {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 12; i++) {
            years.unshift(currentYear - i);
        }
        return years;
    }

    // Build the API URL for a specific year
    buildUrl(year) {
        return `${this.apiUrl}?get=${this.fields}&for=state:${this.states.map(state => state.code).join(',')}&key=${this.apiKey}`;
    }

    // Fetch data for each year
    async fetchData() {
        const allData = [];
        for (const year of this.years) {
            const url = this.buildUrl(year);
            try {
                const response = await fetch(url);
                const data = await response.json();
                allData.push({ year, data: data.slice(1) });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        return allData;
    }

    // Process data for Chart.js
    // processData(allData) {
    //     const labels = [];
    //     const housingUnits = [];

    //     allData.forEach(({ year, data }) => {
    //         labels.push(year);
    //         const totalUnits = data.reduce((sum, row) => sum + parseInt(row[1], 10), 0);
    //         housingUnits.push(totalUnits);
    //     });

    //     return { labels, housingUnits };
    // }

    // Method to process the data for Chart.js with year-over-year change
processData(allData) {
    const labels = [];
    const housingUnits = [];
    let previousUnits = null;

    allData.forEach(({ year, data }) => {
        labels.push(year);
        const totalUnits = data.reduce((sum, row) => sum + parseInt(row[1], 10), 0);
        
        if (previousUnits !== null) {
            housingUnits.push(totalUnits - previousUnits); // Calculate the difference from the previous year
        } else {
            housingUnits.push(0); // First year, no difference to calculate
        }
        
        previousUnits = totalUnits;
    });

    return { labels, housingUnits };
}


    // Render the chart using Chart.js
    renderChart(allData) {
        const { labels, housingUnits } = this.processData(allData);

        const ctx = document.getElementById('housingChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Housing Units in ${this.states.map(state => state.name).join(', ')}`,
                    data: housingUnits,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Initialize the data fetching and chart rendering
    async init() {
        const allData = await this.fetchData();
        if (allData.length) {
            this.renderChart(allData);
        }
    }
}

// Load the configuration and initialize the HousingMarket class
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        const states = [
            { name: 'Florida', code: '12' },
            // Add more states if needed
        ];

        const housingMarket = new HousingMarket(config, states);
        housingMarket.init();
    })
    .catch(error => console.error('Error loading config:', error));
