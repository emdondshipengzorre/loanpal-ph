"use client";

import { useRef, useState } from "react";
import { Search, X, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LENDING_APPS, LendingApp, getLendingApp } from "@/lib/lending-apps";

interface AppPickerProps {
  value: string;
  onChange: (id: string) => void;
  id?: string;
}

const CATEGORY_LABELS: Record<LendingApp["category"], string> = {
  lending: "Lending Apps",
  bnpl: "Buy Now, Pay Later",
  ewallet: "E-Wallet Loans",
  bank: "Banks & Digital Banks",
};

const CATEGORY_ORDER: LendingApp["category"][] = [
  "lending",
  "bnpl",
  "ewallet",
  "bank",
];

function AppIconInner({ app, size = 24 }: { app: LendingApp; size?: number }) {
  const [error, setError] = useState(false);

  if (!app.iconUrl || error) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-muted"
        style={{ width: size, height: size }}
      >
        <Building2 className="text-muted-foreground" style={{ width: size * 0.55, height: size * 0.55 }} />
      </div>
    );
  }

  return (
    <img
      src={app.iconUrl}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-lg"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

export function LendingAppIcon({ appId, size = 24 }: { appId: string; size?: number }) {
  const app = getLendingApp(appId);
  if (!app) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {appId.charAt(0)}
      </div>
    );
  }
  return <AppIconInner app={app} size={size} />;
}

export function AppPickerDisplay({ appId }: { appId: string }) {
  const app = getLendingApp(appId);
  if (!app) return <span>{appId}</span>;
  return (
    <span className="flex items-center gap-2">
      <AppIconInner app={app} size={20} />
      <span className="truncate">{app.name}</span>
    </span>
  );
}

export function AppPicker({ value, onChange, id }: AppPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedApp = getLendingApp(value);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? LENDING_APPS.filter(
        (a) =>
          a.id !== "Other" &&
          (a.name.toLowerCase().includes(query) ||
            a.id.toLowerCase().includes(query))
      )
    : LENDING_APPS.filter((a) => a.id !== "Other");

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    apps: filtered.filter((a) => a.category === cat),
  })).filter((g) => g.apps.length > 0);

  const otherApp = LENDING_APPS.find((a) => a.id === "Other")!;

  function handleSelect(appId: string) {
    onChange(appId);
    setSearch("");
    setOpen(false);
  }

  function handleBlur(e: React.FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      {value && !open ? (
        <button
          id={id}
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm transition-colors hover:bg-accent"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          {selectedApp && <AppIconInner app={selectedApp} size={20} />}
          <span className="flex-1 truncate text-left">
            {selectedApp?.name ?? value}
          </span>
          <X
            className="size-3.5 shrink-0 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        </button>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id={id}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search lending apps..."
            className="pl-8"
            autoComplete="off"
          />
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 max-h-[280px] w-full overflow-y-auto rounded-xl border bg-popover shadow-md">
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="sticky top-0 bg-popover px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
              {group.apps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(app.id)}
                >
                  <AppIconInner app={app} size={24} />
                  <span className="truncate">{app.name}</span>
                </button>
              ))}
            </div>
          ))}

          <div className="border-t">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect("Other")}
            >
              <AppIconInner app={otherApp} size={24} />
              <span>Other (enter name manually)</span>
            </button>
          </div>

          {query && filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No apps found for &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
