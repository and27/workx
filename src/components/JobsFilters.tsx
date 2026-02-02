"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type jobsFiltersProps = {
  sources: string[];
  initialSearch: string;
  initialSource: string;
  initialTriage: string;
};

const normalizeValue = (value: string) => value.trim();

export default function JobsFilters({
  sources,
  initialSearch,
  initialSource,
  initialTriage,
}: jobsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  const sourceValue = normalizeValue(initialSource || "all");
  const triageValue = normalizeValue(initialTriage || "shortlist");

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    const trimmed = search.trim();
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (!trimmed) {
        params.delete("q");
      } else {
        params.set("q", trimmed);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  const sourceOptions = useMemo(
    () => sources.filter(Boolean).sort(),
    [sources]
  );

  const handleClear = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <label className="text-xs text-muted-foreground" htmlFor="q">
          Buscar
        </label>
        <Input
          id="q"
          name="q"
          value={search}
          className="mt-1"
          placeholder="Empresa o rol"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="min-w-[160px]">
        <label className="text-xs text-muted-foreground" htmlFor="source">
          Fuente
        </label>
        <Select
          value={sourceValue}
          onValueChange={(value) => updateQuery("source", value)}
        >
          <SelectTrigger id="source" className="mt-1 w-full">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {sourceOptions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[180px]">
        <label className="text-xs text-muted-foreground" htmlFor="triage">
          Triage
        </label>
        <Select
          value={triageValue}
          onValueChange={(value) => updateQuery("triage", value)}
        >
          <SelectTrigger id="triage" className="mt-1 w-full">
            <SelectValue placeholder="Seleccionados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shortlist">Seleccionados</SelectItem>
            <SelectItem value="maybe">Quizas</SelectItem>
            <SelectItem value="reject">Rechazados</SelectItem>
            <SelectItem value="retriage">Re-analizar</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center">
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
