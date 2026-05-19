import { existsSync } from "fs";
import { join } from "path";

const IMAGES_DIR = join(import.meta.dir, "..", "public", "images");

// Logo mapping: company name -> { localFile, linkedinSlug?, fallbackUrl? }
const logos: Record<
  string,
  { localFile: string; linkedinSlug?: string; fallbackUrl?: string }
> = {
  Bluvo: { localFile: "bluvo.png", linkedinSlug: "bluvo_logo" },
  Alliance: { localFile: "alliance-logo.png", linkedinSlug: "alliancedao_logo" },
  DipSway: { localFile: "dipsway-logo.png", linkedinSlug: "dipsway_logo" },
  "Founders Inc": { localFile: "finclogo.png", linkedinSlug: "foundersinc_logo" },
  Amazon: { localFile: "amazon-logo.png", linkedinSlug: "amazon_web_services_logo" },
  Groq: {
    localFile: "groq-logo.png",
    fallbackUrl: "https://www.google.com/s2/favicons?domain=groq.com&sz=128",
  },
  "Y Combinator": {
    localFile: "yc-logo.png",
    fallbackUrl: "https://www.google.com/s2/favicons?domain=ycombinator.com&sz=128",
  },
  "Wow Solution": {
    localFile: "wowsolution-logo.png",
    fallbackUrl: "https://www.google.com/s2/favicons?domain=wowsolution.it&sz=128",
  },
};

async function main() {
  // Read LinkedIn HTML
  const linkedinPath = join(import.meta.dir, "linkedin.txt");
  const html = await Bun.file(linkedinPath).text();

  // Extract all company-logo URLs
  const logoUrlRegex =
    /https:\/\/media\.licdn\.com\/dms\/image\/[^"'\s>]+company-logo[^"'\s>]+/g;
  const allUrls = [...html.matchAll(logoUrlRegex)].map((m) =>
    m[0].replace(/&amp;/g, "&")
  );

  console.log(`Found ${allUrls.length} company-logo URLs in LinkedIn HTML\n`);

  for (const [company, config] of Object.entries(logos)) {
    const destPath = join(IMAGES_DIR, config.localFile);

    if (existsSync(destPath)) {
      console.log(`[SKIP] ${company}: ${config.localFile} already exists`);
      continue;
    }

    let url: string | undefined;

    // Try LinkedIn URL first
    if (config.linkedinSlug) {
      url = allUrls.find((u) => u.includes(config.linkedinSlug!));
      if (url) {
        console.log(`[LINKEDIN] ${company}: found URL for ${config.linkedinSlug}`);
      }
    }

    // Fall back to web URL
    if (!url && config.fallbackUrl) {
      url = config.fallbackUrl;
      console.log(`[FALLBACK] ${company}: using ${url}`);
    }

    if (!url) {
      console.log(`[FAIL] ${company}: no URL found`);
      continue;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`[FAIL] ${company}: HTTP ${res.status}`);
        continue;
      }
      const buf = await res.arrayBuffer();
      await Bun.write(destPath, buf);
      console.log(`[OK] ${company}: saved to ${config.localFile} (${buf.byteLength} bytes)`);
    } catch (err) {
      console.log(`[FAIL] ${company}: ${err}`);
    }
  }

  console.log("\nDone!");
}

main();
