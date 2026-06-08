import DesertBookingScreen from '@/components/shared/DesertBookingScreen';

const VEHICLES = [
  { id: "quad", label: "Quad ATV 450cc", desc: "Nimble, rugged single-rider quad", price: 5000 },
  { id: "buggy", label: "Polaris RZR Dune Buggy", desc: "Dual-seater high-speed performance", price: 9000 },
];

const DURATIONS = [
  { label: "1 Hour", value: 1 },
  { label: "2 Hours", value: 2 },
  { label: "4 Hours", value: 4 },
];

export default function DuneBuggyScreen() {
  return (
    <DesertBookingScreen
      title="Quad & Buggy"
      subtitle="Ride the dunes with a guide"
      bookingTitle="Sahara Quad & Buggy"
      icon="speedometer-outline"
      iconFamily="Ionicons"
      color="#F4A261"
      gradient={["#F4A261", "#E76F51"]}
      primaryLabel="VEHICLE"
      primaryOptions={VEHICLES}
      countLabel="DURATION"
      countOptions={DURATIONS}
      countDetailKey="hours"
      countUnitSingular="hour"
      countUnitPlural="hours"
    />
  );
}
