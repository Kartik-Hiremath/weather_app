const inputBox = $('#input-box');
const searchBtn = $('#searchBtn'); 
const weather_img = $('.weather-img');
const temperature = $('.temperature');
const description = $('.description');
const humidity = $('#humidity');
const wind_speed = $('#wind-speed');
const location_not_found = $('.location-not-found');
const weather_body = $('.weather-body');

async function checkWeather(city) {
    const api_key = "a1678514234882f652831565f1f9c185";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;

    const weather_data = await fetch(`${url}`).then(response => response.json());

    if (weather_data.cod === `404`) {
        location_not_found.css('display', 'flex');
        weather_body.css('display', 'none');
        console.log("Error in the name");
        return;
    }
    location_not_found.css('display', 'none');
    weather_body.css('display', 'flex');
    temperature.html(`${Math.round(weather_data.main.temp - 273.15)}<sup>°C</sup>`);
    description.html(`${weather_data.weather[0].description}`);
    humidity.html(`${weather_data.main.humidity}%`);
    wind_speed.html(`${weather_data.wind.speed}Km/H`);

    switch(weather_data.weather[0].main){
        case 'Clouds' :
            weather_img.attr('src', 'cloud.png');
            break;
        case 'Clear' :
            weather_img.attr('src', 'clear.png');
            break;
        case 'Rain' :
            weather_img.attr('src', 'rain.png');
            break;
        case 'Mist' :
            weather_img.attr('src', 'mist.png');
            break;
        case 'Snow' :
            weather_img.attr('src', 'snow.png');
            break;
    }
}

searchBtn.on('click', () => {
    checkWeather(inputBox.val());
});
