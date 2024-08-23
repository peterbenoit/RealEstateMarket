# RealEstateMarket

A web-based project designed to display state-specific data using HTML, CSS, and JavaScript. The project utilizes configuration files, API data, and styled pages for different states like Florida and Georgia. It integrates data from various sources, including the Federal Reserve Economic Data (FRED) API, to provide dynamic and up-to-date information.

## Installation

1. Clone the repository:  
   `git clone https://github.com/peterbenoit/RealEstateMarket.git`

2. Navigate to the project directory:  
   `cd your-repo-name`

3. Open `index.html` in your preferred web browser.

## Usage

- This project displays specific data for states such as Florida and Georgia based on the configuration files and API data.
- The `index.html` file serves as the homepage, with navigation to state-specific pages like `florida.html` and `georgia.html` as examples.
- The project uses `styles.css` for custom styles and `fetch.js` to handle data fetching requests to the FRED API.
- Chart.js is used to display the data into charts.

## Configuration

- The `config` directory contains JSON files that control the behavior and settings of different parts of the project.
- `config.json` provides general configuration, while `florida.config.json` and `georgia.config.json` are tailored for state-specific settings.

## API Data

- The `API` directory includes JSON files with data specific to different states, such as county information and housing prices.
- The project also utilizes the FRED API to fetch economic data, such as median days on the market and housing price indexes, which are then displayed dynamically on the relevant state pages.

## FRED API Integration

- The project integrates with the Federal Reserve Economic Data (FRED) API to retrieve real-time economic data.
- You will need your own FRED API key in order to fetch data.
- Data from the FRED API, such as housing price indices and market trends, is processed and displayed in a user-friendly format on the respective state pages (`florida.html`, `georgia.html`).
- The `fred.js` script handles the interaction with the FRED API, ensuring that the data is up-to-date and accurately represented.

## Contributing

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -m 'Add some feature').
5. Push to the branch (git push origin feature-branch).
6. Open a Pull Request.

## License

This project is licensed under the MIT License.
