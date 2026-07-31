import React, { useState, useEffect } from "react";
import { PAKISTAN_CITIES } from "./cities";
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Menu, 
  Loader2 
} from "lucide-react";
import "./App.css";

// Helper function to map WMO Weather Codes to text & icons
const getWeatherDetails = (code) => {
  if (code === 0) return { label: "Sunny", icon: <Sun className="main-weather-icon" /> };
  if (code >= 1 && code <= 3) return { label: "Partly Cloudy", icon: <CloudSun className="main-weather-icon" /> };
  if (code >= 51 && code <= 67) return { label: "Rainy", icon: <CloudRain className="main-weather-icon" /> };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: <CloudDrizzle className="main-weather-icon" /> };
  if (code >= 95) return { label: "Thunderstorm", icon: <CloudLightning className="main-weather-icon" /> };
  return { label: "Clear", icon: <Sun className="main-weather-icon" /> };
};

// Helper function to format day names
const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState(PAKISTAN_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Weather Data from Open-Meteo API
  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,weather_code&timezone=auto`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data.");
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const currentCondition = weatherData ? getWeatherDetails(weatherData.current.weather_code) : null;
  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="app-container">
      {/* City Selector Buttons */}
      <div className="city-selector">
        {PAKISTAN_CITIES.map((city) => (
          <button
            key={city.name}
            disabled={loading}
            className={`city-btn ${selectedCity.name === city.name ? "active" : ""}`}
            onClick={() => setSelectedCity(city)}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Main Card UI */}
      <div className="weather-card">
        {/* Top Header */}
        <div className="card-header">
          <Menu className="menu-icon" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-container">
            <Loader2 className="spinner" />
            <p>Loading weather data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="state-container error">
            <p>⚠️ {error}</p>
            <button onClick={() => fetchWeather(selectedCity)}>Retry</button>
          </div>
        )}

        {/* Content Display */}
        {weatherData && !loading && !error && (
          <>
            <div className="main-info">
              <h1 className="city-name">{selectedCity.name}</h1>
              <p className="condition-text">{todayDate} / {currentCondition.label}</p>
              
              <div className="icon-wrapper">
                {currentCondition.icon}
              </div>

              <div className="temperature">
                {Math.round(weatherData.current.temperature_2m)}°
              </div>
            </div>

            {/* 4-Day Forecast Row */}
            <div className="forecast-container">
              {weatherData.daily.time.slice(1, 5).map((time, idx) => {
                const code = weatherData.daily.weather_code[idx + 1];
                const temp = Math.round(weatherData.daily.temperature_2m_max[idx + 1]);
                const details = getWeatherDetails(code);

                return (
                  <div key={time} className="forecast-item">
                    <span className="forecast-day">{getDayName(time)}</span>
                    <div className="forecast-icon">{details.icon}</div>
                    <span className="forecast-temp">{temp}°</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}