import { Request, Response } from 'express';
import { departmentService } from '../services/department.service.ts';

export class DepartmentController {
  async getAll(req: Request, res: Response) {
    try {
      const depts = await departmentService.getAllDepartments({
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortField: req.query.sortField as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.json(depts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const dept = await departmentService.getDepartmentById(req.params.id);
      res.json(dept);
    } catch (error: any) {
      if (error.message === 'Department not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const dept = await departmentService.createDepartment(req.body);
      res.status(201).json(dept);
    } catch (error: any) {
      if (error.message === 'Department name must be unique') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const dept = await departmentService.updateDepartment(req.params.id, req.body);
      res.json(dept);
    } catch (error: any) {
      if (error.message === 'Department name must be unique') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const dept = await departmentService.deactivateDepartment(req.params.id);
      res.json(dept);
    } catch (error: any) {
      if (error.message === 'Department not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Cannot delete department with active employees') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}

export const departmentController = new DepartmentController();
