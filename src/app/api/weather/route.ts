import { NextResponse } from "next/server";

declare global {
	var weatherCache: WeatherCache | undefined;
}

interface WeatherCache {
	data: {
		temp: string;
		condition: string;
		feelsLike?: string;
		humidity?: string;
		windSpeed?: string;
		lastUpdated: string;
		location?: string;
	} | null;
	timestamp: number;
}

if (!global.weatherCache) {
	global.weatherCache = {
		data: null,
		timestamp: 0,
	} as WeatherCache;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

const getCachedData = () => {
	const cache = global.weatherCache as WeatherCache;
	if (cache.data) {
		return NextResponse.json({
			...cache.data,
			cached: true,
		});
	}
	return null;
};

const fetchFromOpenWeather = async () => {
	try {
		const CITY = "Guayaquil,ECU";
		const API_KEY = process.env.OPENWEATHER_API_KEY;
		
		if (!API_KEY) {
			throw new Error("No OpenWeather API key configured");
		}

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=es`,
			{ next: { revalidate: 900 } }
		);

		if (!response.ok) {
			throw new Error(`OpenWeather API error: ${response.status}`);
		}

		const data = await response.json();
		
		return {
			temp: `${Math.round(data.main.temp)}°C`,
			condition: data.weather[0].description,
			feelsLike: `${Math.round(data.main.feels_like)}°C`,
			humidity: `${data.main.humidity}%`,
			windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
			location: data.name,
			lastUpdated: new Date().toLocaleString("es-ES", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
				timeZone: "America/Guayaquil",
			}),
		};
	} catch (error) {
		console.error("OpenWeather error:", error);
		throw error;
	}
};

const fetchFromWttr = async () => {
	try {
		const response = await fetch(
			"https://wttr.in/Guayaquil?format=j1",
			{ next: { revalidate: 900 } }
		);

		if (!response.ok) {
			throw new Error(`wttr.in API error: ${response.status}`);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Invalid response from wttr.in");
		}

		const data = await response.json();
		
		if (!data || !data.current_condition || !data.current_condition[0]) {
			throw new Error("Invalid weather data format");
		}

		const current = data.current_condition[0];

		return {
			temp: `${current.temp_C}°C`,
			condition: current.weatherDesc[0].value,
			feelsLike: `${current.FeelsLikeC}°C`,
			humidity: `${current.humidity}%`,
			windSpeed: `${current.windspeedKmph} km/h`,
			location: "Guayaquil",
			lastUpdated: new Date().toLocaleString("es-ES", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
				timeZone: "America/Guayaquil",
			}),
		};
	} catch (error) {
		console.error("wttr.in error:", error);
		throw error;
	}
};

const fetchBasicWeather = async () => {
	try {
		const response = await fetch(
			"https://wttr.in/Guayaquil?format=%t|%C|%h|%w",
			{ next: { revalidate: 900 } }
		);

		if (!response.ok) {
			throw new Error(`Basic wttr.in error: ${response.status}`);
		}

		const data = await response.text();
		const [temp, condition, humidity, wind] = data.split("|");

		return {
			temp: temp.replace("+", "").trim(),
			condition: condition.trim(),
			humidity: humidity?.trim() || "N/A",
			windSpeed: wind?.trim() || "N/A",
			location: "Guayaquil",
			lastUpdated: new Date().toLocaleString("es-ES", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
				timeZone: "America/Guayaquil",
			}),
		};
	} catch (error) {
		console.error("Basic weather error:", error);
		throw error;
	}
};

export async function GET() {
	try {
		const now = Date.now();
		const cache = global.weatherCache as WeatherCache;

		if (cache.data && now - cache.timestamp < CACHE_DURATION) {
			return NextResponse.json({
				...cache.data,
				lastUpdated: new Date(cache.timestamp).toLocaleString("es-ES", {
					month: "long",
					day: "numeric",
					year: "numeric",
					hour: "numeric",
					minute: "numeric",
					hour12: true,
					timeZone: "America/Guayaquil",
				}),
				cached: true,
			});
		}

		let weatherData = null;

		try {
			weatherData = await fetchFromOpenWeather();
			console.log("✅ Weather data from OpenWeather");
		} catch (error) {
			console.log("⚠️ OpenWeather failed, trying wttr.in...");


			try {
				weatherData = await fetchFromWttr();
				console.log("✅ Weather data from wttr.in");
			} catch (error) {
				console.log("⚠️ wttr.in failed, trying basic method...");


				try {
					weatherData = await fetchBasicWeather();
					console.log("✅ Weather data from basic method");
				} catch (error) {
					console.log("❌ All weather providers failed");
					

					const cachedResponse = getCachedData();
					if (cachedResponse) {
						console.log("↩️ Returning cached data");
						return cachedResponse;
					}
					
					throw new Error("All weather services unavailable");
				}
			}
		}

		global.weatherCache = {
			data: weatherData,
			timestamp: now,
		};

		return NextResponse.json({
			...weatherData,
			cached: false,
		});

	} catch (error) {
		console.error("❌ Final error fetching weather:", error);
		
		const cachedResponse = getCachedData();
		if (cachedResponse) {
			return cachedResponse;
		}

		return NextResponse.json(
			{ 
				error: "Unable to fetch weather data",
				message: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 503 }
		);
	}
}