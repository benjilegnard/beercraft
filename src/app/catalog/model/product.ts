export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export type Product = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  stock: number;
  abv: number | null;
  imageUrl: string | null;
  category: Category;
};
