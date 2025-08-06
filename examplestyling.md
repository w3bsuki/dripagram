TailwindCSS v4 Design System with Perfect OKLCH Colors
A comprehensive design system built with TailwindCSS v4, leveraging OKLCH color space, modern CSS features, and best practices for scalable web applications.

🚀 Key Features
OKLCH Color Space: Wide gamut colors with better perceptual uniformity

CSS-First Configuration: No more JavaScript config files

100x Faster Builds: Revolutionary performance improvements

Modern CSS Features: Native cascade layers, @property, color-mix()

Automatic Content Detection: Zero configuration needed

Built-in Theming: Dynamic theme switching with CSS variables

📁 Project Structure
text
design-system/
├── css/
│ ├── main.css # Main stylesheet with @theme
│ ├── themes/
│ │ ├── light.css # Light theme variables
│ │ └── dark.css # Dark theme variables
│ └── components/
│ ├── buttons.css # Button components
│ └── cards.css # Card components
├── examples/
│ └── components/ # HTML examples
└── docs/
└── guidelines.md # Design guidelines
🎨 Color System
OKLCH Format
css
oklch(Lightness Chroma Hue)
/_ Example: oklch(0.715 0.143 215.221) _/
Primary Color Palette
css
@theme {
--color-primary-50: oklch(0.984 0.019 200.873);
--color-primary-100: oklch(0.956 0.045 203.388);
--color-primary-200: oklch(0.917 0.08 205.041);
--color-primary-300: oklch(0.865 0.127 207.078);
--color-primary-400: oklch(0.789 0.154 211.53);
--color-primary-500: oklch(0.715 0.143 215.221);
--color-primary-600: oklch(0.609 0.126 221.723);
--color-primary-700: oklch(0.52 0.105 223.128);
--color-primary-800: oklch(0.45 0.085 224.283);
--color-primary-900: oklch(0.398 0.07 227.392);
--color-primary-950: oklch(0.302 0.056 229.695);
}
Semantic Colors
css
@theme {
--color-background: oklch(0.985 0.002 247.839);
--color-foreground: oklch(0.13 0.028 261.692);
--color-muted: oklch(0.928 0.006 264.531);
--color-border: oklch(0.872 0.01 258.338);
--color-success: oklch(0.723 0.219 149.579);
--color-warning: oklch(0.769 0.188 70.08);
--color-error: oklch(0.637 0.237 25.331);
--color-info: oklch(0.685 0.169 237.323);
}
🔤 Typography System
Font Families
css
@theme {
--font-display: "Inter Variable", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono Variable", "Consolas", monospace;
--font-heading: "Poppins", system-ui, sans-serif;
}
Type Scale
css
@theme {
--font-size-xs: 0.75rem; /_ 12px _/
--font-size-sm: 0.875rem; /_ 14px _/
--font-size-base: 1rem; /_ 16px _/
--font-size-lg: 1.125rem; /_ 18px _/
--font-size-xl: 1.25rem; /_ 20px _/
--font-size-2xl: 1.5rem; /_ 24px _/
--font-size-3xl: 1.875rem; /_ 30px _/
--font-size-4xl: 2.25rem; /_ 36px _/
--font-size-5xl: 3rem; /_ 48px _/
--font-size-6xl: 3.75rem; /_ 60px _/
}
Line Heights
css
@theme {
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
}
📐 Spacing System
Base Unit and Scale
css
@theme {
/_ Base unit - all spacing derives from this _/
--spacing: 0.25rem;

/_ Custom spacing values _/
--spacing-xs: calc(var(--spacing) _ 1); /_ 4px _/
--spacing-sm: calc(var(--spacing) _ 2); /_ 8px _/
--spacing-md: calc(var(--spacing) _ 4); /_ 16px _/
--spacing-lg: calc(var(--spacing) _ 6); /_ 24px _/
--spacing-xl: calc(var(--spacing) _ 8); /_ 32px _/
--spacing-2xl: calc(var(--spacing) _ 12); /_ 48px _/
--spacing-3xl: calc(var(--spacing) _ 16); /_ 64px \*/
}
📱 Responsive Breakpoints
css
@theme {
--breakpoint-xs: 475px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
--breakpoint-3xl: 1920px;
--breakpoint-4xl: 2560px;
}
🌓 Theme Configuration
Light Theme (Default)
css
:root {
--background: oklch(1 0 0);
--foreground: oklch(0.13 0.028 261.692);
--card: oklch(1 0 0);
--card-foreground: oklch(0.13 0.028 261.692);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.13 0.028 261.692);
--primary: oklch(0.715 0.143 215.221);
--primary-foreground: oklch(1 0 0);
--secondary: oklch(0.967 0.003 264.542);
--secondary-foreground: oklch(0.278 0.033 256.848);
--muted: oklch(0.967 0.003 264.542);
--muted-foreground: oklch(0.446 0.03 256.802);
--accent: oklch(0.967 0.003 264.542);
--accent-foreground: oklch(0.278 0.033 256.848);
--destructive: oklch(0.637 0.237 25.331);
--destructive-foreground: oklch(1 0 0);
--border: oklch(0.872 0.01 258.338);
--input: oklch(0.872 0.01 258.338);
--ring: oklch(0.715 0.143 215.221);
}
Dark Theme
css
.dark {
--background: oklch(0.13 0.028 261.692);
--foreground: oklch(0.967 0.003 264.542);
--card: oklch(0.13 0.028 261.692);
--card-foreground: oklch(0.967 0.003 264.542);
--popover: oklch(0.13 0.028 261.692);
--popover-foreground: oklch(0.967 0.003 264.542);
--primary: oklch(0.789 0.154 211.53);
--primary-foreground: oklch(0.13 0.028 261.692);
--secondary: oklch(0.278 0.033 256.848);
--secondary-foreground: oklch(0.967 0.003 264.542);
--muted: oklch(0.278 0.033 256.848);
--muted-foreground: oklch(0.707 0.022 261.325);
--accent: oklch(0.278 0.033 256.848);
--accent-foreground: oklch(0.967 0.003 264.542);
--destructive: oklch(0.718 0.202 349.761);
--destructive-foreground: oklch(1 0 0);
--border: oklch(0.278 0.033 256.848);
--input: oklch(0.278 0.033 256.848);
--ring: oklch(0.789 0.154 211.53);
}
Registering Theme Colors
css
@theme inline {
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-card: var(--card);
--color-card-foreground: var(--card-foreground);
--color-primary: var(--primary);
--color-primary-foreground: var(--primary-foreground);
--color-secondary: var(--secondary);
--color-secondary-foreground: var(--secondary-foreground);
--color-muted: var(--muted);
--color-muted-foreground: var(--muted-foreground);
--color-accent: var(--accent);
--color-accent-foreground: var(--accent-foreground);
--color-destructive: var(--destructive);
--color-destructive-foreground: var(--destructive-foreground);
--color-border: var(--border);
--color-input: var(--input);
--color-ring: var(--ring);
}
🎭 Animation System
Custom Animations
css
@theme {
--animate-fade-in: fade-in 0.2s ease-out;
--animate-slide-up: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
--animate-slide-down: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1);
--animate-scale-up: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
--animate-bounce-in: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);

