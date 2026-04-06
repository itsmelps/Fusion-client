/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react";
import styles from "../../styles/inviteApplications.module.css";
import { inviteApplications } from "../../services/api";

function InviteApplications() {
  const [formData, setFormData] = useState({
    award: "",
    programme: "",
    batch: "",
    startdate: "",
    enddate: "",
    remarks: "",
  });

  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to submit the form?",
    );
    if (!confirmed) return;
    try {
      await inviteApplications(formData);
      alert("Application submitted successfully!");
    } catch (submitErr) {
      console.error("Error submitting form:", submitErr);
      alert("Failed to submit the application. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Invite Applications</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Type *</label>
          <select
            className={styles.input}
            name="award"
            value={formData.award}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="MCM Scholarship">MCM Scholarship</option>
            <option value="Director's Silver Medal">
              Director&apos;s Silver Medal
            </option>
            <option value="Director's Gold Medal">
              Director&apos;s Gold Medal
            </option>
            <option value="D&M Proficiency Gold Medal">
              D&amp;M Proficiency Gold Medal
            </option>
            <option value="Notional Prizes">Notional Prizes</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Programme *</label>
          <select
            className={styles.input}
            name="programme"
            value={formData.programme}
            onChange={handleChange}
            required
          >
            <option value="">Select Programme</option>
            <option value="BTech">BTech</option>
            <option value="MTech">MTech</option>
            <option value="MDes">MDes</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Batch *</label>
          <select
            className={styles.input}
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            required
          >
            <option value="">Select Batch</option>
            {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.dateRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date *</label>
            <input
              type="date"
              className={styles.input}
              name="startdate"
              value={formData.startdate}
              onChange={handleChange}
              min={today}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>End Date *</label>
            <input
              type="date"
              className={styles.input}
              name="enddate"
              value={formData.enddate}
              onChange={handleChange}
              min={formData.startdate || today}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Remarks *</label>
          <textarea
            className={styles.textarea}
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={4}
            placeholder="Enter your remarks..."
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default InviteApplications;
