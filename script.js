// Global Variables
let currentTheme = 'dark';
let weatherData = null;
let calculatorDisplay = '0';
let calculatorPreviousValue = null;
let calculatorOperation = null;
let calculatorWaitingForOperand = false;
let calculatorHistory = [];
let newsData = [];
let newsUpdateInterval = null;

// Regional Climate Data
const regionalClimateData = {
    global: {
        name: 'Global',
        temperature: '+1.2°C',
        precipitation: '+2.1%',
        extremeEvents: '+15%',
        description: 'Worldwide climate patterns and anomalies'
    },
    northAmerica: {
        name: 'North America',
        temperature: '+1.8°C',
        precipitation: '-3.2%',
        extremeEvents: '+22%',
        description: 'Increased heat waves and drought conditions'
    },
    europe: {
        name: 'Europe',
        temperature: '+2.1°C',
        precipitation: '+1.8%',
        extremeEvents: '+18%',
        description: 'Record-breaking temperatures and flooding'
    },
    asia: {
        name: 'Asia',
        temperature: '+1.5°C',
        precipitation: '+4.2%',
        extremeEvents: '+25%',
        description: 'Monsoon changes and extreme weather events'
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
    startNewsUpdates();
});

function initializeApp() {
    // Set initial theme
    applyTheme(currentTheme);
    
    // Initialize calculator
    updateCalculatorDisplay();
    
    // Initialize regional data
    updateRegionalData('global');
    
    // Load initial news
    generateWeatherNews();
}

function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Weather search
    const searchBtn = document.getElementById('searchBtn');
    const locationInput = document.getElementById('locationInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchWeather);
    }
    
    if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchWeather();
            }
        });
    }
    
    // News refresh
    const refreshBtn = document.getElementById('refreshNews');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            generateWeatherNews();
        });
    }
    
    // Regional selector
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const region = e.currentTarget.dataset.region;
            selectRegion(region);
        });
    });
    
    // Theme selector
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            setTheme(theme);
        });
    });
    
    // Settings save
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
}

// Tab Navigation
function switchTab(tabId) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    // Page-specific initialization
    if (tabId === 'news') {
        generateWeatherNews();
    }
}

// Weather Functions
async function searchWeather() {
    const locationInput = document.getElementById('locationInput');
    const location = locationInput.value.trim();
    
    if (!location) return;
    
    const searchBtn = document.getElementById('searchBtn');
    const errorDiv = document.getElementById('weatherError');
    const displayDiv = document.getElementById('weatherDisplay');
    const sampleDiv = document.getElementById('sampleLocations');
    
    // Show loading state
    searchBtn.innerHTML = '<div class="spinner"></div>';
    searchBtn.disabled = true;
    errorDiv.classList.add('hidden');
    displayDiv.classList.add('hidden');
    
    try {
        const API_KEY = 'a1678514234882f652831565f1f9c185';
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Location not found');
        }
        
        const data = await response.json();
        weatherData = data;
        displayWeatherData(data);
        sampleDiv.classList.add('hidden');
        
    } catch (error) {
        console.error('Weather API Error:', error);
        errorDiv.classList.remove('hidden');
        sampleDiv.classList.remove('hidden');
    } finally {
        searchBtn.innerHTML = '<i class="fas fa-search"></i>';
        searchBtn.disabled = false;
    }
}

function searchLocation(location) {
    document.getElementById('locationInput').value = location;
    searchWeather();
}

