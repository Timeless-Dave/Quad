import Link from "next/link";

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl tracking-tight">
          Quad
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-neutral-500 md:flex">
          <Link href="/directory" className="transition hover:text-black">
            Directory
          </Link>
          <Link href="/assistant" className="transition hover:text-black">
            Assistant
          </Link>
          <Link href="#how-it-works" className="transition hover:text-black">
            How it works
          </Link>
          <Link href="#features" className="transition hover:text-black">
            Features
          </Link>
        </nav>
        <Link
          href="/sign-in"
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_70%)]" />
      <div className="mx-auto max-w-4xl text-center">
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-medium text-neutral-600">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          Built for .edu students
        </div>
        <h1 className="animate-fade-in-delay-1 font-serif text-5xl leading-[1.1] tracking-tight md:text-7xl">
          Your AI-Powered
          <br />
          Campus <em>Assistant</em>
        </h1>
        <p className="animate-fade-in-delay-2 mx-auto mt-6 max-w-xl text-lg text-neutral-500">
          Find faculty. Navigate campus. Get things done — with an agentic AI assistant built for .edu students.
        </p>
        <div className="animate-fade-in-delay-3 mt-10 flex items-center justify-center gap-4">
          <Link
            href="/assistant"
            className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Open assistant
          </Link>
          <Link
            href="/directory"
            className="rounded-full border border-neutral-300 bg-white px-7 py-3 text-sm font-medium text-black transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Browse directory
          </Link>
        </div>
      </div>

      {/* Draft preview mockup */}
      <div className="animate-fade-in-delay-3 mx-auto mt-16 max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-float-lg">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-neutral-200" />
            <span className="h-3 w-3 rounded-full bg-neutral-200" />
            <span className="h-3 w-3 rounded-full bg-neutral-200" />
            <span className="ml-4 text-xs text-neutral-400">quad — campus assistant</span>
          </div>
          <div className="grid gap-px bg-neutral-100 md:grid-cols-2">
            <div className="space-y-3 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">Inputs</p>
              <div className="space-y-2">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                  Dr. Evelyn Thomas
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                  SWE Internship at Google
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                  Data Structures · A
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
                  3.8 GPA · ACM chapter lead · built a full-stack project tracker...
                </div>
              </div>
              <div className="rounded-lg bg-black px-4 py-2.5 text-center text-sm font-medium text-white">
                Generate &amp; send
              </div>
            </div>
            <div className="space-y-3 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">Output</p>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-600">
                <p className="font-medium text-black">Subject: Request for Recommendation — SWE Internship at Google</p>
                <br />
                <p>Dear Dr. Thomas,</p>
                <br />
                <p>
                  I hope you are doing well. I am applying for a SWE Internship at Google and would be grateful if you
                  could write me a letter of recommendation...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const trustedLabels = [
  "University of Arkansas at Pine Bluff",
  "Launching at more campuses",
  "Any .edu school",
  "Your university next",
  "Expanding nationwide",
  "Built for every campus",
];

