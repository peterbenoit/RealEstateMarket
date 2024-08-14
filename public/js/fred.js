class HousingMarket {
    constructor(config) {
        this.baseUrl = "/api/fred/series/observations"; // This now points to your server's proxy
        this.series = config.series;
        this.currentChartType = 'line'; // Default to line chart
        this.chartInstances = {}; // Object to keep track of chart instances
    }

    buildUrl(seriesId) {
        return `${this.baseUrl}?series_id=${seriesId}`;
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
		// Filter data to get the last 12 months
		const today = new Date();
		const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

		const filteredData = data.filter(entry => {
			const entryDate = new Date(entry.date);
			return entryDate >= lastYear;
		});

		console.log(filteredData);

		// Map data for Chart.js
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

			// Create the "more info" link using template literals
			const headingLink = document.createElement('a');
			headingLink.href = `https://fred.stlouisfed.org/series/${series.id}`;
			headingLink.textContent = ' [more info]';
			headingLink.target = '_blank';

			// Append the link to the heading
			heading.appendChild(headingLink);

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
                    backgroundColor: series.color || 'rgba(75, 192, 192, 0.2)', // Default to a color if none is provided
                    borderColor: series.color ? series.color.replace('0.2', '1') : 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: this.currentChartType === 'pie' ? true : false // Fill only for pie charts
                }]
            },
            options: {
                scales: this.currentChartType === 'pie' ? {} : { // No scales for pie charts
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

	async init() {
		for (const series of this.series) {
			const data = await this.fetchData(series.id);
			if (data) {
				this.renderChart(data, series);
			}
		}
	}

	updateChartType(type) {
		this.currentChartType = type;

		console.log(type)

		// Update the button text and preserve the SVG
		const typeName = type.charAt(0).toUpperCase() + type.slice(1);
		chartTypeButton.innerHTML = `Chart Type: ${typeName}
		<svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>`;

		// Hide the dropdown menu
		dropdownMenu.classList.add('hidden');

		// Reinitialize to render charts with the new type
		this.init();
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
            const pieChartOption = document.getElementById('pieChartOption');

            // Toggle dropdown menu on button click
            chartTypeButton.addEventListener('click', () => {
                dropdownMenu.classList.toggle('hidden');
            });

            // Event listeners for chart type options
            lineChartOption.addEventListener('click', (e) => {
                e.preventDefault();
                housingMarket.updateChartType('line');
            });

            barChartOption.addEventListener('click', (e) => {
                e.preventDefault();
                housingMarket.updateChartType('bar');
            });

            pieChartOption.addEventListener('click', (e) => {
                e.preventDefault();
                housingMarket.updateChartType('pie');
            });

            // Close the dropdown menu when clicking outside of it
            document.addEventListener('click', (e) => {
                if (!chartTypeButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });

            housingMarket.init();
        })
        .catch(error => console.error('Error loading config:', error));
});
