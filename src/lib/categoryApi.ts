import api from "./api";
import type { Category, CreateCategoryRequest } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function getCategory(id: number): Promise<Category> {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(
  data: CreateCategoryRequest
): Promise<Category> {
  const response = await api.post<Category>("/categories", data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: CreateCategoryRequest
): Promise<Category> {
  const response = await api.put<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function getCourseCategories(
  courseId: number
): Promise<Category[]> {
  const response = await api.get<Category[]>(
    `/categories/courses/${courseId}`
  );
  return response.data;
}

export async function setCourseCategories(
  courseId: number,
  categoryIds: number[]
): Promise<void> {
  await api.put(`/categories/courses/${courseId}`, categoryIds);
}
