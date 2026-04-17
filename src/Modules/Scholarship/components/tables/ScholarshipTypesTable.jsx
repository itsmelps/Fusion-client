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
import { Eye, PencilSimple } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { fetchAwards } from "../../services/api";

function ScholarshipTypesTable({ onEdit }) {
  const role = useSelector((state) => state.user.role);
  const isConvenor = role === "spacsconvenor";
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchAwards();
        setAwards(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const getCategoryBadge = (catalog) => {
    // Determine category from catalog text or award_name
    const text = catalog || "";
    const isMerit = text.toLowerCase().includes("merit");
    const label = isMerit ? "MERIT-BASED" : "NEED-BASED";
    const color = isMerit ? "blue" : "green";
    return (
      <Badge color={color} variant="filled" radius="sm" size="md">
        {label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (!num && num !== 0) return "N/A";
    return `₹ ${num.toFixed(2)}`;
  };

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
      <Table.Td>{getCategoryBadge(award.catalog)}</Table.Td>
      <Table.Td>
        <Text size="sm">{formatCurrency(award.income_ceiling || 90250)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">Annual</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">0</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{award.cpi_cutoff || "0.00"}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {award.income_ceiling ? `₹ ${award.income_ceiling}` : "N/A"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="subtle" color="blue" size="md">
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
          {isConvenor && (
            <Tooltip label="Edit Scholarship">
              <ActionIcon
                variant="subtle"
                color="orange"
                size="md"
                onClick={() => onEdit && onEdit(award)}
              >
                <PencilSimple size={18} />
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
  onEdit: PropTypes.func,
};

export default ScholarshipTypesTable;
