import type { LawUpdate } from "@/lib/types";

// Curated AI-governance updates. Maintained from Claude Code: add entries here, re-seed.
export const updates: LawUpdate[] = [
  {
    id: "upd-bok-2-1",
    title: "AIGP Body of Knowledge updated to v2.1",
    jurisdiction: "IAPP (global)",
    publishedDate: "2026-02-02",
    bokRelevant: true,
    severity: "critical",
    status: "published",
    sourceUrl: "https://iapp.org/certify/aigp/",
    bodyMd: `The AIGP exam now tests **BoK v2.1** (effective 2 Feb 2026, supersedes 2.0.1). Structure, the 4 domains, and the blueprint counts are **unchanged**. The shifts:

- **Competency II.C (AI-specific laws)** gets more emphasis; the BoK now explicitly names the **EU AI Act**, the **South Korean AI Basic Law**, and **US federal & state** AI laws applying to private-sector orgs.
- The **Take It Down Act** is the headline new US law.
- A pervasive **"models → systems"** reframing — answer at the governance/system level, not just the model artifact.
- Slightly less weight on industry standards/tools (II.D).`,
  },
  {
    id: "upd-sk-basic-act",
    title: "South Korean AI Basic Act enters into force",
    jurisdiction: "South Korea",
    publishedDate: "2026-01-22",
    bokRelevant: true,
    severity: "important",
    sourceUrl: "https://iapp.org/resources/article/global-ai-governance-south-korea",
    status: "published",
    bodyMd: `The **Framework Act on the Development of AI and Establishment of Trust** ("AI Basic Act") is now in force — the world's second comprehensive AI law after the EU AI Act.

- Uses **"high-impact AI"** (not "high-risk"); innovation-first; **no mandatory third-party conformity assessment**.
- High-impact operators must self-assess before deployment, give a **"meaningful explanation"**, deploy a user-protection plan, and keep human oversight.
- Foreign operators above a threshold must appoint a **domestic representative**.
- Penalties up to **₩30M** (+ possible imprisonment). MSIT is running a **~1-year enforcement grace** through 2026.`,
  },
  {
    id: "upd-take-it-down",
    title: "Take It Down Act — platform enforcement begins",
    jurisdiction: "United States (federal)",
    publishedDate: "2026-05-19",
    bokRelevant: true,
    severity: "important",
    sourceUrl: "https://www.ftc.gov/legal-library/browse/statutes/tools-address-known-exploitation-immobilizing-technological-deepfakes-websites-networks-act-take-it",
    status: "published",
    bodyMd: `One year after being signed (19 May 2025), the **FTC's enforcement of the platform notice-and-removal duty** under the Take It Down Act began on **19 May 2026**.

- Targets **non-consensual intimate imagery (NCII)**, explicitly including **AI-generated deepfakes**.
- Covered platforms must remove flagged content (and identical copies) within **48 hours** of a valid request.
- First major US federal law squarely addressing generative-AI harms — AI image/video developers should build prevention + rapid-takedown controls.`,
  },
  {
    id: "upd-eu-highrisk-2026",
    title: "EU AI Act: high-risk (Annex III) + transparency duties apply",
    jurisdiction: "European Union",
    publishedDate: "2026-08-02",
    bokRelevant: true,
    severity: "critical",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    status: "published",
    bodyMd: `From **2 Aug 2026**, the EU AI Act's **high-risk (Annex III) obligations** and **Article 50 transparency** duties apply (conformity assessment, risk management, data governance, human oversight, AI-interaction disclosure, content labeling).

⚠️ **Verify before exam day:** a late-2025 **"Digital Omnibus"** proposal floated delaying some high-risk dates. Treat the statutory dates as the exam baseline and check a live source for any adopted delay.`,
  },
  {
    id: "upd-colorado",
    title: "Colorado AI Act effective date",
    jurisdiction: "United States — Colorado",
    publishedDate: "2026-06-30",
    bokRelevant: true,
    severity: "info",
    sourceUrl: "https://leg.colorado.gov/bills/sb24-205",
    status: "published",
    bodyMd: `The **Colorado AI Act (SB 24-205)** — the first comprehensive US *state* AI law, targeting **algorithmic discrimination** by developers and deployers of high-risk AI in consequential decisions — takes effect (timing was moved from 1 Feb 2026; **verify the current effective date**, reported ~30 Jun 2026).`,
  },
];
