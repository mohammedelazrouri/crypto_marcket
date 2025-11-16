# Codebase Overview: Crypto Market Dashboard

This document provides a comprehensive overview of the Crypto Market Dashboard application's codebase.

## 1. Project Overview

The Crypto Market Dashboard is a web application designed to provide users with real-time cryptocurrency market data. It features a dynamic and responsive user interface that displays a sortable list of cryptocurrencies, detailed charts, and global market statistics. The application fetches data from the WorldCoinIndex API through a dedicated backend proxy to protect the API key and handle data processing.

## 2. Technologies Used

-   **Backend**:
    -   **Node.js**: JavaScript runtime for the server.
    -   **Express.js**: Web framework for creating the backend proxy.
    -   **`node-fetch`**: For making HTTP requests to the external API.
    -   **`dotenv`**: To manage environment variables (like API keys).
    -   **`cors`**: To enable Cross-Origin Resource Sharing.

-   **Frontend**:
    -   **HTML5**: For the structure of the web page.
    -   **CSS3**: For styling, with a modern, dark-themed, and responsive design.
    -   **JavaScript (ES6+)**: For client-side logic, DOM manipulation, and API interaction.
    -   **Chart.js**: For rendering dynamic and interactive charts.
    -   **Font Awesome**: For icons.
    -   **Google Fonts**: For custom typography.

## 3. Project Structure

```
crypto_marcket/
├── .env                # Environment variables (contains API_KEY)
├── server.js           # Backend Express server (proxy)
├── package.json        # Project metadata and dependencies
├── public/             # Static files served to the client
│   ├── index.html      # Main HTML file
│   ├── css/
│   │   └── style.css   # Stylesheet
│   └── js/
│       └── main.js     # Frontend JavaScript logic
└── codebase.md         # This file
```

## 4. Getting Started

1.  **Prerequisites**:
    -   Node.js and npm installed.
    -   A WorldCoinIndex API key.

2.  **Installation**:
    -   Clone the repository.
    -   Run `npm install` to install dependencies.
    -   Create a `.env` file in the root directory and add your API key:
        ```
        WORLDCOININDEX_KEY=your_api_key_here
        ```

3.  **Running the Application**:
    -   Run `npm start` to start the backend server.
    -   Open `public/index.html` in your web browser.

## 5. Features

-   **Real-time Data**: Fetches and displays up-to-date cryptocurrency data.
-   **Currency Selection**: Users can switch between fiat currencies (e.g., USD, EUR).
-   **Interactive Chart**: A main chart displays the 7-day price trend of a selected cryptocurrency.
-   **Top Coins Display**: Highlights the top 3 cryptocurrencies in prominent cards.
-   **Responsive Design**: The layout adapts for both desktop (table view) and mobile (grid view) devices.
-   **Skeleton Loading**: Shows skeleton loaders while data is being fetched to improve user experience.
-   **Backend Proxy**: Protects the API key by routing all external API calls through a backend server.

## 6. Backend (`server.js`)

The backend is a simple Express.js server that acts as a proxy.

-   **Purpose**: To securely fetch data from the WorldCoinIndex API without exposing the API key on the client-side.
-   **Endpoint**: It exposes a single endpoint: `/api/proxy/coins`.
-   **Functionality**:
    1.  It receives a request from the frontend, optionally with a `currency` query parameter.
    2.  It constructs the full URL for the WorldCoinIndex API, including the API key from the `.env` file.
    3.  It fetches the data, reformats it slightly (e.g., adding an `image` field), and sends it back to the frontend.
    4.  Includes error handling for failed API requests.

## 7. Frontend (`public/`)

The frontend is responsible for rendering the user interface and interacting with the backend proxy.

### `index.html`

-   Defines the basic structure of the page, including the header, main content areas, and placeholders for charts and coin lists.
-   Links to external resources like Google Fonts, Font Awesome, Chart.js, and the local stylesheet/script.

### `css/style.css`

-   Contains all the styling for the application.
-   Uses CSS variables for a consistent and easily customizable color scheme (dark theme).
-   Includes responsive design rules (`@media` queries) to adapt the layout for different screen sizes.
-   Defines styles for skeleton loading animations.

### `js/main.js`

-   **Core Logic**: Manages the entire frontend application flow.
-   **Data Fetching**: Contains the `fetchCryptoData` function to call the backend proxy.
-   **UI Updates**: The `updateUI` function dynamically populates the page with the fetched data. It handles rendering for both top coins and the main list (switching between grid and table views based on screen width).
-   **Charting**: The `updateMainChart` function uses Chart.js to create and update the main price chart.
-   **Event Handling**: Sets up event listeners for currency selection, the refresh button, and clicks on coin cards/rows to update the main chart.
-   **Auto-Refresh**: Automatically fetches new data every 60 seconds.
