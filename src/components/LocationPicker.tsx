import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { AFRICA_COUNTRIES, findCountry } from "@/lib/africa-locations";

export interface LocationValue {
  country: string;
  city: string;
  area: string;
}

interface Props {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  required?: boolean;
  compact?: boolean;
  labelPrefix?: string;
}

/**
 * Country → City → Area picker for all 54 African countries.
 * - Country: dropdown of the 54 countries.
 * - City: dropdown seeded from the country's major cities; users can type a
 *   custom one via the "Other" option.
 * - Area: free-text (neighbourhood / estate / suburb, e.g. "Westlands").
 */
export function LocationPicker({
  value,
  onChange,
  required = false,
  compact = false,
  labelPrefix = "",
}: Props) {
  const country = useMemo(() => findCountry(value.country), [value.country]);
  const cityOptions = country?.cities ?? [];
  const cityIsCustom = !!value.city && !cityOptions.includes(value.city);

  const wrap = compact ? "grid gap-2 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-3";
  const inputCls =
    "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-baba-slate focus:border-baba-blue focus:outline-none";
  const labelCls = "text-xs font-bold uppercase tracking-wide text-baba-slate/70";

  return (
    <div className={wrap}>
      <label className="grid gap-1.5">
        <span className={labelCls}>{labelPrefix}Country{required && " *"}</span>
        <select
          required={required}
          value={value.country}
          onChange={(e) => onChange({ country: e.target.value, city: "", area: value.area })}
          className={inputCls}
        >
          <option value="">Select country…</option>
          {AFRICA_COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className={labelCls}>{labelPrefix}City{required && " *"}</span>
        {cityOptions.length && !cityIsCustom ? (
          <select
            required={required}
            value={value.city}
            onChange={(e) => {
              if (e.target.value === "__custom__") onChange({ ...value, city: " " });
              else onChange({ ...value, city: e.target.value });
            }}
            disabled={!value.country}
            className={inputCls}
          >
            <option value="">Select city…</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__custom__">Other (type it)…</option>
          </select>
        ) : (
          <div className="flex gap-1">
            <input
              required={required}
              value={value.city.trim()}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              placeholder="Type city"
              disabled={!value.country}
              className={inputCls}
            />
            {cityOptions.length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...value, city: "" })}
                className="rounded-lg border border-input px-2 text-xs text-baba-slate/60"
                title="Pick from list"
              >
                List
              </button>
            )}
          </div>
        )}
      </label>

      <label className="grid gap-1.5">
        <span className={labelCls}>
          {labelPrefix}Area / Estate{required && " *"}
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:border-baba-blue">
          <MapPin className="h-4 w-4 text-baba-slate/40" />
          <input
            required={required}
            value={value.area}
            onChange={(e) => onChange({ ...value, area: e.target.value })}
            placeholder="e.g. Westlands, South C, Lekki Phase 1"
            disabled={!value.city.trim()}
            className="w-full bg-transparent py-2 text-sm text-baba-slate focus:outline-none"
          />
        </div>
      </label>
    </div>
  );
}

export const EMPTY_LOCATION: LocationValue = { country: "", city: "", area: "" };
