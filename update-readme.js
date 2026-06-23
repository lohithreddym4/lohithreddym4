const fs = require("fs");

const USERNAME = "lohithreddym4";

async function github(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json"
    }
  });

  return await res.json();
}

async function getReadme(owner, repo) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.raw"
        }
      }
    );

    if (!res.ok) return null;

    return await res.text();
  } catch {
    return null;
  }
}

(async () => {
  const repos = await github(
    `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`
  );

  let generated = "";

  for (const repo of repos) {
    if (repo.fork) continue;

    generated += `## [${repo.name}](${repo.html_url})\n\n`;

    if (repo.description) {
      generated += `${repo.description}\n\n`;
    }

    const readme = await getReadme(USERNAME, repo.name);

    if (readme) {
      generated += readme
        .replace(/^#.*$/m, "")
        .slice(0, 500);

      generated += "\n\n";
    }

    generated += "---\n\n";
  }

  const readmeFile = fs.readFileSync("README.md", "utf8");

  const updated = readmeFile.replace(
    /<!-- START:REPOS -->([\s\S]*?)<!-- END:REPOS -->/,
    `<!-- START:REPOS -->\n${generated}\n<!-- END:REPOS -->`
  );

  fs.writeFileSync("README.md", updated);
})();
