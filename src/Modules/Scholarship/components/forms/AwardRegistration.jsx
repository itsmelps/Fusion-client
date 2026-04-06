import React, { useState, useEffect } from "react";
import { Container, Select, Title } from "@mantine/core";
import DirectorSilverForm from "./DirectorSilverForm";
import DirectorGoldForm from "./DirectorGoldForm";
import DMProficiencyForm from "./DMProficiencyForm";
import { checkWindow } from "../../services/api";

export default function AwardRegistration() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [isEligible, setIsEligible] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async (awardName) => {
    try {
      const data = await checkWindow(awardName);
      setIsEligible(data.result === "Success");
      setMessage(data.message);
    } catch (err) {
      const msg = (err && err.message) || "Failed to get form data";
      console.error("Failed to get form data:", err);
      setIsEligible(false);
      setMessage(msg);
    }
  };

  useEffect(() => {
    fetchData(selectedAward);
  }, []);

  const handleAwardChange = (value) => {
    if (!value) return;
    setSelectedAward(value);
    fetchData(value);
  };

  const renderForm = () => {
    if (!isEligible) return <h1>{message}</h1>;
    switch (selectedAward) {
      case "Director's Silver Medal":
        return <DirectorSilverForm />;
      case "Director's Gold Medal":
        return <DirectorGoldForm />;
      case "D&M Proficiency Gold Medal":
        return <DMProficiencyForm />;
      default:
        return null;
    }
  };

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
            value: "Director's Silver Medal",
            label: "Director's Silver Medal",
          },
          { value: "Director's Gold Medal", label: "Director's Gold Medal" },
          {
            value: "D&M Proficiency Gold Medal",
            label: "D&M Proficiency Gold Medal",
          },
        ]}
      />
      {renderForm()}
    </Container>
  );
}
