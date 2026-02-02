"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type jobsPaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function JobsPagination({
  total,
  page,
  pageSize,
  defaultPageSize = 25,
  pageSizeOptions = [25, 50],
}: jobsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clamp(page, 1, totalPages);
  const range = useMemo(() => {
    if (total === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(total, currentPage * pageSize);
    return { start, end };
  }, [currentPage, pageSize, total]);

  const updateQuery = (next: { page?: number; pageSize?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (typeof next.page === "number") {
      if (next.page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(next.page));
      }
    }
    if (typeof next.pageSize === "number") {
      if (next.pageSize === defaultPageSize) {
        params.delete("pageSize");
      } else {
        params.set("pageSize", String(next.pageSize));
      }
    }
    const query = params.toString();
    if (query === searchParams.toString()) {
      return;
    }
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  };

  const handlePageSizeChange = (value: string) => {
    const nextPageSize = Number.parseInt(value, 10);
    if (!Number.isFinite(nextPageSize)) {
      return;
    }
    updateQuery({ page: 1, pageSize: nextPageSize });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
      <div className="text-muted-foreground">
        Mostrando {range.start}-{range.end} de {total}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Por pagina</span>
          <Select
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[90px]">
              <SelectValue placeholder={String(defaultPageSize)} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateQuery({ page: currentPage - 1 })}
          >
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Pagina {currentPage} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateQuery({ page: currentPage + 1 })}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
