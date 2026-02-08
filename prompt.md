Agency Panel – iOS Dock Navigation

Build the Agency Panel UI.

This panel is similar to the Expert Panel,
but functionality is for agencies.

🚫 Important

Do NOT reuse admin layouts.
Do NOT add header.
Do NOT add top navbar.

This app uses dock navigation only.

🎯 Navigation Style

iOS / macOS dock.

Fixed bottom.
Floating.
Rounded.
Blur background.

4 icons only.

Dashboard
Experts
Workspaces
Settings


Icons + label under icon.

Active tab highlighted.

📱 Mobile First

Design must start from mobile.

No horizontal scroll.
No element outside screen.
Safe area padding.

Dock always visible.

🖥 Desktop

Dock remains bottom center.
Content width max controlled.
Centered like modern SaaS.

🧱 App Structure
AgencyLayout
   ├─ Page Content
   └─ Dock Navigation


Content should scroll.
Dock should stay fixed.

🎨 Visual Feel

Modern.
Calm.
Premium SaaS.

Soft shadows.
Glass / blur ok.

Use existing color system.

📄 Pages Required
1️⃣ Dashboard

Agency overview.

Show:

total hired experts

active contracts

running workspaces

pending approvals

Cards responsive.

2️⃣ Experts

List of experts working for this agency.

Card should show:

photo

name

skills

contract type

status

Click → open expert profile.

3️⃣ Workspaces

Projects handled by agency.

Show:

workspace name

assigned experts

status

start date

Button → open workspace.

4️⃣ Settings

Agency controls.

Include:

company info

billing

agreements

support

notifications

Other future pages can live here.

✨ Interaction Rules

Active icon changes color.

Nice tap animation.

No heavy motion.

🚫 Forbidden

❌ header
❌ sidebar
❌ top navigation
❌ overflowing containers
❌ fixed widths larger than screen

✅ Success =

Feels like modern mobile product.
Thumb friendly.
Clean.
Fast.