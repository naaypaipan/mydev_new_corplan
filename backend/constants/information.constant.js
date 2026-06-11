module.exports = {
  name: "คอร์แพลนอีอาร์พี",
  name_eng: "COREPLAN",
  description: "ระบบกระจายการขนส่ง",
  setting: {
    payroll: {
      sso: {
        rate_percent: 5,
        max_amount: 875,
      },
      work_start_time: "08:00",
    },
  },
  owner: {
    address: {
      subdistrict: "คอหงส์",
      district: "หาดใหญ่",
      province: "สงขลา",
      postcode: "90112",
      country: "ไทย",
    },
  },

  available_module: {
    HRMS: true,
    CRM: true,
    IMS: true,
    MMS: true,
    SPM: true,
    WMS: true,
    PMS: true,
    MOM: true,
    INFORMATION: true,
    REPORT: true,
    DASHBOARD: true,
  },
};
