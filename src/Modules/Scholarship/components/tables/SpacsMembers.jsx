import React from "react";
import { EnvelopeSimple, Phone } from "@phosphor-icons/react";
import styles from "../../styles/SpacsMembers.module.css";
import conv from "../../assets/convenor.png";
import assi from "../../assets/senior_ass.png";
import anotherMemberImg from "../../assets/office_ass.png";

function SpacsMembers() {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>About</h3>

      <div className={styles.membersContainer}>
        <div className={styles.memberCard}>
          <h1 className={styles.cardHeading}>SPACS Convenor</h1>
          <img src={conv} className={styles.memb} alt="SPACS Convenor" />
          <div className={styles.nameRole}>
            <h2 className={styles.name}>Mrs. Priti Patel</h2>
            <p className={styles.role}>Nodal Officer Scholarship/SPACS</p>
          </div>
          <div className={styles.contactInfo}>
            <Phone size={24} weight="bold" className={styles.icon} />
            <p>
              <strong>Phone:</strong> +91 12345 67890
            </p>
          </div>
          <div className={styles.contactInfo}>
            <EnvelopeSimple size={24} weight="bold" className={styles.icon} />
            <p>
              <strong>Email:</strong> convenor@gmail.com
            </p>
          </div>
        </div>

        <div className={`${styles.memberCard} ${styles.assistantCard}`}>
          <h1 className={styles.cardHeading}>SPACS Assistant</h1>
          <img src={assi} className={styles.memb} alt="SPACS Assistant" />
          <div className={styles.nameRole}>
            <h2 className={styles.name}>Mr. Richard Saberio</h2>
            <p className={styles.role}>Senior Assistant</p>
          </div>
          <div className={styles.contactInfo}>
            <Phone size={24} weight="bold" className={styles.icon} />
            <p>
              <strong>Phone:</strong> +91 12345 67890
            </p>
          </div>
          <div className={styles.contactInfo}>
            <EnvelopeSimple size={24} weight="bold" className={styles.icon} />
            <p>
              <strong>Email:</strong> staff@gmail.com
            </p>
          </div>
        </div>

        <div className={styles.memberCard}>
          <h1 className={styles.cardHeading}>SPACS Assistant</h1>
          <img
            src={anotherMemberImg}
            className={styles.memb}
            alt="SPACS Assistant office"
          />
          <div className={styles.nameRole}>
            <h2 className={styles.name}>Mr. Shashank Patel</h2>
            <p className={styles.role}>Office Assistant</p>
          </div>
          <div className={styles.contactInfo}>
            <Phone size={24} weight="bold" className={styles.icon} />
            <p>
              <strong>Phone:</strong> +91 12345 67890
            </p>
          </div>
          <div className={styles.contactInfo}>
            <EnvelopeSimple size={24} weight="bold" className={styles.icon} />
            <p>
              <strong>Email:</strong> staff@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpacsMembers;
