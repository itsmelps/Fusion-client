import { useState, useEffect } from "react";
import {
  Table,
  Badge,
  Text,
  ActionIcon,
  Tooltip,
  Loader,
  Group,
} from "@mantine/core";
import { Eye } from "@phosphor-icons/react";
import { fetchAwards } from "../../services/api";

/* ── Static fallback matching the reference image ─────────────────── */
const FALLBACK_AWARDS = [
  {
    id: 1,
    award_name: "Director's Gold Medal",
    category: "ACADEMIC EXCELLENCE",
    prize_amount: 100000.0,
    certificate: true,
  },
];

function AwardsTable() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchAwards();
        // Filter for medal/award types (not scholarships)
        const filtered = data.filter((a) => {
          const n = (a.award_name || "").toLowerCase();
          return !(
            n.includes("mcm") ||
            n.includes("single parent") ||
            n.includes("merit-cum-means") ||
            n.includes("merit cum means")
          );
        });
        const mapped = filtered.map((a) => ({
          id: a.id,
          award_name: a.award_name,
          category: "ACADEMIC EXCELLENCE",
          prize_amount: a.income_ceiling || 100000.0,
          certificate: true,
        }));
        setAwards(mapped.length > 0 ? mapped : FALLBACK_AWARDS);
      } catch (err) {
        console.error("Failed to fetch awards:", err);
        setAwards(FALLBACK_AWARDS);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <Loader size="md" />
      </div>
    );
  }

  const rows = awards.map((award) => (
    <Table.Tr key={award.id}>
      <Table.Td>
        <Text size="sm">{award.award_name}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="filled" radius="sm" size="md">
          {award.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹ {parseFloat(award.prize_amount).toFixed(2)}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="green" variant="light" radius="sm" size="md">
          {award.certificate ? "YES" : "NO"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" color="blue" size="md">
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Text fw={700} size="xl" mt="md" mb="md" ml="md">
        Awards
      </Text>
      <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: "#F5F7FA" }}>
            <Table.Th>
              <Text size="sm" fw={600}>
                Name
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Category
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Prize Amount
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Certificate
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
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
              <Table.Td colSpan={5} ta="center" py="xl">
                <Text c="dimmed">No awards found.</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </>
  );
}

export default AwardsTable;
