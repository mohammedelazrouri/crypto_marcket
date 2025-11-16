// public/js/main.js
const API_BASE_URL = '/api/proxy/coins';
const REFRESH_INTERVAL = 60000; // 60 seconds

// DOM Element Cache
const currencySelector = document.getElementById('currency-selector');
const refreshButton = document.getElementById('refresh-button');
const topCoinsStrip = document.querySelector('.top-coins-strip');
const allCoinsDisplay = document.querySelector('.all-coins-display');
const mainChartContainer = document.getElementById('main-chart-container'); // To hide chart container
const totalMarketCapEl = document.getElementById('total-market-cap');
const totalVolumeEl = document.getElementById('24h-volume');

// Helper to format currency
const formatCurrency = (value, currency) => {
    if (value === null || typeof value === 'undefined' || isNaN(value)) {
        return 'N/A'; // Return N/A if value is null, undefined, or not a number
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: (value !== 0 && Math.abs(value) < 0.1) ? 8 : 2,
    }).format(value);
};

// Show Skeleton Loaders
const showSkeletonLoaders = () => {
    topCoinsStrip.innerHTML = '';
    allCoinsDisplay.innerHTML = '';
    if (mainChartContainer) mainChartContainer.style.display = 'none';

    for (let i = 0; i < 3; i++) {
        const loader = document.createElement('div');
        loader.className = 'coin-card skeleton-card';
        loader.innerHTML = `
            <div class="skeleton-line circle"></div>
            <div class="skeleton-line width-80"></div>
            <div class="skeleton-line width-50"></div>
            <div class="skeleton-line width-70"></div>
            <div class="skeleton-line width-60"></div>
            <div class="skeleton-line sparkline"></div>
        `;
        topCoinsStrip.appendChild(loader);
    }

    const gridDiv = document.createElement('div');
    gridDiv.className = 'coin-grid';
    for (let i = 0; i < 8; i++) {
        const loader = document.createElement('div');
        loader.className = 'coin-card skeleton-card';
        loader.innerHTML = `
            <div class="skeleton-line circle small"></div>
            <div class="skeleton-line width-60"></div>
            <div class="skeleton-line width-40"></div>
            <div class="skeleton-line width-50"></div>
            <div class="skeleton-line width-30"></div>
        `;
        gridDiv.appendChild(loader);
    }
    allCoinsDisplay.appendChild(gridDiv);
};

// Hide Skeleton Loaders
const hideSkeletonLoaders = () => {
    document.querySelectorAll('.skeleton-card').forEach(loader => loader.remove());
    if (mainChartContainer) mainChartContainer.style.display = 'block';
};