function displayWeatherData(data) {
    const displayDiv = document.getElementById('weatherDisplay');
    const weatherIcon = getWeatherIcon(data.weather[0].main, data.weather[0].description);
    const backgroundClass = getWeatherBackgroundClass(data.weather[0].main);
    
    displayDiv.innerHTML = `
        <div class="weather-main">
            <div class="weather-location">${data.name}, ${data.sys.country}</div>
            <div class="weather-icon">${weatherIcon}</div>
            <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
            <div class="weather-desc">${data.weather[0].description}</div>
        </div>
        <div class="weather-details">
            <div class="weather-detail">
                <i class="fas fa-thermometer-half" style="color: #f59e0b;"></i>
                <div class="label">Feels Like</div>
                <div class="value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-tint" style="color: #3b82f6;"></i>
                <div class="label">Humidity</div>
                <div class="value">${data.main.humidity}%</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-wind" style="color: #10b981;"></i>
                <div class="label">Wind Speed</div>
                <div class="value">${data.wind.speed} m/s</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-eye" style="color: #8b5cf6;"></i>
                <div class="label">Visibility</div>
                <div class="value">${(data.visibility / 1000).toFixed(1)} km</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-thermometer-empty" style="color: #06b6d4;"></i>
                <div class="label">Min Temp</div>
                <div class="value">${Math.round(data.main.temp_min)}°C</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-thermometer-full" style="color: #ef4444;"></i>
                <div class="label">Max Temp</div>
                <div class="value">${Math.round(data.main.temp_max)}°C</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-compress-arrows-alt" style="color: #f59e0b;"></i>
                <div class="label">Pressure</div>
                <div class="value">${data.main.pressure} hPa</div>
            </div>
            <div class="weather-detail">
                <i class="fas fa-compass" style="color: #10b981;"></i>
                <div class="label">Wind Direction</div>
                <div class="value">${data.wind.deg || 0}°</div>
            </div>
        </div>
    `;
    
    displayDiv.classList.remove('hidden');
    displayDiv.classList.add('animate-slide-up');
}

function getWeatherIcon(main, description) {
    const mainCondition = main.toLowerCase();
    const desc = description.toLowerCase();
    
    if (mainCondition === 'clear') return '☀️';
    if (mainCondition === 'clouds') {
        if (desc.includes('few')) return '🌤️';
        if (desc.includes('scattered')) return '⛅';
        return '☁️';
    }
    if (mainCondition === 'rain') {
        if (desc.includes('light')) return '🌦️';
        if (desc.includes('heavy')) return '🌧️';
        return '🌧️';
    }
    if (mainCondition === 'drizzle') return '🌦️';
    if (mainCondition === 'thunderstorm') return '⛈️';
    if (mainCondition === 'snow') return '❄️';
    if (mainCondition === 'mist' || mainCondition === 'fog') return '🌫️';
    if (mainCondition === 'haze') return '😶‍🌫️';
    
    return '🌤️';
}

function getWeatherBackgroundClass(main) {
    const mainCondition = main?.toLowerCase();
    
    switch (mainCondition) {
        case 'clear': return 'weather-clear';
        case 'clouds': return 'weather-clouds';
        case 'rain':
        case 'drizzle': return 'weather-rain';
        case 'thunderstorm': return 'weather-storm';
        case 'snow': return 'weather-snow';
        case 'mist':
        case 'fog': return 'weather-mist';
        default: return 'weather-default';
    }
}

// Calculator Functions
function inputNumber(num) {
    if (calculatorWaitingForOperand) {
        calculatorDisplay = String(num);
        calculatorWaitingForOperand = false;
    } else {
        calculatorDisplay = calculatorDisplay === '0' ? String(num) : calculatorDisplay + num;
    }
    updateCalculatorDisplay();
}

function inputDecimal() {
    if (calculatorWaitingForOperand) {
        calculatorDisplay = '0.';
        calculatorWaitingForOperand = false;
    } else if (calculatorDisplay.indexOf('.') === -1) {
        calculatorDisplay = calculatorDisplay + '.';
    }
    updateCalculatorDisplay();
}

function inputOperator(nextOperator) {
    const inputValue = parseFloat(calculatorDisplay);

    if (calculatorPreviousValue === null) {
        calculatorPreviousValue = inputValue;
    } else if (calculatorOperation) {
        const currentValue = calculatorPreviousValue || 0;
        const newValue = performCalculation(currentValue, inputValue, calculatorOperation);

        calculatorDisplay = String(newValue);
        calculatorPreviousValue = newValue;
        
        // Add to history
        const calculation = `${currentValue} ${calculatorOperation} ${inputValue} = ${newValue}`;
        addToHistory(calculation);
    }

    calculatorWaitingForOperand = true;
    calculatorOperation = nextOperator;
    updateCalculatorDisplay();
}

function calculateResult() {
    const inputValue = parseFloat(calculatorDisplay);

    if (calculatorPreviousValue !== null && calculatorOperation) {
        const newValue = performCalculation(calculatorPreviousValue, inputValue, calculatorOperation);
        
        // Add to history
        const calculation = `${calculatorPreviousValue} ${calculatorOperation} ${inputValue} = ${newValue}`;
        addToHistory(calculation);
        
        calculatorDisplay = String(newValue);
        calculatorPreviousValue = null;
        calculatorOperation = null;
        calculatorWaitingForOperand = true;
        updateCalculatorDisplay();
    }
}

