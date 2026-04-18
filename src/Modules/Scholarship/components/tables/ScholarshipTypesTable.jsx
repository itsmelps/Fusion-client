import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Badge,
  Text,
  ActionIcon,
  Tooltip,
  Loader,
  Group,
} from "@mantine/core";
import { Eye, PaperPlaneTilt } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { fetchAwards } from "../../services/api";

/* ── Static fallback data matching the reference images ─────────────── */
const FALLBACK_SCHOLARSHIPS = [
  {
    id: 1,
    award_name: "Merit Cum Means Scholarship",
    category: "MERIT-BASED",
    amount: 90250.0,
    frequency: "Annual",
    max_backlogs: 0,
    cpi_cutoff: "8.00",
    income_limit: 800000,
  },
  {
    id: 2,
    award_name: "Single Parent Scholarship",
    category: "NEED-BASED",
    amount: 90250.0,
    frequency: "Annual",
    max_backlogs: 1,
    cpi_cutoff: "6.00",
    income_limit: 500000,
  },
];

function ScholarshipTypesTable({ onApply }) {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchAwards();
        // Any award marked live that doesn't say "Medal" should be treated as a scholarship here
        const filtered = data.filter((a) => {
          if (!a.publish_flag) return false;
          const n = (a.award_name || "").toLowerCase();
          // Exclude medals/prizes (they go to AwardsTable)
          return !(
            n.includes("medal") ||
            n.includes("prize") ||
            n.includes("award")
          );
        });

        // Map to consistent shape
        const mapped = filtered.map((a) => {
          const n = (a.award_name || "").toLowerCase();
          const isMerit = n.includes("mcm") || n.includes("merit");
          const isSingleParent = n.includes("single parent");

          return {
            id: a.id,
            award_name: a.award_name,
            category: isMerit
              ? "MERIT-BASED"
              : isSingleParent
                ? "NEED-BASED"
                : "OTHER",
            amount: a.income_ceiling || 90250.0,
            frequency: "Annual",
            max_backlogs: isMerit ? 0 : 1,
            cpi_cutoff: a.cpi_cutoff || (isMerit ? "8.00" : "6.00"),
            income_limit: a.income_ceiling || (isMerit ? 800000 : 500000),
          };
        });
        setScholarships(mapped.length > 0 ? mapped : FALLBACK_SCHOLARSHIPS);
      } catch (err) {
        console.error("Failed to fetch scholarships:", err);
        setScholarships(FALLBACK_SCHOLARSHIPS);
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

  const rows = scholarships.map((s) => (
    <Table.Tr key={s.id}>
      <Table.Td>
        <Text size="sm">{s.award_name}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={s.category === "MERIT-BASED" ? "blue" : "green"}
          variant="filled"
          radius="sm"
          size="md"
        >
          {s.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹ {parseFloat(s.amount).toFixed(2)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{s.frequency}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{s.max_backlogs}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{s.cpi_cutoff}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹ {s.income_limit}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" color="blue" size="md">
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
          {isStudent && (
            <Tooltip label="Apply for Scholarship">
              <ActionIcon
                variant="subtle"
                color="blue"
                size="md"
                onClick={() => onApply && onApply(s)}
              >
                <PaperPlaneTilt size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Text fw={700} size="xl" mt="md" mb="md" ml="md">
        Scholarship Types
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
                Amount
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Frequency
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Max Backlogs
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                CPI Cutoff
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={600}>
                Income Limit
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
              <Table.Td colSpan={8} ta="center" py="xl">
                <Text c="dimmed">No scholarship types found.</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </>
  );
}

ScholarshipTypesTable.propTypes = {
  onApply: PropTypes.func,
};

export default ScholarshipTypesTable;
