import DesertBookingScreen from "@/components/DesertBookingScreen";

const TREK_TYPES = [
  { id: "sunset", label: "Sunset Trek", desc: "2 hours during golden hour", price: 2500 },
  { id: "half-day", label: "Half-Day Trek", desc: "4 hours with tea stop", price: 4000 },
  { id: "full-day", label: "Full-Day Safari", desc: "8 hours with traditional lunch", price: 7500 },
];

const CAMEL_COUNTS = [1, 2, 3, 4].map((value) => ({
  label: `${value}`,
  value,
}));

export default function CamelRideScreen() {
  return (
    <DesertBookingScreen
      title="Camel Ride"
      subtitle="Traditional Sahara treks"
      bookingTitle="Sahara Camel Ride"
      icon="image-outline"
      iconFamily="Ionicons"
      color="#E76F51"
      gradient={["#E76F51", "#C1440E"]}
      primaryLabel="TREK TYPE"
      primaryOptions={TREK_TYPES}
      countLabel="CAMELS"
      countOptions={CAMEL_COUNTS}
      countDetailKey="camels"
      countUnitSingular="camel"
      countUnitPlural="camels"
    />
  );
}
