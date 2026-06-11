const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const { schema: AddressSchema } = require("./Address");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    name_eng: {
      type: String,
    },
    description: {
      type: String,
    },
    tax_id: {
      type: String,
    },
    url: {
      type: String,
    },
    logo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },

    line_token_group_Expenses: {
      type: String,
    },
    line_token_id: {
      type: String,
    },
    line_notify_checkin: {
      token: { type: String },
      group: {
        type: String,
      },
    },
    address: AddressSchema,

    line_token_expenses: {
      type: String,
    },

    sponsor: {
      name: { type: String },
      website: { type: String },
    },
    // Expense approval flow mode: ONE_STEP or THREE_STEP
    expense_approval_mode: {
      type: String,
      enum: ["ONE_STEP", "THREE_STEP"],
      default: "THREE_STEP",
    },
    setting: {
      mms: {
        verifiedMaterialRequest: { type: Boolean, default: true },
      },
      payroll: {
        sso: {
          // employee contribution percent (e.g. 5)
          rate_percent: { type: Number, default: 5 },
          // maximum monthly contribution amount (e.g. 875)
          max_amount: { type: Number, default: 875 },
        },
        // เวลาเข้างานสำหรับคำนวณหักเงินมาสาย (รูปแบบ HH:mm เช่น "08:00")
        work_start_time: { type: String, default: "08:00" },
      },
      timestamp_image: {
        type: Boolean,
        default: true,
      },
      timestamp_location: {
        type: Boolean,
        default: false,
      },
      notify: {
        IMS: {
          enable: { type: Boolean, default: false },
          departments: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
          ],
        },
        MMS: {
          enable: { type: Boolean, default: false },
          departments: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
          ],
        },
        SPM: {
          enable: { type: Boolean, default: false },
          departments: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
          ],
        },
        WMS: {
          enable: { type: Boolean, default: false },
          departments: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
          ],
        },
        PMS: {
          enable: { type: Boolean, default: false },
          departments: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
          ],
        },
      },
    },
    expense_approver_1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    expense_approver_2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    expense_approver_3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    // ชื่อแผ่นงาน Google Sheet สำหรับส่งข้อมูล payout (ตั้งค่าในตั้งค่าบริษัท)
    google_sheet_worksheet: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator);

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    _id: this._id,
    id: this._id,
    name: this.name,
    description: this.description,
    line_token_expenses: this.line_token_expenses,
    line_notify_checkin: this.line_notify_checkin,
    line_token_group_Expenses: this.line_token_group_Expenses,
    line_token_id: this.line_token_id,
    url: this.url,
    tax_id: this.tax_id,
    logo: this.logo,
    owner: this.owner,
    sponsor: this.sponsor,
    setting: this.setting,
    name_eng: this.name_eng,
    expense_approval_mode: this.expense_approval_mode,
    expense_approver_1: this.expense_approver_1,
    expense_approver_2: this.expense_approver_2,
    expense_approver_3: this.expense_approver_3,
    google_sheet_worksheet: this.google_sheet_worksheet,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Information", schema);
