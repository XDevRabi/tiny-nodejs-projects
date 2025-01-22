import readline from "readline/promises";

const apikey = process.env.OPEN_WEATHER_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const getWeather = async (city) => {
    const url = `${BASE_URL}?q=${city}&appid=${apikey}`;

    try{
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`City not found: ${city}`);
        }

        const data = await response.json();
        console.log(`\nWeather for ${city}:`);
        console.log(`Temperature: ${data.main.temp}°C`);
        console.log(`Description: ${data.weather[0].description}`);
        console.log(`Humidity: ${data.main.humidity}%`);
        console.log(`Wind Speed: ${data.wind.speed} m/s`);
    } catch (error) {
        console.log(error);
    }
}

const city = await rl.question("Enter the city name: ");
await getWeather(city);