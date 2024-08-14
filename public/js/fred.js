class HousingMarket {
    constructor(config) {
        this.baseUrl = "https://api.stlouisfed.org/fred/series/observations";
        this.apiKey = null;
        this.series = config.series;
        this.currentChartType = 'line'; // Default to line chart
        this.chartInstances = {}; // Object to keep track of chart instances
    }

    async fetchApiKey() {
        try {
            const response = await fetch('/api/get-fred-api-key');
            const data = await response.json();
            this.apiKey = data.apiKey;
        } catch (error) {
            console.error('Error fetching API key:', error);
        }
    }

    buildUrl(seriesId) {
        return `${this.baseUrl}?series_id=${seriesId}&api_key=${this.apiKey}&file_type=json`;
    }

    async fetchData(seriesId) {
        const url = this.buildUrl(seriesId);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            const data = await response.json();
            return data.observations;
        } catch (error) {
            console.error('Error fetching data from API, falling back to local data:', error);
            try {
                const localData = await fetch(`API/${seriesId}.json`).then(res => res.json());
                return localData.observations;
            } catch (localError) {
                console.error('Error fetching data from local fallback:', localError);
            }
        }
        return null; // Return null if both API and local data fail
    }

    processData(data) {
        const last12Months = new Date();
        last12Months.setMonth(last12Months.getMonth() - 12);

        const filteredData = data.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= last12Months;
        });

        const labels = filteredData.map(entry => entry.date);
        const values = filteredData.map(entry => parseFloat(entry.value));

        return { labels, values };
    }

    createCanvasElement(series) {
        const container = document.getElementById('chart-container');

        // Check if the canvas already exists
        let canvas = document.getElementById(series.canvasId);
        if (!canvas) {
            const section = document.createElement('section');
            const heading = document.createElement('h2');
            heading.textContent = series.name;

            const description = document.createElement('p');
            description.textContent = series.description;

            canvas = document.createElement('canvas');
            canvas.id = series.canvasId;
            canvas.width = 400;
            canvas.height = 200;

            section.appendChild(heading);
            section.appendChild(description);
            section.appendChild(canvas);
            container.appendChild(section);
        }

        return canvas;
    }

    renderChart(data, series) {
        const { labels, values } = this.processData(data);
        const ctx = this.createCanvasElement(series).getContext('2d');

        // Destroy existing chart instance if it exists
        if (this.chartInstances[series.canvasId]) {
            this.chartInstances[series.canvasId].destroy();
        }

        // Create a new chart instance and save it in the chartInstances object
        this.chartInstances[series.canvasId] = new Chart(ctx, {
            type: this.currentChartType,
            data: {
                labels: labels,
                datasets: [{
                    label: series.name,
                    data: values,
                    backgroundColor: series.color,
                    borderColor: series.color.replace('0.2', '1'),
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    async init() {
        await this.fetchApiKey();
        for (const series of this.series) {
            const data = await this.fetchData(series.id);
            if (data) {
                this.renderChart(data, series);
            }
        }
    }

    updateChartType(type) {
        this.currentChartType = type;
        this.init(); // Reinitialize to render charts with the new type
    }
}

// Load the configuration and initialize the HousingMarket class
document.addEventListener('DOMContentLoaded', () => {
    const configName = document.querySelector('script[data-config]').getAttribute('data-config');
    fetch(`config/${configName}.config.json`)
        .then(response => response.json())
        .then(config => {
            const housingMarket = new HousingMarket(config);

            const chartTypeButton = document.getElementById('chartTypeButton');
            const dropdownMenu = document.getElementById('dropdownMenu');
            const lineChartOption = document.getElementById('lineChartOption');
            const barChartOption = document.getElementById('barChartOption');

            chartTypeButton.addEventListener('click', () => {
                dropdownMenu.classList.toggle('hidden');
            });

            lineChartOption.addEventListener('click', (e) => {
                e.preventDefault();
                housingMarket.updateChartType('line');
                chartTypeButton.innerHTML = `Chart Type: Line`;
                dropdownMenu.classList.add('hidden');
            });

            barChartOption.addEventListener('click', (e) => {
                e.preventDefault();
                housingMarket.updateChartType('bar');
                chartTypeButton.innerHTML = `Chart Type: Bar`;
                dropdownMenu.classList.add('hidden');
            });

            housingMarket.init();
        })
        .catch(error => console.error('Error loading config:', error));
});
