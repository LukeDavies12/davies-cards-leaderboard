'use client';

import { formatGameDateMmDdYy } from '@/helpers/dateFormatters';
import { HighScoreGroupInfo } from './HighScoreGroupInfo';

export type HighScoreRow = {
  player_count: number;
  player_id: number;
  player_name: string;
  score: number;
  game_id: number;
  game_date: string;
  game_location: string;
  score_rank: number;
};

function groupScores(rows: HighScoreRow[]): Map<number, HighScoreRow[][]> {
  const grouped = new Map<number, HighScoreRow[][]>();

  for (const row of rows) {
    if (!grouped.has(row.player_count)) {
      grouped.set(row.player_count, []);
    }

    const scoreGroups = grouped.get(row.player_count)!;
    const lastGroup = scoreGroups.at(-1);

    if (lastGroup?.at(0)?.score_rank === row.score_rank) {
      lastGroup.push(row);
    } else {
      scoreGroups.push([row]);
    }
  }

  return grouped;
}

function ScoreEntry({ group }: { group: HighScoreRow[] }) {
  const gameCount = new Set(group.map((r) => r.game_id)).size;
  const playerNames = [...new Set(group.map((r) => r.player_name))]
    .sort()
    .join(' / ');

  return (
    <li className="flex min-w-0 flex-col gap-1">
      <div className="flex justify-between gap-3">
        <span className="min-w-0 truncate">{playerNames}</span>
        <span className="shrink-0 font-medium">{group[0].score}</span>
      </div>
      <div className="inline-flex items-center gap-1 text-xs text-neutral-600">
        {gameCount === 1 ? (
          <>
            <span>{formatGameDateMmDdYy(group[0].game_date)}</span>
            {group[0].game_location && (
              <span className="text-neutral-500">{group[0].game_location}</span>
            )}
          </>
        ) : (
          <>
            <span>{gameCount} games</span>
            <HighScoreGroupInfo
              rows={group.map((r) => ({
                player_id: r.player_id,
                game_id: r.game_id,
                player_name: r.player_name,
                game_date: r.game_date,
                game_location: r.game_location,
              }))}
            />
          </>
        )}
      </div>
    </li>
  );
}

export default function HighScoresMatrixClient({
  rows,
}: {
  rows: HighScoreRow[];
}) {
  const byPlayerCount = groupScores(rows);

  return (
    <div className="mx-auto w-full max-w-7xl py-4">
      <h2 className="mb-2 font-bold">High Scores by # of Players</h2>
      <div className="grid max-h-[min(24rem,55vh)] grid-cols-1 gap-4 overflow-y-auto sm:max-h-none sm:overflow-visible sm:grid-cols-2 lg:grid-cols-4">
        {Array.from(byPlayerCount).map(([n, groups]) => (
          <section key={n} className="flex min-w-0 flex-col gap-2">
            <h3>
              {n}{' '}
              <span className="text-neutral-400">
                {n === 1 ? 'player' : 'players'}
              </span>
            </h3>
            <ul className="flex flex-col gap-1">
              {groups.map((group) => (
                <ScoreEntry key={group[0].score_rank} group={group} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
