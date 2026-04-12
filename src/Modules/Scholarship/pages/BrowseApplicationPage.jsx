import React, { useState } from "react";
import ConvocationMedalPage from "./ConvocationMedalPage";
import ScholarshipForm from "../components/forms/ScholarshipForm";
import styles from "../styles/BrowseApplication.module.css";

function BrowseApplicationPage() {
  const [desc, setDesc] = useState(1);

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={() => setDesc(1)}
          className={`${styles.progressButton} ${desc === 1 ? styles.activeProgress : styles.inactiveProgress}`}
          aria-label="Merit-cum-Means Scholarship Progress"
        >
          Merit-cum-Means Scholarship
        </button>
        <button
          type="button"
          onClick={() => setDesc(2)}
          className={`${styles.progressButton} ${desc === 2 ? styles.activeProgress : styles.inactiveProgress}`}
          aria-label="Convocation Medals Progress"
        >
          Convocation Medals
        </button>
      </div>
      {desc === 1 && <ScholarshipForm />}
      {desc === 2 && <ConvocationMedalPage />}
    </div>
  );
}

export default BrowseApplicationPage;
