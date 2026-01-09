import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const recipesDirectory = path.join(process.cwd(), 'src/content/recipes');

type Locale = 'nl' | 'en';

interface LocalizedString {
  nl: string;
  en: string;
}

export interface Recipe {
  slug: string;
  title: string;
  description: string;
  category: 'appetizer' | 'main-course' | 'dessert';
  tags: string[];
  image?: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  content: string;
}

export interface RecipeMeta {
  slug: string;
  title: string;
  description: string;
  category: 'appetizer' | 'main-course' | 'dessert';
  tags: string[];
  image?: string;
  prepTime: string;
  cookTime: string;
  servings: number;
}

// Helper to get localized string value
function getLocalizedValue(value: string | LocalizedString, locale: Locale): string {
  if (typeof value === 'string') {
    return value;
  }
  return value[locale] || value.nl || '';
}

// Helper to extract content for a specific locale
function getLocalizedContent(content: string, locale: Locale): string {
  // Content is split by '---' with NL first, then EN
  const parts = content.split(/^---$/m).map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 1) {
    // No separator, return full content (backwards compatible)
    return content;
  }
  
  // Find the section for the requested locale
  // NL section starts with <!-- NL --> or is the first section
  // EN section starts with <!-- EN --> or is the second section
  
  const nlIndex = parts.findIndex(p => p.includes('<!-- NL -->'));
  const enIndex = parts.findIndex(p => p.includes('<!-- EN -->'));
  
  if (locale === 'en' && enIndex !== -1) {
    return parts[enIndex].replace('<!-- EN -->', '').trim();
  }
  
  if (locale === 'nl' && nlIndex !== -1) {
    return parts[nlIndex].replace('<!-- NL -->', '').trim();
  }
  
  // Fallback: first section for NL, second for EN
  if (locale === 'en' && parts.length > 1) {
    return parts[1].replace('<!-- EN -->', '').trim();
  }
  
  return parts[0].replace('<!-- NL -->', '').trim();
}

export function getAllRecipes(locale: Locale = 'nl'): RecipeMeta[] {
  // Create directory if it doesn't exist
  if (!fs.existsSync(recipesDirectory)) {
    fs.mkdirSync(recipesDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(recipesDirectory);
  const allRecipes = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(recipesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: getLocalizedValue(data.title, locale),
        description: getLocalizedValue(data.description, locale),
        category: data.category || 'main-course',
        tags: data.tags || [],
        image: data.image,
        prepTime: data.prepTime || '',
        cookTime: data.cookTime || '',
        servings: data.servings || 4,
      } as RecipeMeta;
    });

  return allRecipes;
}

export function getRecipeBySlug(slug: string, locale: Locale = 'nl'): Recipe | null {
  try {
    const fullPath = path.join(recipesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: getLocalizedValue(data.title, locale),
      description: getLocalizedValue(data.description, locale),
      category: data.category || 'main-course',
      tags: data.tags || [],
      image: data.image,
      prepTime: data.prepTime || '',
      cookTime: data.cookTime || '',
      servings: data.servings || 4,
      content: getLocalizedContent(content, locale),
    };
  } catch {
    return null;
  }
}

export function getRecipesByCategory(category: string, locale: Locale = 'nl'): RecipeMeta[] {
  const allRecipes = getAllRecipes(locale);
  if (category === 'all') return allRecipes;
  return allRecipes.filter((recipe) => recipe.category === category);
}

export function getRecipesByTag(tag: string, locale: Locale = 'nl'): RecipeMeta[] {
  const allRecipes = getAllRecipes(locale);
  if (tag === 'all') return allRecipes;
  return allRecipes.filter((recipe) => recipe.tags.includes(tag));
}

export function filterRecipes(category?: string, tag?: string, locale: Locale = 'nl'): RecipeMeta[] {
  let recipes = getAllRecipes(locale);
  
  if (category && category !== 'all') {
    recipes = recipes.filter((recipe) => recipe.category === category);
  }
  
  if (tag && tag !== 'all') {
    recipes = recipes.filter((recipe) => recipe.tags.includes(tag));
  }
  
  return recipes;
}

export function getFeaturedRecipes(count: number = 6, locale: Locale = 'nl'): RecipeMeta[] {
  const allRecipes = getAllRecipes(locale);
  return allRecipes.slice(0, count);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(recipesDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(recipesDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}
