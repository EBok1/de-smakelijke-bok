import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";

interface CategoryMasonryGridProps {
  locale: string;
}

// Chapter numbers follow the menu, not the grid position; each chapter
// gets its own paper colour from the kitchen tints
const CHAPTERS = [
  { key: "main-course" as const, labelKey: "mainCourse" as const, number: 2, tone: "sage" },
  { key: "appetizer" as const, labelKey: "appetizer" as const, number: 1, tone: "peach" },
  { key: "dessert" as const, labelKey: "dessert" as const, number: 3, tone: "blue" },
];

export default async function CategoryMasonryGrid({
  locale,
}: CategoryMasonryGridProps) {
  const t = await getTranslations({ locale, namespace: "home" });
  const allRecipes = getAllRecipes(locale as "nl" | "en");

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-brown-dark mb-8">
          {t("categories.title")}
        </h2>

        {/*
         * Same grid as before: main courses tall on the left, the other two
         * chapters stacked on the right. Each tile is coloured paper with a
         * big chapter number and a dish from that chapter served on a plate.
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:h-[460px]">
          {CHAPTERS.map(({ key, labelKey, number, tone }, index) => {
            const recipes = allRecipes.filter((r) => r.category === key);
            const cover = recipes.find((r) => r.image)?.image;
            const isLead = index === 0;

            return (
              <Link
                key={key}
                href={`/${locale}/recipes?category=${key}`}
                className={`chapter-tile group ${isLead ? "md:row-span-2 chapter-tile-lead" : ""}`}
                data-tone={tone}
              >
                <span className="chapter-text">
                  <span className="chapter-number" aria-hidden="true">
                    {String(number).padStart(2, "0")}
                  </span>
                  <span className="sr-only">
                    {t("categories.chapter", { number })}:
                  </span>
                  <span className="recipe-title chapter-title">
                    <span className="marker">{t(`categories.${labelKey}`)}</span>
                  </span>
                  <span className="chapter-count">
                    {t("categories.recipesCount", { count: recipes.length })}
                  </span>
                </span>
                {cover && (
                  <span className="chapter-plate">
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes={isLead ? "18rem" : "10rem"}
                      className="chapter-tile-img object-cover"
                    />
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
