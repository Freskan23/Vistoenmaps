// Filter real directory sites from Base44 CitationSource data
const fs = require("fs");
const path = require("path");

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "citation-sources-raw.json"), "utf-8")
);

console.log("Total entries:", raw.length);

// Extract root domain from domain field
function getRootDomain(domain) {
  if (!domain) return null;
  // Remove www. prefix
  domain = domain.replace(/^www\./, "");
  return domain.toLowerCase();
}

// Group by root domain (e.g. cylex.es groups es.cylex.es + cylex.es)
function getGroupDomain(domain) {
  if (!domain) return null;
  const parts = domain.split(".");
  // For 3+ part domains like es.polomap.com, group by last 2 parts
  if (parts.length >= 3) {
    return parts.slice(-2).join(".");
  }
  return domain;
}

// First pass: understand the data
const domainMap = new Map();
for (const entry of raw) {
  const domain = getRootDomain(entry.domain);
  if (!domain) continue;
  const groupKey = getGroupDomain(domain);

  if (!domainMap.has(groupKey)) {
    domainMap.set(groupKey, {
      domain: groupKey,
      subdomains: new Set(),
      entries: [],
      totalTimesFound: 0,
      categories: new Set(),
      isPaid: false,
      allowReviews: false,
      maxProjectsCount: 0,
    });
  }

  const group = domainMap.get(groupKey);
  group.subdomains.add(domain);
  group.entries.push(entry);
  group.totalTimesFound += entry.times_found || 0;
  group.maxProjectsCount = Math.max(group.maxProjectsCount, entry.projects_count || 0);
  if (entry.category) group.categories.add(entry.category);
  if (entry.is_paid) group.isPaid = true;
  if (entry.allows_reviews) group.allowReviews = true;
}

console.log("Unique grouped domains:", domainMap.size);

// Known directory domains (curated list of real directories)
const knownDirectories = new Set([
  "cylex.es",
  "paginasamarillas.es",
  "yelp.es",
  "yelp.com",
  "google.com",
  "hotfrog.es",
  "hotfrog.com",
  "europages.es",
  "europages.com",
  "tupaki.es",
  "vulka.es",
  "infoisinfo.es",
  "kompass.com",
  "qdq.com",
  "11870.com",
  "polomap.com",
  "habitissimo.es",
  "cronoshare.com",
  "starofservice.com",
  "listado.es",
  "globaliza.com",
  "trustpilot.com",
  "tripadvisor.es",
  "tripadvisor.com",
  "foursquare.com",
  "telelista.es",
  "cataloxy.es",
  "yalwa.es",
  "misterwhat.es",
  "telefono.es",
  "dondeesta.es",
  "buscoelmejor.com",
  "mapquest.com",
  "manta.com",
  "yellowpages.com",
  "bbb.org",
  "brownbook.net",
  "tupaginaweb.es",
  "guialocal.es",
  "macrotiendas.com",
  "maptons.com",
  "findglocal.com",
  "iglobal.co",
  "enrollbusiness.com",
  "tuugo.es",
  "cybo.com",
  "n49.com",
  "whereorg.com",
  "lasmejoresempresas.es",
]);

// Social media / generic platforms (include as directories of type social)
const socialPlatforms = new Set([
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
  "google.com",
]);

// Patterns that indicate a directory/listing site domain
const directoryDomainPatterns = [
  /directorio/i,
  /listado/i,
  /guia/i,
  /paginas/i,
  /busco/i,
  /encuentra/i,
  /portal/i,
  /comparador/i,
  /mejores/i,
  /yellow/i,
  /pages/i,
  /local/i,
  /review/i,
  /rating/i,
  /opiniones/i,
];

// Filter into directories vs individual business sites
const directories = [];
const businesses = [];

