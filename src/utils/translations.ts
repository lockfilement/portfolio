import esTranslations from "@/translations/es.json";
import enTranslations from "@/translations/en.json";
import { Language } from "@/hooks/LanguageContext";

export const translations: Record<Language, any> = {
	es: esTranslations,
	en: enTranslations,
};

function getNestedValue(obj: any, keys: string[]): any {
	let value = obj;
	for (const key of keys) {
		if (value && typeof value === "object" && key in value) {
			value = value[key];
		} else {
			return undefined;
		}
	}
	return value;
}

function getRandomArrayItem(value: any): string {
	if (Array.isArray(value)) {
		return value[Math.floor(Math.random() * value.length)];
	}
	return value;
}

export function getTranslation(language: Language, key: string): string {
	const keys = key.split(".");
	
	// Try to get value in current language
	let value = getNestedValue(translations[language], keys);
	
	// If not found and not English, try fallback to English
	if (value === undefined && language !== "en") {
		value = getNestedValue(translations["en"], keys);
	}
	
	// If still not found, return the key
	if (value === undefined) {
		return key;
	}
	
	// Handle arrays and strings
	const result = getRandomArrayItem(value);
	return typeof result === "string" ? result : key;
}