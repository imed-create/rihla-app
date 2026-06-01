import DesertBookingScreen from "@/components/DesertBookingScreen";

const TIERS = [
  { id: "standard", label: "Standard Bivouac", desc: "Cozy wool tent and sleeping bag", price: 12000 },
  { id: "luxury", label: "Luxury Nomadic", desc: "Spacious tent, real bed and en-suite", price: 25000 },
  { id: "royal", label: "Royal Stargazer Dome", desc: "Transparent roof dome and private chef", price: 48000 },
];

const NIGHT_OPTIONS = [1, 2, 3].map((value) => ({
  label: `${value}`,
  value,
}));

export default function DesertCampScreen() {
  return (
    <DesertBookingScreen
      title="Desert Camp"
      subtitle="Sleep under the Sahara sky"
      bookingTitle="Desert Camp Accommodation"
      icon="home-outline"
      iconFamily="Ionicons"
      color="#C1440E"
      gradient={["#C1440E", "#7C2D12"]}
      primaryLabel="CAMP TIER"
      primaryOptions={TIERS}
      countLabel="NIGHTS"
      countOptions={NIGHT_OPTIONS}
      countDetailKey="nights"
      countUnitSingular="night"
      countUnitPlural="nights"
    />
  );
}
