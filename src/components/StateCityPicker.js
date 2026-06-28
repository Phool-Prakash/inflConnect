"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";

async function fetchStates(search) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`/api/locations/states?${params}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

async function fetchCities(state, search) {
  const params = new URLSearchParams({ state });
  if (search) params.set("search", search);
  const res = await fetch(`/api/locations/cities?${params}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function StateCityPicker({
  state,
  city,
  onStateChange,
  onCityChange,
  errors = {},
}) {
  const [stateSearch, setStateSearch] = useState(state || "");
  const [citySearch, setCitySearch] = useState(city || "");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const debouncedStateSearch = useDebouncedValue(stateSearch);
  const debouncedCitySearch = useDebouncedValue(citySearch);

  const inputClass =
    "w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-shadow";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const errorClass = "text-red-500 text-xs mt-1";

  useEffect(() => {
    if (!stateOpen) setStateSearch(state || "");
  }, [state, stateOpen]);

  useEffect(() => {
    if (!cityOpen) setCitySearch(city || "");
  }, [city, cityOpen]);

  useEffect(() => {
    let active = true;
    setLoadingStates(true);
    fetchStates(debouncedStateSearch)
      .then((data) => active && setStates(data))
      .catch(() => active && setStates([]))
      .finally(() => active && setLoadingStates(false));
    return () => { active = false; };
  }, [debouncedStateSearch]);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    let active = true;
    setLoadingCities(true);
    fetchCities(state, debouncedCitySearch)
      .then((data) => active && setCities(data))
      .catch(() => active && setCities([]))
      .finally(() => active && setLoadingCities(false));
    return () => { active = false; };
  }, [state, debouncedCitySearch]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectState(name) {
    onStateChange(name);
    setStateSearch(name);
    setStateOpen(false);
    onCityChange("");
    setCitySearch("");
    setCityOpen(false);
  }

  function selectCity(name) {
    onCityChange(name);
    setCitySearch(name);
    setCityOpen(false);
  }

  return (
    <>
      <div className="relative" ref={stateRef}>
        <label htmlFor="state-search" className={labelClass}>State / UT *</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="state-search"
            type="text"
            value={stateSearch}
            onChange={(e) => {
              const next = e.target.value;
              setStateSearch(next);
              setStateOpen(true);
              if (state && next !== state) onStateChange("");
            }}
            onFocus={() => setStateOpen(true)}
            placeholder="Search your state..."
            autoComplete="off"
            className={inputClass}
          />
          {loadingStates ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          )}
        </div>
        {stateOpen && (
          <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1">
            {states.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                {loadingStates ? "Searching..." : "No states found"}
              </li>
            ) : (
              states.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => selectState(s)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${
                      state === s ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"
                    }`}
                  >
                    {s}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
        {errors.state && <p className={errorClass}>{errors.state}</p>}
      </div>

      <div className="relative" ref={cityRef}>
        <label htmlFor="city-search" className={labelClass}>City / District *</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="city-search"
            type="text"
            value={citySearch}
            disabled={!state}
            onChange={(e) => {
              const next = e.target.value;
              setCitySearch(next);
              setCityOpen(true);
              if (city && next !== city) onCityChange("");
            }}
            onFocus={() => state && setCityOpen(true)}
            placeholder={!state ? "Select state first" : "Search your city or district..."}
            autoComplete="off"
            className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
          />
          {loadingCities ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          )}
        </div>
        {cityOpen && state && (
          <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1">
            {cities.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                {loadingCities ? "Searching..." : "No cities found"}
              </li>
            ) : (
              cities.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => selectCity(c)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${
                      city === c ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
        {errors.city && <p className={errorClass}>{errors.city}</p>}
      </div>
    </>
  );
}
