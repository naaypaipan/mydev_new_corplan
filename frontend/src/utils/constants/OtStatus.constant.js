export const OT_STATUS = {
  PENDING: {
    status_code: 'waiting',
    description: 'รอการอนุมัติ',
    color: 'warning',
  },
  APPROVE: {
    status_code: 'approve',
    description: 'อนุมัติ',
    color: 'success',
  },
  REJECT: {
    status_code: 'reject',
    description: 'ไม่อนุมัติ',
    color: 'error',
  },
};
export default OT_STATUS;
