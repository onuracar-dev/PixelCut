/**
 * Lightweight Client-Side CSS Hygiene & Bloat Analyzer
 * Detects whether student extracted only needed rules or dumped entire 5000-line framework.
 */

export interface CssAnalysisResult {
  totalLines: number;
  totalSelectors: number;
  unusedSelectors: number;
  unusedPercent: number; // 0 to 100
  isBloated: boolean;
  cleanScore: number;    // 0 to 100
  warnings: string[];
}

export function analyzeCssHygiene(html: string, css: string): CssAnalysisResult {
  const lines = css.split('\n').filter((l) => l.trim().length > 0);
  const totalLines = lines.length;

  // Extract class names present in HTML: class="..." or class='...'
  const htmlClassMatches = Array.from(html.matchAll(/class=["']([^"']+)["']/g));
  const htmlClasses = new Set<string>();
  for (const match of htmlClassMatches) {
    const classNames = match[1].split(/\s+/).filter(Boolean);
    classNames.forEach((c) => htmlClasses.add(c));
  }

  // Extract class selectors from CSS: .class-name
  const cssClassMatches = Array.from(css.matchAll(/\.([a-zA-Z0-9_-]+)(?=[\s,{:>.])/g));
  const cssClasses = new Set<string>();
  for (const match of cssClassMatches) {
    cssClasses.add(match[1]);
  }

  let unusedCount = 0;
  const warnings: string[] = [];

  cssClasses.forEach((cls) => {
    if (!htmlClasses.has(cls)) {
      unusedCount++;
    }
  });

  const totalSelectors = Math.max(cssClasses.size, 1);
  const unusedPercent = Math.min(
    Math.round((unusedCount / totalSelectors) * 100),
    100
  );

  const isBloated = unusedPercent > 35 || totalLines > 350;

  // Cleanliness score formula
  let cleanScore = 100 - unusedPercent;
  if (totalLines > 200) {
    cleanScore = Math.max(0, cleanScore - Math.round((totalLines - 200) / 10));
  }
  cleanScore = Math.max(10, Math.min(cleanScore, 100));

  if (unusedPercent > 50) {
    warnings.push(`Kritik: CSS'teki sınıfların %${unusedPercent}'i HTML'de kullanılmıyor. Şablon kodunu ayıklamadınız.`);
  } else if (unusedPercent > 20) {
    warnings.push(`Uyarı: %${unusedPercent} kullanılmayan CSS kuralı mevcut. Temizleme yapabilirsiniz.`);
  }

  if (totalLines > 250) {
    warnings.push(`Satır sayısı hedefin üzerinde (${totalLines} satır). Sadece bu bileşene ait stilleri bırakın.`);
  }

  return {
    totalLines,
    totalSelectors,
    unusedSelectors: unusedCount,
    unusedPercent,
    isBloated,
    cleanScore,
    warnings,
  };
}
