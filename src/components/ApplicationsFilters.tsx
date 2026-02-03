"use client";

import { useEffect, useState } from "react";
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
import { applicationStatus } from "@/src/domain/types/application-status";
import { priority } from "@/src/domain/types/priority";

type applicationsFiltersProps = {
  initialSearch: string;
  initialStatus: applicationStatus | "all";
  initialPriority: priority | "all";
};

const normalizeValue = (value: string) => value.trim();

export default function ApplicationsFilters({
  initialSearch,
  initialStatus,
  initialPriority,
}: applicationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  const statusValue = normalizeValue(initialStatus || "all");
  const priorityValue = normalizeValue(initialPriority || "all");

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    if (query === searchParams.toString()) {
      return;
    }
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  useEffect(() => {
    const trimmed = search.trim();
    const currentQuery = searchParams.get("q") ?? "";
    if (trimmed === currentQuery) {
      return;
    }
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (!trimmed) {
        params.delete("q");
      } else {
        params.set("q", trimmed);
      }
      const query = params.toString();
      if (query === searchParams.toString()) {
        return;
      }
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, pathname, router, searchParams]);

  const handleClear = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
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
        <label className="text-xs text-muted-foreground" htmlFor="status">
          Estado
        </label>
        <Select
          value={statusValue}
          onValueChange={(value) => updateQuery("status", value)}
        >
          <SelectTrigger id="status" className="mt-1 w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="saved">saved</SelectItem>
            <SelectItem value="applied">applied</SelectItem>
            <SelectItem value="screen">screen</SelectItem>
            <SelectItem value="tech">tech</SelectItem>
            <SelectItem value="offer">offer</SelectItem>
            <SelectItem value="rejected">rejected</SelectItem>
            <SelectItem value="ghosted">ghosted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-[140px]">
        <label className="text-xs text-muted-foreground" htmlFor="priority">
          Prioridad
        </label>
        <Select
          value={priorityValue}
          onValueChange={(value) => updateQuery("priority", value)}
        >
          <SelectTrigger id="priority" className="mt-1 w-full">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">low</SelectItem>
            <SelectItem value="medium">medium</SelectItem>
            <SelectItem value="high">high</SelectItem>
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
