import { Request, Response } from 'express';
import { categoryService } from '../services/category.service.ts';

export class CategoryController {
  async getAll(req: Request, res: Response) {
    try {
      const cats = await categoryService.getAllCategories({
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortField: req.query.sortField as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.json(cats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const cat = await categoryService.getCategoryById(req.params.id);
      res.json(cat);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const cat = await categoryService.createCategory(req.body);
      res.status(201).json(cat);
    } catch (error: any) {
      if (error.message === 'Category name must be unique') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const cat = await categoryService.updateCategory(req.params.id, req.body);
      res.json(cat);
    } catch (error: any) {
      if (error.message === 'Category name must be unique') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const cat = await categoryService.deactivateCategory(req.params.id);
      res.json(cat);
    } catch (error: any) {
      if (error.message === 'Category not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Cannot delete category with existing assets') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export const categoryController = new CategoryController();
