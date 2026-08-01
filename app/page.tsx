import Link from "next/link";

const highlights = [
  "Verified artisan profiles",
  "Country and trade based discovery",
  "Job posting and bid workflows",
  "Secure project coordination",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10 lg:px-12">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          CredibleArtisans.com
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          Connect with trusted artisans across multiple countries.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          Discover verified professionals, post service needs, and hire with confidence on a single platform built for customers and artisans.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Explore the platform
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {highlights.map((item) => (
          <article
            key={item}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-100">{item}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
