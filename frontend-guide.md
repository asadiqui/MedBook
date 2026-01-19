# Design System & Style Guide

> "Keep it clean. Use `bg-gray-50` for the page background and `bg-white` for containers. Round the corners (`rounded-xl`). Use blue (`blue-600`) for primary actions only. For status indicators, use colored text on light pastel backgrounds (pills)."

## 1. Color Palette

The platform uses a "Clean Medical" aesthetic: high contrast, sterile whites/grays, and a trustworthy primary blue.

* **Primary Action Color:** Bright Royal Blue. Used for main buttons ("New Appointment", "Start Session").
    * *Approx:* `bg-blue-600` (Hover: `bg-blue-700`)

* **Page Background:** Very Light Cool Gray. The canvas behind the cards is not pure white.
    * *Approx:* `bg-gray-50` or `bg-slate-50`

* **Surface (Card) Color:** Pure White. Used for the sidebar, top header, and content cards.
    * *Approx:* `bg-white`

* **Text Colors:**
    * **Headings:** Dark Slate/Black (`text-gray-900` or `text-slate-900`).
    * **Body/Labels:** Medium Cool Gray (`text-gray-500` or `text-slate-500`).

## 2. Shapes & Borders (The "Vibe")

* **Border Radius:** The UI is soft and friendly.
    * **Cards & Modals:** Generous rounding. Use `rounded-xl` (approx 12px) or `rounded-2xl` (16px).
    * **Buttons:** Nearly pill-shaped or fully rounded. Use `rounded-lg` or `rounded-full`.
    * **Inputs:** Standard rounding. Use `rounded-md` or `rounded-lg`.

* **Shadows:** Very subtle. The design looks mostly "flat" but uses faint shadows to lift cards off the gray background.
    * *Class:* `shadow-sm` or `border border-gray-100`.

## 3. UI Components Guide

### **A. Buttons**

* **Primary Button:** Solid Blue background, White text. No border.
    * *Style:* `bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition`

* **Secondary/Filter Button:** Light Gray background, Dark text.
    * *Style:* `bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200`

* **Icon Buttons:** (Like the notification bell or pagination arrows) Transparent background with gray icon.

### **B. Cards (Containers)**

Any new section (like a "Doctor Profile" or "Symptom Summary") should be inside a Card.

* **Style:** Pure white background, subtle border or shadow, rounded corners.
* *Code:* `<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"> ... </div>`

### **C. Status Badges (Pills)**

Used heavily for "Confirmed", "Pending", "Active".

* **Shape:** Fully rounded ends (`rounded-full`).
* **Style:** Pastel background with darker text of the same hue.
    * *Confirmed/Active:* Light Green bg (`bg-green-100`) + Green text (`text-green-700`).
    * *Pending/Wait:* Light Orange/Yellow bg (`bg-orange-100`) + Orange text (`text-orange-700`).
    * *Cancelled/Inactive:* Light Red/Pink bg (`bg-red-100`) + Red text (`text-red-700`).

### **D. Typography**

* **Font Family:** Sans-serif (Looks like Inter, Roboto, or SF Pro).
* **Headings:** Bold but clean.
    * *Page Titles:* `text-2xl font-bold text-gray-900`
    * *Card Titles:* `text-lg font-semibold text-gray-800`

## 4. Layout & Spacing

* **Sidebar:** Fixed width (approx 250px), pure white, distinct from the main content.
* **Grid Gaps:** There is plenty of breathing room. Don't crowd elements.
    * Space between cards: `gap-6` (24px).
    * Padding inside cards: `p-6` (24px).

# Layout Description

Here are the layout descriptions for the platform, which can be used for the project documentation or design system.

## 1. Dashboard (Home)

* **The Layout:** The page features a **left-hand sidebar** for navigation. The **main content area** is a complex grid:
    * **Top Row:** A welcome header on the left and a "Quick Actions" button set on the right.
    * **Second Row:** Three equal-width **statistic cards** (Total Patients, Pending Requests, Average Wait Time).
    * **Main Grid:** A two-column split below the stats.
        * **Left Column (Wider):** Contains a large "Next Up" patient card followed by a list of "Upcoming Appointments."
        * **Right Column (Narrower):** Stacked vertically with a Calendar widget on top and an "Activity Feed" list below it.

## 2. Appointments Page

* **The Layout:** A standard admin layout with a **fixed sidebar on the left**. The **center content area** is stacked vertically:
    * **Top:** A row of three summary cards (Today's Appointments, Pending Approval, Total Patients) providing high-level metrics.
    * **Middle:** A control bar containing a search field on the left and dropdown filters (Status, Date, Type) on the right.
    * **Bottom:** A detailed **data table** listing appointments with columns for patient info, date/time, reason, status, and actions.



## 3. Patient Management Page

* **The Layout:** The layout consists of a **sidebar navigation on the left** and a large **content panel on the right**.
    * **Header Area:** Features the page title ("Patient Management") on the left and primary action buttons ("Export CSV", "Add New Patient") on the right.
    * **Filter Bar:** A wide search bar spans the left/center, with filter dropdowns (Status, Last Visit) aligned to the right.
    * **Main Content:** A full-width **list view/table** displaying patient profiles, IDs, last visit dates, conditions, and status badges.



## 4. Messages (Chat) Page

* **The Layout:** A **three-pane layout** optimized for communication:
    * **Left Pane:** The standard application navigation sidebar.
    * **Middle Pane:** A "Messages" list sidebar displaying active conversations, search, and message filters (All, Unread, Archived).
    * **Right Pane:** The **main chat interface**, occupying the largest space. It includes a conversation header (Patient Name/Status), the scrollable message history (bubbles), and a message input area at the bottom.



## 5. Landing Page (Public Website)

* **The Layout:** A classic **single-column marketing layout**:
    * **Navbar:** A sticky top navigation bar with the logo on the left, links in the center, and "Login/Register" buttons on the right.
    * **Hero Section:** A split layout with **text and CTA buttons** (Register/Login) on the left and a **feature image** on the right.
    * **Features Section:** A three-column grid below the fold, displaying "Search Specialist," "Select Schedule," and "Get Care" cards with icons and centered text.

## 6. Empty / Generic Page State

* **The Layout:** The layout establishes the **shell structure** of the application. It features the **fixed sidebar on the left** for navigation and a **top header bar** containing the global search input, notification icons, and user profile. The central content area is currently empty, serving as a container for dynamic pages.