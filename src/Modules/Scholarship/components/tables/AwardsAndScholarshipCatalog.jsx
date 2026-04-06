import React, { useState, useEffect } from "react";
import { List, Title, Divider, Container, Loader, Grid } from "@mantine/core";
import { fetchAwards } from "../../services/api";

function AwardsAndScholarshipCatalog() {
  const [selectedAward, setSelectedAward] = useState(null);
  const [awards, setAwards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAwards()
      .then((data) => {
        setAwards(data);
        setSelectedAward(data[0]);
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
    <Container
      size="lg"
      px={{ base: "xs", sm: "md", md: "lg" }}
      py={{ base: "sm", sm: "md", md: "xl" }}
    >
      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <Grid gap={{ base: "sm", md: "lg" }}>
          <Grid.Col
            span={{ sm: 12, md: 4 }}
            bg={{ base: "gray.0", md: "gray.1" }}
            p={{ base: "xs", md: "sm" }}
            style={{ borderRadius: "8px" }}
          >
            <List spacing="sm" size="lg">
              {awards.map((award) => (
                <List.Item
                  key={award.id}
                  onClick={() => setSelectedAward(award)}
                  style={{
                    cursor: "pointer",
                    fontWeight:
                      selectedAward?.id === award.id ? "bold" : "normal",
                  }}
                >
                  {award.award_name}
                </List.Item>
              ))}
            </List>
          </Grid.Col>
          <Grid.Col
            span={{ sm: 12, md: 8 }}
            bg="gray.0"
            p={{ base: "xs", md: "sm" }}
            style={{ borderRadius: "8px" }}
          >
            {selectedAward && (
              <>
                <Title
                  order={2}
                  size={{ base: "16px", sm: "20px", md: "26px" }}
                >
                  {selectedAward.award_name}
                </Title>
                <Divider my="sm" />
                <List size="md" spacing="sm">
                  {selectedAward.catalog.split("\n").map((point, index) => (
                    <List.Item key={`catalog-point-${index}`}>
                      {point}
                    </List.Item>
                  ))}
                </List>
              </>
            )}
          </Grid.Col>
        </Grid>
      )}
    </Container>
  );
}

export default AwardsAndScholarshipCatalog;
