import { departmentRepository } from '../repositories/department.repository.ts';

export class DepartmentService {
  async getAllDepartments(query?: any) {
    return departmentRepository.findAll(query);
  }

  async getDepartmentById(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept || dept.deletedAt) throw new Error('Department not found');
    return dept;
  }

  async createDepartment(data: { name: string; description?: string; parentId?: string; headId?: string }) {
    const existing = await departmentRepository.findByName(data.name);
    if (existing) {
      throw new Error('Department name must be unique');
    }
    return departmentRepository.create(data);
  }

  async updateDepartment(id: string, data: { name?: string; description?: string; parentId?: string; headId?: string; isActive?: boolean }) {
    if (data.name) {
      const existing = await departmentRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new Error('Department name must be unique');
      }
    }
    return departmentRepository.update(id, data);
  }

  async deactivateDepartment(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw new Error('Department not found');
    if (dept.users.length > 0) {
      throw new Error('Cannot delete department with active employees');
    }
    return departmentRepository.softDelete(id);
  }
}

export const departmentService = new DepartmentService();
