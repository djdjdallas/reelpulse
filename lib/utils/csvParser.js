import Papa from "papaparse";

/**
 * Parse and validate a CSV file of episode metrics.
 *
 * Expected columns: episode_number, date, views, watch_time_seconds,
 * avg_percent_watched, drop_off_point_seconds, likes, shares, comments,
 * unlocks, revenue (in dollars)
 *
 * @param {File} file
 * @param {Array} episodes - existing episodes to validate episode_number against
 * @returns {Promise<{ rows: Array, errors: Array }>}
 */
export function parseMetricsCSV(file, episodes) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete(results) {
        const episodeNumbers = new Set(episodes.map((e) => e.episode_number));
        const episodeMap = {};
        for (const ep of episodes) {
          episodeMap[ep.episode_number] = ep.id;
        }

        const rows = [];
        const errors = [];

        results.data.forEach((row, idx) => {
          const lineNum = idx + 2; // +2 for header + 0-index
          const rowErrors = [];

          // Episode number
          const epNum = parseInt(row.episode_number, 10);
          if (isNaN(epNum)) {
            rowErrors.push(`Row ${lineNum}: Invalid episode_number`);
          } else if (!episodeNumbers.has(epNum)) {
            rowErrors.push(
              `Row ${lineNum}: Episode ${epNum} does not exist in this series`
            );
          }

          // Date
          const dateStr = row.date?.trim();
          if (!dateStr) {
            rowErrors.push(`Row ${lineNum}: Missing date`);
          } else {
            const parsed = new Date(dateStr);
            if (isNaN(parsed.getTime())) {
              rowErrors.push(`Row ${lineNum}: Invalid date "${dateStr}"`);
            }
          }

          // Numeric fields
          const numFields = [
            "views",
            "watch_time_seconds",
            "avg_percent_watched",
            "drop_off_point_seconds",
            "likes",
            "shares",
            "comments",
            "unlocks",
            "revenue",
          ];

          for (const field of numFields) {
            const val = row[field]?.trim();
            if (val && val !== "" && isNaN(Number(val))) {
              rowErrors.push(
                `Row ${lineNum}: "${field}" must be a number, got "${val}"`
              );
            }
          }

          if (rowErrors.length > 0) {
            errors.push(...rowErrors);
          } else {
            rows.push({
              episode_id: episodeMap[epNum],
              episode_number: epNum,
              date: formatDate(dateStr),
              views: toInt(row.views),
              watch_time_seconds: toInt(row.watch_time_seconds),
              avg_percent_watched: toFloat(row.avg_percent_watched),
              drop_off_point_seconds: toIntOrNull(row.drop_off_point_seconds),
              likes: toInt(row.likes),
              shares: toInt(row.shares),
              comments: toInt(row.comments),
              unlocks: toInt(row.unlocks),
              revenue_cents: Math.round(toFloat(row.revenue) * 100),
            });
          }
        });

        resolve({ rows, errors });
      },
      error(err) {
        resolve({ rows: [], errors: [`Parse error: ${err.message}`] });
      },
    });
  });
}

function toInt(val) {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function toFloat(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function toIntOrNull(val) {
  if (!val || val.trim() === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
