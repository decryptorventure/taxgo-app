import React, { useState, useRef } from 'react';
import { Transaction, TaxGroupId, ExpenseCategory } from '../types';
import { TAX_GROUPS, EXPENSE_CATEGORIES_LIST } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { analyzeInvoiceImage } from '../services/geminiService';
import { Plus, Search, FileText, ArrowUpRight, ArrowDownLeft, Trash2, Camera, Loader2, AlertTriangle, Calendar, Tag, CreditCard, X } from 'lucide-react';

interface LedgerProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const DigitalLedger: React.FC<LedgerProps> = ({ transactions, onAddTransaction, onDeleteTransaction }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('');
  
  // Transaction Form State
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newGroup, setNewGroup] = useState<TaxGroupId>(TaxGroupId.DISTRIBUTION);
  const [newExpCategory, setNewExpCategory] = useState<ExpenseCategory>('SUPPLIES');
  
  // OCR State
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cash Flow Calculation
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const isNegativeCashFlow = totalExpense > totalIncome;

  const handleSave = () => {
    if (!newDesc || !newAmount) return;
    
    const t: Transaction = {
      id: Date.now().toString(),
      date: formDate,
      description: newDesc,
      amount: parseFloat(newAmount),
      type: activeTab,
      taxGroupId: activeTab === 'INCOME' ? newGroup : undefined,
      expenseCategory: activeTab === 'EXPENSE' ? newExpCategory : undefined,
      hasInvoice: true
    };
    
    onAddTransaction(t);
    resetForm();
    setIsAdding(false);
  };

  const resetForm = () => {
    setNewDesc('');
    setNewAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setNewExpCategory('SUPPLIES');
    setNewGroup(TaxGroupId.DISTRIBUTION);
    setIsScanning(false);
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Remove data url prefix for API
      const base64Data = base64String.split(',')[1];
      
      const data = await analyzeInvoiceImage(base64Data);
      
      if (data) {
        setNewAmount(data.amount.toString());
        setNewDesc(data.description);
        if (data.date) setFormDate(data.date);
        
        // Auto-switch to expense tab usually for receipts
        setActiveTab('EXPENSE');
        
        // Map category if possible
        if (EXPENSE_CATEGORIES_LIST.some(c => c.id === data.category)) {
          setNewExpCategory(data.category as ExpenseCategory);
        } else {
            setNewExpCategory('OTHER');
        }
      } else {
        alert("Không thể đọc thông tin từ ảnh. Vui lòng nhập thủ công.");
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-20 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Sổ Thu Chi</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Cash Flow Warning */}
      {isNegativeCashFlow && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fade-in">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Cảnh báo dòng tiền âm!</h3>
              <p className="text-xs text-red-700 mt-1">
                Chi phí ({formatCurrency(totalExpense)}) đang vượt quá thu nhập ({formatCurrency(totalIncome)}).
                Hãy rà soát lại các khoản chi không cần thiết.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Tìm kiếm giao dịch..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {t.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1">{t.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{t.date}</span>
                    <span>•</span>
                    {t.type === 'INCOME' ? (
                       <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                         {TAX_GROUPS.find(g => g.id === t.taxGroupId)?.shortName}
                       </span>
                    ) : (
                       <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                         {EXPENSE_CATEGORIES_LIST.find(c => c.id === t.expenseCategory)?.name || 'Khác'}
                       </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-gray-800'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                 <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-300 hover:text-red-500 ml-2 p-1">
                    <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up sm:animate-none">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Thêm Giao Dịch</h3>
              <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => setActiveTab('INCOME')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === 'INCOME' 
                      ? 'bg-white text-green-600 shadow-sm ring-1 ring-black/5' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <ArrowDownLeft size={16} className="mr-1.5" /> Thu Nhập
                  </span>
                </button>
                <button 
                  onClick={() => setActiveTab('EXPENSE')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === 'EXPENSE' 
                      ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                   <span className="flex items-center justify-center">
                    <ArrowUpRight size={16} className="mr-1.5" /> Chi Phí
                  </span>
                </button>
              </div>

              {/* OCR Scan Button */}
              <div className="mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-xl py-3 flex items-center justify-center hover:bg-blue-100 transition group"
                >
                  {isScanning ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Đang quét hóa đơn...
                    </>
                  ) : (
                    <>
                      <Camera size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                      Quét Hóa Đơn (OCR)
                    </>
                  )}
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ngày giao dịch</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input 
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl transition font-medium"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Số tiền (VNĐ)</label>
                   <div className="relative">
                      <CreditCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input 
                        type="number"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl transition text-lg font-bold text-gray-800"
                        placeholder="0"
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                      />
                   </div>
                </div>

                {/* Description */}
                <div>
                   <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mô tả</label>
                   <input 
                      className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl transition"
                      placeholder={activeTab === 'INCOME' ? "VD: Bán hàng sáng nay" : "VD: Thanh toán tiền điện"}
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                   />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                    {activeTab === 'INCOME' ? 'Nhóm Ngành Thuế' : 'Danh Mục Chi Phí'}
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    {activeTab === 'INCOME' ? (
                       <select 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl transition appearance-none"
                          value={newGroup}
                          onChange={(e) => setNewGroup(Number(e.target.value))}
                       >
                          {TAX_GROUPS.map(g => (
                            <option key={g.id} value={g.id}>{g.shortName}</option>
                          ))}
                       </select>
                    ) : (
                       <select 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl transition appearance-none"
                          value={newExpCategory}
                          onChange={(e) => setNewExpCategory(e.target.value as ExpenseCategory)}
                       >
                          {EXPENSE_CATEGORIES_LIST.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                       </select>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex space-x-3">
              <button 
                onClick={() => { setIsAdding(false); resetForm(); }} 
                className="flex-1 py-3.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave} 
                className={`flex-1 py-3.5 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition ${
                  activeTab === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Lưu Giao Dịch
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalLedger;
