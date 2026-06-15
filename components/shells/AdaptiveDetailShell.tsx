/**
 * RIHLA — Adaptive Detail Shell Dispatcher
 * -----------------------------------------
 * Universal component that maps MarketplaceCategory → correct shell.
 * Wraps the 5 polymorphic shells behind a single entry point.
 *
 * Shell mapping:
 *   hotel, rental        → StaysAccommodationShell
 *   beach, restaurant    → Spatial2DGridShell
 *   photographer, guide  → CreativePortfolioShell
 *   activity, event, experience → ExperienceAdventureShell
 *   driver               → MobilityOnDemandShell
 */

import React from 'react';
import type { Listing, MarketplaceCategory } from '@/types/service';
import StaysAccommodationShell from './StaysAccommodationShell';
import Spatial2DGridShell from './Spatial2DGridShell';
import CreativePortfolioShell from './CreativePortfolioShell';
import ExperienceAdventureShell from './ExperienceAdventureShell';
import MobilityOnDemandShell from './MobilityOnDemandShell';

type Props = { listing: Listing };

const SHELL_MAP: Record<MarketplaceCategory, React.ComponentType<Props>> = {
  hotel: StaysAccommodationShell,
  rental: StaysAccommodationShell,
  beach: Spatial2DGridShell,
  restaurant: Spatial2DGridShell,
  photographer: CreativePortfolioShell,
  guide: CreativePortfolioShell,
  activity: ExperienceAdventureShell,
  event: ExperienceAdventureShell,
  experience: ExperienceAdventureShell,
  driver: MobilityOnDemandShell,
};

export default function AdaptiveDetailShell({ listing }: Props) {
  const Shell = SHELL_MAP[listing.category];
  if (!Shell) return null;
  return <Shell listing={listing} />;
}
