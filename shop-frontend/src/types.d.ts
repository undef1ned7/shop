export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string | null;
  category: Category;
}

export interface ProductsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ProductMutation {
  category: string;
  title: string;
  description: string;
  price: string;
  image: File | null;
}

export interface Category {
  _id: string;
  title: string;
  description: string;
}

export interface CategoryMutation {
  title: string;
  description: string;
}

export type SellerStatus = "none" | "pending" | "approved" | "rejected";

export interface User {
  _id: string;
  username: string;
  role: "admin" | "seller" | "user";
  sellerStatus?: SellerStatus;
}

export interface AuthResponse {
  id: string;
  username: string;
  role: "admin" | "seller" | "user";
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  sellerStatus?: SellerStatus;
  products: Product[];
  categories: Category[];
  favorites: Product[];
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export interface OrderShort {
  _id: string;
  items: OrderItem[];
  total: number;
  status: "new" | "paid" | "shipped" | "completed" | "cancelled";
  createdAt: string;
}

export interface OrderItem {
  product: Product;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    username: string;
    role: string;
  };
  items: OrderItem[];
  total: number;
  status: "new" | "paid" | "shipped" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}
