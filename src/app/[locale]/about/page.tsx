import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
  };
}

// Title page — cookbook front matter, voorwoord, three questions (design.md § About)
export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  const questions = [
    { q: t("whoCooks"), a: <p>{t("whoCooksContent")}</p> },
    { q: t("whyName"), a: <p>{t("whyNameContent")}</p> },
    {
      q: t("whereStart"),
      a: (
        <p>
          {t("whereStartContent")}{" "}
          <Link href={`/${locale}/recipes`} className="text-link">
            {t("whereStartLink")} <span aria-hidden="true">→</span>
          </Link>
        </p>
      ),
    },
  ];

  return (
    <article className="titlepage container" aria-labelledby="about-title">
      <header className="titlepage-head">
        {/* The page title stays for screen readers; the book title is the visible heading */}
        <h1 id="about-title" className="titlepage-title">
          <span className="sr-only">{t("title")} — </span>
          De Smakelijke
          <br />
          Bok
        </h1>
        <div className="titlepage-ornament" aria-hidden="true">
          <span />✻<span />
        </div>
        <p className="titlepage-subtitle">{t("subtitle")}</p>
      </header>

      <figure className="titlepage-art">
        <Image
          src="/images/logo.png"
          alt={t("portraitAlt")}
          width={1024}
          height={1024}
          priority
          sizes="(min-width: 60rem) 22rem, 70vw"
        />
      </figure>

      <section className="titlepage-section" aria-labelledby="about-foreword">
        <h2 id="about-foreword" className="titlepage-h2">
          {t("foreword")}
        </h2>
        <p className="titlepage-foreword">{t("content")}</p>
      </section>

      <section className="titlepage-section" aria-labelledby="about-questions">
        <h2 id="about-questions" className="titlepage-h2">
          {t("questionsTitle")}
        </h2>
        <dl className="qa">
          {questions.map(({ q, a }) => (
            <div key={q} className="qa-row">
              <dt className="qa-q">{q}</dt>
              <dd className="qa-a">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="titlepage-close">
        <p>
          {t("signoff")}
          <span className="titlepage-signature">{t("signature")}</span>
        </p>
      </footer>
    </article>
  );
}
