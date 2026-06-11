/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */

const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const { schema: AddressSchema } = require("./Address");

const schema = new mongoose.Schema(
  {
    type: {
      type: mongoose.Types.ObjectId,
      ref: "CustomerType",
    },
    name: {
      type: String,
    }, // company
    short: {
      type: String,
    }, // company
    telephone: {
      type: String,
    },
    fax: {
      type: String,
    },
    taxId: {
      type: String,
    },
    email: {
      type: String,
    },
    credit_term: {
      type: String,
    },
    contact: [
      {
        firstname: {
          type: String,
        },
        lastname: {
          type: String,
        },
        nickname: {
          type: String,
        },
        position: {
          type: String,
        },
        telephone: {
          type: String,
        },
        email: {
          type: String,
        },
        note: {
          type: String,
        },
      },
    ],
    customer_status: {
      type: Boolean,
      default: true,
    },
    supplier_status: {
      type: Boolean,
      default: false,
    },

    contactreserve: [
      {
        firstname: {
          type: String,
        },
        lastname: {
          type: String,
        },
        nickname: {
          type: String,
        },
        position: {
          type: String,
        },
        telephone: {
          type: String,
        },
        email: {
          type: String,
        },
        note: {
          type: String,
        },
      },
    ],
    address: AddressSchema,
    bank: {
      bank_name: {
        type: String,
      },
      account_name: {
        type: String,
      },
      account_number: {
        type: String,
      },
      branch: {
        type: String,
      },
      // short_name: {
      //   type: String,
      // },
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
    type: this.type,
    name: this.name,
    short: this.short,
    telephone: this.telephone,
    email: this.email,
    credit_term: this.credit_term,
    contact: this.contact,
    address: this.address,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    contactreserve: this.contactreserve,
    customer_status: this.customer_status,
    supplier_status: this.supplier_status,
    fax: this.fax,
    taxId: this.taxId,
    bank: this.bank,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Customer", schema);
