import React from "react";
import {
  LungsIcon,
  HeartPulseIcon,
  BrainNeuroIcon,
  GlucoseDropIcon,
  StomachGastroIcon,
  SepsisShieldIcon
} from "./MedicalIcons";
import {
  Droplet,
  Wind,
  Eye,
  HeartCrack,
  HeartPulse,
  Activity,
  Zap,
  Flame,
  ThermometerSnowflake,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  EyeClosed
} from "lucide-react";

/**
 * Renders professional vector clinical medical icons for symptom cards
 */
export function SymptomIcon({ type, size = 20, color = "#0F766E" }) {
  switch (type) {
    case "droplets":
      return <GlucoseDropIcon size={size} color={color} />;
    case "breath":
      return <Wind size={size} color={color} />;
    case "sweat":
      return <ThermometerSnowflake size={size} color={color} />;
    case "eye":
      return <Eye size={size} color={color} />;
    case "chest":
      return <HeartCrack size={size} color={color} />;
    case "heart":
      return <HeartPulse size={size} color={color} />;
    case "faint":
      return <AlertOctagon size={size} color={color} />;
    case "lungs":
      return <LungsIcon size={size} color={color} />;
    case "wheeze":
      return <Wind size={size} color={color} />;
    case "hemoptysis":
      return <Droplet size={size} color="#DC2626" />;
    case "cough":
      return <LungsIcon size={size} color={color} />;
    case "stroke":
      return <BrainNeuroIcon size={size} color={color} />;
    case "coma":
      return <EyeClosed size={size} color={color} />;
    case "headache":
      return <Zap size={size} color={color} />;
    case "seizure":
      return <Zap size={size} color={color} />;
    case "vomit":
      return <StomachGastroIcon size={size} color={color} />;
    case "diarrhea":
      return <Droplet size={size} color={color} />;
    case "abdomen":
      return <StomachGastroIcon size={size} color={color} />;
    case "rigors":
      return <ThermometerSnowflake size={size} color={color} />;
    case "fever":
      return <Flame size={size} color="#DC2626" />;
    case "rash":
      return <SepsisShieldIcon size={size} color={color} />;
    case "neck":
      return <AlertTriangle size={size} color={color} />;
    case "weakness":
      return <Activity size={size} color={color} />;
    default:
      return <Activity size={size} color={color} />;
  }
}
