import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl tracking-tight text-white">
          Quad
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/directory" className="transition hover:text-white">
            Directory
          </Link>
          <Link href="/assistant" className="transition hover:text-white">
            Assistant
          </Link>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-500">
            .edu only
          </span>
        </nav>
      </div>
    </header>
  );
}
