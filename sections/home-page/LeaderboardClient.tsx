'use client';
import { useState, useMemo } from 'react';
import { SortTable, type Column, type SortDirection } from '@/components/SortTable';
import { formatPct } from '@/helpers/formatPercent';

export type LeaderboardRow = {
  player_id: number;
  player_name: string;
  games_played: number;
  wins: number;
  win_percentage: number;
  competitiveness_percentage: number;
};

type Metric = 'win_percentage' | 'competitiveness_percentage';

const COLUMNS: Column<LeaderboardRow>[] = [
  { key: 'player_name', label: 'Player', width: '24%', truncate: true },
  { key: 'games_played', label: 'Played', align: 'right', width: '19%' },
  { key: 'wins', label: 'Wins', align: 'right', width: '17%' },
  { key: 'win_percentage', label: 'Win %', align: 'right', width: '20%', render: formatPct },
  { key: 'competitiveness_percentage', label: 'Comp. %', align: 'right', width: '20%', render: formatPct },
];

const getTopPlayers = (rows: LeaderboardRow[], metric: Metric) => {
  const groups: LeaderboardRow[][] = [];
  const sorted = [...rows].sort((a, b) => b[metric] - a[metric]);
  let current: number | null = null;
  let group: LeaderboardRow[] = [];

  for (const row of sorted) {
    if (current !== row[metric]) {
      if (group.length) groups.push(group);
      if (groups.length >= 5) break;
      current = row[metric];
      group = [row];
    } else {
      group.push(row);
    }
  }
  if (groups.length < 5 && group.length) groups.push(group);
  return groups;
};

const TopPlayerEntry = ({
  group,
  metric,
  max,
  barClassName,
}: {
  group: LeaderboardRow[];
  metric: Metric;
  max: number;
  barClassName: string;
}) => {
  const val = group[0][metric];
  const pct = max > 0 ? (val / max) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="truncate">{group.map(p => p.player_name).join(' / ')}</span>
        <span className="shrink-0 font-medium">{formatPct(val)}</span>
      </div>
      <div className="h-2 bg-neutral-100 overflow-hidden">
        <div className={`h-full transition-all ${barClassName}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
    </div>
  );
};

const TopSection = ({
  title,
  groups,
  metric,
  barClassName,
}: {
  title: string;
  groups: LeaderboardRow[][];
  metric: Metric;
  barClassName: string;
}) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-xs font-medium">{title}</h3>
    <div className="flex flex-col gap-1">
      {groups.map((group, i) => (
        <TopPlayerEntry
          key={i}
          group={group}
          metric={metric}
          max={groups[0]?.[0]?.[metric] ?? 0}
          barClassName={barClassName}
        />
      ))}
    </div>
  </div>
);

export default function LeaderboardClient({ rows: rawRows }: { rows: LeaderboardRow[] }) {
  const [sort, setSort] = useState<keyof LeaderboardRow>('win_percentage');
  const [dir, setDir] = useState<SortDirection>('desc');

  const rows = useMemo(
    () => rawRows.map(r => ({
      ...r,
      games_played: Number(r.games_played),
      wins: Number(r.wins),
      win_percentage: Number(r.win_percentage),
      competitiveness_percentage: Number(r.competitiveness_percentage),
    })),
    [rawRows]
  );

  const topWin = getTopPlayers(rows, 'win_percentage');
  const topComp = getTopPlayers(rows, 'competitiveness_percentage');

  return (
    <div className="w-full max-w-7xl mx-auto py-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopSection title="Top 5 Win %" groups={topWin} metric="win_percentage" barClassName="bg-red-500" />
        <TopSection title="Top 5 Comp. %" groups={topComp} metric="competitiveness_percentage" barClassName="bg-neutral-600" />
      </div>
      <div className="rounded-sm overflow-hidden">
        <SortTable
          data={rows}
          columns={COLUMNS}
          sortKey={sort}
          sortDirection={dir}
          onSort={key => {
            setDir(sort === key && dir === 'desc' ? 'asc' : 'desc');
            setSort(key);
          }}
          maxHeight="244px"
          getRowKey={r => r.player_id}
        />
      </div>
    </div>
  );
}
