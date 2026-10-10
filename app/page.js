import Link from "next/link";
import HeroDemo from "@/components/HeroDemo";
import LinkGraph from "@/components/LinkGraph";
import Pipeline from "@/components/Pipeline";
import Anatomy from "@/components/Anatomy";
import Deploy from "@/components/Deploy";
import Faq from "@/components/Faq";
import Creator from "@/components/Creator";
import CountUp from "@/components/CountUp";
import RoiCalculator from "@/components/RoiCalculator";
import Pricing from "@/components/Pricing";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const COMPARE = [
  ["Open every site to judge if it fits", "Every site scored 0 to 100 against your client"],
  ["Scroll blogs for something to pitch", "The best page picked from the sitemap"],
  ["Guess who wrote the article", "Author read from the page, AI as backup"],
  ["Hunt for emails and hope they land", "Emails found, verified, risky ones flagged"],
  ["Generic pitches written in a hurry", "A reason and pitch angle for every site"],
  ["Credits spent on sites that never fit", "Irrelevant sites dropped before any cost"],
  ["Copy and paste into a spreadsheet", "Excel and CSV ready for your outreach tool"],
];

const FAQ = [
  ["Does it send the emails?", "No. It builds the list and the reasons. You send from the outreach tool you already use, so your sender reputation stays in your hands."],
  ["Which exports does it accept?", "Ahrefs Backlinks and Referring domains reports, and Semrush Backlinks and Referring Domains reports. No cleaning or renaming needed."],
  ["What else do I need to pay for?", "Your own OpenAI or Anthropic key for the AI step and a Hunter.io key for emails. You pay them directly. A free keyword-only mode is included if you want to skip both."],
  ["Where does it run?", "On your Windows PC with a one-click installer, on your own server and domain with Docker, or on our server with the managed plan."],
  ["Can my whole team use it?", "Yes. Everyone signs in with the team password at the same address. The license covers one computer or server, not one person."],
  ["What happens if a run is interrupted?", "Press Resume. Sites already finished are reused and never paid for twice."],
  ["How do I get my license?", "Place an order, install the app and send us the Machine ID shown on its Activate page. We reply with your license key, usually the same day."],
  ["Can I try it first?", "Yes. The free trial runs for 7 days with every feature unlocked."],
];

const HEADLINE = "Your competitor’s backlinks, turned into people you can email today.";

const TOOLS = ["Ahrefs", "Semrush", "Hunter.io", "OpenAI", "Anthropic", "Lemlist", "Instantly", "Pitchbox", "Excel"];

