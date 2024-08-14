class HousingMarket {
	constructor(config) {
		this.baseUrl = config.baseUrl;
		this.apiKey = config.apiKey;
		this.series = config.series;
	}

	// Method to build the FRED API URL
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
				const localData = await fetch(`/API/${seriesId}.json`).then(res => res.json());
				return localData.observations;
			} catch (localError) {
				console.error('Error fetching data from local fallback:', localError);
			}
		}
		return null; // Return null if both API and local data fail
	}

	// Method to process the data for Chart.js
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

	// Method to create and append a canvas element along with a description
	createCanvasElement(series) {
		const container = document.getElementById('chart-container');
		const section = document.createElement('section');
		
		const heading = document.createElement('h2');
		heading.textContent = series.name;

		const description = document.createElement('p');
		description.textContent = series.description;

		const canvas = document.createElement('canvas');
		canvas.id = series.canvasId;
		canvas.width = 400;
		canvas.height = 200;

		section.appendChild(heading);
		section.appendChild(description);
		section.appendChild(canvas);
		container.appendChild(section);
	}

	// Method to render a chart using Chart.js
	renderChart(data, series) {
		const { labels, values } = this.processData(data);

		const ctx = document.getElementById(series.canvasId).getContext('2d');
		new Chart(ctx, {
			type: 'line',
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

	// Method to initialize the data fetching, chart creation, and chart rendering
	async init() {
		for (const series of this.series) {
			this.createCanvasElement(series);
			const data = await this.fetchData(series.id);
			if (data) {
				this.renderChart(data, series);
			}
		}
	}
}

// Load the configuration and initialize the HousingMarket class
document.addEventListener('DOMContentLoaded', () => {
	const configName = document.querySelector('script[data-config]').getAttribute('data-config');
	fetch(`/config/${configName}.config.json`)
		.then(response => response.json())
		.then(config => {
			const housingMarket = new HousingMarket(config);
			housingMarket.init();
		})
		.catch(error => console.error('Error loading config:', error));
});
