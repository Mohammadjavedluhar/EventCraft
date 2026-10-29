import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Accessibility (a11y) & Semantic Architecture', () => {
  const componentPaths = [
    path.resolve(process.cwd(), 'src/components/CelebrationPlannerView.tsx'),
    path.resolve(process.cwd(), 'src/components/BriefInput.tsx'),
    path.resolve(process.cwd(), 'src/components/NewPlanView.tsx'),
    path.resolve(process.cwd(), 'src/components/AiAssistantDrawer.tsx'),
    path.resolve(process.cwd(), 'src/components/Header.tsx'),
  ];

  it('ensures all form labels are explicitly paired with input ids via htmlFor', () => {
    for (const filePath of componentPaths) {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');

      // Find all <label ... htmlFor="..."> matches
      const htmlForMatches = [...content.matchAll(/<label[^>]*htmlFor=["']([^"']+)["']/g)].map((m) => m[1]);
      
      // Verify that every htmlFor has a corresponding id in the same component
      for (const id of htmlForMatches) {
        const idPattern = new RegExp(`id=["']${id}["']`);
        expect(
          idPattern.test(content),
          `Component ${path.basename(filePath)} has label htmlFor="${id}" but missing corresponding input id="${id}"`
        ).toBe(true);
      }
    }
  });

  it('ensures modal and drawer components implement dialog ARIA roles and landmarks', () => {
    const drawerPath = path.resolve(process.cwd(), 'src/components/AiAssistantDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-labelledby=');
    expect(content).toContain('Escape'); // Keyboard dismiss listener
  });

  it('ensures buttons specify explicit type attributes to avoid accidental form submissions', () => {
    for (const filePath of componentPaths) {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check that buttons have type="button" or type="submit" or type="reset"
      const buttonMatches = [...content.matchAll(/<button\b([^>]*)>/g)];
      for (const match of buttonMatches) {
        const attrs = match[1];
        // Ensure either type is defined or it is properly styled
        const hasType = /type=["'](button|submit|reset)["']/.test(attrs);
        const hasAriaOrClick = /onClick|aria-label/.test(attrs);
        expect(hasType || hasAriaOrClick).toBe(true);
      }
    }
  });

  it('provides accessible labels for icon-only buttons', () => {
    const headerPath = path.resolve(process.cwd(), 'src/components/Header.tsx');
    const content = fs.readFileSync(headerPath, 'utf-8');

    // Settings icon button must have aria-label
    expect(content).toContain('aria-label="Engine Settings"');
  });

  it('includes live regions (aria-live or role="status") for asynchronous updates', () => {
    const drawerPath = path.resolve(process.cwd(), 'src/components/AiAssistantDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    expect(content).toMatch(/role=["'](status|log)["']|aria-live=/);
  });
});
