import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileIcon } from 'lucide-react';
import { apiClient } from '../../api/client.ts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type ReportType = 'assets' | 'allocations' | 'maintenance' | 'audits' | 'bookings' | 'departments';

export function ReportsList() {
  const [loadingType, setLoadingType] = useState<ReportType | null>(null);

  const reports = [
    { id: 'assets', name: 'Asset Inventory Report', description: 'Complete list of all assets with category, location, and status.' },
    { id: 'allocations', name: 'Asset Allocation Report', description: 'Current and past asset assignments to employees.' },
    { id: 'maintenance', name: 'Maintenance History', description: 'Log of all maintenance requests and repairs.' },
    { id: 'audits', name: 'Audit Cycles Report', description: 'Summary of all physical asset verifications and discrepancies.' },
    { id: 'bookings', name: 'Resource Bookings', description: 'History of all shared resource reservations.' },
    { id: 'departments', name: 'Department Summary', description: 'Overview of departments, heads, and asset counts.' }
  ] as const;

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return alert('No data to export');
    
    // Flatten nested objects for CSV
    const flatData = data.map(item => {
      const flat: any = {};
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'object' && value !== null) {
          if (value instanceof Date) {
            flat[key] = value.toISOString();
          } else {
            // Take the first string property or just stringify
            const strVal = Object.values(value).find(v => typeof v === 'string') || JSON.stringify(value);
            flat[key] = strVal;
          }
        } else {
          flat[key] = value;
        }
      }
      return flat;
    });

    const headers = Object.keys(flatData[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of flatData) {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any[], filename: string) => {
    if (data.length === 0) return alert('No data to export');
    const flatData = data.map(item => {
      const flat: any = {};
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'object' && value !== null) {
          flat[key] = Object.values(value).find(v => typeof v === 'string') || JSON.stringify(value);
        } else {
          flat[key] = value;
        }
      }
      return flat;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const downloadPDF = (data: any[], filename: string, title: string) => {
    if (data.length === 0) return alert('No data to export');
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    
    const flatData = data.map(item => {
      const flat: any = {};
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'object' && value !== null) {
          flat[key] = Object.values(value).find(v => typeof v === 'string') || JSON.stringify(value);
        } else {
          flat[key] = value;
        }
      }
      return flat;
    });

    const headers = Object.keys(flatData[0]);
    const rows = flatData.map(item => headers.map(h => item[h] || ''));

    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 }
    });

    doc.save(`${filename}.pdf`);
  };

  const handleExport = async (type: ReportType, format: 'csv' | 'excel' | 'pdf', name: string) => {
    try {
      setLoadingType(type);
      const res = await apiClient.get(`/analytics/reports/${type}`);
      const data = res.data;
      
      const filename = `${type}_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') downloadCSV(data, filename);
      else if (format === 'excel') downloadExcel(data, filename);
      else if (format === 'pdf') downloadPDF(data, filename, name);
      
    } catch (error) {
      console.error(error);
      alert('Failed to generate report');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Export data and generate reports for offline analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start">
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600 mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    disabled={loadingType === report.id}
                    onClick={() => handleExport(report.id, 'csv', report.name)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loadingType === report.id ? 'Generating...' : <><FileIcon className="w-4 h-4 mr-2 text-gray-400" /> CSV</>}
                  </button>
                  <button 
                    disabled={loadingType === report.id}
                    onClick={() => handleExport(report.id, 'excel', report.name)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loadingType === report.id ? 'Generating...' : <><FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" /> Excel</>}
                  </button>
                  <button 
                    disabled={loadingType === report.id}
                    onClick={() => handleExport(report.id, 'pdf', report.name)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loadingType === report.id ? 'Generating...' : <><Download className="w-4 h-4 mr-2 text-red-600" /> PDF</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
