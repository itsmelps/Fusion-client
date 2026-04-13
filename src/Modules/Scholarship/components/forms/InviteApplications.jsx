/* eslint-disable react/jsx-props-no-spreading, no-unused-vars */
import React, { useState } from "react";
import {
  Paper,
  Title,
  Select,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
  Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import { inviteApplicationsRoute } from "../../../../routes/SPACSRoutes";

function InviteApplications() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  const form = useForm({
    initialValues: {
      award: "",
      programme: "",
      batch: "",
      startdate: "",
      enddate: "",
      remarks: "",
    },
    validate: {
      award: (v) => (!v ? "Please select an award type" : null),
      programme: (v) => (!v ? "Please select programme" : null),
      startdate: (v) => (!v ? "Start date is required" : null),
      enddate: (v, values) => {
        if (!v) return "End date is required";
        if (values.startdate && v <= values.startdate)
          return "End date must be after start date";
        return null;
      },
    },
  });

  const handleSubmit = async (values) => {
    const confirmed = window.confirm(
      `Open application window for "${values.award}" from ${values.startdate} to ${values.enddate}?`,
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(inviteApplicationsRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setSuccess(true);
        form.reset();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to open application window.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder mt="md">
      <Title order={3} mb="lg">
        Open Application Window
      </Title>

      {success && (
        <Alert
          icon={<IconCircleCheck size={16} />}
          color="green"
          mb="md"
          title="Success"
          withCloseButton
          onClose={() => setSuccess(false)}
        >
          Application window has been opened and notifications sent to eligible
          students.
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Award / Scholarship Type *"
              placeholder="Select type"
              data={[
                { value: "MCM Scholarship", label: "MCM Scholarship" },
                {
                  value: "Director's Silver Medal",
                  label: "Director's Silver Medal",
                },
                {
                  value: "Director's Gold Medal",
                  label: "Director's Gold Medal",
                },
                {
                  value: "D&M Proficiency Gold Medal",
                  label: "D&M Proficiency Gold Medal",
                },
              ]}
              {...form.getInputProps("award")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Programme *"
              placeholder="Select programme"
              data={[
                { value: "B.Tech", label: "B.Tech" },
                { value: "M.Tech", label: "M.Tech" },
                { value: "PhD", label: "PhD" },
                { value: "All", label: "All Programmes" },
              ]}
              {...form.getInputProps("programme")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Batch"
              placeholder="Select batch (or leave for all)"
              clearable
              data={[
                { value: "UG1", label: "UG1" },
                { value: "UG2", label: "UG2" },
                { value: "UG3", label: "UG3" },
                { value: "UG4", label: "UG4" },
                { value: "PG1", label: "PG1" },
                { value: "PG2", label: "PG2" },
                { value: "all", label: "All Batches" },
              ]}
              {...form.getInputProps("batch")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TextInput
              type="date"
              label="Start Date *"
              min={today}
              {...form.getInputProps("startdate")}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <TextInput
              type="date"
              label="End Date *"
              min={form.values.startdate || today}
              {...form.getInputProps("enddate")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Remarks / Additional Instructions"
              placeholder="Any special instructions for applicants..."
              minRows={3}
              maxLength={500}
              {...form.getInputProps("remarks")}
            />
          </Grid.Col>
        </Grid>

        <Group position="right" mt="xl">
          <Button variant="default" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" color="blue" loading={submitting}>
            Open Application Window
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default InviteApplications;
