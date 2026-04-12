import React, { useState, useEffect } from "react";
import { Container, Select, Title, Alert, Loader, Center } from "@mantine/core";
import DirectorSilverForm from "./DirectorSilverForm";
import DirectorGoldForm from "./DirectorGoldForm";
import DMProficiencyForm from "./DMProficiencyForm";
import { checkWindow } from "../../services/api";

export default function AwardRegistration() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver");
  const [checkLoading, setCheckLoading] = useState(true);
  const [eligibility, setEligibility] = useState({
    result: "Success",
    message: "",
  });

  const fetchData = async (awardName) => {
    setCheckLoading(true);
    try {
      const data = await checkWindow(awardName);
      setEligibility({
        result: data.result || "Failure",
        message: data.message || "",
      });
    } catch (err) {
      const msg = (err && err.message) || "Failed to get form data";
      console.error("Failed to get form data:", err);
      setEligibility({
        result: "Failure",
        message: msg,
      });
    } finally {
      setCheckLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedAward);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAwardChange = (value) => {
    if (!value) return;
    setSelectedAward(value);
    fetchData(value);
  };

  const renderForm = () => {
    switch (selectedAward) {
      case "Director's Silver":
        return <DirectorSilverForm />;
      case "Director's Gold":
        return <DirectorGoldForm />;
      case "D&M Proficiency Gold Medal":
        return <DMProficiencyForm />;
      default:
        return null;
    }
  };

  const windowOpen = eligibility.result === "Success";

  return (
    <Container size="lg">
      <Title order={2} mb="md">
        Award Registration Form
      </Title>
      <Select
        label="Select Award"
        value={selectedAward}
        onChange={handleAwardChange}
        data={[
          {
            value: "Director's Silver",
            label: "Director's Silver Medal",
          },
          { value: "Director's Gold", label: "Director's Gold Medal" },
          {
            value: "D&M Proficiency Gold Medal",
            label: "D&M Proficiency Gold Medal",
          },
        ]}
        mb="md"
      />
      {checkLoading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : (
        <>
          <Alert
            color={windowOpen ? "green" : "yellow"}
            title={
              windowOpen ? "Application window open" : "Application window"
            }
            mb="md"
          >
            {eligibility.message ||
              (windowOpen
                ? "You may submit your application for the selected medal."
                : "The invitation window may be closed; the form is still available below.")}
          </Alert>
          {renderForm()}
        </>
      )}
    </Container>
  );
}