for (const [groupDomain, data] of domainMap) {
  // Social media platform
  if (socialPlatforms.has(groupDomain)) {
    directories.push({
      ...data,
      type: "social",
      subdomains: Array.from(data.subdomains),
      categories: Array.from(data.categories),
    });
    continue;
  }

  // Known directory
  if (knownDirectories.has(groupDomain)) {
    directories.push({
      ...data,
      type: "directory",
      subdomains: Array.from(data.subdomains),
      categories: Array.from(data.categories),
    });
    continue;
  }

  // Heuristic: appears in many different projects/businesses = likely a directory
  if (data.totalTimesFound >= 8 || data.entries.length >= 3 || data.maxProjectsCount >= 3) {
    directories.push({
      ...data,
      type: "directory_inferred",
      subdomains: Array.from(data.subdomains),
      categories: Array.from(data.categories),
    });
    continue;
  }

  // Domain pattern matching
  let isDir = false;
  for (const pat of directoryDomainPatterns) {
    if (pat.test(groupDomain)) {
      isDir = true;
      break;
    }
  }
  if (isDir) {
    directories.push({
      ...data,
      type: "directory_pattern",
      subdomains: Array.from(data.subdomains),
      categories: Array.from(data.categories),
    });
    continue;
  }

  // Everything else is a business site
  businesses.push({
    ...data,
    type: "business",
    subdomains: Array.from(data.subdomains),
    categories: Array.from(data.categories),
  });
}

console.log("\n--- Results ---");
console.log("Directories found:", directories.length);
console.log("Individual businesses:", businesses.length);

// Sort directories by total times found
directories.sort((a, b) => b.totalTimesFound - a.totalTimesFound);

console.log("\nTop 40 directories:");
directories.slice(0, 40).forEach((d, i) => {
  console.log(
    `  ${i + 1}. ${d.domain} (found ${d.totalTimesFound}x, ${d.entries.length} entries, type: ${d.type}, paid: ${d.isPaid}, reviews: ${d.allowReviews})`
  );
});

// Build clean output for the app
const cleanDirectories = directories.map((d) => {
  const firstEntry = d.entries[0];
  return {
    domain: d.domain,
    name: firstEntry.name || d.domain,
    url: "https://" + d.domain,
    description: firstEntry.description || "",
    type: d.type,
    isPaid: d.isPaid,
    allowReviews: d.allowReviews,
    timesFound: d.totalTimesFound,
    entriesCount: d.entries.length,
    categories: d.categories,
    domainAuthority: firstEntry.domain_authority || null,
    geographicScope: firstEntry.geographic_scope || null,
  };
});

// Save filtered data
fs.writeFileSync(
  path.join(__dirname, "directories-filtered.json"),
  JSON.stringify(cleanDirectories, null, 2),
  "utf-8"
);
console.log(
  "\nSaved",
  cleanDirectories.length,
  "directories to scripts/directories-filtered.json"
);

// Stats by type
const byType = {};
for (const d of directories) {
  byType[d.type] = (byType[d.type] || 0) + 1;
}
console.log("\nBy type:", byType);

// Premium candidates: paid OR high times_found OR known important
const premium = cleanDirectories.filter(
  (d) =>
    d.isPaid ||
    d.timesFound >= 50 ||
    d.entriesCount >= 8 ||
    d.type === "directory"
);

// Sort premium by timesFound
premium.sort((a, b) => b.timesFound - a.timesFound);

console.log("\nPremium directory candidates:", premium.length);
premium.forEach((d, i) => {
  console.log(
    `  ${i + 1}. ${d.name} (${d.domain}) - type: ${d.type}, paid: ${d.isPaid}, found: ${d.timesFound}x, reviews: ${d.allowReviews}`
  );
});

// Save premium separately
fs.writeFileSync(
  path.join(__dirname, "directories-premium.json"),
  JSON.stringify(premium, null, 2),
  "utf-8"
);
console.log("\nSaved", premium.length, "premium directories to scripts/directories-premium.json");
