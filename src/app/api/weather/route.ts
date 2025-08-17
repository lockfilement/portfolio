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
		windDirection?: string;
		visibility?: string;
		pressure?: string;
		lastUpdated: string;
		forecast?: {
			date: string;
			condition: string;
			maxTemp: string;
			minTemp: string;
			humidity?: string;
			windSpeed?: string;
			visibility?: string;
		}[];
	} | null;
	timestamp: number;
}

if (!global.weatherCache) {
	global.weatherCache = {
		data: null,
		timestamp: 0,
	} as WeatherCache;
}

const CACHE_DURATION = 15 * 60 * 1000;
const API_URL = "https://wttr.in/Ecuador?format=j1";
const FALLBACK_URL = "https://wttr.in/Ecuador?format=%t|%C";

const getCachedData = () => {
	const cache = global.weatherCache!;
	if (cache.data) {
		return NextResponse.json({
			...cache.data,
			lastUpdated: new Date(cache.timestamp).toLocaleString("en-US", {
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
	return null;
};

export async function GET() {
	try {
		const now = Date.now();
		const cache = global.weatherCache!;

		if (cache.data && now - cache.timestamp < CACHE_DURATION) {
			return NextResponse.json({
				...cache.data,
				lastUpdated: new Date(cache.timestamp).toLocaleString("en-US", {
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

		const response = await fetch(API_URL, {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"User-Agent": "YannPortfolio/1.0",
			},
			next: { revalidate: 900 },
		});

		if (!response.ok) {
			throw new Error(`Weather service unavailable: ${response.status}`);
		}

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new Error("Invalid content-type from weather service");
		}

		const data = await response.json();

		if (!data || !data.current_condition || !data.current_condition[0]) {
			throw new Error("Invalid data structure from weather service");
		}

		const current = data.current_condition[0];

		const forecast = data.weather?.slice(0, 3).map((day: any) => {
			const midday = day.hourly?.[4] || day.hourly?.[0];
			return {
				date: day.date,
				condition: midday?.weatherDesc?.[0]?.value || "Unknown",
				maxTemp: `${day.maxtempC}°C`,
				minTemp: `${day.mintempC}°C`,
				humidity: midday?.humidity ? `${midday.humidity}%` : undefined,
				windSpeed: midday?.windspeedKmph ? `${midday.windspeedKmph} km/h` : undefined,
				visibility: midday?.visibility ? `${midday.visibility} km` : undefined,
			};
		}) || [];

		const weatherData = {
			temp: `${current.temp_C}°C`,
			condition: current.weatherDesc?.[0]?.value || "Unknown",
			feelsLike: `${current.FeelsLikeC}°C`,
			humidity: `${current.humidity}%`,
			windSpeed: `${current.windspeedKmph} km/h`,
			windDirection: current.winddir16Point || "N/A",
			visibility: `${current.visibility} km`,
			pressure: `${current.pressure} mb`,
			lastUpdated: new Date(now).toLocaleString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true,
				timeZone: "America/Guayaquil",
			}),
			forecast,
		};

		global.weatherCache = {
			data: weatherData,
			timestamp: now,
		};

		return NextResponse.json({
			...weatherData,
			cached: false,
		});
	} catch (error) {
		console.error("Error fetching weather:", error);
		const cache = global.weatherCache!;

		if (cache.data) {
			return NextResponse.json({
				...cache.data,
				lastUpdated: new Date(cache.timestamp).toLocaleString("en-US", {
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

		try {
			const fallbackResponse = await fetch(FALLBACK_URL, {
				method: "GET",
				headers: {
					"User-Agent": "YannPortfolio/1.0",
				},
				next: { revalidate: 900 },
			});

			if (fallbackResponse.ok) {
				const text = await fallbackResponse.text();
				const [temp, condition] = text.split("|").map(s => s.trim());

				const basicData = {
					temp: temp.replace("+", ""),
					condition: condition || "Sunny",
					lastUpdated: new Date().toLocaleString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
						hour: "numeric",
						minute: "numeric",
						hour12: true,
						timeZone: "America/Guayaquil",
					}),
				};

				global.weatherCache = {
					data: basicData,
					timestamp: Date.now(),
				};

				return NextResponse.json({
					...basicData,
					cached: false,
				});
			}
		} catch (e) {
			console.error("Fallback failed:", e);
		}

		const cachedResponse = getCachedData();
		if (cachedResponse) return cachedResponse;

		return NextResponse.json(
			{ error: "No weather data available" },
			{ status: 500 }
		);
	}
}