import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TaxCalculator from './components/TaxCalculator';
import DigitalLedger from './components/DigitalLedger';
import AiAssistant from './components/AiAssistant';
import { ViewState, Transaction } from './types';
import { MOCK_TRANSACTIONS } from './constants';
import { LayoutDashboard, Calculator, BookOpen, MessageSquareText } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const handleAddTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
      case 'CALCULATOR':
        return <TaxCalculator />;
      case 'LEDGER':
        return <DigitalLedger 
          transactions={transactions} 
          onAddTransaction={handleAddTransaction} 
          onDeleteTransaction={handleDeleteTransaction}
        />;
      case 'AI_ASSISTANT':
        return <AiAssistant />;
      default:
        return <Dashboard transactions={transactions} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-blue-100">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Top Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-20 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    T
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">TaxGo</h1>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto no-scrollbar relative">
          {renderView()}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center sticky bottom-0 z-30 pb-safe">
          <button 
            onClick={() => setCurrentView('DASHBOARD')}
            className={`flex flex-col items-center space-y-1 transition ${currentView === 'DASHBOARD' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Tổng quan</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('CALCULATOR')}
            className={`flex flex-col items-center space-y-1 transition ${currentView === 'CALCULATOR' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Calculator size={24} />
            <span className="text-[10px] font-medium">Tính thuế</span>
          </button>

          <button 
            onClick={() => setCurrentView('LEDGER')}
            className={`flex flex-col items-center space-y-1 transition ${currentView === 'LEDGER' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BookOpen size={24} />
            <span className="text-[10px] font-medium">Sổ sách</span>
          </button>

          <button 
            onClick={() => setCurrentView('AI_ASSISTANT')}
            className={`flex flex-col items-center space-y-1 transition ${currentView === 'AI_ASSISTANT' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MessageSquareText size={24} />
            <span className="text-[10px] font-medium">Trợ lý AI</span>
          </button>
        </nav>

      </div>
    </div>
  );
};

export default App;
