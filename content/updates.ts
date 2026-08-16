import type { LawUpdate } from "@/lib/types";

// Curated AI-governance updates. Add entries here, then redeploy or re-seed.
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
    id: "upd-eu-omnibus-2026",
    title: "EU Digital Omnibus adopted: high-risk deadlines deferred; transparency stays 2 Aug 2026",
    jurisdiction: "European Union",
    publishedDate: "2026-07-27",
    bokRelevant: true,
    severity: "critical",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    status: "published",
    bodyMd: `The **Digital Omnibus on AI** is now law (provisional agreement 7 May 2026; European Parliament adopted 16 Jun 2026; **in force 27 Jul 2026**). What changed — and what didn't:

- **Deferred:** high-risk obligations for **stand-alone Annex III** systems (recruitment, credit scoring, education, law enforcement…) move from 2 Aug 2026 → **2 December 2027**. **Annex I** (AI embedded in regulated products) moves → **2 August 2028**.
- **NOT deferred:** **Article 50 transparency** duties still apply from **2 Aug 2026** — chatbot disclosure, AI-content marking/labeling, deepfake disclosure, emotion-recognition/biometric-categorization notices.
- **Unchanged:** prohibitions (since Feb 2025), AI literacy, GPAI rules + Codes of Practice (since Aug 2025), penalty tiers.

**Exam angle:** know both timelines — the original statutory dates AND the Omnibus deferral. A question on "what applies from 2 Aug 2026" is now answered by **transparency**, not Annex III high-risk.`,
  },
  {
    id: "upd-colorado-sb189",
    title: "Colorado repeals its AI Act, replaces it with SB 26-189 (ADMT law, eff. 1 Jan 2027)",
    jurisdiction: "United States — Colorado",
    publishedDate: "2026-05-14",
    bokRelevant: true,
    severity: "critical",
    sourceUrl: "https://leg.colorado.gov/bills/sb26-189",
    status: "published",
    bodyMd: `Colorado's landmark **AI Act (SB 24-205) was repealed before it ever took effect** and replaced by **SB 26-189** (signed **14 May 2026**, effective **1 Jan 2027**):

- Regulates **automated decision-making technology (ADMT)** that **"materially influences" a consequential decision** about a consumer (vs. the old high-risk/algorithmic-discrimination framework).
- Duties shift from broad governance/impact assessments to **consumer disclosures**, **post-adverse-outcome explanations**, **correction rights**, and **meaningful human review**.
- **Attorney General–only enforcement** (no private right of action); violations = deceptive trade practices; **60-day cure** unless knowing/repeated.

**Contrast to memorize:** Colorado SB 189 = **impact/transparency-based**; Texas TRAIGA (eff. 1 Jan 2026) = **intent-based**.`,
  },
  {
    id: "upd-gpai-cop",
    title: "GPAI Code of Practice = presumption of conformity",
    jurisdiction: "European Union",
    publishedDate: "2026-06-01",
    bokRelevant: true,
    severity: "info",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/ai-code-practice",
    status: "published",
    bodyMd: `The AI Office's **GPAI Codes of Practice** (transparency, copyright, safety/security) are the primary compliance route for GPAI providers — following them gives a **presumption of conformity** with Chapter V obligations. GPAI rules have applied since **2 Aug 2025**; pre-existing models must comply by **2 Aug 2027**.`,
  },
];
