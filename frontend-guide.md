Design System & Style Guide
"Keep it clean. Use bg-gray-50 for the page background and bg-white for containers. Round the corners (rounded-xl). Use blue (blue-600) for primary actions only. For status indicators, use colored text on light pastel backgrounds (pills)."

1. Color Palette
The platform uses a "Clean Medical" aesthetic: high contrast, sterile whites/grays, and a trustworthy primary blue.

Primary Action Color: Bright Royal Blue. Used for main buttons ("New Appointment", "Start Session").

Approx: bg-blue-600 (Hover: bg-blue-700)
Page Background: Very Light Cool Gray. The canvas behind the cards is not pure white.

Approx: bg-gray-50 or bg-slate-50
Surface (Card) Color: Pure White. Used for the sidebar, top header, and content cards.

Approx: bg-white
Text Colors:

Headings: Dark Slate/Black (text-gray-900 or text-slate-900).
Body/Labels: Medium Cool Gray (text-gray-500 or text-slate-500).
2. Shapes & Borders (The "Vibe")
Border Radius: The UI is soft and friendly.

Cards & Modals: Generous rounding. Use rounded-xl (approx 12px) or rounded-2xl (16px).
Buttons: Nearly pill-shaped or fully rounded. Use rounded-lg or rounded-full.
Inputs: Standard rounding. Use rounded-md or rounded-lg.
Shadows: Very subtle. The design looks mostly "flat" but uses faint shadows to lift cards off the gray background.

Class: shadow-sm or border border-gray-100.
3. UI Components Guide
A. Buttons
Primary Button: Solid Blue background, White text. No border.

Style: bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition
Secondary/Filter Button: Light Gray background, Dark text.

Style: bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200
Icon Buttons: (Like the notification bell or pagination arrows) Transparent background with gray icon.

B. Cards (Containers)
Any new section (like a "Doctor Profile" or "Symptom Summary") should be inside a Card.

Style: Pure white background, subtle border or shadow, rounded corners.
Code: <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"> ... </div>
C. Status Badges (Pills)
Used heavily for "Confirmed", "Pending", "Active".

Shape: Fully rounded ends (rounded-full).
Style: Pastel background with darker text of the same hue.
Confirmed/Active: Light Green bg (bg-green-100) + Green text (text-green-700).
Pending/Wait: Light Orange/Yellow bg (bg-orange-100) + Orange text (text-orange-700).
Cancelled/Inactive: Light Red/Pink bg (bg-red-100) + Red text (text-red-700).
D. Typography
Font Family: Sans-serif (Looks like Inter, Roboto, or SF Pro).
Headings: Bold but clean.
Page Titles: text-2xl font-bold text-gray-900
Card Titles: text-lg font-semibold text-gray-800
4. Layout & Spacing
Sidebar: Fixed width (approx 250px), pure white, distinct from the main content.
Grid Gaps: There is plenty of breathing room. Don't crowd elements.
Space between cards: gap-6 (24px).
Padding inside cards: p-6 (24px).