const WHO = [
  ["SEO and link-building agencies", "Run prospecting for every client from one place and give writers lists that are ready to pitch.", "M4 20V9l8-5 8 5v11M9 20v-6h6v6"],
  ["Freelance link builders", "Take on more clients without hiring researchers or working weekends.", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"],
  ["In-house SEO and content teams", "Turn a competitor export into an outreach plan in a day instead of a week.", "M3 12h4l3-8 4 16 3-8h4"],
  ["Digital PR teams", "Find the right writer and article for each pitch, with a reason it fits.", "M4 5h16v11H8l-4 4V5z"],
];

export default function Home() {
  const words = HEADLINE.split(" ");
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero">
          <LinkGraph />
          <div className="hero-glow" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <Link href="/order?plan=trial" className="hero-pill">
                <span className="pill-tag">Free</span>
                7-day trial with every feature unlocked
              </Link>
              <h1 aria-label={HEADLINE}>
                {words.map((w, i) => (
                  <span className="word" aria-hidden="true" key={i} style={{ "--i": i }}>{w} </span>
                ))}
              </h1>
              <p className="lead">
                Upload one Ahrefs or Semrush export. Backlink Prospector checks every referring site, drops the ones
                that do not fit your client, and hands back the best page to pitch, the reason it fits, the author and a
                verified email.
              </p>
              <div className="hero-ctas">
                <Link className="btn btn-glow" href="/order?plan=trial">Start the 7-day free trial</Link>
                <a className="btn btn-ghost" href="#how">See how it works</a>
              </div>
              <ul className="hero-ticks">
                <li>Runs on your PC or your own server</li>
                <li>Your data never leaves it</li>
                <li>No card needed for the trial</li>
              </ul>
            </div>
            <div className="hero-demo">
              <HeroDemo />
            </div>
          </div>

          <div className="tools" aria-label="Works with">
            <p className="wrap tools-label">Reads exports from, and hands lists to, the tools you already use</p>
            <div className="marquee">
              <div className="marquee-track">
                {[...TOOLS, ...TOOLS].map((t, i) => (
                  <span key={i} aria-hidden={i >= TOOLS.length ? "true" : undefined}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="stats wrap" aria-label="At a glance">
          <div data-reveal><p className="stat-n"><CountUp to={6} /></p><p>checks on every referring site</p></div>
          <div data-reveal style={{ "--d": "80ms" }}><p className="stat-n"><CountUp to={100} /></p><p>point fit score against your client</p></div>
          <div data-reveal style={{ "--d": "160ms" }}><p className="stat-n"><CountUp to={5} suffix=" min" /></p><p>to install on a Windows PC</p></div>
          <div data-reveal style={{ "--d": "240ms" }}><p className="stat-n"><CountUp to={0} suffix="%" /></p><p>markup on your AI and email usage</p></div>
        </section>

        <section className="section" id="problem">
          <div className="wrap split">
            <div data-reveal>
              <h2>The list takes seconds. The research takes days.</h2>
              <p>
                Ahrefs shows you every site linking to a competitor in seconds. Then someone has to open each one,
                decide if it fits, find an article worth pitching, work out who wrote it, find an email that will not
                bounce and note why it fits. Most of those sites turn out to be coupon pages and directories.
              </p>
              <p>
                That work delays outreach by days and pushes writers into generic pitches. Here is what it costs your
                team on one export.
              </p>
            </div>
            <div data-reveal style={{ "--d": "120ms" }}><RoiCalculator /></div>
          </div>
        </section>

        <section className="section band-soft" id="how">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <h2>Six checks on every referring site</h2>
              <p className="section-lead">Each site goes through the same steps in order. Pick a step to see what happens to an example export.</p>
            </div>
            <div data-reveal><Pipeline /></div>
          </div>
        </section>

        <section className="section band-ink" id="output">
          <div className="ink-glow" aria-hidden="true" />
          <div className="wrap">
            <div className="section-head" data-reveal>
              <h2>Every row is ready for a writer</h2>
              <p className="section-lead">Each prospect comes with what a person needs to send a pitch that reads as if they did the research themselves. Point at a field to find it in the row.</p>
            </div>
            <div data-reveal><Anatomy /></div>
            <p className="fields-foot">Plus a separate file of every skipped site and the reason, so nothing disappears without an explanation.</p>
          </div>
        </section>

        <section className="section" id="compare">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <h2>What changes for your team</h2>
            </div>
            <div className="compare-wrap" data-reveal>
              <table className="compare">
                <thead><tr><th scope="col">By hand</th><th scope="col">With Backlink Prospector</th></tr></thead>
                <tbody>
                  {COMPARE.map(([a, b], i) => (
                    <tr key={a} style={{ "--d": `${i * 60}ms` }}><td>{a}</td><td>{b}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section who band-soft" id="who">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <h2>Built for people who prospect every month</h2>
            </div>
            <div className="who-grid">
              {WHO.map(([t, p, d], i) => (
                <div key={t} data-reveal style={{ "--d": `${i * 80}ms` }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} /></svg>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="wrap split">
            <div data-reveal>
              <h2>Your data, your keys, your server</h2>
              <p>
                Backlink Prospector runs on your own computer or server, not on a shared platform. Client lists,
                exports and results stay with you. You use your own AI and Hunter.io keys, so there is no markup on
                usage and no per-seat fee.
              </p>
              <ul className="trust-list">
                <li><strong>Built to keep costs low.</strong> Every AI answer and email lookup is cached, and a report shows what each run cost.</li>
                <li><strong>Polite crawling.</strong> It follows robots.txt and paces requests.</li>
                <li><strong>Interrupted run?</strong> Press Resume. Finished sites are reused and never paid for twice.</li>
              </ul>
            </div>
            <div data-reveal style={{ "--d": "120ms" }}>
              <p className="deploy-label">Pick where it runs</p>
              <Deploy />
            </div>
          </div>
        </section>

        <section className="section band-soft" id="pricing">
          <div className="wrap">
            <div className="section-head center" data-reveal>
              <h2>Plans</h2>
              <p className="section-lead">Every plan unlocks the full tool. Start with the trial and decide after you see your own results.</p>
            </div>
            <Pricing />
          </div>
        </section>

        <section className="section" id="maker" aria-labelledby="maker-title">
          <div className="wrap"><Creator /></div>
        </section>

        <section className="section faq band-soft" id="faq">
          <div className="wrap faq-grid">
            <div className="section-head" data-reveal>
              <h2>Questions people ask before buying</h2>
              <p className="section-lead">Something else on your mind? Message Manik on WhatsApp or by email and you get a reply within one working day.</p>
            </div>
            <div data-reveal><Faq items={FAQ} /></div>
          </div>
        </section>

        <section className="final">
          <div className="final-glow" aria-hidden="true" />
          <div className="wrap final-inner" data-reveal>
            <h2>Run it on one competitor export. See the list before you pay.</h2>
            <p>The trial runs for 7 days on your own data, with every feature on.</p>
            <div className="hero-ctas">
              <Link className="btn btn-light" href="/order?plan=trial">Start the free trial</Link>
              <a className="btn btn-ghost" href="#pricing">Compare plans</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