// Update UI with fetched data
const updateUI = (data, currency) => {
    console.log("Data received by frontend updateUI:", data); // IMPORTANT: Check raw data here

    const { coins, global } = data;

    hideSkeletonLoaders();
    topCoinsStrip.innerHTML = '';
    allCoinsDisplay.innerHTML = '';

    if (!coins || coins.length === 0) {
        allCoinsDisplay.innerHTML = '<p>No cryptocurrency data available. Please try again later.</p>';
        if (mainChartContainer) mainChartContainer.style.display = 'none';
        return;
    }

    // Add this for debugging
    const debugData = document.createElement('pre');
    debugData.style.backgroundColor = '#f0f0f0';
    debugData.style.padding = '10px';
    debugData.style.border = '1px solid #ccc';
    debugData.textContent = JSON.stringify(data.raw_api_response, null, 2);
    document.body.appendChild(debugData);

    // Update global data
    if (global) {
        totalMarketCapEl.textContent = formatCurrency(global.TotalMarketCap || 0, currency);
        totalVolumeEl.textContent = formatCurrency(global.Total24hVolume || 0, currency);
    } else {
        totalMarketCapEl.textContent = 'N/A';
        totalVolumeEl.textContent = 'N/A';
    }

    // Helper to safely get coin symbol from Label
    const getCoinSymbol = (label) => {
        if (typeof label === 'string' && label.includes('/')) {
            return label.split('/')[0];
        }
        return 'N/A'; // Default if Label is not a string or doesn't contain '/'
    };

    // Top 3 Coins
    coins.slice(0, 3).forEach(coin => {
        const card = document.createElement('div');
        card.className = 'coin-card';
        card.innerHTML = `
            <img src="${coin.image || 'https://dummyimage.com/48x48/cccccc/000000.png&text=?'}" alt="${coin.Name || 'N/A'}" class="coin-logo">
            <h3 class="coin-name">${coin.Name || 'N/A'}</h3>
            <span class="coin-symbol">${getCoinSymbol(coin.Label)}</span>
            <span class="coin-price">${formatCurrency(coin.Price, currency)}</span>
            <div class="price-change ${coin.Change24h > 0 ? 'positive' : (coin.Change24h < 0 ? 'negative' : 'neutral')}">
                <span>${typeof coin.Change24h === 'number' ? coin.Change24h.toFixed(2) : 'N/A'}%</span>
            </div>
        `;
        topCoinsStrip.appendChild(card);
    });

    // All other coins (Grid for mobile, Table for desktop)
    const renderCoins = (coinList, parentElement, isTable = false) => {
        console.log('coinList' + coinList);
        coinList.forEach((coin, index) => {
            console.log(coin);
            console.log(isTable);
            if (isTable) {
                const row = document.createElement('tr');
                coin = coin[0];
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <img src="${coin.image || 'https://dummyimage.com/48x48/cccccc/000000.png&text=?'}" alt="${coin.Name || 'N/A'}" class="coin-table-logo">
                        ${coin.Name || 'N/A'} (${getCoinSymbol(coin.Label)})
                    </td>
                    <td>${formatCurrency(coin.Price, currency)}</td>
                    <td>
                        <div class="price-change ${coin.Change24h > 0 ? 'positive' : (coin.Change24h < 0 ? 'negative' : 'neutral')}">
                            <span>${typeof coin.Change24h === 'number' ? coin.Change24h.toFixed(2) : 'N/A'}%</span>
                        </div>
                    </td>
                    <td>${formatCurrency(coin.MarketCap, currency)}</td>
                    <td>${formatCurrency(coin.Volume_24h, currency)}</td>
                `;
                parentElement.appendChild(row);
            } else {
                const card = document.createElement('div');
                card.className = 'coin-card';
                card.innerHTML = `
                    <img src="${coin.image || 'https://dummyimage.com/48x48/cccccc/000000.png&text=?'}" alt="${coin.Name || 'N/A'}" class="coin-logo">
                    <h3 class="coin-name">${coin.Name || 'N/A'}</h3>
                    <span class="coin-symbol">${getCoinSymbol(coin.Label)}</span>
                    <span class="coin-price">${formatCurrency(coin.Price, currency)}</span>
                    <div class="price-change ${coin.Change24h > 0 ? 'positive' : (coin.Change24h < 0 ? 'negative' : 'neutral')}">
                        <span>${typeof coin.Change24h === 'number' ? coin.Change24h.toFixed(2) : 'N/A'}%</span>
                    </div>
                `;
                parentElement.appendChild(card);
            }
        });
    };


    if (window.innerWidth < 768) {
        const coinGridDiv = document.createElement('div');
        coinGridDiv.className = 'coin-grid';
        renderCoins(coins.slice(3), coinGridDiv);
        allCoinsDisplay.appendChild(coinGridDiv);
    } else {
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Coin</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th>Market Cap</th>
                    <th>Volume 24h</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');
        renderCoins(coins, tbody, true); // Pass all coins for table view, and indicate it's a table
        allCoinsDisplay.appendChild(table);
    }
};

// Fetch Crypto Data
const fetchCryptoData = async (currency) => {
    showSkeletonLoaders();
    try {
        console.log('Fetching data from server...');
        const response = await fetch(`${API_BASE_URL}?currency=${currency}`);
        console.log('api response: ' + response);
        if (!response.ok) {
            // Log response text for more detailed error from backend
            const errorText = await response.text();
            console.error('Backend API response not OK:', response.status, errorText);
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorJson.details || errorMessage;
            } catch (e) {
                errorMessage = errorText; // If not JSON, use raw text
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        updateUI(data, currency);

    } catch (error) {
        console.error('Error fetching crypto data:', error);
        hideSkeletonLoaders();
        allCoinsDisplay.innerHTML = `<p style="text-align:center; margin-top:30px; color:red;">
            Failed to load cryptocurrency data. Please ensure the server is running and the API key is valid.
        </p>`;
        totalMarketCapEl.textContent = 'N/A';
        totalVolumeEl.textContent = 'N/A';
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => fetchCryptoData(currencySelector.value));
refreshButton.addEventListener('click', () => fetchCryptoData(currencySelector.value));
currencySelector.addEventListener('change', (e) => fetchCryptoData(e.target.value));
setInterval(() => fetchCryptoData(currencySelector.value), REFRESH_INTERVAL);

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        fetchCryptoData(currencySelector.value);
    }, 200);
});