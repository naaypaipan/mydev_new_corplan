/**
 * โครงสร้างเมนู Sidebar (ไอคอนโมดูลกำหนดใน MainSidebar — SIDEBAR_MODULE_ICONS)
 * access.subMenuAccess[MODULE][href] ควบคุมสิทธิ์เมนูย่อย
 */

/** ชื่อที่แสดงเป็นกลุ่มโมดูล (tooltip แถบหลัก + หัวข้อแถบรอง) */
export const SIDEBAR_MODULE_TITLE = {
  PROFILE: 'ส่วนตัว & โปรไฟล์',
  PROJECT: 'โครงการ',
  HUMEN: 'ทรัพยากรบุคคล',
  FINANCE: 'การเงิน',
  CUSTOMER: 'ลูกค้า',
  DIRECTOR: 'ผู้บริหาร',
  MANAGEMENT: 'การตั้งค่าระบบ',
};

export const SIDEBAR_NAV_ITEMS = [
  {
    href: '/profile/timestamp',
    title: 'บันทึกเวลา',
    name: 'PROFILE',
    sub: [],
  },
  {
    href: '/profile/ot',
    title: 'คำขอโอที',
    name: 'PROFILE',
    sub: [],
  },
  {
    href: '/profile/disbursement',
    title: 'การเบิกจ่าย',
    name: 'PROFILE',
    sub: [],
  },
  {
    href: '/project/project',
    title: 'โครงการ',
    name: 'PROJECT',
    sub: [],
  },
  {
    href: '/humen/reportDaily',
    title: 'ทรัพยากรบุคคล',
    name: 'HUMEN',
    sub: [
      { href: '/humen/reportDaily', title: 'บันทึกเวลารายวัน' },
      { href: '/humen/ot-request', title: 'คำขอโอที' },
      { href: '/humen/salarylist', title: 'เงินเดือน' },
      { href: '/humen/report', title: 'รายงานรายเดือน' },
      { href: '/humen/checkin-management', title: 'จัดการสถานที่ลงเวลา' },
      { href: '/humen/timestamp', title: 'รายการบันทึกเวลา' },
      { href: '/humen/employee', title: 'พนักงาน' },
    ],
  },
  {
    href: '/finance/expenses',
    title: 'การเงิน',
    name: 'FINANCE',
    sub: [
      { href: '/finance/expenses', title: 'รายการเบิกเงิน' },
      { href: '/finance/expenses/all', title: 'ดูรายการตั้งเบิกทั้งหมด' },
      { href: '/finance/daily-report', title: 'รายงานรายวัน' },
      { href: '/finance/payment', title: 'เตรียมจ่ายเงิน' },
      { href: '/finance/billing', title: 'วางบิล' },
      { href: '/finance/expense-approvers', title: 'ตั้งค่าผู้อนุมัติรายการ' },
    ],
  },
  {
    href: '/customer',
    title: 'ลูกค้า',
    name: 'CUSTOMER',
    sub: [
      { href: '/customer/customers', title: 'ลูกค้า', level: 0 },
      { href: '/customer/customer-types', title: 'ประเภทลูกค้า', level: 1 },
    ],
  },
  {
    href: '/director/project',
    title: 'ผู้บริหาร',
    name: 'DIRECTOR',
    sub: [
      { href: '/director/project', title: 'ภาพรวมโครงการ', level: 0 },
      { href: '/director/approve-expenses', title: 'อนุมัติจ่ายเงิน', level: 0 },
    ],
  },
  {
    href: '/profile/profile',
    title: 'โปรไฟล์',
    name: 'PROFILE',
    sub: [],
  },
  {
    href: '/management/employee',
    title: 'การตั้งค่า',
    name: 'MANAGEMENT',
    sub: [
      { href: '/management/employee', title: 'พนักงาน' },
      { href: '/management/holiday', title: 'วันหยุด' },
      { href: '/management/department', title: 'แผนก' },
      { href: '/management/role-type', title: 'ประเภทบทบาท' },
      { href: '/management/user', title: 'ผู้ใช้งาน' },
      { href: '/management/paytype', title: 'ประเภทการจ่ายเงิน' },
      { href: '/management/transection-type', title: 'ประเภทรายการ' },
      { href: '/management/business', title: 'ตั้งค่า' },
      { href: '/management/developer', title: 'นักพัฒนา' },
    ],
  },
];

/** รายการเมนูย่อยตามโมดูล (สำหรับฟอร์มแผนก) */
export function buildSubmenuEntriesByModule() {
  const by = {};
  SIDEBAR_NAV_ITEMS.forEach((row) => {
    const mod = row.name;
    if (!by[mod]) by[mod] = [];
    if (row.sub?.length) {
      row.sub.forEach((s) => {
        by[mod].push({
          href: s.href,
          title: s.title,
          level: s.level ?? 0,
        });
      });
    } else {
      by[mod].push({ href: row.href, title: row.title, level: 0 });
    }
  });
  return by;
}

export const SUBMENU_ENTRIES_BY_MODULE = buildSubmenuEntriesByModule();

/** เติมค่าเมนูย่อยที่ยังไม่เคยบันทึกเป็น true (รองรับข้อมูลแผนกเก่า) */
export function mergeSubMenuDefaults(access = {}) {
  const existing = access.subMenuAccess || {};
  const out = {};
  Object.keys(SUBMENU_ENTRIES_BY_MODULE).forEach((mod) => {
    out[mod] = { ...(existing[mod] || {}) };
    SUBMENU_ENTRIES_BY_MODULE[mod].forEach(({ href }) => {
      if (out[mod][href] === undefined) out[mod][href] = true;
    });
  });
  return out;
}
