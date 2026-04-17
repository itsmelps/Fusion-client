/* eslint-disable react/prop-types */
import React from "react";
import { Breadcrumbs as MantineBreadcrumbs, Text } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";

function ScholarshipBreadcrumbs({ items }) {
  return (
    <MantineBreadcrumbs
      separator={<CaretRight size={14} weight="bold" color="#666" />}
      mb="md"
    >
      <Text size="sm" fw={600} color="#666">
        Scholarship Portal
      </Text>
      {items.map((item, index) => (
        <Text
          key={index}
          size="sm"
          fw={600}
          color={index === items.length - 1 ? "#333" : "#666"}
        >
          {item.title}
        </Text>
      ))}
    </MantineBreadcrumbs>
  );
}

export default ScholarshipBreadcrumbs;
