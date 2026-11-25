import { Request, Response } from 'express';
import { employeeService } from '../services/employee.service.ts';

export class EmployeeController {
  async getAll(req: Request, res: Response) {
    try {
      const emps = await employeeService.getEmployees(req.query);
      res.json(emps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const emp = await employeeService.getEmployeeById(req.params.id);
      res.json(emp);
    } catch (error: any) {
      if (error.message === 'Employee not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async promote(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const emp = await employeeService.promoteEmployee(req.params.id, role);
      res.json(emp);
    } catch (error: any) {
      if (error.message === 'Employee not found') res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  async assignDepartment(req: Request, res: Response) {
    try {
      const { departmentId } = req.body;
      const emp = await employeeService.assignDepartment(req.params.id, departmentId || null);
      res.json(emp);
    } catch (error: any) {
      if (error.message === 'Employee not found') res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const emp = await employeeService.deactivateEmployee(req.params.id);
      res.json(emp);
    } catch (error: any) {
      if (error.message === 'Employee not found') res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }

  async reactivate(req: Request, res: Response) {
    try {
      const emp = await employeeService.reactivateEmployee(req.params.id);
      res.json(emp);
    } catch (error: any) {
      if (error.message === 'Employee not found') res.status(404).json({ error: error.message });
      else res.status(500).json({ error: error.message });
    }
  }
}

export const employeeController = new EmployeeController();
