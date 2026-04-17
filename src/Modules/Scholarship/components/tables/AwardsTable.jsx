import { useState, useEffect } from "react";
import {
  Table,
  Badge,
  Text,
  ActionIcon,
  Tooltip,
  Paper,
  Loader,
  Group,
} from "@mantine/core";
import { Eye } from "@phosphor-icons/react";
import * as api from "../../services/api";

function AwardsTable() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        // For 'Awards' we use the medals catalog
        const data = await api.fetchAwards();
        // Filter for medals only or show all awards as per ref
        setAwards(data.filter((a) => a.award_type === "MEDAL" || true));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const rows = awards.map((award) => (
    <Table.Tr key={award.id} style={{ borderBottom: "1px solid #F1F3F5" }}>
      <Table.Td>
        <Text size="sm" fw={500}>
          {award.award_name || "Director's Gold Medal"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="filled" radius="xl" px="md">
          ACADEMIC EXCELLENCE
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          ₹ {award.amount || "100000.00"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color="green.1"
          c="green.7"
          variant="filled"
          radius="xs"
          size="sm"
        >
          YES
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon
              variant="light"
              color="blue"
              radius="xl"
              size="lg"
              bg="#EDF7FF"
            >
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (loading)
    return (
      <center>
        <Loader size="xl" mt="xl" />
      </center>
    );

  return (
    <Paper radius="md" p={0}>
      <Text size="xl" fw={700} mb="xl" px="md" pt="md">
        Awards
      </Text>

      <Table verticalSpacing="md" horizontalSpacing="md">
        <Table.Thead bg="#F3F3F7">
          <Table.Tr>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Name
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Category
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Prize Amount
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Certificate
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Actions
              </Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5} ta="center" py="xl" c="dimmed">
                No awards found.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

export default AwardsTable;
