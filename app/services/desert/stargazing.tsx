import DesertBookingScreen from "@/components/DesertBookingScreen";

const STAR_SESSIONS = [
  { id: "telescope", label: "Telescope Session", desc: "1 hour guided telescope tour", price: 1500 },
  { id: "observatory", label: "Deep Sky Observatory", desc: "2 hour astronomy guide and galaxy search", price: 2500 },
  { id: "astrophoto", label: "Astrophotography Package", desc: "Pro camera setup for Milky Way shots", price: 4500 },
];

const OBSERVER_COUNTS = [1, 2, 3, 4].map((value) => ({
  label: `${value}`,
  value,
}));

export default function StargazingScreen() {
  return (
    <DesertBookingScreen
      title="Stargazing"
      subtitle="Clear skies and guided astronomy"
      bookingTitle="Sahara Stargazing"
      icon="telescope-outline"
      iconFamily="MaterialCommunityIcons"
      color="#3F37C9"
      gradient={["#3F37C9", "#1E1B4B"]}
      primaryLabel="SESSION"
      primaryOptions={STAR_SESSIONS}
      countLabel="OBSERVERS"
      countOptions={OBSERVER_COUNTS}
      countDetailKey="observers"
      countUnitSingular="observer"
      countUnitPlural="observers"
    />
  );
}
