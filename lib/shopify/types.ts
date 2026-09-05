export type Money = { amount: string; currencyCode: string };
export type ShopifyImage = { url: string; altText: string | null };
export type SelectedOption = { name: string; value: string };

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: SelectedOption[];
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: Money };
  options: { name: string; values: string[] }[];
  variants: { nodes: ShopifyVariant[] };
  images: { nodes: ShopifyImage[] };
  specsMetafield: { value: string } | null;
  capacidadMetafield: { value: string } | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: Money;
    image: ShopifyImage | null;
    product: { title: string; handle: string };
    selectedOptions: SelectedOption[];
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: Money };
  lines: { nodes: CartLine[] };
};
