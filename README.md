# 🐐 De Smakelijke Bok

A cozy, kawaii-style cookbook website built with Next.js. Share your favorite recipes with a warm and inviting aesthetic inspired by cozy cooking games.

## ✨ Features

- **Bilingual Support** - Full Dutch/English translations (UI and recipes)
- **Recipe Management** - Recipes stored as Markdown files for easy editing
- **Favorites System** - Save your favorite recipes (stored in localStorage)
- **Dark Mode** - Toggle between light and cozy dark themes
- **Responsive Design** - Mobile-first design with dropdown menu on mobile, navbar on desktop
- **Recipe Filtering** - Filter by category (appetizer, main course, dessert) and tags (sweet, savory, easy)

## 🎨 Design

The website features a "cozy kawaii game art style" with:
- Soft pastel color palette (cream, sage green, peach, dusty blue)
- Rounded, friendly shapes
- Quicksand & Nunito typography
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/de-smakelijke-bok.git

# Navigate to the project
cd de-smakelijke-bok

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 📁 Project Structure

```
de-smakelijke-bok/
├── messages/              # Translation files
│   ├── en.json           # English translations
│   └── nl.json           # Dutch translations
├── public/
│   └── images/           # Static images (logo, mascot)
├── src/
│   ├── app/
│   │   └── [locale]/     # Locale-based routing
│   │       ├── page.tsx          # Homepage
│   │       ├── about/            # About page
│   │       ├── recipes/          # Recipe listing & detail pages
│   │       └── favorites/        # Favorites page
│   ├── components/       # Reusable UI components
│   ├── content/
│   │   └── recipes/      # Markdown recipe files
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization config
│   └── lib/              # Utility functions
└── middleware.ts         # i18n middleware
```

## 📝 Adding a New Recipe

Create a new `.md` file in `src/content/recipes/`:

```markdown
---
slug: "recipe-slug"
category: "main-course"  # appetizer | main-course | dessert
tags: ["savory", "easy"] # sweet | savory | easy
image: ""                # Optional image path
prepTime: "15 min"
cookTime: "30 min"
servings: 4

title:
  nl: "Nederlandse Titel"
  en: "English Title"

description:
  nl: "Nederlandse beschrijving."
  en: "English description."
---

<!-- NL -->
## Ingrediënten
- Ingredient 1
- Ingredient 2

## Bereiding
1. Stap 1
2. Stap 2

---

<!-- EN -->
## Ingredients
- Ingredient 1
- Ingredient 2

## Instructions
1. Step 1
2. Step 2
```

## 🌐 Internationalization

The website supports Dutch (default) and English. Translations are managed via:
- `messages/nl.json` - Dutch UI translations
- `messages/en.json` - English UI translations
- Recipe files contain both languages in frontmatter and content sections

Switch languages using the NL/EN toggle in the navigation bar.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Markdown**: [gray-matter](https://github.com/jonschlinkert/gray-matter) + [react-markdown](https://github.com/remarkjs/react-markdown)
- **TypeScript**: Full type safety

## 📜 License

This project is licensed under the MIT License.

---

Made with ♥ by De Smakelijke Bok
