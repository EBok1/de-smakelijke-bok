import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedRecipes } from "@/lib/recipes";
import VeggieBackground from "@/components/VeggieBackground";
import FeaturedCards from "@/components/FeaturedCards";

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

  const recipes = getFeaturedRecipes(4, locale as "nl" | "en");

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-cream to-cream-dark py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative" style={{ zIndex: 10 }}>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Mascot Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <Image
                  src="/images/mascot.png"
                  alt="De Smakelijke Bok mascot"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <HomeContent locale={locale} />
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
          style={{ zIndex: 0 }}
        >
          <VeggieBackground />
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <FeaturedRecipesSection locale={locale} recipes={recipes} />
        </div>
      </section>
    </div>
  );
}

function HomeContent({ locale }: { locale: string }) {
  const t = useTranslations("home");

  return (
    <>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brown-dark mb-4">
        {t("welcome")}
      </h1>
      <p className="text-lg text-brown-light mb-8 max-w-lg">{t("intro")}</p>
      <Link
        href={`/${locale}/recipes`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-sage-dark font-heading font-semibold rounded-full hover:bg-brown-dark transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        style={{ color: "#ffffff" }}
      >
        {t("viewAllRecipes")}
        <span>→</span>
      </Link>
    </>
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
