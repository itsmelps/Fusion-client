import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
import { Eye, PaperPlaneTilt } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { fetchAwards } from "../../services/api";

function ScholarshipTypesTable({ onApply }) {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
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

  const getCategoryBadge = (category) => {
    const text = (category || "MERIT-BASED").toUpperCase();
    const color = text.includes("MERIT") ? "blue" : "green";
    return (
      <Badge color={color} variant="filled" radius="xl" px="md">
        {text}
      </Badge>
    );
  };

  const rows = awards.map((award) => (
    <Table.Tr key={award.id} style={{ borderBottom: "1px solid #F1F3F5" }}>
      <Table.Td>
        <Text size="sm" fw={500}>
          {award.award_name}
        </Text>
      </Table.Td>
      <Table.Td>{getCategoryBadge(award.award_type)}</Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          ₹ {award.amount || "N/A"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">Annual</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{award.max_backlogs || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          {award.cpi_cutoff || "0.00"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600}>
          ₹ {award.income_ceiling || "0"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="light" color="gray" radius="xl" size="lg">
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
          {isStudent && (
            <Tooltip label="Apply Now">
              <ActionIcon
                variant="light"
                color="green"
                radius="xl"
                size="lg"
                onClick={() => onApply && onApply(award)}
              >
                <PaperPlaneTilt size={18} />
              </ActionIcon>
            </Tooltip>
          )}
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
        Scholarship Types
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
                Amount
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Frequency
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Max Backlogs
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                CPI Cutoff
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="xs" fw={700} c="dimmed">
                Income Limit
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
              <Table.Td colSpan={8} ta="center" py="xl" c="dimmed">
                No scholarships found.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

ScholarshipTypesTable.propTypes = {
  onApply: PropTypes.func,
};

export default ScholarshipTypesTable;
