import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";

interface CategoryMasonryGridProps {
  locale: string;
}

// Each category tile has its own visual identity
const CATEGORY_CONFIG = [
  {
    key: "main-course" as const,
    labelKey: "mainCourse" as const,
    descKey: "mainCourseDesc" as const,
    emoji: "🍲",
    // spans 2 rows on desktop — the "hero" tile
    className:
      "md:row-span-2 bg-sage-light/25 border-sage/30 hover:bg-sage-light/40",
    emojiClass: "text-sage-dark",
  },
  {
    key: "appetizer" as const,
    labelKey: "appetizer" as const,
    descKey: "appetizerDesc" as const,
    emoji: "🥗",
    className:
      "bg-peach-light/30 border-peach/30 hover:bg-peach-light/50",
    emojiClass: "text-peach-dark",
  },
  {
    key: "dessert" as const,
    labelKey: "dessert" as const,
    descKey: "dessertDesc" as const,
    emoji: "🍰",
    className:
      "bg-dusty-blue-light/25 border-dusty-blue/30 hover:bg-dusty-blue-light/40",
    emojiClass: "text-dusty-blue",
  },
] as const;

export default async function CategoryMasonryGrid({
  locale,
}: CategoryMasonryGridProps) {
  const t = await getTranslations({ locale, namespace: "home" });
  const allRecipes = getAllRecipes(locale as "nl" | "en");

  // Count recipes per category once
  const countByCategory = {
    "main-course": allRecipes.filter((r) => r.category === "main-course")
      .length,
    appetizer: allRecipes.filter((r) => r.category === "appetizer").length,
    dessert: allRecipes.filter((r) => r.category === "dessert").length,
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-brown-dark mb-8">
          {t("categories.title")}
        </h2>

        {/*
         * Masonry-style grid:
         * On desktop: 2 columns, 2 rows. The first tile (main-course)
         * spans both rows so it sits tall on the left, while appetizer
         * and dessert stack on the right.
         *
         * On mobile: single column, all tiles stacked.
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:h-[420px]">
          {CATEGORY_CONFIG.map(
            ({ key, labelKey, descKey, emoji, className, emojiClass }) => {
              const count = countByCategory[key];

              return (
                <Link
                  key={key}
                  href={`/${locale}/recipes?category=${key}`}
                  className={`
                    group flex flex-col justify-between
                    rounded-2xl border p-6
                    transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-md
                    ${className}
                  `}
                >
                  {/* Top: emoji + count */}
                  <div className="flex items-start justify-between">
                    <span className="text-4xl" role="img" aria-hidden="true">
                      {emoji}
                    </span>
                    <span
                      className={`text-sm font-medium opacity-70 ${emojiClass}`}
                    >
                      {t("categories.recipesCount", { count })}
                    </span>
                  </div>

                  {/* Bottom: title + description + arrow */}
                  <div>
                    <h3 className="text-xl font-bold text-brown-dark mb-1 font-heading">
                      {t(`categories.${labelKey}`)}
                    </h3>
                    <p className="text-sm text-brown-light leading-relaxed mb-3">
                      {t(`categories.${descKey}`)}
                    </p>
                    <span
                      className={`text-sm font-semibold ${emojiClass} group-hover:translate-x-1 inline-block transition-transform duration-150`}
                    >
                      {t("categories.browse")}
                    </span>
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
