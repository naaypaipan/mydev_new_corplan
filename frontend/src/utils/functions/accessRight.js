import _ from 'lodash';

const accessRight = (me, moduleName, levelPage = 0) => {
  const lvl = levelPage ?? 0;
  const {
    userData: {
      department: { access = {} } = {},
      role: { level: meLevel } = {},
    } = {},
  } = me || {};

  if (access[`${_.toUpper(moduleName)}`] && meLevel >= lvl) {
    return true;
  }
  return false;
};

/**
 * ถ้ามีการตั้งค่า subMenuAccess[MODULE] อย่างน้อย 1 key จะใช้โหมด whitelist (เฉพาะ href ที่เป็น true)
 * ถ้าไม่มีการตั้งค่าเลยต่อโมดูล = ไม่จำกัดเมนูย่อย (ถ้าเข้าโมดูลได้)
 */
export const subMenuAllowed = (access, moduleName, href) => {
  if (!access || !moduleName || !href) return true;
  const mod = _.toUpper(moduleName);
  const sub = access.subMenuAccess && access.subMenuAccess[mod];
  if (!sub || typeof sub !== 'object' || Object.keys(sub).length === 0) {
    return true;
  }
  return sub[href] === true;
};

export const accessRightSubMenu = (me, moduleName, href, levelPage = 0) => {
  const lvl = levelPage ?? 0;
  if (!accessRight(me, moduleName, lvl)) return false;
  const access = me?.userData?.department?.access;
  return subMenuAllowed(access, moduleName, href);
};

export default accessRight;

/*
การใช้งาน

me คือข้อมูล user ผู้ใช้งานระบบที่ได้จาก server

module คือชื่อ module จาก layout เช่น TMS CRM เป็นต้น

levelPage สำหรับกำหนดระดับการเข้าถึงของ Page นั้น ๆ
ทั้งนี้หากต้องการตรวจสอบการเข้าถึงโมดูลไม่จำเป็นต้องส่งข้อมูลมาแต่ใช้ค่าเริ่มต้นในฟังก์ชันแทน

accessRightSubMenu — ตรวจทั้งโมดูล ระดับบทบาท และสิทธิ์เมนูย่อย (href ตรงกับ Sidebar)
*/
