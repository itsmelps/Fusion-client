import React, { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  List,
  Button,
  Group,
} from "@mantine/core";
import AwardRegistration from "../components/forms/AwardRegistration";

function ConvocationMedalPage() {
  const [next, setNext] = useState(false);

  return (
    <>
      {!next && (
        <Container size="lg" my="xl">
          <Paper
            p="-15"
            radius="md"
            style={{ background: "none", marginTop: "10px" }}
          >
            <Title order={2} mb="md" mt="lg">
              Please read below instructions before applying for any of the
              Convocation Medals:
            </Title>
            <Text c="dark" mb="lg">
              <strong>Brief Description for Cultural:</strong>
              <br />
              This includes the following:
            </Text>

            <List withPadding size="sm" mb="xl">
              <List.Item>
                Write the level of participation in Cultural activities during
                your stay at IIITDMJ (Relevant documents are required to be
                uploaded).
              </List.Item>
              <List.Item>
                (a) Performance on the field - single, group (Main participant
                or side participant)
              </List.Item>
              <List.Item>
                (b) Did you win any prize/medal/award while performing above
                mentioned activity?
              </List.Item>
              <List.Item>(c) Managing cultural activity</List.Item>
              <List.Item>
                (d) Generating fund for the conduction of activity
              </List.Item>
              <List.Item>
                (e) Mention above points clearly whether the activity was
                performed inside IIITDMJ or outside IIITDMJ
              </List.Item>
            </List>

            <Text c="dark" mt="md">
              Please click on the PROCEED button below to fill the form.
            </Text>

            <Group justify="flex-end" mt="lg">
              <Button
                onClick={() => setNext(true)}
                color="blue"
                radius="md"
                size="md"
              >
                Proceed
              </Button>
            </Group>
          </Paper>
        </Container>
      )}
      {next && <AwardRegistration />}
    </>
  );
}

export default ConvocationMedalPage;
