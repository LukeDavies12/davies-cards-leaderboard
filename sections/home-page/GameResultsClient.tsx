'use client';

import { useMemo, useState } from 'react';
import { SortTable, type Column, type SortDirection } from '@/components/SortTable';
import { formatGameDateMmDdYy } from '@/helpers/dateFormatters';
import { useSession } from '@/sections/shared/SessionProvider';
import { EditGameButton } from './EditGameButton';
import { GameDeleteButton } from './GameDeleteButton';
import { GameScoresInfo } from './GameScoresInfo';

export const GAME_LIST_PAGE_SIZE = 25;

export type GameResultRow = {
  id: number;
  date: string;
  location_name: string;
  message: string | null;
  players_count: number;
  winning_score: number;
  winning_player_name: string;
};

type ParsedGameResultRow = Omit<GameResultRow, 'date'> & { date: Date };

export default function GameResultsClient({
  rows: rawRows,
  onLoadMore,
  isLoadingMore = false,
}: {
  rows: GameResultRow[];
  onLoadMore?: (offsetRows: number) => void;
  isLoadingMore?: boolean;
}) {
  const { session } = useSession();
  const [sort, setSort] = useState<keyof ParsedGameResultRow>('date');
  const [dir, setDir] = useState<SortDirection>('desc');

  const columns = useMemo<Column<ParsedGameResultRow>[]>(() => {
    const base: Column<ParsedGameResultRow>[] = [
      {
        key: 'date',
        label: 'Date',
        width: '100px',
        render: (value) => {
          if (!value || !(value instanceof Date)) return '';
          return formatGameDateMmDdYy(value.toISOString());
        },
      },
      { key: 'location_name', label: 'Location', width: '160px' },
      {
        key: 'message',
        label: 'Message',
        render: (value) => {
          const text = value == null ? '' : String(value);
          return (
            <span className="block truncate" title={text || undefined}>
              {text}
            </span>
          );
        },
      },
      { key: 'players_count', label: 'Players', align: 'right', width: '70px' },
      { key: 'winning_player_name', label: 'Winner', width: '160px' },
      { key: 'winning_score', label: 'Score', align: 'right', width: '70px' },
      {
        id: 'actions',
        key: 'id',
        label: '',
        align: 'right',
        width: session ? '140px' : '72px',
        hideHeader: true,
        render: (_, row) => (
          <div className="flex items-center justify-end gap-2">
            <GameScoresInfo gameId={row.id} />
            {session ? (
              <>
                <EditGameButton gameId={row.id} />
                <GameDeleteButton gameId={row.id} />
              </>
            ) : null}
          </div>
        ),
      },
    ];

    return base;
  }, [session]);

  const rows = useMemo(
    () =>
      rawRows.map((r) => ({
        ...r,
        date: typeof r.date === 'string' ? new Date(r.date) : r.date,
        players_count: Number(r.players_count),
        winning_score: Number(r.winning_score),
      })),
    [rawRows],
  );

  return (
    <div className="mx-auto w-full max-w-7xl py-4">
      <h2 className="mb-2 font-bold">Games Log</h2>
      <div className="rounded-sm">
        <SortTable
          data={rows}
          columns={columns}
          sortKey={sort}
          sortDirection={dir}
          onSort={(key) => {
            setDir(sort === key && dir === 'desc' ? 'asc' : 'desc');
            setSort(key);
          }}
          maxHeight="400px"
          getRowKey={(r) => r.id}
          offsetRows={rawRows.length}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
        />
      </div>
    </div>
  );
}
