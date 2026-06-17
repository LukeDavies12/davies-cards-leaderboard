'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { SortTable, type Column, type SortDirection } from '@/components/SortTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatGameDateMmDdYy } from '@/helpers/dateFormatters';

export type GameRow = {
  id: number;
  date: string;
  location_name: string;
  message: string | null;
  players_count: number;
  winning_score: number;
  winning_player_name: string;
};

type ParsedGameRow = Omit<GameRow, 'date'> & { date: Date };

const COLUMNS: Column<ParsedGameRow>[] = [
  {
    key: 'date',
    label: 'Date',
    width: '120px',
    render: (value) => {
      if (!value || !(value instanceof Date)) return '';
      return formatGameDateMmDdYy(value.toISOString());
    }
  },
  { key: 'location_name', label: 'Location', width: '140px' },
  { key: 'players_count', label: 'Players', align: 'right', width: '70px' },
  { key: 'winning_score', label: 'Score', align: 'right', width: '70px' },
  { key: 'winning_player_name', label: 'Winner', width: '140px' },
];

export default function GamesLogClient({
  initialRows,
  onLoadMore,
  isLoading = false,
}: {
  initialRows: GameRow[];
  onLoadMore: () => Promise<void>;
  isLoading?: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [sort, setSort] = useState<keyof ParsedGameRow>('date');
  const [dir, setDir] = useState<SortDirection>('desc');
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        date: typeof r.date === 'string' ? new Date(r.date) : r.date,
        players_count: Number(r.players_count),
        winning_score: Number(r.winning_score),
      })),
    [rows]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 200 && !isLoading) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, isLoading]);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 flex flex-col gap-4">
      <div ref={containerRef} className="rounded-sm overflow-hidden">
        <SortTable
          data={parsed}
          columns={COLUMNS}
          sortKey={sort}
          sortDirection={dir}
          onSort={(key) => {
            setDir(sort === key && dir === 'desc' ? 'asc' : 'desc');
            setSort(key);
          }}
          maxHeight="500px"
          getRowKey={(r) => r.id}
        />
      </div>
      {isLoading && (
        <div className="flex justify-center py-1">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}