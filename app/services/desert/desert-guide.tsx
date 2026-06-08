import DesertBookingScreen from '@/components/shared/DesertBookingScreen';

const GUIDES = [
  { id: "nomad", label: "Local Nomadic Guide", desc: "Expert in tracks, water wells and camel paths", price: 4000 },
  { id: "historian", label: "Certified Historian Guide", desc: "Archaeological expert in rock art and ruins", price: 6000 },
  { id: "survival", label: "Wilderness Survival Specialist", desc: "Emergency rescue certified Sahara veteran", price: 9000 },
];

const DAY_OPTIONS = [1, 2, 3].map((value) => ({
  label: `${value}`,
  value,
}));

export default function DesertGuideScreen() {
  return (
    <DesertBookingScreen
      title="Private Guide"
      subtitle="Certified local desert experts"
      bookingTitle="Private Desert Guide"
      icon="compass-outline"
      iconFamily="Ionicons"
      color="#A8763E"
      gradient={["#A8763E", "#6B4423"]}
      primaryLabel="GUIDE TYPE"
      primaryOptions={GUIDES}
      countLabel="DAYS"
      countOptions={DAY_OPTIONS}
      countDetailKey="days"
      countUnitSingular="day"
      countUnitPlural="days"
    />
  );
}
