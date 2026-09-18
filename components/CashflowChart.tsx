import { Transaction } from '@/lib/types';
import { useMemo, useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface CashflowChartProps {
  transactions: Transaction[];
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    // We want the last 5 months including current month.
    const months = [];
    const now = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('id-ID', { month: 'short' }),
        fullMonth: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        in: 0,
        out: 0
      });
    }

    // Accumulate transaction amounts
    transactions.forEach(tx => {
      if (tx.account !== 'BUSINESS') return;

      const txDate = new Date(tx.created_at);
      const mIdx = months.findIndex(m => m.year === txDate.getFullYear() && m.monthIndex === txDate.getMonth());
      if (mIdx !== -1) {
        if (tx.type === 'IN') {
          months[mIdx].in += Number(tx.amount);
        } else {
          months[mIdx].out += Number(tx.amount);
        }
      }
    });

    return months;
  }, [transactions]);

  const [activeIndex, setActiveIndex] = useState<number>(4); // default to current month
  const activeData = chartData[activeIndex];

  // Find max value to scale bars properly
  const maxVal = Math.max(...chartData.map(d => Math.max(d.in, d.out)), 1);
  
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Grafik Cashflow</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Ketuk batang untuk detail</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-medium text-gray-600">Masuk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] font-medium text-gray-600">Keluar</span>
          </div>
        </div>
      </div>

      {/* Dynamic Compact Details */}
      <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 transition-all">
        <span className="text-[11px] font-bold text-gray-700">Bulan {activeData.label}</span>
        <div className="flex gap-4 text-[11px] font-black">
           <span className="text-green-600">+{formatIDR(activeData.in)}</span>
           <span className="text-red-500">-{formatIDR(activeData.out)}</span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="flex items-end justify-between h-40 gap-1 sm:gap-2">
        {chartData.map((data, idx) => {
          // Calculate height percentage, ensuring a minimum visible height even if 0 for aesthetics
          const heightIn = data.in === 0 && data.out === 0 ? '4px' : `${Math.max((data.in / maxVal) * 100, 2)}%`;
          const heightOut = data.in === 0 && data.out === 0 ? '4px' : `${Math.max((data.out / maxVal) * 100, 2)}%`;
          
          const isActive = activeIndex === idx;
          const opacityClass = isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70';
          
          return (
            <div 
              key={idx} 
              onClick={() => setActiveIndex(idx)}
              className={`flex flex-col items-center flex-1 h-full justify-end gap-2 group cursor-pointer relative transition-all duration-300 ${opacityClass}`}
            >
              <div className="w-full flex items-end justify-center gap-1 h-[120px]">
                {/* Bar IN */}
                <div 
                  className="w-full max-w-[14px] sm:max-w-[18px] bg-gradient-to-t from-green-500 to-green-400 rounded-t-md flex-shrink-0 transition-all duration-700 ease-out shadow-sm" 
                  style={{ height: heightIn }}
                />
                {/* Bar OUT */}
                <div 
                  className="w-full max-w-[14px] sm:max-w-[18px] bg-gradient-to-t from-red-500 to-red-400 rounded-t-md flex-shrink-0 transition-all duration-700 ease-out shadow-sm" 
                  style={{ height: heightOut }}
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {data.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
