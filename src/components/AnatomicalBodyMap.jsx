import React from "react";
import {
  BrainNeuroIcon,
  HeartPulseIcon,
  LungsIcon,
  GlucoseDropIcon,
  StomachGastroIcon,
  SepsisShieldIcon
} from "./MedicalIcons";
import { Layers } from "lucide-react";

/**
 * Interactive Anatomical Body System Explorer
 * Clinical organ system diagram & category selector with symptom counters
 */
export function AnatomicalBodyMap({
  activeCategory,
  onSelectCategory,
  symptoms = [],
  selectedSymptoms = []
}) {
  const systems = [
    {
      id: "All",
      categoryName: "All",
      label: "All Systems",
      subtext: "Full body screening",
      icon: <Layers size={18} />,
      color: "#0F766E",
      bg: "#F0FDFA",
      border: "#99F6E4"
    },
    {
      id: "Cardiovascular & BP",
      categoryName: "Cardiovascular & BP",
      label: "Cardiovascular",
      subtext: "Heart, coronary, BP & hemodynamics",
      icon: <HeartPulseIcon size={18} color="#DC2626" />,
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA"
    },
    {
      id: "Respiratory",
      categoryName: "Respiratory",
      label: "Respiratory",
      subtext: "Lungs, airway, SpO2 & ventilation",
      icon: <LungsIcon size={18} color="#0284C7" />,
      color: "#0284C7",
      bg: "#F0F9FF",
      border: "#BAE6FD"
    },
    {
      id: "Metabolic / Sugar",
      categoryName: "Metabolic / Sugar",
      label: "Metabolic / Glycemic",
      subtext: "Glucose, endocrine & hydration",
      icon: <GlucoseDropIcon size={18} color="#7C3AED" />,
      color: "#7C3AED",
      bg: "#FAF5FF",
      border: "#E9D5FF"
    },
    {
      id: "Neurological & Stroke",
      categoryName: "Neurological & Stroke",
      label: "Neurological & CVA",
      subtext: "Brain, stroke, coma & seizures",
      icon: <BrainNeuroIcon size={18} color="#EA580C" />,
      color: "#EA580C",
      bg: "#FFF7ED",
      border: "#FED7AA"
    },
    {
      id: "Gastrointestinal",
      categoryName: "Gastrointestinal",
      label: "Gastrointestinal",
      subtext: "Abdomen, dehydration & emesis",
      icon: <StomachGastroIcon size={18} color="#D97706" />,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A"
    },
    {
      id: "Infectious & Sepsis",
      categoryName: "Infectious & Sepsis",
      label: "Infectious & Sepsis",
      subtext: "SIRS, high fever & pyrexia",
      icon: <SepsisShieldIcon size={18} color="#B91C1C" />,
      color: "#B91C1C",
      bg: "#FEF2F2",
      border: "#FECACA"
    }
  ];

  return (
    <div style={{ marginBottom: "18px" }}>
      {/* Header & Section Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
          flexWrap: "wrap",
          gap: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#E0F2FE",
              color: "#0369A1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Layers size={16} />
          </div>
          <span style={{ fontWeight: "700", color: "#1E293B", fontSize: "14px" }}>
            Anatomical System Explorer & Symptom Filter
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "#64748B" }}>
          Select an organ system to isolate clinical flags
        </span>
      </div>

      {/* Anatomical Systems Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: "8px"
        }}
      >
        {systems.map((sys) => {
          const isSelected = activeCategory === sys.categoryName;
          const systemSymptoms =
            sys.categoryName === "All"
              ? symptoms
              : symptoms.filter((s) => s.category === sys.categoryName);
          const activeSelectedCount = systemSymptoms.filter((s) =>
            selectedSymptoms.includes(s.key)
          ).length;

          return (
            <button
              type="button"
              key={sys.id}
              onClick={() => onSelectCategory(sys.categoryName)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "12px",
                border: isSelected ? `2px solid ${sys.color}` : "1.5px solid #E2E8F0",
                backgroundColor: isSelected ? sys.bg : "#FFFFFF",
                boxShadow: isSelected
                  ? `0 4px 12px ${sys.color}25`
                  : "0 1px 2px rgba(0,0,0,0.03)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
                position: "relative"
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: isSelected ? "#FFFFFF" : sys.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${sys.border}`
                }}
              >
                {sys.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: isSelected ? "700" : "600",
                    color: isSelected ? sys.color : "#334155",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {sys.label}
                </div>
                <div style={{ fontSize: "10px", color: "#64748B", marginTop: "1px" }}>
                  {systemSymptoms.length} signs
                </div>
              </div>

              {activeSelectedCount > 0 && (
                <span
                  style={{
                    background: sys.color,
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "800",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {activeSelectedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
