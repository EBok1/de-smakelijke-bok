"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTransitionRouter } from "next-view-transitions";
import type { RecipeMeta } from "@/lib/recipes";

interface FeaturedCardsProps {
  locale: string;
  recipes: RecipeMeta[];
}

export default function FeaturedCards({ locale, recipes }: FeaturedCardsProps) {
  const router = useTransitionRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const safeRecipes = useMemo(() => recipes ?? [], [recipes]);

  type ViewTransitionStyle = CSSProperties & {
    viewTransitionName?: string;
  };

  const navigateToDetail = (recipeSlug: string) => {
    router.push(`/${locale}/recipes/${recipeSlug}`);
  };

  return (
    <div className="featured-panels">
      <button
        type="button"
        className="featured-nav-btn featured-nav-btn-left"
        aria-label="Previous featured recipe"
        disabled={safeRecipes.length <= 1}
        onClick={() => {
          if (safeRecipes.length <= 1) return;
          setActiveIndex(
            (prev) => (prev - 1 + safeRecipes.length) % safeRecipes.length,
          );
        }}
      >
        ←
      </button>

      {safeRecipes.map((recipe, i) => {
        const isActive = i === activeIndex;
        const backgroundImage = recipe.image
          ? `url(${recipe.image})`
          : undefined;
        // viewTransitionName must be unique in the document — only the active
        // panel gets the name so the browser can match it to the detail page.
        const panelStyle: ViewTransitionStyle = {
          ...(backgroundImage ? { backgroundImage } : {}),
          ...(isActive ? { viewTransitionName: "recipe-hero" } : {}),
        };
        const firstSentence =
          recipe.description.match(/[^.!?]*[.!?]/)?.[0] ?? recipe.description;

        return (
          <div
            key={recipe.slug}
            className={`featured-panel${isActive ? " active" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={`Featured recipe: ${recipe.title}`}
            style={panelStyle}
            onClick={() => {
              if (isActive) {
                navigateToDetail(recipe.slug);
              } else {
                setActiveIndex(i);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (isActive) {
                  navigateToDetail(recipe.slug);
                } else {
                  setActiveIndex(i);
                }
              }
            }}
          >
            <div className="featured-panel-card">
              <h3 className="featured-panel-title">{recipe.title}</h3>
              <p className="featured-panel-desc line-clamp-3">
                {firstSentence}
              </p>
              <div className="featured-panel-tags gap-2 flex flex-nowrap mt-3">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="tag text-xs bg-cream-dark text-brown-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="featured-nav-btn featured-nav-btn-right"
        aria-label="Next featured recipe"
        disabled={safeRecipes.length <= 1}
        onClick={() => {
          if (safeRecipes.length <= 1) return;
          setActiveIndex((prev) => (prev + 1) % safeRecipes.length);
        }}
      >
        →
      </button>
    </div>
  );
}
