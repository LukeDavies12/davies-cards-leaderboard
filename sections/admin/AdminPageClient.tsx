'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import BaseInput from '@/components/BaseInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import { SortTable, type Column, type SortDirection } from '@/components/SortTable';
import {
  deleteLocation,
  deletePlayer,
  fetchAdminLocations,
  fetchAdminPlayers,
  updateLocation,
  updatePlayer,
  type AdminLocationRow,
  type AdminPlayerRow,
} from '@/sections/admin/adminActions';
import { useSession } from '@/sections/shared/SessionProvider';

function AdminEntityTable({
  title,
  rows,
  onSave,
  onDelete,
}: {
  title: string;
  rows: AdminPlayerRow[] | AdminLocationRow[];
  onSave: (id: number, name: string) => Promise<{ error?: string }>;
  onDelete: (id: number) => Promise<{ error?: string }>;
}) {
  const [sort, setSort] = useState<keyof AdminPlayerRow>('name');
  const [dir, setDir] = useState<SortDirection>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setError('');
  };

  const handleSave = async (id: number) => {
    setSubmitting(true);
    setError('');
    const result = await onSave(id, editName);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    cancelEdit();
  };

  const handleDelete = async (row: AdminPlayerRow | AdminLocationRow) => {
    if (row.games_count > 0) return;
    if (!window.confirm(`Delete "${row.name}"?`)) return;

    setSubmitting(true);
    setError('');
    const result = await onDelete(row.id);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  };

  const columns: Column<AdminPlayerRow>[] = [
    {
      key: 'name',
      label: 'Name',
      width: '240px',
      render: (_, row) =>
        editingId === row.id ? (
          <BaseInput
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            aria-label={`Edit ${title.slice(0, -1)} name`}
            className="relative z-20 bg-white focus:ring-inset"
            autoFocus
          />
        ) : (
          row.name
        ),
    },
    {
      key: 'games_count',
      label: 'Games',
      align: 'right',
      width: '80px',
    },
    {
      id: 'actions',
      key: 'id',
      label: '',
      align: 'right',
      width: '160px',
      hideHeader: true,
      render: (_, row) =>
        editingId === row.id ? (
          <div className="flex justify-end gap-2">
            <PrimaryButton
              type="button"
              disabled={submitting}
              onClick={() => handleSave(row.id)}
            >
              Save
            </PrimaryButton>
            <SecondaryButton type="button" onClick={cancelEdit}>
              Cancel
            </SecondaryButton>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <SecondaryButton
              type="button"
              onClick={() => {
                setEditingId(row.id);
                setEditName(row.name);
                setError('');
              }}
            >
              Edit
            </SecondaryButton>
            <button
              type="button"
              disabled={row.games_count > 0 || submitting}
              title={
                row.games_count > 0
                  ? 'Cannot delete while games are logged'
                  : 'Delete'
              }
              onClick={() => handleDelete(row)}
              className="cursor-pointer text-xs text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-neutral-300"
            >
              Delete
            </button>
          </div>
        ),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold">{title}</h2>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="rounded-sm">
        <SortTable
          data={rows}
          columns={columns}
          sortKey={sort}
          sortDirection={dir}
          onSort={(key) => {
            setDir(sort === key && dir === 'asc' ? 'desc' : 'asc');
            setSort(key);
          }}
          maxHeight="320px"
          getRowKey={(row) => row.id}
          getRowClassName={(row) =>
            editingId === row.id
              ? 'relative z-20 [&>td]:relative [&>td]:z-20 [&>td]:bg-white'
              : undefined
          }
        />
      </div>
    </section>
  );
}

export default function AdminPageClient() {
  const { session, isLoaded } = useSession();
  const [players, setPlayers] = useState<AdminPlayerRow[]>([]);
  const [locations, setLocations] = useState<AdminLocationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [playerRows, locationRows] = await Promise.all([
        fetchAdminPlayers(),
        fetchAdminLocations(),
      ]);
      setPlayers(playerRows);
      setLocations(locationRows);
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    loadData();
  }, [session, loadData]);

  const handlePlayerSave = async (id: number, name: string) => {
    const result = await updatePlayer(id, name);
    if (!result.error) await loadData();
    return result;
  };

  const handlePlayerDelete = async (id: number) => {
    const result = await deletePlayer(id);
    if (!result.error) await loadData();
    return result;
  };

  const handleLocationSave = async (id: number, name: string) => {
    const result = await updateLocation(id, name);
    if (!result.error) await loadData();
    return result;
  };

  const handleLocationDelete = async (id: number) => {
    const result = await deleteLocation(id);
    if (!result.error) await loadData();
    return result;
  };

  if (!isLoaded) return null;

  if (!session) {
    return (
      <main className="mx-auto w-full max-w-4xl px-3 py-6 lg:px-4">
        <h1 className="text-lg font-bold">Admin</h1>
        <p className="mt-4 text-neutral-600">
          Sign in to manage players and locations.{' '}
          <Link href="/" className="underline hover:text-neutral-900">
            Go home
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-3 py-6 lg:px-4">
      <div>
        <h1 className="text-lg font-bold">Admin</h1>
        <p className="mt-1 text-neutral-500">
          Update names or delete players and locations that have no logged games.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <AdminEntityTable
        title="Players"
        rows={players}
        onSave={handlePlayerSave}
        onDelete={handlePlayerDelete}
      />

      <AdminEntityTable
        title="Locations"
        rows={locations}
        onSave={handleLocationSave}
        onDelete={handleLocationDelete}
      />
    </main>
  );
}