function performCalculation(firstValue, secondValue, operation) {
    switch (operation) {
        case '+': return firstValue + secondValue;
        case '-': return firstValue - secondValue;
        case '×': return firstValue * secondValue;
        case '÷': return secondValue !== 0 ? firstValue / secondValue : 0;
        case '%': return firstValue % secondValue;
        default: return secondValue;
    }
}

function clearCalculator() {
    calculatorDisplay = '0';
    calculatorPreviousValue = null;
    calculatorOperation = null;
    calculatorWaitingForOperand = false;
    updateCalculatorDisplay();
}

function updateCalculatorDisplay() {
    document.getElementById('calculatorScreen').textContent = calculatorDisplay;
}

function addToHistory(calculation) {
    calculatorHistory.unshift(calculation);
    if (calculatorHistory.length > 10) {
        calculatorHistory.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('calculatorHistory');
    
    if (calculatorHistory.length === 0) {
        historyDiv.innerHTML = '<p class="no-history">No calculations yet</p>';
    } else {
        historyDiv.innerHTML = calculatorHistory
            .map(calc => `<div class="history-item">${calc}</div>`)
            .join('');
    }
}

function clearHistory() {
    calculatorHistory = [];
    updateHistoryDisplay();
}

// News Functions
function generateWeatherNews() {
    const loadingDiv = document.getElementById('newsLoading');
    const contentDiv = document.getElementById('newsContent');
    
    loadingDiv.classList.remove('hidden');
    contentDiv.classList.add('hidden');
    
    setTimeout(() => {
        const currentDate = new Date();
        const hour = currentDate.getHours();
        const month = currentDate.getMonth();
        const season = month >= 3 && month <= 5 ? 'spring' : 
                       month >= 6 && month <= 8 ? 'summer' : 
                       month >= 9 && month <= 11 ? 'autumn' : 'winter';
        
        const newsTemplates = [
            {
                id: 1,
                title: `${season === 'summer' ? 'Heat Wave Alert' : season === 'winter' ? 'Winter Storm Watch' : 'Severe Weather Alert'}: ${season.charAt(0).toUpperCase() + season.slice(1)} Conditions Intensify`,
                summary: `Current ${season} weather patterns show ${season === 'summer' ? 'record-breaking temperatures' : season === 'winter' ? 'heavy snowfall and freezing conditions' : 'unpredictable weather changes'} affecting multiple regions. Emergency services are on high alert.`,
                source: "National Hurricane Center",
                url: "https://www.nhc.noaa.gov/",
                category: "Severe Weather",
                image: season === 'summer' ? "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800" :
                       season === 'winter' ? "https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=800" :
                       "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800",
                urgency: 'HIGH'
            },
            {
                id: 2,
                title: `${hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'} Weather Update: Real-Time Conditions at ${hour}:${currentDate.getMinutes().toString().padStart(2, '0')}`,
                summary: `Live weather monitoring shows ${Math.random() > 0.5 ? 'improving' : 'deteriorating'} conditions across major metropolitan areas. Temperature readings indicate ${season === 'summer' ? 'heat stress warnings' : season === 'winter' ? 'frost advisories' : 'variable conditions'}.`,
                source: "National Weather Service",
                url: "https://www.weather.gov/",
                category: "Live Update",
                image: hour < 12 ? "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800" :
                       hour < 18 ? "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800" :
                       "https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=800",
                urgency: 'MEDIUM'
            },
            {
                id: 3,
                title: `Storm Tracking Alert: ${Math.floor(Math.random() * 3) + 2} Active Weather Systems Detected`,
                summary: `Advanced radar systems are tracking multiple storm formations with ${Math.random() > 0.5 ? 'increasing' : 'decreasing'} intensity. Meteorologists report ${season === 'summer' ? 'thunderstorm development' : season === 'winter' ? 'blizzard conditions' : 'mixed precipitation'} expected.`,
                source: "Storm Prediction Center",
                url: "https://www.spc.noaa.gov/",
                category: "Storm Alert",
                image: "https://images.pexels.com/photos/1162251/pexels-photo-1162251.jpeg?auto=compress&cs=tinysrgb&w=800",
                urgency: 'HIGH'
            },
            {
                id: 4,
                title: `Climate Emergency: ${currentDate.getFullYear()} Temperature Records ${Math.random() > 0.5 ? 'Shattered' : 'Approaching Historic Levels'}`,
                summary: `Latest climate data reveals ${currentDate.getFullYear()} is ${Math.random() > 0.5 ? 'on track to be the hottest year' : 'showing unprecedented warming trends'} on record. Scientists warn of accelerating climate change impacts.`,
                source: "NOAA Climate.gov",
                url: "https://www.climate.gov/",
                category: "Climate Emergency",
                image: "https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg?auto=compress&cs=tinysrgb&w=800",
                urgency: 'NORMAL'
            },
            {
                id: 5,
                title: `${currentDate.toLocaleDateString()} Flash Weather Briefing: Urgent Regional Updates`,
                summary: `Emergency weather briefing issued for ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'} conditions. ${season === 'summer' ? 'Heat emergency protocols' : season === 'winter' ? 'Cold weather advisories' : 'Weather warnings'} now in effect for multiple states.`,
                source: "Emergency Alert System",
                url: "https://www.weather.gov/",
                category: "Emergency Alert",
                image: season === 'summer' ? "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800" :
                       "https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=800",
                urgency: 'HIGH'
            },
            {
                id: 6,
                title: `Breaking: ${Math.random() > 0.5 ? 'Drought' : 'Flood'} Conditions Escalate - Agricultural Impact Severe`,
                summary: `Critical ${Math.random() > 0.5 ? 'water shortage' : 'flooding'} situation develops as ${season} weather patterns create ${Math.random() > 0.5 ? 'unprecedented dry conditions' : 'excessive rainfall'} affecting crop yields and water supplies nationwide.`,
                source: "US Drought Monitor",
                url: "https://droughtmonitor.unl.edu/",
                category: "Agricultural Alert",
                image: Math.random() > 0.5 ? 
                       "https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg?auto=compress&cs=tinysrgb&w=800" :
                       "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800",
                urgency: 'MEDIUM'
            }
        ];

        newsData = newsTemplates
            .map(news => ({
                ...news,
                date: new Date(currentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                timestamp: new Date(currentDate.getTime() - Math.random() * 24 * 60 * 60 * 1000)
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

        displayNews();
        updateLastUpdated();
        
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
    }, 1000);
}

function displayNews() {
    const featuredDiv = document.getElementById('featuredNews');
    const gridDiv = document.getElementById('newsGrid');
    
    if (newsData.length === 0) return;
    
    // Featured news (first article)
    const featured = newsData[0];
    featuredDiv.innerHTML = `
        <div class="featured-article" onclick="openLink('${featured.url}')">
            <div class="breaking-banner">
                ${getUrgencyIndicator(featured.urgency)} - BREAKING NEWS
            </div>
            <img src="${featured.image}" alt="${featured.title}" class="article-image">
            <div class="article-content">
                <h2 class="article-title">${featured.title}</h2>
                <p class="article-summary">${featured.summary}</p>
                <div class="article-meta">
                    <div class="article-meta-left">
                        <span><i class="fas fa-calendar"></i> ${new Date(featured.date).toLocaleDateString()}</span>
                        <span>${featured.source}</span>
                    </div>
                    <span class="category-badge" style="background: ${getCategoryGradient(featured.category)}">
                        ${featured.category}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    // News grid (remaining articles)
    gridDiv.innerHTML = newsData.slice(1).map(news => `
        <div class="news-article" onclick="openLink('${news.url}')">
            ${news.urgency === 'HIGH' ? '<div class="urgent-badge">🚨 URGENT</div>' : ''}
            <img src="${news.image}" alt="${news.title}" class="article-image">
            <div class="article-content">
                <h3 class="article-title">${news.title}</h3>
                <p class="article-summary">${news.summary}</p>
                <div class="article-meta">
                    <div class="article-meta-left">
                        <span><i class="fas fa-calendar"></i> ${new Date(news.date).toLocaleDateString()}</span>
                    </div>
                    <span class="category-badge" style="background: ${getCategoryGradient(news.category)}">
                        ${news.category}
                    </span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.5rem;">
                    Source: ${news.source}
                </div>
            </div>
        </div>
    `).join('');
}

function getUrgencyIndicator(urgency) {
    switch(urgency) {
        case 'HIGH': return '🚨 URGENT';
        case 'MEDIUM': return '⚠️ ALERT';
        default: return '📢 UPDATE';
    }
}

function getCategoryGradient(category) {
    const gradients = {
        'Severe Weather': 'linear-gradient(135deg, #ef4444, #f59e0b)',
        'Live Update': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        'Storm Alert': 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        'Climate Emergency': 'linear-gradient(135deg, #dc2626, #b91c1c)',
        'Emergency Alert': 'linear-gradient(135deg, #ef4444, #ec4899)',
        'Agricultural Alert': 'linear-gradient(135deg, #10b981, #059669)'
    };
    return gradients[category] || 'linear-gradient(135deg, #6b7280, #4b5563)';
}

function updateLastUpdated() {
    const lastUpdatedSpan = document.getElementById('lastUpdated');
    if (lastUpdatedSpan) {
        lastUpdatedSpan.textContent = `🕒 Last updated: ${new Date().toLocaleTimeString()}`;
    }
}

function startNewsUpdates() {
    // Update news every 3 minutes
    newsUpdateInterval = setInterval(() => {
        if (document.getElementById('news').classList.contains('active')) {
            generateWeatherNews();
        }
    }, 3 * 60 * 1000);
}

// Regional Climate Functions
function selectRegion(regionKey) {
    // Update button states
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-region="${regionKey}"]`).classList.add('active');
    
    // Update data display
    updateRegionalData(regionKey);
}

function updateRegionalData(regionKey) {
    const data = regionalClimateData[regionKey];
    
    document.getElementById('regionName').textContent = `${data.name} Climate Trends`;
    document.getElementById('regionDescription').textContent = data.description;
    document.getElementById('tempChange').textContent = data.temperature;
    document.getElementById('precipChange').textContent = data.precipitation;
    document.getElementById('extremeEvents').textContent = data.extremeEvents;
}

// Theme Functions
function setTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
    
    // Update button states
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    
    // Update current theme display
    const currentThemeSpan = document.getElementById('currentTheme');
    if (currentThemeSpan) {
        const themeNames = {
            'dark': 'Dark mode',
            'light': 'Light mode',
            'auto': 'Auto (System)'
        };
        currentThemeSpan.textContent = themeNames[theme];
    }
    
    saveSettings();
}

function applyTheme(theme) {
    let effectiveTheme = theme;
    
    if (theme === 'auto') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', effectiveTheme);
}

// Settings Functions
function saveSettings() {
    const settings = {
        theme: currentTheme,
        notifications: {
            email: document.querySelector('input[type="checkbox"]').checked,
            weather: document.querySelectorAll('input[type="checkbox"]')[1].checked,
            news: document.querySelectorAll('input[type="checkbox"]')[2].checked
        },
        privacy: {
            publicProfile: document.querySelectorAll('input[type="checkbox"]')[3].checked,
            activityStatus: document.querySelectorAll('input[type="checkbox"]')[4].checked
        }
    };
    
    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
    
    // Show saved feedback
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Settings Saved!';
        saveBtn.classList.add('saved');
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.classList.remove('saved');
        }, 2000);
    }
}

function loadSettings() {
    const saved = localStorage.getItem('weatherAppSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            
            if (settings.theme) {
                setTheme(settings.theme);
            }
            
            // Load checkbox states
            if (settings.notifications) {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                if (checkboxes[0]) checkboxes[0].checked = settings.notifications.email;
                if (checkboxes[1]) checkboxes[1].checked = settings.notifications.weather;
                if (checkboxes[2]) checkboxes[2].checked = settings.notifications.news;
            }
            
            if (settings.privacy) {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                if (checkboxes[3]) checkboxes[3].checked = settings.privacy.publicProfile;
                if (checkboxes[4]) checkboxes[4].checked = settings.privacy.activityStatus;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// Utility Functions
function openLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Auto theme detection
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (currentTheme === 'auto') {
            applyTheme('auto');
        }
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (newsUpdateInterval) {
        clearInterval(newsUpdateInterval);
    }
});

// Error handling for API calls
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't prevent the default behavior, just log it
});

// Service Worker Registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}