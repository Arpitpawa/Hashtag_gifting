export interface SelectedHamperItem {
  productId: number;
  name:      string;
  image:     string;
  price:     number; // paise
  slug:      string;
}

export interface GiftCard {
  id:    string;
  name:  string;
  image: string;
  price: number; // paise — 0 = free
}

export type HamperStep = 1 | 2 | 3 | 4;

export interface HamperState {
  step:               HamperStep;
  selectedBox:        SelectedHamperItem | null;
  selectedProducts:   SelectedHamperItem[];
  selectedCard:       GiftCard | null;
  personalizationMsg: string;
  recipientName:      string;
}