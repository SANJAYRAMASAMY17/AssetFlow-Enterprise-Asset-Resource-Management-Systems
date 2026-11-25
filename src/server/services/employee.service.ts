import { employeeRepository } from '../repositories/employee.repository.ts';
import { Role } from '@prisma/client';

export class EmployeeService {
  async getEmployees(query: any) {
    // query mapping
    const typedQuery = {
      search: query.search as string | undefined,
      departmentId: query.departmentId as string | undefined,
      role: query.role as Role | undefined,
      isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
    return employeeRepository.findAll(typedQuery);
  }

  async getEmployeeById(id: string) {
    const emp = await employeeRepository.findById(id);
    if (!emp) throw new Error('Employee not found');
    return emp;
  }

  async promoteEmployee(id: string, role: Role) {
    const emp = await employeeRepository.findById(id);
    if (!emp) throw new Error('Employee not found');
    return employeeRepository.update(id, { role });
  }

  async assignDepartment(id: string, departmentId: string | null) {
    const emp = await employeeRepository.findById(id);
    if (!emp) throw new Error('Employee not found');
    return employeeRepository.update(id, { departmentId });
  }

  async deactivateEmployee(id: string) {
    const emp = await employeeRepository.findById(id);
    if (!emp) throw new Error('Employee not found');
    return employeeRepository.update(id, { isActive: false });
  }

  async reactivateEmployee(id: string) {
    const emp = await employeeRepository.findById(id);
    if (!emp) throw new Error('Employee not found');
    return employeeRepository.update(id, { isActive: true });
  }
}

export const employeeService = new EmployeeService();
