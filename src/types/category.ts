export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}
