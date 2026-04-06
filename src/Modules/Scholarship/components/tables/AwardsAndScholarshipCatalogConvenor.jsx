import React, { useState, useEffect } from "react";
import {
  List,
  Title,
  Divider,
  Container,
  Loader,
  Textarea,
  Button,
} from "@mantine/core";
import { Pencil } from "@phosphor-icons/react";
import styles from "../../styles/CatalogC.module.css";
import { fetchAwards, updateCatalog } from "../../services/api";

function AwardsAndScholarshipCatalogConvenor() {
  const [selectedAward, setSelectedAward] = useState(null);
  const [awards, setAwards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedText, setUpdatedText] = useState("");

  const handleAwardSelect = (award) => {
    setSelectedAward(award);
    setEditMode(false);
    setUpdatedText(award.catalog);
  };

  const saveChanges = async () => {
    try {
      await updateCatalog(selectedAward.id, updatedText);
      setAwards((prev) =>
        prev.map((a) =>
          a.id === selectedAward.id ? { ...a, catalog: updatedText } : a,
        ),
      );
      setSelectedAward((prev) => ({ ...prev, catalog: updatedText }));
      setEditMode(false);
    } catch (saveErr) {
      console.error(
        "Error saving changes:",
        saveErr.response ? saveErr.response.data : saveErr.message,
      );
    }
  };

  useEffect(() => {
    fetchAwards()
      .then((data) => {
        setAwards(data);
        setSelectedAward(data[0]);
        setUpdatedText(data[0]?.catalog || "");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(
          "Error fetching awards:",
          err.response ? err.response.data : err.message,
        );
        setIsLoading(false);
      });
  }, []);

  return (
    <Container className={styles.wrapper}>
      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <>
          <div className={styles.listContainer}>
            <List spacing="sm" size="lg">
              {awards.map((award) => (
                <List.Item
                  key={award.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleAwardSelect(award)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAwardSelect(award);
                    }
                  }}
                  className={`${styles.listItem} ${selectedAward?.id === award.id ? styles.activeItem : ""}`}
                >
                  {award.award_name}
                </List.Item>
              ))}
            </List>
          </div>
          <div className={styles.contentContainer}>
            {selectedAward && (
              <>
                <div className={styles.header}>
                  <Title order={2}>{selectedAward.award_name}</Title>
                  <Button
                    className={styles.editButton}
                    onClick={editMode ? saveChanges : () => setEditMode(true)}
                  >
                    {editMode ? "Save" : "Edit"}
                    <Pencil className={styles.pencilIcon} />
                  </Button>
                </div>
                <Divider my="sm" />
                {editMode ? (
                  <Textarea
                    value={updatedText}
                    onChange={(e) => setUpdatedText(e.target.value)}
                    autosize
                    minRows={10}
                    maxRows={20}
                    className={styles.editTextarea}
                  />
                ) : (
                  <List className={styles.catalogList}>
                    {selectedAward.catalog.split("\n").map((point, index) => (
                      <List.Item key={`catalog-line-${index}`}>
                        {point}
                      </List.Item>
                    ))}
                  </List>
                )}
              </>
            )}
          </div>
        </>
      )}
    </Container>
  );
}

export default AwardsAndScholarshipCatalogConvenor;
