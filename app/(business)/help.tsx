/**
 * RIHLA — Business Help Center
 * Business-specific FAQ and guides on the shared HelpCenter shell.
 */

import React from 'react';
import HelpCenter, { type FaqItem, type GuideItem } from '@/components/pro/HelpCenter';
import { PRO } from '@/components/pro/ProKit';

const FAQS: FaqItem[] = [
  {
    id: 'f1',
    topic: 'Payouts',
    question: 'When do I get paid for a booking?',
    answer:
      'Settlements run on the last working day of each month and cover every booking completed in that month. Funds arrive in your CCP or bank account 3–5 business days after the transfer. The minimum payout is 5,000 DZD — anything below that rolls into the next cycle.',
  },
  {
    id: 'f2',
    topic: 'Payouts',
    question: 'What commission does RIHLA take?',
    answer:
      'RIHLA takes 12% of the gross booking value. There are no listing fees, no monthly subscription and no charge for cancelled bookings. The commission is deducted before your payout, and every settlement statement shows the breakdown.',
  },
  {
    id: 'f3',
    topic: 'Verification',
    question: 'Which documents do I need to get verified?',
    answer:
      'Three documents: your national ID card, your commercial register (registre de commerce) and your tax identification (NIF or Article d\'imposition). Upload clear photos of the whole document — screenshots and cropped images are rejected. Review takes 24–48 hours.',
  },
  {
    id: 'f4',
    topic: 'Verification',
    question: 'My documents were rejected. What now?',
    answer:
      'Open Business Profile — the rejection reason is shown at the top. The most common causes are a blurry photo, an expired commercial register, or a name that does not match your ID. Re-upload the corrected document and review restarts immediately.',
  },
  {
    id: 'f5',
    topic: 'Listings',
    question: 'Why is my listing not showing in search?',
    answer:
      'Listings only appear once your business is verified, the listing has at least one photo and a price, and it is marked available. Check the listing health section in Analytics — it flags whichever requirement is missing.',
  },
  {
    id: 'f6',
    topic: 'Listings',
    question: 'How do I set different prices for high season?',
    answer:
      'Open the listing, go to Inventory Control and add a seasonal rate for the date range you want. Seasonal rates override the base price for those dates only. Marketplace Insights shows when demand in your category peaks.',
  },
  {
    id: 'f7',
    topic: 'Bookings',
    question: 'A traveller did not show up. Am I still paid?',
    answer:
      'Yes, if the booking was non-refundable or the cancellation window had closed. Mark the booking as a no-show within 24 hours in the Bookings tab so it settles correctly. Repeated no-shows from the same traveller are flagged by our team.',
  },
  {
    id: 'f8',
    topic: 'Bookings',
    question: 'Can I cancel a booking I already accepted?',
    answer:
      'You can, but it affects your reliability score and the traveller is refunded in full. Cancel from the booking detail and give a reason. If a genuine problem forces the cancellation (damage, staff emergency), contact support and we will review the penalty.',
  },
  {
    id: 'f9',
    topic: 'Account',
    question: 'Can I change my business category?',
    answer:
      'The category is locked after verification because it determines your dashboard, your booking flows and your fee structure. Contact support with your commercial register and we will move you if the change is legitimate.',
  },
  {
    id: 'f10',
    topic: 'Account',
    question: 'How do I add staff to my account?',
    answer:
      'Open Staff Management from the menu and add each team member with their role, shift and monthly pay. Staff records are used for payroll totals and shift planning — they do not create separate app logins yet.',
  },
];

const GUIDES: GuideItem[] = [
  {
    id: 'g1',
    title: 'Getting your first booking',
    description: 'Photos, pricing and response time that convert',
    icon: 'rocket-outline',
    color: PRO.green,
    minutes: 6,
  },
  {
    id: 'g2',
    title: 'Pricing for Algerian seasons',
    description: 'How to price around summer and holiday peaks',
    icon: 'pricetag-outline',
    color: PRO.amber,
    minutes: 8,
  },
  {
    id: 'g3',
    title: 'Passing verification first time',
    description: 'Document checklist and common rejection causes',
    icon: 'shield-checkmark-outline',
    color: PRO.blue,
    minutes: 4,
  },
  {
    id: 'g4',
    title: 'Handling reviews well',
    description: 'Replying to criticism without losing rating',
    icon: 'chatbubbles-outline',
    color: PRO.violet,
    minutes: 5,
  },
];

export default function BusinessHelp() {
  return <HelpCenter role="business" accent={PRO.navy} faqs={FAQS} guides={GUIDES} />;
}
