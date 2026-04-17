/**
 * services/api.js
 * Centralized API communication layer for the Scholarships module.
 * All backend calls are defined here. Components import from this file
 * instead of calling fetch/axios directly.
 *
 * F1-REFACTOR: Extracted all inline fetch/axios calls from components.
 */

import axios from "axios";
import {
  checkApplicationWindow,
  submitMCMApplicationsRoute,
  submitSilverRoute,
  showDirectorGoldSubmitRoute,
  submitPdmRoute,
  getMCMApplicationsRoute,
  updateMCMStatusRoute,
  getDirectorGoldApplicationsRoute,
  getDirectorSilverApplicationsRoute,
  getProficiencyDMApplicationsRoute,
  updateDirectorGoldStatusRoute,
  updateDirectorSilverStatusRoute,
  updateProficiencyDMStatusRoute,
  scholarshipNotification,
  showAwardRoute,
  updateCatalogRoute,
  getPreviousWinnersRoute,
  showMcmStatusRoute,
  showGoldStatusRoute,
  showSilverStatusRoute,
  showPdmStatusRoute,
  inviteApplicationsRoute,
} from "../../../routes/SPACSRoutes";
import { host } from "../../../routes/globalRoutes";

// ── Auth helper ───────────────────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("User is not authenticated. Please log in.");
  return { Authorization: `Token ${token}` };
};

const getJsonHeaders = () => ({
  ...getAuthHeaders(),
  "Content-Type": "application/json",
});

// ── Application window check ──────────────────────────────────────────────────

export const checkWindow = async (award) => {
  const response = await fetch(checkApplicationWindow, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify({ award }),
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // Backend sometimes returns non-JSON (HTML/plaintext on errors).
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && data.message) ||
      `Failed to check window (HTTP ${response.status})`;
    throw new Error(message);
  }

  return data;
};

// ── MCM Scholarship ───────────────────────────────────────────────────────────

export const submitMCM = async (formData) => {
  const response = await fetch(submitMCMApplicationsRoute, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || response.statusText);
  }
  return response.json();
};

export const fetchMCMApplications = async () => {
  const response = await fetch(getMCMApplicationsRoute, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const updateMCMStatus = async (id, action, note = "") => {
  const res = await axios.post(
    updateMCMStatusRoute,
    { id, action, note },
    { headers: getAuthHeaders() },
  );
  return res.data;
};

export const fetchMCMStatus = async () => {
  const res = await fetch(showMcmStatusRoute, {
    method: "POST",
    headers: getJsonHeaders(),
  });
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

// ── Director Silver Medal ─────────────────────────────────────────────────────

export const submitSilver = async (formData) => {
  const response = await fetch(submitSilverRoute, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || response.statusText);
  }
  return response.json();
};

export const fetchSilverApplications = async () => {
  const { data } = await axios.get(getDirectorSilverApplicationsRoute, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updateSilverStatus = async (id, action, note = "") => {
  const res = await axios.post(
    updateDirectorSilverStatusRoute,
    { id, action, note },
    { headers: getAuthHeaders() },
  );
  return res.data;
};

export const fetchSilverStatus = async () => {
  const res = await fetch(showSilverStatusRoute, {
    method: "POST",
    headers: getJsonHeaders(),
  });
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

// ── Director Gold Medal ───────────────────────────────────────────────────────

export const submitGold = async (formData) => {
  const response = await fetch(showDirectorGoldSubmitRoute, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || response.statusText);
  }
  return response.json();
};

export const fetchGoldApplications = async () => {
  const { data } = await axios.get(getDirectorGoldApplicationsRoute, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updateGoldStatus = async (id, action, note = "") => {
  const res = await axios.post(
    updateDirectorGoldStatusRoute,
    { id, action, note },
    { headers: getAuthHeaders() },
  );
  return res.data;
};

export const fetchGoldStatus = async () => {
  const res = await fetch(showGoldStatusRoute, {
    method: "POST",
    headers: getJsonHeaders(),
  });
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

// ── D&M Proficiency Gold Medal ────────────────────────────────────────────────

export const submitPDM = async (formData) => {
  const response = await fetch(submitPdmRoute, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || response.statusText);
  }
  return response.json();
};

export const fetchPDMApplications = async () => {
  const { data } = await axios.get(getProficiencyDMApplicationsRoute, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const updatePDMStatus = async (id, action, note = "") => {
  const res = await axios.post(
    updateProficiencyDMStatusRoute,
    { id, action, note },
    { headers: getAuthHeaders() },
  );
  return res.data;
};

export const fetchPDMStatus = async () => {
  const res = await fetch(showPdmStatusRoute, {
    method: "POST",
    headers: getJsonHeaders(),
  });
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

// ── Awards / Catalog ──────────────────────────────────────────────────────────

export const fetchAwards = async () => {
  const { data } = await axios.get(showAwardRoute, {
    headers: getJsonHeaders(),
  });
  return data;
};

export const updateCatalog = async (id, catalog) => {
  const { data } = await axios.post(
    updateCatalogRoute,
    { id, catalog },
    { headers: getJsonHeaders() },
  );
  return data;
};

// ── Previous Winners ──────────────────────────────────────────────────────────

export const fetchPreviousWinners = async (programme, batch, award_id) => {
  const { data } = await axios.post(
    getPreviousWinnersRoute,
    { programme, batch, award_id },
    { headers: getJsonHeaders() },
  );
  return data;
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const sendNotification = async (recipient, type) => {
  const res = await axios.post(
    scholarshipNotification,
    { recipient, type },
    { headers: getAuthHeaders() },
  );
  return res.data;
};

// ── Invite Applications (Convenor) ────────────────────────────────────────────

export const inviteApplications = async (formData) => {
  const response = await fetch(inviteApplicationsRoute, {
    method: "POST",
    headers: getJsonHeaders(),
    body: JSON.stringify(formData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to submit invitation");
  }
  return response.json();
};

// ── Application Notes ────────────────────────────────────────────────────────

export const fetchApplicationNotes = async (
  scholarship_type,
  application_id,
) => {
  const { data } = await axios.get(`${host}/spacs/application-notes/`, {
    params: { scholarship_type, application_id },
    headers: getAuthHeaders(),
  });
  return data;
};

export const manageApplicationNote = async (note_id, action) => {
  const { data } = await axios.post(
    `${host}/spacs/manage-note/`,
    { note_id, action },
    { headers: getJsonHeaders() },
  );
  return data;
};
