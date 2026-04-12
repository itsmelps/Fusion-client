/**
 * utils/helpers.js
 * Reusable utility functions shared across Scholarship module components.
 * F3-REFACTOR: Extracted duplicated logic from PreviousWinners (user + convenor).
 */

// Package resolves at build time; eslint import plugin may not resolve package exports.
// eslint-disable-next-line import/no-unresolved
import { mkConfig, generateCsv, download } from "export-to-csv";

// Award name → backend award_id mapping
// Defined once here; used by both user and convenor PreviousWinners components.
export const AWARD_MAPPING = {
  "Director's Gold": 2,
  "Director's Silver": 3,
  "Merit-cum-means Scholarship": 1,
  "Notional Prizes": 4,
  "D&M Proficiency Gold Medal": 5,
};

// Programme options shared across PreviousWinners selects
export const PROGRAMME_OPTIONS = [
  { value: "B.Tech", label: "B.Tech" },
  { value: "M.Tech", label: "M.Tech" },
  { value: "B.Des", label: "B.Des" },
  { value: "M.Des", label: "M.Des" },
  { value: "PhD", label: "PhD" },
];

// Academic year options (2014 → current year)
export const getYearOptions = () =>
  [...Array(11).keys()].map((i) => ({
    value: `${2014 + i}`,
    label: `${2014 + i}`,
  }));

/**
 * Build a CSV config and return download helpers.
 * @param {string} filename
 */
export const buildCsvHelpers = (filename = "export") => {
  const config = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
    filename,
  });
  const exportAll = (data) => download(config)(generateCsv(config)(data));
  const exportRows = (rows) =>
    download(config)(generateCsv(config)(rows.map((r) => r.original)));
  return { config, exportAll, exportRows };
};

/**
 * Normalise the response from the getPreviousWinnersRoute into an array of
 * { name, roll, program } objects — logic was duplicated across both
 * user/PreviousWinners.jsx and convenor/previousWinnerC.jsx.
 */
export const normaliseWinnersResponse = (data) => {
  if (!data || data.result !== "Success") return [];
  const student_name = data.student_name || [];
  const roll = data.roll || [];
  const student_program = data.student_program || [];
  if (!Array.isArray(student_name)) return [];
  return student_name.map((name, index) => ({
    name,
    roll: roll[index],
    program: student_program[index],
  }));
};

/**
 * Validate a grand_total value.
 * Returns an error string or empty string if valid.
 */
export const validateGrandTotal = (value) => {
  if (value === "" || value === null || value === undefined)
    return "Grand Total is required";
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(value)) return "Must be a valid number";
  if (parseFloat(value) <= 0) return "Must be a positive number";
  return "";
};
