import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction, TaxGroupId } from '../types';
import { formatCurrency } from '../services/taxLogic';
import { TAX_GROUPS } from '../constants';
import { AlertTriangle, TrendingUp, Wallet, FileText } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  onNavigate: (view: any) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, onNavigate }) => {
  // Calculate Totals
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  // Data for Pie Chart (Income by Tax Group)
  const incomeByGroup = transactions
    .filter(t => t.type === 'INCOME' && t.taxGroupId)
    .reduce((acc, t) => {
      const groupName = TAX_GROUPS.find(g => g.id === t.taxGroupId)?.shortName || 'Khác';
      acc[groupName] = (acc[groupName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(incomeByGroup).map(key => ({
    name: key,
    value: incomeByGroup[key]
  }));

  // Revenue projection status
  const annualProjection = totalIncome * 12; // Crude projection based on 1 month mock
  const isHighRisk = annualProjection > 100000000 && !pieData.length; // Example risk logic

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 rounded-2xl text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">Tổng quan tài chính</h2>
        <p className="text-blue-100 text-sm mb-4">Tháng 5, 2025</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-blue-100 mb-1">Doanh thu</p>
            <p className="text-lg font-bold">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-blue-100 mb-1">Chi phí</p>
            <p className="text-lg font-bold">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Compliance Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-800 text-sm">Cảnh báo ngưỡng doanh thu</h3>
          <p className="text-xs text-yellow-700 mt-1">
            Dự báo doanh thu năm: {formatCurrency(annualProjection)}. 
            {annualProjection > 100000000 
              ? " Bạn thuộc đối tượng phải nộp lệ phí môn bài bậc 2." 
              : " Bạn đang ở dưới ngưỡng chịu thuế VAT/TNCN (nếu chỉ cho thuê tài sản)."}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('CALCULATOR')}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:bg-gray-50 transition"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-600">
            <TrendingUp size={20} />
          </div>
          <span className="text-sm font-medium text-gray-700">Tính Thuế</span>
        </button>
        <button 
          onClick={() => onNavigate('LEDGER')}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:bg-gray-50 transition"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 text-green-600">
            <Wallet size={20} />
          </div>
          <span className="text-sm font-medium text-gray-700">Sổ Thu Chi</span>
        </button>
      </div>

      {/* Analytics */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-blue-500" />
          Phân bố nguồn thu
        </h3>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu giao dịch
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
