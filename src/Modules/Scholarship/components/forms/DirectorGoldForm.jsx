import React, { useState } from "react";
import {
  Button,
  TextInput,
  Grid,
  Textarea,
  Group,
  Container,
  Paper,
  Title,
  NumberInput,
} from "@mantine/core";
import { submitGold } from "../../services/api";
import { validateGrandTotal } from "../../utils/helpers";

export default function DirectorGoldForm() {
  const [formData, setFormData] = useState({
    justification: "",
    correspondence_address: "",
    nearest_policestation: "",
    nearest_railwaystation: "",
    financial_assistance: "",
    grand_total: "",
    academic_achievements: "",
    social: "",
    corporate: "",
    hall_activities: "",
    gymkhana_activities: "",
    institute_activities: "",
    counselling_activities: "",
    other_activities: "",
    science_inside: "",
    science_outside: "",
    games_inside: "",
    games_outside: "",
    cultural_inside: "",
    cultural_outside: "",
    Marksheet: null,
  });
  const [grandTotalError, setGrandTotalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) =>
    setFormData((prev) => ({ ...prev, Marksheet: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to submit the form?",
    );
    if (!confirmed) return;

    const err = validateGrandTotal(formData.grand_total);
    if (err) {
      setGrandTotalError(err);
      return;
    }
    if (!formData.Marksheet) {
      alert("Marksheet is required. Please upload a file.");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    try {
      await submitGold(formDataToSend);
      alert("Form submitted successfully!");
    } catch (submitErr) {
      console.error("Error submitting form:", submitErr);
      alert(`Failed to submit the form: ${submitErr.message}`);
    }
  };

  const achievementFields = [
    "academic_achievements",
    "social",
    "corporate",
    "hall_activities",
    "gymkhana_activities",
    "institute_activities",
    "counselling_activities",
    "other_activities",
    "science_inside",
    "science_outside",
    "games_inside",
    "games_outside",
    "cultural_inside",
    "cultural_outside",
  ];

  const marksheetInputId = "director-gold-marksheet-input";

  return (
    <Container size="lg">
      <Paper radius="md" p="sm">
        <Title order={2} mb="lg">
          Director&apos;s Gold Medal Application Form
        </Title>
        <form onSubmit={handleSubmit}>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Police Station"
                name="nearest_policestation"
                value={formData.nearest_policestation}
                onChange={handleChange}
                placeholder="Enter Nearest Police Station"
                required
                maxLength={500}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Railway Station"
                name="nearest_railwaystation"
                value={formData.nearest_railwaystation}
                onChange={handleChange}
                placeholder="Enter Nearest Railway Station"
                required
                maxLength={500}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Grand Total Amount"
                value={formData.grand_total}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, grand_total: value }));
                  setGrandTotalError(validateGrandTotal(value));
                }}
                placeholder="Enter Grand Total Amount"
                min={0}
                step={0.01}
                decimalScale={2}
                error={grandTotalError}
                required
              />
            </Grid.Col>
            {[
              "justification",
              "correspondence_address",
              "financial_assistance",
            ].map((field) => (
              <Grid.Col span={12} key={field}>
                <Textarea
                  label={field.replace(/_/g, " ")}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field.replace(/_/g, " ")}`}
                  minRows={3}
                  required
                  maxLength={500}
                  description="Maximum 500 characters"
                  descriptionProps={{ color: "dimmed" }}
                />
              </Grid.Col>
            ))}
            {achievementFields.map((field) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={field}>
                <Textarea
                  label={field.replace(/_/g, " ")}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field.replace(/_/g, " ")}`}
                  minRows={2}
                  required
                  maxLength={500}
                  description="Maximum 500 characters"
                  descriptionProps={{ color: "dimmed" }}
                />
              </Grid.Col>
            ))}
            <Grid.Col span={12}>
              <input
                id={marksheetInputId}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <Button fullWidth component="label" htmlFor={marksheetInputId}>
                Upload Marksheet (PDF)
              </Button>
              {formData.Marksheet && (
                <TextInput
                  value={formData.Marksheet.name}
                  readOnly
                  mt="sm"
                  label="Uploaded File"
                />
              )}
            </Grid.Col>
          </Grid>
          <Group position="right" mt="xl">
            <Button type="submit" color="blue">
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
