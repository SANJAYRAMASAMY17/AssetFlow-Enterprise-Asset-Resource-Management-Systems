import { categoryRepository } from '../repositories/category.repository.ts';

export class CategoryService {
  async getAllCategories(query?: any) {
    return categoryRepository.findAll(query);
  }

  async getCategoryById(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat || cat.deletedAt) throw new Error('Category not found');
    return cat;
  }

  async createCategory(data: { name: string; description?: string; icon?: string }) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new Error('Category name must be unique');
    }
    return categoryRepository.create(data);
  }

  async updateCategory(id: string, data: { name?: string; description?: string; icon?: string; isActive?: boolean }) {
    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error('Category name must be unique');
      }
    }
    return categoryRepository.update(id, data);
  }

  async deactivateCategory(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw new Error('Category not found');
    if (cat.assets.length > 0) {
      throw new Error('Cannot delete category with existing assets');
    }
    return categoryRepository.softDelete(id);
  }
}

export const categoryService = new CategoryService();
