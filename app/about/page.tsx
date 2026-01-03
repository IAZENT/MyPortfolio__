export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">// ABOUT ME</h1>

      <p className="mt-6 text-[var(--muted)]">
        I am a cybersecurity student focused on practical learning: designing secure networks, testing
        assumptions in lab environments, and extracting lessons from incidents. I combine hands-on
        exercises (CTFs, packet-tracer simulations) with clear, evidence-driven writeups and reproducible
        lab work.
      </p>

      <p className="mt-4 text-[var(--muted)]">
        My areas of interest include web application security, digital forensics, and defensive network
        architecture. I enjoy translating technical findings into actionable recommendations for both
        technical and non-technical stakeholders.
      </p>

      <div className="mt-8">
        <p className="text-sm text-[var(--muted)]">If you'd like to connect, email me directly from the contact section.</p>
      </div>
    </main>
  );
}
