import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedRecipes } from "@/lib/recipes";
import VeggieBackground from "@/components/VeggieBackground";
import FeaturedCards from "@/components/FeaturedCards";
import CategoryMasonryGrid from "@/components/CategoryMasonryGrid";
import AlphabetSoupGame from "@/components/AlphabetSoupGame";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const recipes = getFeaturedRecipes(4, locale as "nl" | "en");

  return (
    <div className="animate-fade-in">
      {/* Hero — the illustration gets the room, veggies float up behind it */}
      <section
        className="frontis relative overflow-hidden bg-linear-to-b from-cream to-cream-dark"
        aria-labelledby="home-title"
      >
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
          style={{ zIndex: 0 }}
        >
          <VeggieBackground />
        </div>

        <div className="frontis-art" style={{ zIndex: 10 }}>
          <Image
            src="/images/mascot.png"
            alt={t("mascotAlt")}
            fill
            priority
            sizes="(min-width: 60rem) 58vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="frontis-text relative" style={{ zIndex: 10 }}>
          <h1 id="home-title" className="frontis-title">
            {t("welcome")}
          </h1>
          <p className="frontis-intro">{t("intro")}</p>
          <Link href={`/${locale}/recipes`} className="btn btn-primary">
            {t("viewAllRecipes")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FeaturedRecipesSection locale={locale} recipes={recipes} />
        </div>
      </section>

      {/* Category Grid Section */}
      <CategoryMasonryGrid locale={locale} />

      {/* Alphabet Soup Game */}
      <AlphabetSoupGame />
    </div>
  );
}

function FeaturedRecipesSection({
  locale,
  recipes,
}: {
  locale: string;
  recipes: ReturnType<typeof getFeaturedRecipes>;
}) {
  const t = useTranslations("home");

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-brown-dark">
          {t("featuredRecipes")}
        </h2>
        <Link
          href={`/${locale}/recipes`}
          className="text-sage-dark hover:text-sage font-medium hidden sm:flex items-center gap-1"
        >
          {t("viewAllRecipes")}
          <span>→</span>
        </Link>
      </div>

      {recipes.length > 0 ? (
        <FeaturedCards locale={locale} recipes={recipes} />
      ) : (
        <div className="text-center py-12 bg-cream-dark rounded-2xl">
          <p className="text-brown-light text-lg">
            No recipes yet. Check back soon! 🍳
          </p>
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Link
          href={`/${locale}/recipes`}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-sage text-sage-dark font-heading font-semibold rounded-full hover:bg-sage hover:text-[#ffffff] transition-all duration-200"
        >
          {t("viewAllRecipes")}
        </Link>
      </div>
    </>
  );
}
