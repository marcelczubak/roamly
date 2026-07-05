"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CitySelection = {
  id: string;
  label: string;
  destination: string;
  country?: string | null;
};

type CitySearchResult = {
  id: string;
  name: string;
  country: string | null;
  label: string;
  destination: string;
};

type CityAutocompleteProps = {
  id?: string;
  value: CitySelection | null;
  onChange: (city: CitySelection | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function citySelectionFromName(
  name: string,
  idPrefix = "manual"
): CitySelection {
  const trimmed = name.trim();
  return {
    id: `${idPrefix}-${trimmed.toLowerCase()}`,
    label: trimmed,
    destination: trimmed,
  };
}

export function CityAutocomplete({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Search for a city…",
}: CityAutocompleteProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  const selectCity = useCallback(
    (city: CitySearchResult | CitySelection) => {
      const selection: CitySelection = {
        id: city.id,
        label: city.label,
        destination: city.destination,
        country: "country" in city ? city.country : null,
      };
      setQuery(selection.label);
      onChange(selection);
      setIsOpen(false);
      setHighlightIndex(-1);
      setResults([]);
    },
    [onChange]
  );

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (value && query === value.label) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim() });
        const response = await fetch(`/api/city-search?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (response.ok && Array.isArray(data.cities)) {
          setResults(data.cities);
          setHighlightIndex(data.cities.length > 0 ? 0 : -1);
        } else {
          setResults([]);
          setHighlightIndex(-1);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
        setHighlightIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isOpen, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        if (value) {
          setQuery(value.label);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function handleInputChange(next: string) {
    setQuery(next);
    setIsOpen(true);
    if (value && next !== value.label) {
      onChange(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) =>
        current < results.length - 1 ? current + 1 : current
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => (current > 0 ? current - 1 : 0));
    } else if (event.key === "Enter" && highlightIndex >= 0 && results[highlightIndex]) {
      event.preventDefault();
      selectCity(results[highlightIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      if (value) setQuery(value.label);
    }
  }

  const showDropdown =
    isOpen && query.trim().length >= 2 && (!value || query !== value.label);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-md border border-stone-200 bg-stone-50 px-3 transition-colors focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-300/40",
          value && "border-stone-400"
        )}
      >
        <MapPin className="size-4 shrink-0 text-stone-400" aria-hidden />
        <Input
          id={id}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
        />
        {value ? (
          <Check className="size-4 shrink-0 text-stone-600" aria-hidden />
        ) : isLoading ? (
          <Loader2
            className="size-4 shrink-0 animate-spin text-stone-400"
            aria-hidden
          />
        ) : null}
      </div>

      {showDropdown ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {isLoading && results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-stone-500">Searching…</li>
          ) : null}
          {!isLoading && results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-stone-500">
              No cities found — try a different spelling
            </li>
          ) : null}
          {results.map((city, index) => (
            <li key={city.id} role="option" aria-selected={highlightIndex === index}>
              <button
                type="button"
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => selectCity(city)}
                className={cn(
                  "flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                  highlightIndex === index
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-700 hover:bg-stone-50"
                )}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-stone-400" />
                <span>
                  <span className="font-medium">{city.name}</span>
                  {city.country ? (
                    <span className="text-stone-500"> · {city.country}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
