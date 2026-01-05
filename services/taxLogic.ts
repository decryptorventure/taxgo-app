import { LICENSE_FEE_TIERS, TAX_GROUPS } from '../constants';
import { TaxCalculationResult, TaxGroupId } from '../types';

export const calculateTax = (revenue: number, groupId: TaxGroupId, annualRevenueProjection: number): TaxCalculationResult => {
  const group = TAX_GROUPS.find(g => g.id === groupId);
  
  if (!group) {
    throw new Error("Invalid Tax Group");
  }

  // 1. Calculate VAT and PIT
  // Note: For Rental, if annual revenue <= 100M, tax is 0.
  let vatAmount = 0;
  let pitAmount = 0;
  
  const isExempt = groupId === TaxGroupId.RENTAL && annualRevenueProjection <= 100000000;

  if (!isExempt) {
    vatAmount = Math.round(revenue * (group.vatRate / 100));
    pitAmount = Math.round(revenue * (group.pitRate / 100));
  }

  // 2. Calculate License Fee (Môn Bài) based on Annual Projection
  let licenseFee = 0;
  // Find the applicable tier
  const tier = LICENSE_FEE_TIERS.find(t => annualRevenueProjection > t.threshold);
  if (tier) {
    licenseFee = tier.fee;
  }

  // Note: License fee is usually paid once a year, but for the calculator's sake, 
  // we display the annual obligation or strictly the tax on *this* revenue.
  // To keep it simple for the user context of "How much tax do I owe on this revenue?",
  // we will return the license fee as an informational "Annual Obligation" separate field often.
  // However, `totalLiability` in this context will represent immediate tax on this revenue input.
  
  const totalTax = vatAmount + pitAmount;

  return {
    revenue,
    vatAmount,
    pitAmount,
    totalTax,
    licenseFee,
    totalLiability: totalTax // Instant liability for this specific revenue entry
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const generateMockXML = (revenue: number, tax: number, taxCode: string, name: string) => {
  const date = new Date().toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<HSoThueDTu>
    <HSoKhaiThue>
        <TTinChung>
            <MSo>01/CNKD</MSo>
            <Ten>Tờ khai thuế đối với cá nhân kinh doanh</Ten>
            <NguoiNopThue>${name}</NguoiNopThue>
            <MaSoThue>${taxCode}</MaSoThue>
            <NgayKhai>${date}</NgayKhai>
        </TTinChung>
        <NoiDung>
            <DoanhThu>${revenue}</DoanhThu>
            <ThuePhaiNop>${tax}</ThuePhaiNop>
        </NoiDung>
    </HSoKhaiThue>
</HSoThueDTu>`;
};
