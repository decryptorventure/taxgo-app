import { TaxGroup, TaxGroupId, ExpenseCategory } from './types';

export const TAX_GROUPS: TaxGroup[] = [
  {
    id: TaxGroupId.DISTRIBUTION,
    name: "Phân phối, cung cấp hàng hóa (Bán buôn, bán lẻ)",
    shortName: "Thương mại",
    vatRate: 1.0,
    pitRate: 0.5,
    description: "Cửa hàng tạp hóa, siêu thị mini, bán buôn..."
  },
  {
    id: TaxGroupId.SERVICES_CONSTRUCTION,
    name: "Dịch vụ, xây dựng không bao thầu nguyên vật liệu",
    shortName: "Dịch vụ",
    vatRate: 5.0,
    pitRate: 2.0,
    description: "Lưu trú, sửa chữa, tư vấn, xây dựng nhân công...",
    warning: "Lưu ý: Ngành có thuế suất cao nhất. Tránh khai sai từ dịch vụ sang bán hàng."
  },
  {
    id: TaxGroupId.PRODUCTION_TRANSPORT,
    name: "Sản xuất, vận tải, dịch vụ có gắn với hàng hóa",
    shortName: "Sản xuất/Vận tải",
    vatRate: 3.0,
    pitRate: 1.5,
    description: "Nhà hàng, quán ăn, xưởng gia công, vận tải hàng hóa..."
  },
  {
    id: TaxGroupId.OTHER,
    name: "Hoạt động kinh doanh khác",
    shortName: "Khác",
    vatRate: 2.0,
    pitRate: 1.0,
    description: "Các hoạt động không thuộc các nhóm trên."
  },
  {
    id: TaxGroupId.RENTAL,
    name: "Cho thuê tài sản (Doanh thu > 100tr/năm)",
    shortName: "Cho thuê tài sản",
    vatRate: 5.0,
    pitRate: 5.0,
    description: "Cho thuê nhà, mặt bằng, phương tiện...",
    warning: "Ngưỡng chịu thuế: Doanh thu > 8.33 triệu/tháng."
  }
];

export const EXPENSE_CATEGORIES_LIST: { id: ExpenseCategory; name: string }[] = [
  { id: 'SUPPLIES', name: 'Nguyên vật liệu/Hàng hóa' },
  { id: 'RENT', name: 'Thuê mặt bằng' },
  { id: 'UTILITIES', name: 'Điện, Nước, Internet' },
  { id: 'MARKETING', name: 'Quảng cáo & Marketing' },
  { id: 'SALARY', name: 'Lương nhân viên' },
  { id: 'OTHER', name: 'Chi phí khác' },
];

export const MOCK_TRANSACTIONS = [
  { id: '1', date: '2025-05-01', description: 'Bán hàng tạp hóa', amount: 15000000, type: 'INCOME', taxGroupId: TaxGroupId.DISTRIBUTION, hasInvoice: true },
  { id: '2', date: '2025-05-02', description: 'Nhập hàng Vinamilk', amount: 8000000, type: 'EXPENSE', expenseCategory: 'SUPPLIES', hasInvoice: true },
  { id: '3', date: '2025-05-05', description: 'Bán hàng tạp hóa', amount: 5000000, type: 'INCOME', taxGroupId: TaxGroupId.DISTRIBUTION, hasInvoice: false },
  { id: '4', date: '2025-05-10', description: 'Tiền điện tháng 4', amount: 1200000, type: 'EXPENSE', expenseCategory: 'UTILITIES', hasInvoice: true },
];

export const LICENSE_FEE_TIERS = [
  { threshold: 500000000, fee: 1000000 },
  { threshold: 300000000, fee: 500000 },
  { threshold: 100000000, fee: 300000 },
  { threshold: 0, fee: 0 },
];
