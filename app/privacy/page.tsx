import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SkillBridge privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Skill</span>
            <span className="text-blue-400">Bridge</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>
            <strong className="text-zinc-300">Last updated:</strong>{" "}
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">What we collect</h2>
            <p>
              When you use SkillBridge, we collect the information you provide in the career form
              (current role, target role, skills, and years of experience). If you purchase a mock
              interview, Stripe processes your payment — we never see or store your card details.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">How we use your data</h2>
            <p>
              Your career information is used solely to generate your personalized roadmap and mock
              interview. We do not sell, rent, or share your data with third parties for marketing
              purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Email collection</h2>
            <p>
              If you provide your email to unlock the Authority phase, we store it to deliver your
              blueprint. You can request deletion at any time by emailing{" "}
              <a href="mailto:support@tryskillbridge.com" className="text-blue-400 hover:underline">
                support@tryskillbridge.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Data retention</h2>
            <p>
              Roadmap data is stored for up to 90 days. Paid interview evaluations are retained for
              90 days from the purchase date. After expiry, data is automatically deleted.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Analytics</h2>
            <p>
              We use Umami, a privacy-friendly analytics tool that does not use cookies and does not
              track personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Payments</h2>
            <p>
              All payments are processed by{" "}
              <a href="https://stripe.com/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Stripe
              </a>
              . We do not store credit card numbers or payment credentials on our servers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Contact</h2>
            <p>
              Questions? Reach us at{" "}
              <a href="mailto:support@tryskillbridge.com" className="text-blue-400 hover:underline">
                support@tryskillbridge.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
