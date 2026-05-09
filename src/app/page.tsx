import Link from "next/link";
import { ArrowUpRight, BadgeCheck, CalendarDays, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { VerifyLookupForm } from "@/components/verify-lookup-form";

const communityUrl =
  process.env.GDG_COMMUNITY_URL ??
  "https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

export default async function Home() {
  const [eventsCount, certificatesCount, uniqueParticipants, recentEvents] =
    await Promise.all([
      prisma.event.count(),
      prisma.certificate.count(),
      prisma.certificate.findMany({
        distinct: ["rollNumber"],
        select: { rollNumber: true },
      }),
      prisma.event.findMany({
        orderBy: { eventDate: "desc" },
        take: 3,
        include: { _count: { select: { certificates: true } } },
      }),
    ]);

  const participantCount = uniqueParticipants.length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fef3c7,transparent_48%),radial-gradient(circle_at_20%_40%,#dbeafe,transparent_45%),linear-gradient(120deg,#f8fafc,white_40%,#fefce8)]">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-(--gdg-blue)/10 blur-[110px]" />
          <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-(--gdg-green)/15 blur-[140px]" />
          <div className="absolute bottom-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-(--gdg-red)/10 blur-[160px]" />
        </div>

        <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-16 md:pt-20">
          <header className="flex flex-col gap-8">
            <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-(--gdg-blue)" />
              GDG on Campus - RIT Roorkee
            </div>
            <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <h1 className="text-balance font-heading text-4xl leading-tight text-foreground md:text-6xl">
                  GDG on Campus, RIT Roorkee.
                  <span className="block text-muted-foreground">
                    Learn, build, and grow together.
                  </span>
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  A community for developers and builders across campus.
                  Discover events, celebrate participation, and keep every
                  achievement verifiable.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <Link href={communityUrl} target="_blank" rel="noreferrer">
                      Visit Community Page
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#verify">
                      Verify a Certificate
                      <BadgeCheck className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    Live stats
                  </span>
                  <span className="rounded-full bg-(--gdg-green)/15 px-3 py-1 text-xs font-semibold text-(--gdg-green)">
                    Updated daily
                  </span>
                </div>
                <div className="grid gap-5">
                  <div className="flex items-center justify-between text-2xl font-semibold">
                    <span>Total events</span>
                    <span>{eventsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-2xl font-semibold">
                    <span>Certificates issued</span>
                    <span>{certificatesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-2xl font-semibold">
                    <span>Unique participants</span>
                    <span>{participantCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Community-led learning",
                description: "Workshops, sessions, and study circles run by the chapter.",
                icon: BadgeCheck,
                tone: "text-(--gdg-blue)",
              },
              {
                title: "Event analytics",
                description: "Track participation, branch diversity, and engagement trends.",
                icon: Users,
                tone: "text-(--gdg-green)",
              },
              {
                title: "Verified achievements",
                description: "Certificates are generated on demand and protected against tampering.",
                icon: CalendarDays,
                tone: "text-(--gdg-red)",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur"
              >
                <item.icon className={`mb-4 size-8 ${item.tone}`} />
                <h3 className="font-heading text-xl text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  Recent events
                </p>
                <h2 className="mt-3 font-heading text-3xl text-foreground">
                  Highlights from the community
                </h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={communityUrl} target="_blank" rel="noreferrer">
                  Explore GDG on Campus
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-muted/60 bg-white/90 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {formatDate(event.eventDate)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {event.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.venue ?? "RIT Roorkee"}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    {event._count.certificates} certificates issued
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="verify"
            className="grid gap-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Certificate verification
              </p>
              <h2 className="mt-3 font-heading text-3xl text-foreground">
                Verify a certificate in seconds
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Use the certificate ID or QR code to confirm authenticity. This
                keeps achievements trusted for employers, peers, and mentors.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/verify">
                    Open verification page
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={communityUrl} target="_blank" rel="noreferrer">
                    Learn about GDG on Campus
                  </Link>
                </Button>
              </div>
            </div>
            <VerifyLookupForm />
          </section>

          <section className="flex flex-col items-center gap-6 rounded-3xl border border-white/70 bg-[linear-gradient(120deg,#ffffff,rgba(255,255,255,0.6),#fef3c7)] p-10 text-center shadow-sm">
            <h2 className="text-balance font-heading text-3xl text-foreground">
              Built for credible, community-first credentials.
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Every certificate is a gateway into our chapter community. Meet
              fellow builders, explore events, and connect with the GDG on Campus
              network.
            </p>
            <Button asChild size="lg">
              <Link href={communityUrl} target="_blank" rel="noreferrer">
                Join the community
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </section>
        </section>
      </main>
    </div>
  );
}
