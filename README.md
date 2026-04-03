FinTrace — Finance Dashboard
A clean, interactive personal finance dashboard built with React + Vite.

Setup
Prerequisites: Node.js 18+
bash# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
The app runs at http://localhost:5173 by default.

File Structure
finance-minimal/
├── index.html          # HTML shell
├── package.json        # Dependencies
├── vite.config.js      # Vite config
└── src/
    ├── main.jsx        # React entry point
    ├── index.css       # CSS variables, theme, animations
    └── App.jsx         # Everything else (data, state, components)
The entire app lives in 6 files. All logic, data, state management, and UI components are consolidated inside App.jsx to minimize file count while keeping sections clearly separated by comments.

Approach
Architecture
Everything is co-located in App.jsx with sections separated by block comments:

DATA — Seed transactions and category definitions
UTILS — Pure functions for filtering, aggregation, formatting, and export
STATE — React Context + useReducer for global state; localStorage for persistence
COMPONENTS — Inline components: Modal, Dashboard, Transactions, Insights, Sidebar, AppContent

Design

Color system via CSS variables — full dark/light mode with zero JS involvement
Font pairing — Space Mono (monospace, used for numbers and labels) + Sora (humanist sans, used for body text)
Grid background — subtle CSS grid lines for depth
Accent-top cards — each stat card has a colored gradient bar at the top edge that matches its metric color
Hover animations — cards lift on hover with a matching color glow

State Management
Global state is handled by a single useReducer with the following shape:
js{
  transactions: [],     
  role: 'admin',       
  darkMode: true,       
  view: 'dashboard',    
  filters: {
    search, type, category, dateRange, sortBy, sortDir
  }
}
Actions: INIT, ROLE, FILTER, VIEW, DARK, ADD, UPD, DEL
State is persisted to localStorage on every change and rehydrated on load.

Features
Dashboard

4 summary cards — Net Balance, Monthly Income, Monthly Expenses, Savings Rate
Area chart — Income vs. expenses trend across the last 6 months (Recharts)
Donut chart — Spending breakdown by category for the last 30 days
Recent activity feed — Latest 8 transactions with quick-link to full list

Transactions

Full table with date, merchant, category, type badge, and amount
Search — filters by merchant name or category in real time
Type filter — All / Income / Expense
Category filter — any of 10 categories
Date range filter — Last 7 / 30 / 60 days / All time
Sortable columns — Date, Merchant, Amount (click to toggle asc/desc)
Export — Download filtered transactions as CSV or JSON
Admin-only: inline Edit and Delete buttons per row

Role-Based UI
Switch between roles using the toggle in the sidebar:
RoleCapabilitiesAdminView all data + Add, Edit, Delete transactionsViewerRead-only — all mutation controls are hidden
Role is stored in localStorage and persists across sessions.
Add / Edit Transaction (Admin only)
Modal form with:

Type toggle (Income / Expense)
Merchant name, Amount, Date, Category
Client-side validation with inline error messages

Insights

Top spending category — highest spend category in the last 30 days
Month-over-month comparison — % change in expenses vs. previous month
Savings rate — income minus expenses as a % of income, with health rating
Monthly bar chart — net balance per month (green = positive, red = negative)
Category breakdown bars — horizontal progress bars showing % of total spend per category
Monthly summary table — income, expenses, net, and savings % for each of the last 6 months

Dark / Light Mode
Toggle in the sidebar footer. Preference persists to localStorage. Implemented entirely via CSS custom properties — no class toggling on individual elements.
Responsive Design

Desktop (769px+): Sidebar navigation on the left, content area on the right
Mobile (≤768px): Top bar with logo and dark mode toggle, fixed bottom tab bar for navigation


Tech Stack
LibraryVersionPurposeReact18UI frameworkVite6Build tool / dev serverRechartslatestArea, Bar, Pie chartsdate-fnslatestDate arithmetic and formatting
No CSS framework is used — all styling is hand-written inline styles + CSS variables.

Mock Data
The app seeds ~60 transactions across 3 months on first load, spread across 10 categories (Housing, Food, Transport, Entertainment, Health, Shopping, Utilities, Salary, Freelance, Investment). All data is stored in localStorage after the first load, so edits persist across sessions.
To reset to seed data, clear localStorage key ft4 in your browser DevTools.
