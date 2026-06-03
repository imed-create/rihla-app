import type { MenuCategory } from '@/types/order';

export type FoodMenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  nameAr: string;
  priceDZD: number;
  emoji: string;
};

export const FOOD_MENU: FoodMenuItem[] = [
  { id: '1', category: 'drinks', name: 'Fresh Orange Juice', nameAr: 'عصير برتقال', priceDZD: 250, emoji: '🥤' },
  { id: '2', category: 'drinks', name: 'Coconut Water', nameAr: 'ماء جوز الهند', priceDZD: 300, emoji: '🥥' },
  { id: '3', category: 'drinks', name: 'Limonade', nameAr: 'ليموناضة', priceDZD: 150, emoji: '🍋' },
  { id: '4', category: 'drinks', name: 'Café Noisette', nameAr: 'قهوة', priceDZD: 200, emoji: '☕' },
  { id: '5', category: 'food', name: 'Sandwich Thon', nameAr: 'ساندويتش تونة', priceDZD: 450, emoji: '🥪' },
  { id: '6', category: 'food', name: 'Salad Fraîche', nameAr: 'سلطة طازجة', priceDZD: 500, emoji: '🥗' },
  { id: '7', category: 'food', name: 'Pizza Margherita', nameAr: 'بيتزا', priceDZD: 800, emoji: '🍕' },
  { id: '8', category: 'food', name: 'Chicken Wrap', nameAr: 'لفافة دجاج', priceDZD: 600, emoji: '🌯' },
  { id: '9', category: 'snacks', name: 'Chips & Dips', nameAr: 'شيبس', priceDZD: 200, emoji: '🍟' },
  { id: '10', category: 'snacks', name: 'Fruit Platter', nameAr: 'طبق فواكه', priceDZD: 400, emoji: '🍓' },
  { id: '11', category: 'snacks', name: 'Ice Cream', nameAr: 'آيس كريم', priceDZD: 180, emoji: '🍦' },
];

export const FOOD_CATEGORIES: { key: MenuCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'drinks', label: 'Drinks', emoji: '🥤' },
  { key: 'food', label: 'Food', emoji: '🍔' },
  { key: 'snacks', label: 'Snacks', emoji: '🍿' },
];
