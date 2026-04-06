import React, { useState } from "react";
import ConvocationMedalPage from "./ConvocationMedalPage";
import ScholarshipForm from "../components/forms/ScholarshipForm";
import styles from "../styles/BrowseApplication.module.css";

function BrowseApplicationPage() {
  const [desc, setDesc] = useState(1);

  const changeDesc = (event) => {
    setDesc(parseInt(event.target.value, 10));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={changeDesc}
          value={1}
          className={`${styles.progressButton} ${desc === 1 ? styles.activeProgress : styles.inactiveProgress}`}
          aria-label="Merit-cum-Means Scholarship Progress"
        >
          Merit-cum-Means Scholarship
        </button>
        <button
          type="button"
          onClick={changeDesc}
          value={2}
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
