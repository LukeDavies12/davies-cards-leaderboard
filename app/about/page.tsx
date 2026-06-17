import AppShell from '@/sections/shared/AppShell';

export default function AboutPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-2xl px-3 py-6 lg:px-4">
        <h1 className="text-lg font-bold">About</h1>

        <section className="mt-6 flex flex-col gap-2">
          <h2 className="font-semibold">Competitiveness %</h2>
          <p className="text-neutral-700">
            Competitiveness % = on average, what percentage of the players in your games do you
            finish ahead of?
          </p>
          <p className="text-neutral-500">
            A higher Comp. % means you usually beat more of the field, even in games you do not
            win outright.
          </p>
        </section>

        <section className="mt-8 flex flex-col gap-2">
          <h2 className="font-semibold">How to log a game</h2>
          <ol className="list-decimal space-y-2 pl-5 text-neutral-700">
            <li>Click <strong>Log Game</strong> in the header and sign in with your account.</li>
            <li>Confirm the date (defaults to today).</li>
            <li>Select a location from the list, or type a new one to create it.</li>
            <li>
              Enter player scores like <strong>Claire 182 Jake 144 Trent 181..</strong>
            </li>
            <li>Add an optional message, then submit.</li>
          </ol>
        </section>
      </main>
    </AppShell>
  );
}
