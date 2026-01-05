import React, { useState, useEffect } from 'react';
import { TAX_GROUPS } from '../constants';
import { calculateTax, formatCurrency, generateMockXML } from '../services/taxLogic';
import { TaxGroupId } from '../types';
import { Info, Download, Calculator, AlertCircle } from 'lucide-react';

const TaxCalculator: React.FC = () => {
  const [revenue, setRevenue] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<TaxGroupId>(TaxGroupId.DISTRIBUTION);
  const [annualProjection, setAnnualProjection] = useState<number>(500000000); // Default 500M
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    try {
      const res = calculateTax(revenue, selectedGroup, annualProjection);
      setResult(res);
    } catch (e) {
      console.error(e);
    }
  }, [revenue, selectedGroup, annualProjection]);

  const handleDownloadXML = () => {
    const xmlContent = generateMockXML(revenue, result.totalTax, "8675943210", "Nguyễn Văn A");
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ToKhai_01_CNKD_${new Date().getTime()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Đã tạo tờ khai XML mẫu 01/CNKD thành công!");
  };

  const selectedGroupInfo = TAX_GROUPS.find(g => g.id === selectedGroup);

  return (
    <div className="pb-20 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Calculator className="w-6 h-6 text-blue-600 mr-2" />
          Tính Thuế Nhanh
        </h2>

        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm ngành nghề</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(Number(e.target.value))}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {TAX_GROUPS.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.vatRate}% + {group.pitRate}%)
                </option>
              ))}
            </select>
            {selectedGroupInfo?.warning && (
              <div className="mt-2 flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                <AlertCircle size={14} className="mt-0.5" />
                <span>{selectedGroupInfo.warning}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doanh thu phát sinh (VNĐ)
            </label>
            <input
              type="number"
              value={revenue || ''}
              onChange={(e) => setRevenue(Number(e.target.value))}
              placeholder="Ví dụ: 50000000"
              className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dự báo doanh thu cả năm (VNĐ)
            </label>
            <input
              type="number"
              value={annualProjection || ''}
              onChange={(e) => setAnnualProjection(Number(e.target.value))}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Dùng để xác định bậc lệ phí môn bài.</p>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Kết quả tính toán</h3>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Tạm tính
            </span>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-gray-600">Thuế GTGT ({selectedGroupInfo?.vatRate}%)</span>
              <span className="font-medium text-gray-900">{formatCurrency(result.vatAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-gray-600">Thuế TNCN ({selectedGroupInfo?.pitRate}%)</span>
              <span className="font-medium text-gray-900">{formatCurrency(result.pitAmount)}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-800 font-bold">Tổng thuế phải nộp</span>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(result.totalTax)}</span>
            </div>

            <div className="mt-4 pt-4 bg-blue-50 -mx-6 px-6 pb-2">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-800 flex items-center">
                    <Info size={14} className="mr-1"/> Lệ phí môn bài (Năm)
                  </span>
                  <span className="font-semibold text-blue-900">{formatCurrency(result.licenseFee)}</span>
               </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleDownloadXML}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Xuất Tờ Khai XML (01/CNKD)
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Tệp XML tương thích với hệ thống thuedientu.gdt.gov.vn
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