@keyframes fade-in {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes slide-up {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

@keyframes slide-down {
from {
opacity: 0;
transform: translateY(-10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

@keyframes scale-up {
from {
opacity: 0;
transform: scale(0.95);
}
to {
opacity: 1;
transform: scale(1);
}
}

@keyframes bounce-in {
0% {
opacity: 0;
transform: scale(0.3);
}
50% {
opacity: 1;
transform: scale(1.1);
}
100% {
opacity: 1;
transform: scale(1);
}
}
}
Easing Functions
css
@theme {
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-snappy: cubic-bezier(0.2, 0, 0, 1);
--ease-fluid: cubic-bezier(0.3, 0, 0, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
🎯 Shadow System
css
@theme {
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/_ Colored shadows _/
--shadow-primary: 0 4px 14px 0 rgb(59 130 246 / 0.15);
--shadow-success: 0 4px 14px 0 rgb(34 197 94 / 0.15);
--shadow-warning: 0 4px 14px 0 rgb(245 158 11 / 0.15);
--shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.15);
}
🔧 Component Utilities
Button Variants
css
@layer components {
.btn {
@apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200;
@apply focus:outline-none focus:ring-2 focus:ring-offset-2;
@apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
@apply btn bg-primary text-primary-foreground;
@apply hover:bg-primary/90 active:bg-primary/80;
@apply focus:ring-primary/50;
}

.btn-secondary {
@apply btn bg-secondary text-secondary-foreground;
@apply hover:bg-secondary/90 active:bg-secondary/80;
@apply focus:ring-secondary/50;
}

.btn-outline {
@apply btn border border-border bg-background text-foreground;
@apply hover:bg-accent hover:text-accent-foreground;
@apply focus:ring-ring;
}

.btn-ghost {
@apply btn text-foreground;
@apply hover:bg-accent hover:text-accent-foreground;
@apply focus:ring-ring;
}

.btn-destructive {
@apply btn bg-destructive text-destructive-foreground;
@apply hover:bg-destructive/90 active:bg-destructive/80;
@apply focus:ring-destructive/50;
}
}
Card Components
css
@layer components {
.card {
@apply bg-card text-card-foreground rounded-lg border border-border;
@apply shadow-sm hover:shadow-md transition-shadow duration-200;
}

.card-header {
@apply flex flex-col space-y-1.5 p-6 pb-4;
}

.card-title {
@apply text-lg font-semibold leading-none tracking-tight;
}

.card-description {
@apply text-sm text-muted-foreground;
}

.card-content {
@apply p-6 pt-0;
}

.card-footer {
@apply flex items-center p-6 pt-0;
}
}
Form Components
css
@layer components {
.input {
@apply flex h-10 w-full rounded-md border border-input;
@apply bg-background px-3 py-2 text-sm;
@apply ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium;
@apply placeholder:text-muted-foreground;
@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
@apply disabled:cursor-not-allowed disabled:opacity-50;
}

.label {
@apply text-sm font-medium leading-none;
@apply peer-disabled:cursor-not-allowed peer-disabled:opacity-70;
}

.textarea {
@apply flex min-h-20 w-full rounded-md border border-input;
@apply bg-background px-3 py-2 text-sm;
@apply ring-offset-background placeholder:text-muted-foreground;
@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
@apply disabled:cursor-not-allowed disabled:opacity-50;
}

.select {
@apply flex h-10 w-full items-center justify-between rounded-md border border-input;
@apply bg-background px-3 py-2 text-sm;
@apply ring-offset-background placeholder:text-muted-foreground;
@apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
@apply disabled:cursor-not-allowed disabled:opacity-50;
}
}
🚦 Usage Examples
Basic Layout
xml

<!DOCTYPE html>
<html class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Example</title>
  <link rel="stylesheet" href="./css/main.css">
</head>
<body class="bg-background text-foreground antialiased">
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-bold mb-8">TailwindCSS v4 Design System</h1>
    
    <!-- Button Examples -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Buttons</h2>
      <div class="space-x-4">
        <button class="btn-primary">Primary Button</button>
        <button class="btn-secondary">Secondary Button</button>
        <button class="btn-outline">Outline Button</button>
        <button class="btn-ghost">Ghost Button</button>
        <button class="btn-destructive">Destructive Button</button>
      </div>
    </section>
    
    <!-- Card Example -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Cards</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Feature Card</h3>
            <p class="card-description">A beautiful card component with perfect spacing.</p>
          </div>
          <div class="card-content">
            <p>This card demonstrates the design system's typography and spacing scales.</p>
          </div>
          <div class="card-footer">
            <button class="btn-primary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Form Example -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Forms</h2>
      <div class="max-w-md">
        <div class="space-y-4">
          <div>
            <label class="label">Email</label>
            <input type="email" class="input" placeholder="Enter your email">
          </div>
          <div>
            <label class="label">Message</label>
            <textarea class="textarea" placeholder="Enter your message"></textarea>
          </div>
          <button class="btn-primary w-full">Send Message</button>
        </div>
      </div>
    </section>
    
    <!-- Theme Toggle -->
    <button onclick="toggleTheme()" class="btn-outline">
      Toggle Theme
    </button>
  </div>
  
  <script>
    function toggleTheme() {
      const html = document.documentElement;
      html.classList.toggle('dark');
    }
  </script>
</body>
</html>
Color Usage
xml
<!-- Using semantic colors -->
<div class="bg-background text-foreground border-border">
  <h2 class="text-primary">Primary Heading</h2>
  <p class="text-muted-foreground">Muted text content</p>
  <button class="bg-primary text-primary-foreground">Primary Action</button>
</div>

<!-- Using color palette with opacity -->
<div class="bg-primary/10 border border-primary/20">
  <p class="text-primary/80">Translucent primary text</p>
</div>

<!-- Using color variables in CSS -->
<style>
.custom-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
}

.custom-shadow {
  box-shadow: 0 4px 12px var(--color-primary/25%);
}
</style>

Responsive Design
xml

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
  <div class="text-sm sm:text-base lg:text-lg 2xl:text-xl">
    Responsive typography scaling
  </div>
</div>

<div class="p-4 sm:p-6 lg:p-8 2xl:p-12">
  Responsive spacing
</div>
🛠️ Installation & Setup
1. Install TailwindCSS v4
bash
npm install tailwindcss@latest @tailwindcss/vite@latest
# or
npm install tailwindcss@latest @tailwindcss/postcss@latest
2. Configure Vite (Recommended)
javascript
// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
plugins: [
tailwindcss(),
],
}) 3. Create Main CSS File
css
/_ css/main.css _/
@import "tailwindcss";

/_ Import your theme configuration _/
@import "./themes/light.css";
@import "./themes/dark.css";
@import "./components/buttons.css";
@import "./components/cards.css";
@import "./components/forms.css";

/_ Your theme configuration goes here _/
@theme {
/_ Colors, typography, spacing, etc. _/
} 4. Add Theme Toggle Script
javascript
// js/theme-toggle.js
class ThemeToggle {
constructor() {
this.init();
}

init() {
// Check for saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
this.setTheme(savedTheme);

    // Listen for theme toggle events
    this.addEventListeners();

}

setTheme(theme) {
document.documentElement.classList.toggle('dark', theme === 'dark');
localStorage.setItem('theme', theme);
}

toggle() {
const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
const newTheme = currentTheme === 'light' ? 'dark' : 'light';
this.setTheme(newTheme);
}

addEventListeners() {
const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
toggleButtons.forEach(button => {
button.addEventListener('click', () => this.toggle());
});
}
}

// Initialize theme toggle
new ThemeToggle();
📚 Best Practices

1. Color System
   Use OKLCH for all custom colors for better color manipulation

Define semantic color tokens (background, foreground, primary, etc.)

Use CSS variables for theming and dynamic color switching

Maintain consistent contrast ratios for accessibility

2. Typography
   Use a modular scale for font sizes

Define semantic font families (display, body, mono)

Use relative units (rem) for scalability

Consider line height for optimal readability

3. Spacing
   Use a consistent spacing scale based on a base unit

Use calc() functions to create derived spacing values

Consider both horizontal and vertical rhythm

Use logical properties for better RTL support

4. Configuration
   Organize tokens by purpose (colors, typography, spacing)

Use descriptive names for semantic tokens

Document your design system thoroughly

Use @theme inline for referencing other CSS variables

5. Components
   Create reusable component classes with @layer components

Use @apply to combine utilities

Maintain consistent naming conventions

Consider state variations (hover, focus, active)

6. Performance
   Leverage Tailwind's automatic content detection

Use @source directive for external libraries

Consider purging unused styles in production

Take advantage of v4's performance improvements

🔍 Migration from v3
Key Changes
CSS-first configuration: Use @theme instead of tailwind.config.js

OKLCH colors: All default colors now use OKLCH format

Removed deprecated utilities: Clean up old utility classes

New installation process: Simpler setup with fewer dependencies

Migration Steps
Run the automated upgrade tool: npx @tailwindcss/upgrade

Move configuration from JS to CSS using @theme

Update color values to OKLCH format

Remove deprecated utilities from templates

Test thoroughly across browsers and devices
