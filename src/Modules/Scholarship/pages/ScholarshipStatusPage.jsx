import React, { useState } from "react";
import styles from "../styles/ScholarshipStatusPage.module.css";
import ScholarshipStatus from "../components/tables/ScholarshipStatus";

function ScholarshipStatusPage() {
  const [desc, setDesc] = useState(1);

  const changeDesc = (event) => {
    setDesc(parseInt(event.target.value, 10));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.gridContainer}>
        <button
          type="button"
          onClick={changeDesc}
          value={1}
          className={`${styles.progressButton} ${desc === 1 ? styles.active : styles.inactive}`}
          aria-label="Progress Button"
        >
          View Application Status
        </button>
      </div>
      {desc === 1 && <ScholarshipStatus />}
    </div>
  );
}

export default ScholarshipStatusPage;
