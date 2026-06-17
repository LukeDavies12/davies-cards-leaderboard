"use client"

import { useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { LoadingSpinner } from "@/components/LoadingSpinner"

export type SortDirection = "asc" | "desc"

export interface Column<T> {
  id?: string
  key: keyof T
  label: string
  align?: "left" | "right"
  width?: string
  hideHeader?: boolean
  truncate?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface SortTableProps<T extends { [key: string]: any }> {
  data: T[]
  columns: Column<T>[]
  sortKey: keyof T
  sortDirection: SortDirection
  onSort: (key: keyof T) => void
  maxHeight?: string
  minWidth?: string
  getRowKey: (row: T) => string | number
  getRowClassName?: (row: T) => string | undefined
  offsetRows?: number
  onLoadMore?: (offsetRows: number) => void
  isLoadingMore?: boolean
}

export function SortTable<T extends { [key: string]: any }>({
  data,
  columns,
  sortKey,
  sortDirection,
  onSort,
  maxHeight = "280px",
  minWidth,
  getRowKey,
  getRowClassName,
  offsetRows,
  onLoadMore,
  isLoadingMore = false,
}: SortTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onLoadMore) return

    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      if (isLoadingMore) return
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - scrollTop - clientHeight < 200) {
        onLoadMore(offsetRows ?? data.length)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [onLoadMore, isLoadingMore, offsetRows, data.length])

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortKey as string]
    const bVal = b[sortKey as string]
    const multiplier = sortDirection === "asc" ? 1 : -1

    if (typeof aVal === "string" && typeof bVal === "string") {
      const aNum = parseFloat(aVal)
      const bNum = parseFloat(bVal)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return (aNum - bNum) * multiplier
      }
      return aVal.localeCompare(bVal) * multiplier
    }
    return ((aVal as number) - (bVal as number)) * multiplier
  })

  const SortButton = ({ column }: { column: Column<T> }) => {
    const isActive = sortKey === column.key
    const align = column.align || "left"
    const alignClass = align === "right" ? "justify-end" : "justify-start"

    if (column.hideHeader) return null

    return (
      <button
        onClick={() => onSort(column.key)}
        className={`flex w-full items-center gap-1 whitespace-nowrap hover:text-neutral-900 transition-colors ${alignClass}`}
      >
        {column.label}
        <span className="w-3 h-3 inline-flex items-center justify-center">
          {isActive &&
            (sortDirection === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            ))}
        </span>
      </button>
    )
  }

  const cellClassName = (column: Column<T>, index: number) => {
    const align = column.align || "left"
    const isFirst = index === 0
    const isLast = index === columns.length - 1
    const alignClass = align === "right" ? "text-right" : "text-left"
    const padClass = isFirst
      ? "pl-0 pr-3"
      : isLast
        ? align === "right"
          ? "pl-2 pr-4"
          : "pl-2 pr-3"
        : "px-2"
    const truncateClass = column.truncate ? "max-w-0 overflow-hidden" : ""
    return `py-1 ${padClass} ${alignClass} ${truncateClass}`.trim()
  }

  const renderCellContent = (column: Column<T>, row: T) => {
    const value = row[column.key as string]

    if (column.render) {
      return column.render(value, row)
    }

    if (column.truncate) {
      const text = value == null ? "" : String(value)
      return (
        <span className="block truncate" title={text || undefined}>
          {text}
        </span>
      )
    }

    return value
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto [scrollbar-gutter:stable]"
        style={{ maxHeight }}
      >
        <table
          className="w-full table-fixed"
          style={minWidth ? { minWidth } : undefined}
        >
        <colgroup>
          {columns.map((column, index) => (
            <col
              key={column.id ?? `${String(column.key)}-${index}`}
              style={column.width ? { width: column.width } : undefined}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <tr className="text-left text-xs text-neutral-500 border-b border-neutral-200">
            {columns.map((column, index) => (
              <th
                key={column.id ?? `${String(column.key)}-${index}`}
                className={`pb-1 font-medium ${cellClassName(column, index)}`}
                style={{ width: column.width }}
              >
                <SortButton column={column} />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row) => (
            <tr
              key={getRowKey(row)}
              className={[
                "text-sm border-b border-neutral-100",
                getRowClassName?.(row),
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {columns.map((column, index) => (
                <td
                  key={column.id ?? `${String(column.key)}-${index}`}
                  className={cellClassName(column, index)}
                  style={{
                    width: column.width,
                    color:
                      column.align === "right"
                        ? "rgb(55, 65, 81)"
                        : "inherit",
                  }}
                >
                  {renderCellContent(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {isLoadingMore && (
        <div className="flex justify-center py-1">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}