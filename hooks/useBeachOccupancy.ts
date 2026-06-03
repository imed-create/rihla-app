import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export function useBeachOccupancy() {
  const { activeBookings } = useApp();

  return useMemo(() => {
    const occupiedSpotIds = new Set<string>();
    const occupiedAssetSlots = new Set<string>();
    const activeSpotBooking = activeBookings.find(
      (b) => b.type === 'spots' && b.status === 'active'
    );
    const deliverySpotId = activeSpotBooking?.details?.spotId?.toString() ?? null;
    const deliveryZone =
      (activeSpotBooking?.details?.zone as 'family' | 'vip' | 'free' | undefined) ?? 'family';

    for (const b of activeBookings) {
      if (b.status !== 'active') continue;
      const spotId = b.details?.spotId;
      if (spotId) occupiedSpotIds.add(String(spotId));
      const slotId = b.details?.assetSlotId;
      if (slotId) occupiedAssetSlots.add(String(slotId));
    }

    return {
      occupiedSpotIds: Array.from(occupiedSpotIds),
      occupiedAssetSlots: Array.from(occupiedAssetSlots),
      deliverySpotId,
      deliveryZone,
      hasActiveSpot: !!deliverySpotId,
    };
  }, [activeBookings]);
}