function TrustedBar() {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-8">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-neutral-400">
        Launching at universities across the country
      </p>
      <div className="relative overflow-hidden">
        <div className="animate-marquee flex w-max items-center gap-16 px-8">
          {[...trustedLabels, ...trustedLabels].map((label, i) => (
            <span key={i} className="whitespace-nowrap text-sm font-medium text-neutral-300">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ number, label, sub }: { number: string; label: string; sub: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
      <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[10px]">{number}</span>
      <span>·</span>
      <span>{label}</span>
      <span className="hidden md:inline">·</span>
      <span className="hidden md:inline">{sub}</span>
    </div>
  );
}

const steps = [
  {
    step: "01",
    title: "Sign in with your .edu",
    description:
      "Authenticate with Microsoft or Google. Quad instantly scopes everything to your campus — faculty, buildings, and resources.",
  },
  {
    step: "02",
    title: "Ask the assistant",
    description:
      "Chat naturally. Find a professor's office, draft an email, look up campus services — Quad handles it conversationally.",
  },
  {
    step: "03",
    title: "Get things done",
    description:
      "Act on answers immediately. Send emails, navigate to buildings, or save info — all without leaving the assistant.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionLabel number="01" label="Workflow" sub="Three simple steps" />
        <h2 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          Start drafting <em>today</em>
        </h2>
        <p className="mt-4 max-w-lg text-neutral-500">
          No sign-up friction. Just a clean workflow that gets you from zero to a polished email fast.
        </p>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group rounded-2xl border border-neutral-200 bg-white p-8 transition hover:border-neutral-300 hover:shadow-float"
            >
              <span className="mb-4 inline-block font-serif text-3xl text-neutral-300 transition group-hover:text-black">
                {item.step}
              </span>
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Faculty directory",
    description: "Search your school's professors by name, title, department, or building. Always up to date.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.8 5.8a7.5 7.5 0 0010 10z" />
      </svg>
    ),
  },
  {
    title: "AI chat assistant",
    description: "Ask anything about your campus. Quad answers conversationally and helps you take action instantly.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l2.651 2.651M7.5 20.5h13M18.375 2.625a2.121 2.121 0 013 3L9 18l-4 1 1-4 12.375-12.375z" />
      </svg>
    ),
  },
  {
    title: "Office maps",
    description: "Tap any professor to see their building floor plan with office location highlighted.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    title: "One-click send",
    description: "Hit send and your email opens in Outlook or Gmail — subject, body, and recipient pre-filled.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    title: "Campus-scoped access",
    description: "Sign in with Microsoft or Google. Each school's data is isolated and private.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Zero configuration",
    description: "No accounts to create, no forms to fill. Sign in with your university email and start immediately.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-neutral-200 bg-neutral-50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionLabel number="02" label="Features" sub="Built for focus" />
        <h2 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          Everything you need,
          <br />
          nothing you <em>don&apos;t</em>
        </h2>
        <p className="mt-4 max-w-lg text-neutral-500">
          One tool with one purpose. Find professors, draft emails, get recommendations.
        </p>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-neutral-200 bg-white p-7 transition hover:border-neutral-300 hover:shadow-float"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 transition group-hover:border-black group-hover:text-black">
                {f.icon}
              </div>
              <h3 className="mb-1.5 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DraftPreview() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionLabel number="03" label="Chat assistant" sub="AI-powered" />
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              One assistant for
              <br />
              your whole <em>campus</em>
            </h2>
            <p className="mt-4 max-w-md text-neutral-500">
              No more hunting across six websites. Quad knows your campus and answers in plain language — then helps you act.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Where is Dr. Thomas's office?",
                "Help me draft a recommendation request email.",
                "What are the library hours this week?",
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                    {i + 1}
                  </span>
                  <p className="text-neutral-600">{q}</p>
                </div>
              ))}
            </div>
            <Link
              href="/assistant"
              className="mt-10 inline-flex rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Open assistant
            </Link>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-float-lg">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-black" />
              <span className="text-xs font-medium uppercase tracking-widest text-neutral-400">Live preview</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-neutral-100 p-4 text-neutral-600">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                  Quad
                </span>
                Hello! I&apos;m your Quad Assistant. How can I help you today?
              </div>
              <div className="ml-8 rounded-xl bg-black p-4 text-white">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                  You
                </span>
                Where is Dr. Thomas&apos;s office?
              </div>
              <div className="rounded-xl bg-neutral-100 p-4 text-neutral-600">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                  Quad
                </span>
                Dr. Thomas is in Hazzard Hall, Room 301. Want me to show you a map?
              </div>
              <div className="rounded-xl border-2 border-black bg-neutral-50 p-4 text-neutral-700">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                  Action ready
                </span>
                View building map · Send email · Draft request
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DirectoryPreview() {
  return (
    <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionLabel number="04" label="Directory" sub="Faculty lookup" />
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-float-lg">
              <div className="border-b border-neutral-100 px-6 py-4">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.8 5.8a7.5 7.5 0 0010 10z" />
                  </svg>
                  <span className="text-sm text-neutral-400">Search by name, department, building...</span>
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {[
                  { name: "Dr. Evelyn Thomas", role: "Chair & Professor", dept: "Computer Science", office: "Hazzard Hall · Room 301" },
                  { name: "Prof. Marcus Reed", role: "Associate Professor", dept: "Computer Science", office: "Hazzard Hall · Room 204" },
                  { name: "Dr. Alicia Benton", role: "Assistant Professor", dept: "Computer Science", office: "Corbin Hall · Room 112" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-neutral-500">
                        {p.role} · {p.dept}
                      </p>
                      <p className="text-xs text-neutral-400">{p.office}</p>
                    </div>
                    <span className="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:border-black hover:text-black">
                      View map
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              Find any professor
              <br />
              in <em>seconds</em>
            </h2>
            <p className="mt-4 max-w-md text-neutral-500">
              Search your school&apos;s full faculty directory. See titles, departments, office locations, and building
              floor plans — all in one place.
            </p>
            <Link
              href="/directory"
              className="mt-8 inline-flex rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Browse directory
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-6xl">
          Your campus,
          <br />
          <em>answered.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg text-neutral-500">
          Stop navigating five different websites. Quad puts your entire campus in one conversation.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/assistant"
            className="rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Open assistant — it&apos;s free
          </Link>
          <Link
            href="/directory"
            className="rounded-full border border-neutral-300 bg-white px-8 py-3.5 text-sm font-medium text-black transition hover:border-neutral-400"
          >
            View directory
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <span className="font-serif text-lg">Quad</span>
          <p className="mt-1 text-xs text-neutral-400">
            Built for .edu students · {new Date().getFullYear()}
          </p>
        </div>
        <nav className="flex items-center gap-8 text-sm text-neutral-400">
          <Link href="/directory" className="transition hover:text-black">
            Directory
          </Link>
          <Link href="/assistant" className="transition hover:text-black">
            Assistant
          </Link>
          <Link href="/sign-in" className="transition hover:text-black">
            Sign in
          </Link>
        </nav>
        <p className="text-xs text-neutral-300">.edu accounts only</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-black">
      <Nav />
      <Hero />
      <TrustedBar />
      <HowItWorks />
      <Features />
      <DraftPreview />
      <DirectoryPreview />
      <CTA />
      <Footer />
    </div>
  );
}
