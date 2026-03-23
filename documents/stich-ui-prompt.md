# Stich UI Generation Prompt

Copy and paste the following prompt into Stich:

---

**Role & Context:**
Act as an expert Frontend Developer and UI/UX Designer. Create a premium, state-of-the-art dashboard using Next.js (App Router), React, Tailwind CSS, and Lucide React icons.

**Project Overview:**
This is the "Contract Ledger" platform, an AI-based Contract Lifecycle Management (CLM) system. The dashboard is a tool for tenant administrators to monitor audit logs and test AI webhook integrations. 

**Key Features Required:**
1. **Multi-Tenant Switcher (Header/Sidebar):**
   - A sleek dropdown or toggle to switch between "Tenant A (Acme Corp)" and "Tenant B (Globex)".
   - Changing the tenant should visually simulate loading tenant-specific data.

2. **Audit Logs Data Table (Main View):**
   - A modern, clean data table displaying audit events.
   - Columns: Event ID, Action (e.g., `CREATE_CONTRACT`, `RISK_DETECTED`, `SIGNATURE_COMPLETED`), User ID, Resource ID, IP Address, and Timestamp.
   - Use subtle badge colors for different kinds of actions (e.g., Red/Orange for Risk, Green for Create, Blue for info).

3. **AI Webhook Simulator (Sidebar or Modal/Card):**
   - A premium looking card or section titled "Simulate AI Agent Webhook".
   - It should have a button labeled "Trigger AI Risk Alert" that, when clicked, shows a toast notification simulating a webhook being received from an external AI engine.

**Design Aesthetics (Premium & Modern):**
- **Theme:** Sleek Dark Mode by default, utilizing glassmorphism effects where appropriate.
- **Typography:** Modern clean fonts.
- **Layout:** Responsive sidebar navigation with a spacious, well-padded main content area.
- **Micro-interactions:** Add hover effects on table rows, subtle transitions on button clicks, and smooth state changes.
- **Colors:** Avoid generic, boring colors. Use a highly curated color palette (e.g., deep slate/zinc backgrounds, vibrant indigo/purple or emerald accents).

**Technical Constraints:**
- Use valid React and standard Tailwind CSS utility classes.
- Use `lucide-react` for beautiful, consistent iconography.
- Keep the code clean, modular, and ready to be integrated with real backend APIs (mock the data fetching for now).
- Provide responsive design (mobile-friendly) out of the box.
- **Security & Accessibility:**
  - Do not hardcode authentication tokens or secrets; use environment variables or mock tokens for local/dev.
  - All interactive components must support keyboard navigation and focus management (tab, enter/space, arrow keys) and provide visible focus styles.
  - Include ARIA roles/labels and semantic HTML for widgets (use aria-label, role, aria-expanded, aria-hidden where appropriate).
  - Ensure text contrast and provide alt text for images.

---
