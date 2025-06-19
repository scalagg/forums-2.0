import HTTPClient from "@/libs/HTTPClient";
import { ForumCategory } from "@/types/api";

const baseEndpoint = "/forum/category";

// Active API Methods
export async function getAllCategories(client: HTTPClient): Promise<ForumCategory[]> {
  try {
    console.log("Fetching all forum categories");
    const [categories, status, error] = await client.GetAsync<ForumCategory[]>(baseEndpoint);
    console.log("Categories API response:", { categories: categories?.length, status, error });
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    
    if (!categories) {
      console.error("No categories data returned");
      return [];
    }
    
    console.log("Successfully fetched categories:", categories.length);
    return categories;
  } catch (error) {
    console.error("Exception fetching categories:", error);
    return [];
  }
}

export async function createCategory(
  client: HTTPClient,
  category: { name: string; weight: number }
): Promise<ForumCategory | null> {
  try {
    console.log("Creating category:", category);
    const [newCategory, status, error] = await client.PostAsync<ForumCategory>(baseEndpoint, category);
    console.log("Create category response:", { newCategory, status, error });
    
    if (error) {
      console.error("Error creating category:", error);
      return null;
    }
    
    return newCategory;
  } catch (error) {
    console.error("Exception creating category:", error);
    return null;
  }
}

export async function updateCategory(
  client: HTTPClient,
  id: string,
  category: { name: string; weight: number }
): Promise<ForumCategory | null> {
  try {
    console.log("Updating category:", id, category);
    const [updatedCategory, status, error] = await client.PutAsync<ForumCategory>(`${baseEndpoint}/${id}`, category);
    console.log("Update category response:", { updatedCategory, status, error });
    
    if (error) {
      console.error("Error updating category:", error);
      return null;
    }
    
    return updatedCategory;
  } catch (error) {
    console.error("Exception updating category:", error);
    return null;
  }
}

export async function deleteCategory(client: HTTPClient, id: string): Promise<boolean> {
  try {
    console.log("Deleting category:", id);
    const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`);
    console.log("Delete category response:", { status, error });
    
    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }
    
    return status === 200;
  } catch (error) {
    console.error("Exception deleting category:", error);
    return false;
  }
}

// Aliases for backward compatibility
export const GetForumCategories = getAllCategories;
export const CreateForumCategory = createCategory;
export const EditForumCategory = updateCategory;
export const DeleteForumCategory = deleteCategory; 