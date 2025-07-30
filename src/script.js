// Global Variables
let currentTheme = 'dark';
let weatherData = null;
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

// Dynamic image selection based on weather conditions and news type
const getNewsImage = (category, season, urgency) => {
    const imageCategories = {
        monsoon: [
            "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1463530/pexels-photo-1463530.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        heat: [
            "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1022923/pexels-photo-1022923.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        storm: [
            "https://images.pexels.com/photos/1162251/pexels-photo-1162251.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1446076/pexels-photo-1446076.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1154510/pexels-photo-1154510.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        agriculture: [
            "https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        winter: [
            "https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        fire: [
            "https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1112086/pexels-photo-1112086.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        flood: [
            "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=800"
        ]
    };

    // Select appropriate image category based on news type
    let selectedCategory = 'heat'; // default
    
    if (category.includes('Monsoon') || category.includes('flood')) {
        selectedCategory = 'monsoon';
    } else if (category.includes('Heat') || category.includes('temperature')) {
        selectedCategory = 'heat';
    } else if (category.includes('Storm') || category.includes('Cyclone')) {
        selectedCategory = 'storm';
    } else if (category.includes('Agriculture')) {
        selectedCategory = 'agriculture';
    } else if (category.includes('Mountain') || season === 'winter') {
        selectedCategory = 'winter';
    } else if (category.includes('Fire')) {
        selectedCategory = 'fire';
    } else if (category.includes('flood')) {
        selectedCategory = 'flood';
    }

    const images = imageCategories[selectedCategory];
    return images[Math.floor(Math.random() * images.length)];
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

// News Functions - UPDATED FOR INDIA FOCUS WITH CLEAN DISPLAY
function generateWeatherNews() {
    const loadingDiv = document.getElementById('newsLoading');
    const contentDiv = document.getElementById('newsContent');
    
    loadingDiv.classList.remove('hidden');
    contentDiv.classList.add('hidden');
    
    setTimeout(() => {
        const currentDate = new Date();
        const hour = currentDate.getHours();
        const month = currentDate.getMonth();
        
        // Indian seasons and monsoon patterns
        const season = month >= 3 && month <= 5 ? 'pre-monsoon' : 
                       month >= 6 && month <= 9 ? 'monsoon' : 
                       month >= 10 && month <= 11 ? 'post-monsoon' : 'winter';
        
        // Indian cities for weather focus
        const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
        const randomCity = indianCities[Math.floor(Math.random() * indianCities.length)];
        
        // India-focused news templates with some catastrophic world news
        const newsTemplates = [
            // Indian Weather News (70% of content)
            {
                id: 1,
                title: `${season === 'monsoon' ? 'Monsoon Alert' : season === 'pre-monsoon' ? 'Heat Wave Warning' : season === 'post-monsoon' ? 'Cyclone Watch' : 'Winter Fog Advisory'}: ${randomCity} and Surrounding Regions`,
                summary: `India Meteorological Department (IMD) reports ${season === 'monsoon' ? 'heavy rainfall and flooding risks' : season === 'pre-monsoon' ? 'extreme heat conditions reaching 45°C+' : season === 'post-monsoon' ? 'cyclonic formations in Bay of Bengal' : 'dense fog affecting North India'} across ${randomCity} and neighboring states. Emergency protocols activated.`,
                source: "India Meteorological Department (IMD)",
                url: "https://mausam.imd.gov.in/",
                category: "India Weather Alert",
                urgency: 'HIGH',
                region: 'India'
            },
            {
                id: 2,
                title: `Breaking: ${randomCity} Records ${season === 'pre-monsoon' ? 'Highest' : 'Unusual'} Temperature at ${hour}:${currentDate.getMinutes().toString().padStart(2, '0')} IST`,
                summary: `Live monitoring from IMD weather stations shows ${Math.random() > 0.5 ? 'record-breaking' : 'unusual'} temperature readings in ${randomCity}. ${season === 'monsoon' ? 'Monsoon patterns disrupted' : season === 'pre-monsoon' ? 'Heat wave conditions intensifying' : 'Unexpected weather variations'} affecting daily life and agriculture.`,
                source: "National Weather Service India",
                url: "https://mausam.imd.gov.in/",
                category: "India Live Update",
                urgency: 'MEDIUM',
                region: 'India'
            },
            {
                id: 3,
                title: `Monsoon Update: ${Math.floor(Math.random() * 5) + 3} States Under ${season === 'monsoon' ? 'Heavy Rainfall' : 'Weather'} Alert`,
                summary: `Central Water Commission and IMD issue joint advisory for ${season === 'monsoon' ? 'flood-prone areas across Kerala, Karnataka, Maharashtra, Gujarat, and Rajasthan' : 'weather disturbances affecting multiple Indian states'}. River levels rising in major basins. Disaster management teams deployed.`,
                source: "Central Water Commission India",
                url: "https://cwc.gov.in/",
                category: "India Monsoon Alert",
                urgency: 'HIGH',
                region: 'India'
            },
            {
                id: 4,
                title: `Agricultural Emergency: ${season} Weather Patterns Threaten Kharif/Rabi Crops Across India`,
                summary: `Ministry of Agriculture reports ${season === 'monsoon' ? 'excess rainfall damaging standing crops' : season === 'pre-monsoon' ? 'drought conditions affecting sowing' : 'unseasonal weather threatening harvest'} in major agricultural states. Farmer support measures announced. Food security concerns raised.`,
                source: "Ministry of Agriculture & Farmers Welfare",
                url: "https://agricoop.nic.in/",
                category: "India Agriculture Alert",
                urgency: 'HIGH',
                region: 'India'
            },
            {
                id: 5,
                title: `Cyclone Watch: Bay of Bengal Disturbance Threatens East Coast - Odisha, Andhra Pradesh on Alert`,
                summary: `Indian National Centre for Ocean Information Services (INCOIS) tracks ${Math.random() > 0.5 ? 'developing cyclonic circulation' : 'low pressure system'} in Bay of Bengal. Coastal states of Odisha, Andhra Pradesh, and West Bengal prepare for potential landfall. Fishing operations suspended.`,
                source: "Indian National Centre for Ocean Information Services",
                url: "https://incois.gov.in/",
                category: "India Cyclone Alert",
                urgency: 'HIGH',
                region: 'India'
            },
            {
                id: 6,
                title: `Himalayan Weather Alert: Uttarakhand, Himachal Pradesh Face ${season === 'winter' ? 'Heavy Snowfall' : 'Extreme Weather'} Conditions`,
                summary: `High altitude weather stations report ${season === 'winter' ? 'unprecedented snowfall blocking major highways and pilgrimage routes' : 'dangerous weather conditions in mountainous regions'}. Rescue operations underway. Tourist advisories issued for hill stations.`,
                source: "India Meteorological Department - Mountain Division",
                url: "https://mausam.imd.gov.in/",
                category: "India Mountain Weather",
                urgency: 'MEDIUM',
                region: 'India'
            },
            
            // Catastrophic World News (30% of content)
            {
                id: 7,
                title: `GLOBAL CATASTROPHE: ${Math.random() > 0.5 ? 'Category 5 Hurricane' : 'Unprecedented Typhoon'} Devastates ${Math.random() > 0.5 ? 'Caribbean Islands' : 'Philippines'} - International Aid Requested`,
                summary: `Catastrophic ${Math.random() > 0.5 ? 'Hurricane with 200+ mph winds' : 'Super Typhoon'} causes unprecedented destruction. Millions without power, entire cities evacuated. International disaster response teams mobilized. Climate scientists call it "worst storm in recorded history."`,
                source: "World Meteorological Organization",
                url: "https://public.wmo.int/",
                category: "Global Catastrophe",
                urgency: 'HIGH',
                region: 'World'
            },
            {
                id: 8,
                title: `BREAKING: Massive Wildfires Engulf ${Math.random() > 0.5 ? 'California' : 'Australia'} - State of Emergency Declared`,
                summary: `Unprecedented wildfire emergency as ${Math.random() > 0.5 ? 'multiple mega-fires merge in California' : 'bushfires rage across Australian states'}. Thousands evacuated, air quality reaches hazardous levels. International firefighting assistance requested. Climate change blamed for intensity.`,
                source: "International Association of Fire Chiefs",
                url: "https://www.iafc.org/",
                category: "Global Fire Emergency",
                urgency: 'HIGH',
                region: 'World'
            },
            {
                id: 9,
                title: `ARCTIC EMERGENCY: Unprecedented Ice Sheet Collapse in ${Math.random() > 0.5 ? 'Greenland' : 'Antarctica'} Triggers Global Sea Level Concerns`,
                summary: `Satellite imagery reveals catastrophic ice sheet collapse affecting global sea levels. Coastal cities worldwide on high alert. Emergency climate summit called. Scientists warn of "irreversible tipping point" reached. Immediate global action demanded.`,
                source: "Intergovernmental Panel on Climate Change",
                url: "https://www.ipcc.ch/",
                category: "Global Climate Emergency",
                urgency: 'HIGH',
                region: 'World'
            }
        ];

        // Prioritize Indian news (70%) with some world catastrophic news (30%)
        const indianNews = newsTemplates.filter(news => news.region === 'India');
        const worldNews = newsTemplates.filter(news => news.region === 'World');
        
        // Select 4-5 Indian news and 2-3 world catastrophic news
        const selectedIndianNews = indianNews.slice(0, Math.floor(Math.random() * 2) + 4);
        const selectedWorldNews = worldNews.slice(0, Math.floor(Math.random() * 2) + 2);
        
        newsData = [...selectedIndianNews, ...selectedWorldNews]
            .map(news => ({
                ...news,
                date: new Date(currentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                timestamp: new Date(currentDate.getTime() - Math.random() * 24 * 60 * 60 * 1000),
                image: getNewsImage(news.category, season, news.urgency)
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
                ${getUrgencyIndicator(featured.urgency)} - ${featured.region === 'India' ? 'INDIA' : 'WORLD'} BREAKING NEWS
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
            ${news.urgency === 'HIGH' ? `<div class="urgent-badge">🚨 ${news.region === 'India' ? 'INDIA' : 'WORLD'} URGENT</div>` : ''}
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
        'India Weather Alert': 'linear-gradient(135deg, #ff6b35, #f7931e)',
        'India Live Update': 'linear-gradient(135deg, #138808, #0d5f0a)',
        'India Monsoon Alert': 'linear-gradient(135deg, #1e40af, #1e3a8a)',
        'India Agriculture Alert': 'linear-gradient(135deg, #059669, #047857)',
        'India Cyclone Alert': 'linear-gradient(135deg, #7c3aed, #5b21b6)',
        'India Mountain Weather': 'linear-gradient(135deg, #0891b2, #0e7490)',
        'Global Catastrophe': 'linear-gradient(135deg, #dc2626, #b91c1c)',
        'Global Fire Emergency': 'linear-gradient(135deg, #ea580c, #c2410c)',
        'Global Climate Emergency': 'linear-gradient(135deg, #7c2d12, #451a03)',
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
        lastUpdatedSpan.textContent = `🕒 Last updated: ${new Date().toLocaleTimeString()} IST`;
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
