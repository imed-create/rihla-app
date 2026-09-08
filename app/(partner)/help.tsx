/**
 * RIHLA — Partner Help & Support
 * Partner-specific FAQ and guides on the shared HelpCenter shell.
 */

import React from 'react';
import HelpCenter, { type FaqItem, type GuideItem } from '@/components/pro/HelpCenter';
import { PRO } from '@/components/pro/ProKit';

const ACCENT = '#f4a261';

const FAQS: FaqItem[] = [
  {
    id: 'p1',
    topic: 'Jobs',
    question: 'Why am I not receiving any job offers?',
    answer:
      'Three things have to be true: you are toggled online on your dashboard, you have at least one published service, and your verification is approved. Check My Analytics — a low acceptance rate also pushes you down the dispatch ranking.',
  },
  {
    id: 'p2',
    topic: 'Jobs',
    question: 'What happens if I decline a job?',
    answer:
      'It is offered to the next partner in range. Declining occasionally is fine, but your acceptance rate feeds directly into how often you are dispatched. If you cannot work, go offline rather than declining offers.',
  },
  {
    id: 'p3',
    topic: 'Jobs',
    question: 'The traveller never showed up. What do I do?',
    answer:
      'Wait 15 minutes at the meeting point, try calling from the job card, then mark the job as a no-show. You are paid the cancellation portion, and repeated no-shows from the same traveller get flagged by our team.',
  },
  {
    id: 'p4',
    topic: 'Payouts',
    question: 'When do I get paid?',
    answer:
      'On your chosen schedule — weekly, every two weeks, or monthly. Weekly carries a 200 DZD transfer fee; the others are free. The minimum payout is 3,000 DZD, and funds arrive 3–5 business days after the transfer.',
  },
  {
    id: 'p5',
    topic: 'Payouts',
    question: 'Which payout methods can I use?',
    answer:
      'Algérie Poste CCP, a bank RIB, BaridiMob, or cash pickup at a RIHLA partner office. CCP is what most partners use — transfers are free and reliable. Add methods under Payout Settings.',
  },
  {
    id: 'p6',
    topic: 'Payouts',
    question: 'My payout is late. What should I check?',
    answer:
      'First check that your payout method shows Verified, not Pending — an unverified account holds the transfer. Then confirm the account number, since a single wrong digit bounces the payment. If both look right and it has been over 7 days, contact support with your payout reference.',
  },
  {
    id: 'p7',
    topic: 'Verification',
    question: 'What documents do I need as a partner?',
    answer:
      'Your national ID is required. A commercial register and tax identification are optional but needed to invoice above 100,000 DZD. Upload clear photos with all four corners visible — cropped images and screenshots get rejected.',
  },
  {
    id: 'p8',
    topic: 'Verification',
    question: 'How long does verification take?',
    answer:
      'Normally 24–48 hours. If it has been longer than three working days, your documents may have been rejected — check the Verification screen, which shows the reason at the top.',
  },
  {
    id: 'p9',
    topic: 'Services',
    question: 'How do I set my prices?',
    answer:
      'Each service carries its own hourly rate, set when you create or edit it. Look at what comparable partners in your wilaya charge before pricing — undercutting the market usually costs you more than it earns.',
  },
  {
    id: 'p10',
    topic: 'Services',
    question: 'Can I pause a service without deleting it?',
    answer:
      'Yes. Open the service and set its status to Paused. It stops appearing to travellers but keeps its history, photos and reviews, so you can republish it next season without starting over.',
  },
  {
    id: 'p11',
    topic: 'Account',
    question: 'How do I improve my ranking in dispatch?',
    answer:
      'Four levers, roughly in order of impact: accept more of the jobs you are offered, complete what you accept, keep your rating above 4.5, and finish your profile — photo, bio, languages and service area all count.',
  },
  {
    id: 'p12',
    topic: 'Account',
    question: 'Can I work in more than one wilaya?',
    answer:
      'Your profile has one primary service area, which is where you appear by default. For jobs outside it, keep multi-day work enabled on the relevant services — travellers booking longer trips can still reach you.',
  },
];

const GUIDES: GuideItem[] = [
  {
    id: 'pg1',
    title: 'Your first week as a partner',
    description: 'Getting online, verified and dispatched',
    icon: 'rocket-outline',
    color: PRO.green,
    minutes: 5,
  },
  {
    id: 'pg2',
    title: 'Earning more without working more',
    description: 'Which hours and job types actually pay',
    icon: 'trending-up-outline',
    color: ACCENT,
    minutes: 7,
  },
  {
    id: 'pg3',
    title: 'Getting paid on time, every time',
    description: 'Payout methods, schedules and common delays',
    icon: 'wallet-outline',
    color: PRO.blue,
    minutes: 4,
  },
  {
    id: 'pg4',
    title: 'Staying safe on the job',
    description: 'Meeting points, night work and emergencies',
    icon: 'shield-checkmark-outline',
    color: PRO.red,
    minutes: 6,
  },
];

export default function PartnerHelp() {
  return <HelpCenter role="partner" accent={ACCENT} faqs={FAQS} guides={GUIDES} />;
}
