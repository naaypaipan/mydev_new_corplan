import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Grid, Paper, Box, Typography, Button, Snackbar, Alert, Menu, MenuItem, TextField, Select,
  InputLabel, FormControl, Checkbox, FormControlLabel, Divider, Chip, useTheme, Stack, Tooltip, Autocomplete,
  Modal, Fade, Backdrop, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot
} from '@mui/lab';
import {
  Description as DescriptionIcon, Edit as EditIcon, Share as ShareIcon, Print as PrintIcon,
  MoreHoriz as MoreHorizIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon,
  CheckCircle as CheckCircleIcon, RestartAlt as ResetIcon
} from '@mui/icons-material';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import pdfMake from 'addthaifont-pdfmake';
import 'addthaifont-pdfmake/build/vfs_fonts';
import quotationReport from '../../components/PDF/quotationReport';
import { createFilterOptions } from '@mui/material/Autocomplete';

// ตั้งค่า dayjs
dayjs.locale('th');
dayjs.extend(buddhistEra);
dayjs.extend(LocalizedFormat);

// ตั้งค่าฟอนต์สำหรับ pdfMake
pdfMake.fonts = {
  Sarabun: {
    normal: 'Sarabun-Light.ttf',
    bold: 'Sarabun-Regular.ttf',
    italics: 'Sarabun-LightItalic.ttf',
    bolditalics: 'Sarabun-Italic.ttf',
  },
};

// Regex สำหรับเลขที่เอกสาร
const BILLING_NO_REGEX = /^BN\s?\d{8}\s?\d{4}$|^BN\s?\d{4}-\d{2}-\d{2}\s?\d{4}$/;
const ADD_PROJECT_ID = '__ADD_PROJECT__';
const PROJECTS_KEY = 'projects';
const DEFAULT_PROJECTS = ['โปรเจกต์ A', 'โปรเจกต์ B', 'โปรเจกต์ C'];

const CreateFormQuotation = ({ initialQuotationData = {}, initialSummary = {}, onSave }) => {
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();

  // ขนาดมาตรฐานสำหรับ input fields
  const FIELD_WIDTH = 160;
  const FIELD_HEIGHT = 40;
  const FIELD_FONT_SIZE = 14;

  const inputSx = {
    width: FIELD_WIDTH,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      height: FIELD_HEIGHT,
    },
    '& .MuiInputBase-input': {
      py: 0,
      fontSize: FIELD_FONT_SIZE,
    },
  };
  // ขนาดมาตรฐานให้เท่ากันทุกช่องในบรรทัด โปรเจกต์/เลขที่อ้างอิง/ราคาสินค้า
  const CONTROL_HEIGHT = 44;
  const UNIFORM_SX = {
    width: '100%',
    '& .MuiOutlinedInput-root': { borderRadius: 2, height: CONTROL_HEIGHT },
    '& .MuiInputBase-input': { py: 0.5, fontSize: 14 },
  };
  const UNIFORM_SELECT_SX = {
    width: '100%',
    borderRadius: 2,
    height: CONTROL_HEIGHT,
    '& .MuiSelect-select': { py: 0.5, fontSize: 14, display: 'flex', alignItems: 'center' },
  };

  const selectSx = {
    width: FIELD_WIDTH,
    borderRadius: 2,
    height: FIELD_HEIGHT,
    '& .MuiSelect-select': {
      py: 0.8,
      fontSize: FIELD_FONT_SIZE,
    },
  };

  const initialBillingData = {
    billingNumber: `BN${dayjs().format('YYYYMMDD')}0001`,
    customerName: '',
    contactId: '',
    topic: '',
    currency: 'THB - ไทย',
    date: dayjs().format('YYYY-MM-DD'),
    dueDate: dayjs().format('YYYY-MM-DD'),
    salesperson: 'Nuriyah H.',
    terms: '',
    paymentMethod: '',
    project: '',
    referenceNumber: '',
    priceType: 'ไม่รวมภาษี',
    description: '',
    notes: '',
    internalNotes: '',
    warehouse: '',
    items: [{ id: 1, description: '', quantity: 1.0, pricePerUnit: 0.0, unit: '', total: 0.0 }],
    includeDiscount: true,
    discount: 0.0,
    discountType: '%',
    vatIncluded: true,
    vatRate: 7,
    withholdingTax: false,
    paymentStatus: 'รอชำระ',
  };

  // helper ใส่ detail ให้ทุกรายการ (กันเคสข้อมูลเก่าที่ยังไม่มี field นี้)
  const ensureDetail = (arr = []) => arr.map(it => ({ detail: '', ...it }));
  const [billingData, setBillingData] = useState(() => ({
    ...initialBillingData,
    ...initialQuotationData,
    items: initialQuotationData.items?.length > 0
      ? ensureDetail(initialQuotationData.items)
      : ensureDetail(initialBillingData.items),
  }));

  // const [billingData, setBillingData] = useState(() => ({
  //   ...initialBillingData,
  //   ...initialQuotationData,
  //   items: [{ id: 1, description: '', detail: '', quantity: 1.0, pricePerUnit: 0.0, unit: '', total: 0.0 }],
  // }));

  const [summary, setSummary] = useState({
    ...initialSummary,
    subtotal: initialSummary.subtotal || 0.0,
    discount: initialSummary.discount || 0.0,
    afterDiscount: initialSummary.afterDiscount || 0.0,
    vat: initialSummary.vat || 0.0,
    total: initialSummary.total || 0.0,
  });
  const [openBillingNumberModal, setOpenBillingNumberModal] = useState(false);
  const [newBillingNumber, setNewBillingNumber] = useState(billingData.billingNumber);
  const [customerOptions, setCustomerOptions] = useState(['Cool umbrella', 'สมชาย ใจดี']);
  const [contacts, setContacts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [openEnvelopePreview, setOpenEnvelopePreview] = useState(false);
  const [envelopeSize, setEnvelopeSize] = useState('DL');
  const [customWidth, setCustomWidth] = useState(220);
  const [customHeight, setCustomHeight] = useState(110);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    businessName: '',
    roles: { customer: false, vendor: false },
  });
  const [projectErrors, setProjectErrors] = useState({});

  // State สำหรับ projectOptions
  const [projectOptions, setProjectOptions] = useState(DEFAULT_PROJECTS);

  // โหลดโปรเจกต์จาก localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PROJECTS_KEY));
      if (Array.isArray(stored) && stored.length > 0) {
        setProjectOptions(stored);
      } else {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
        setProjectOptions(DEFAULT_PROJECTS);
      }
    } catch {
      setProjectOptions(DEFAULT_PROJECTS);
    }
  }, []);

  // โหลดผู้ติดต่อจาก localStorage
  useEffect(() => {
    try {
      const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
      setContacts(storedContacts);
      setCustomerOptions(storedContacts.map((contact) => contact.name));
    } catch (error) {
      console.error('Error loading contacts:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการโหลดผู้ติดต่อ',
        severity: 'error',
      });
    }
  }, []);

  // ฟังก์ชันบันทึกโปรเจกต์ลง localStorage
  const saveProjects = useCallback((list) => {
    const unique = Array.from(new Set(list.map(p => p?.trim()).filter(Boolean)));
    setProjectOptions(unique);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(unique));
  }, []);

  // ฟังก์ชันจัดการการบันทึกโปรเจกต์ใหม่
  const handleSaveProject = useCallback(() => {
    const errs = {};
    if (!projectForm.name.trim()) errs.name = 'กรุณาระบุชื่อโปรเจกต์';
    if (!projectForm.roles.customer && !projectForm.roles.vendor) {
      errs.roles = 'กรุณาเลือกบทบาทอย่างน้อย 1 ค่า';
    }
    setProjectErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const name = projectForm.name.trim();
    saveProjects([...projectOptions, name]);
    setBillingData((prev) => ({ ...prev, project: name }));
    setOpenProjectModal(false);
    setProjectForm({ name: '', businessName: '', roles: { customer: false, vendor: false } });
    setProjectErrors({});
  }, [projectForm, projectOptions, saveProjects]);

  const formatCurrency = useCallback((amount) => {
    const currencySymbols = {
      'THB - ไทย': '฿',
      'USD - US Dollar': '$',
      'EUR - Euro': '€',
    };
    const parsedAmount = parseFloat(amount);
    return isNaN(parsedAmount)
      ? `${currencySymbols[billingData.currency] || ''}0.00`
      : `${currencySymbols[billingData.currency] || ''}${parsedAmount.toFixed(2)}`;
  }, [billingData.currency]);

  const calculateSummary = useCallback((items, discount, discountType, vatIncluded, vatRate) => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    const discountAmount = discountType === '%' ? (subtotal * discount) / 100 : discount;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const vatAmount = vatIncluded ? (afterDiscount * vatRate) / 100 : 0;
    const total = afterDiscount + vatAmount;
    setSummary({
      subtotal: subtotal.toFixed(2),
      discount: discountAmount.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      vat: vatAmount.toFixed(2),
      total: total.toFixed(2),
    });
  }, []);

  useEffect(() => {
    calculateSummary(
      billingData.items,
      billingData.discount,
      billingData.discountType,
      billingData.vatIncluded,
      billingData.vatRate
    );
  }, [billingData.items, billingData.discount, billingData.discountType, billingData.vatIncluded, billingData.vatRate, calculateSummary]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!billingData.contactId) errors.contactId = 'กรุณาเลือกผู้ติดต่อ';
    if (!billingData.topic) errors.topic = 'กรุณากรอกที่อยู่';
    if (!billingData.date) errors.date = 'กรุณากรอกวันที่';
    if (!billingData.dueDate) errors.dueDate = 'กรุณากรอกวันที่ครบกำหนด';
    if (dayjs(billingData.dueDate).isBefore(dayjs(billingData.date))) {
      errors.dueDate = 'วันที่ครบกำหนดต้องไม่เร็วกว่าวันที่เอกสาร';
    }
    if (!billingData.salesperson) errors.salesperson = 'กรุณาเลือกพนักงานขาย';
    if (!BILLING_NO_REGEX.test(billingData.billingNumber)) {
      errors.billingNumber = 'เลขที่เอกสารถูกต้องต้องเป็น BNYYYYMMDDXXXX หรือ BN YYYY-MM-DD XXXX';
    }
    if (billingData.items.some((item) => !item.description || item.quantity <= 0 || item.pricePerUnit <= 0)) {
      errors.items = 'กรุณากรอกข้อมูลรายการสินค้าให้ครบถ้วน';
    }
    if (files.length > 0 && files.some((file) => file.size > 5 * 1024 * 1024)) {
      errors.files = 'ไฟล์แนบต้องมีขนาดไม่เกิน 5MB';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [billingData, files]);

  const handlePrint = useCallback(() => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนพิมพ์', severity: 'error' });
      return;
    }
    try {
      setSnackbar({ open: true, message: 'กำลังสร้างไฟล์ PDF...', severity: 'info' });
      const pdfData = {
        ...billingData,
        summary: { ...summary },
        vatRate: billingData.vatRate || 7,
        items: billingData.items.map(item => ({
          ...item,
          description: item.description || 'ไม่ระบุ',
          quantity: item.quantity || 0,
          pricePerUnit: item.pricePerUnit || 0,
          unit: item.unit || '',
          total: item.total || 0,
        })),
      };
      quotationReport(pdfData);
      setSnackbar({ open: true, message: 'สร้างและเปิด PDF สำเร็จ', severity: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({ open: true, message: `เกิดข้อผิดพลาดในการสร้าง PDF: ${error.message}`, severity: 'error' });
    }
  }, [billingData, summary, validateForm]);

  const addItem = useCallback(() => {
    const newItem = { id: billingData.items.length + 1, description: '', detail: '', quantity: 1.0, pricePerUnit: 0.0, unit: '', total: 0.0 };
    setBillingData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  }, [billingData.items]);

  const updateItem = useCallback((id, field, value) => {
    const isTextField = ['description', 'unit', 'detail'].includes(field);
    const isText = ['description', 'detail', 'unit'].includes(field);
    const parsedValue = isText ? value : Math.max(0, parseFloat(value) || 0);
    const updatedItems = billingData.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: parsedValue };
        if (field === 'quantity' || field === 'pricePerUnit') {
          updatedItem.total = (updatedItem.quantity * updatedItem.pricePerUnit).toFixed(2);
        }
        return updatedItem;
      }
      return item;
    });
    setBillingData((prev) => ({ ...prev, items: updatedItems }));
    setFormErrors((prev) => ({ ...prev, items: '' }));
  }, [billingData.items]);

  const removeItem = useCallback((id) => {
    const updatedItems = billingData.items.filter((item) => item.id !== id);
    setBillingData((prev) => ({ ...prev, items: updatedItems }));
  }, [billingData.items]);

  const handleResetForm = useCallback(() => {
    setBillingData(initialBillingData);
    setSummary({
      subtotal: 0.0,
      discount: 0.0,
      afterDiscount: 0.0,
      vat: 0.0,
      total: 0.0,
    });
    setFiles([]);
    setFormErrors({});
    setSnackbar({ open: true, message: 'รีเซ็ตฟอร์มเรียบร้อย', severity: 'info' });
  }, []);

  const handleSaveDocument = useCallback(() => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วน', severity: 'error' });
      return;
    }
    try {
      const quotationId = billingData.id || uuidv4();
      const quotationData = {
        id: quotationId,
        billingData: {
          ...billingData,
          billingNumber: billingData.billingNumber.replace(/\s/g, ''),
          history: [
            ...(billingData.history || []),
            { action: `แก้ไขเอกสาร ${billingData.billingNumber}`, timestamp: new Date().toISOString() }
          ]
        },
        summary: { ...summary }
      };

      const storedQuotations = JSON.parse(localStorage.getItem('quotations')) || [];
      const existingIndex = storedQuotations.findIndex((q) => q.id === quotationId);
      let updatedQuotations;
      if (existingIndex >= 0) {
        updatedQuotations = [...storedQuotations];
        updatedQuotations[existingIndex] = quotationData;
      } else {
        updatedQuotations = [...storedQuotations, quotationData];
      }
      localStorage.setItem('quotations', JSON.stringify(updatedQuotations));

      onSave(quotationData);

      setSnackbar({ open: true, message: 'เอกสารถูกบันทึกเรียบร้อยแล้ว', severity: 'success' });
      setSaveDialogOpen(false);
      history.push('/sale/quotation');
    } catch (error) {
      console.error('Error saving document:', error);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการบันทึก', severity: 'error' });
    }
  }, [billingData, summary, validateForm, onSave, history]);

  const handleCloseWindow = useCallback(() => {
    if (
      JSON.stringify(billingData) !== JSON.stringify({ ...initialBillingData, ...initialQuotationData }) ||
      JSON.stringify(summary) !== JSON.stringify(initialSummary)
    ) {
      setSaveDialogOpen(true);
    } else {
      onSave(null);
    }
  }, [billingData, summary, initialBillingData, initialQuotationData, initialSummary, onSave]);

  const handleShare = useCallback(() => {
    const shareData = {
      title: `Quotation ${billingData.billingNumber}`,
      text: `Quotation Details:\nCustomer: ${billingData.customerName}\nTotal: ${formatCurrency(summary.total)}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch((error) => console.error('Share failed:', error));
    } else {
      navigator.clipboard.writeText(shareData.text).then(() => {
        setSnackbar({ open: true, message: 'คัดลอกข้อมูลใบเสนอราคาไปยังคลิปบอร์ดแล้ว', severity: 'success' });
      });
    }
  }, [billingData.billingNumber, billingData.customerName, summary.total, formatCurrency]);

  const ADD_ID = '__add_new__';
  const optionsWithAdd = [{ id: ADD_ID, name: '➕ เพิ่มลูกค้าใหม่' }, ...contacts];

  const handleDownload = useCallback(() => {
    const billingText = `
Quotation Number: ${billingData.billingNumber}
Date: ${billingData.date}
Due Date: ${billingData.dueDate}
Customer: ${billingData.customerName}
Salesperson: ${billingData.salesperson}
Payment Status: ${billingData.paymentStatus}
Project: ${billingData.project}
Reference Number: ${billingData.referenceNumber}
Price Type: ${billingData.priceType}
Description: ${billingData.description}
Warehouse: ${billingData.warehouse}
Notes: ${billingData.notes}
Subtotal: ${formatCurrency(summary.subtotal)}
Discount: ${formatCurrency(summary.discount)}
After Discount: ${formatCurrency(summary.afterDiscount)}
VAT (${billingData.vatRate}%): ${formatCurrency(summary.vat)}
Total: ${formatCurrency(summary.total)}
Items: ${billingData.items.map((item) => `\n- ${item.description}: ${item.quantity} ${item.unit} x ${formatCurrency(item.pricePerUnit)} = ${formatCurrency(item.total)}`).join('')}
    `.trim();
    const blob = new Blob([billingText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quotation_${billingData.billingNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [billingData, summary, formatCurrency]);

  const handleOpenBillingNumberModal = () => {
    setNewBillingNumber(billingData.billingNumber);
    setOpenBillingNumberModal(true);
  };

  const handleCloseBillingNumberModal = () => {
    setOpenBillingNumberModal(false);
  };

  const confirmBillingNumber = useCallback(() => {
    let formattedNumber = newBillingNumber.trim();
    if (!BILLING_NO_REGEX.test(formattedNumber)) {
      formattedNumber = `BN${dayjs().format('YYYYMMDD')}0001`;
      setSnackbar({ open: true, message: `เลขที่เอกสารไม่ถูกต้อง ใช้รูปแบบเริ่มต้น: ${formattedNumber}`, severity: 'warning' });
    }
    setBillingData((prev) => ({ ...prev, billingNumber: formattedNumber.replace(/\s/g, '') }));
    setFormErrors((prev) => ({ ...prev, billingNumber: '' }));
    setOpenBillingNumberModal(false);
  }, [newBillingNumber]);

  const handleEditContact = useCallback(() => {
    const contact = contacts.find((contact) => contact.id === billingData.contactId);
    if (contact) {
      history.push(`/contact/${contact.id}`);
    } else {
      setSnackbar({ open: true, message: 'กรุณาเลือกผู้ติดต่อก่อนแก้ไข', severity: 'warning' });
    }
  }, [billingData.contactId, contacts, history]);

  const handleAddContact = useCallback(() => {
    history.push('/sale/quotation/contact/new');
  }, [history]);

  const handleSaveContact = useCallback((newContact) => {
    try {
      const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
      const existingIndex = storedContacts.findIndex((contact) => contact.id === newContact.id);
      let updatedContacts;
      if (existingIndex >= 0) {
        updatedContacts = [...storedContacts];
        updatedContacts[existingIndex] = newContact;
      } else {
        updatedContacts = [...storedContacts, newContact];
      }
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      setCustomerOptions(updatedContacts.map((contact) => contact.name));
      setBillingData((prev) => ({
        ...prev,
        customerName: newContact.name,
        contactId: newContact.id
      }));
      setSnackbar({
        open: true,
        message: 'บันทึกผู้ติดต่อสำเร็จ',
        severity: 'success',
      });
      history.push('/sale/quotation');
    } catch (error) {
      console.error('Error saving contact:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกผู้ติดต่อ',
        severity: 'error',
      });
    }
  }, [history]);

  const handleAddCustomerFromPayment = () => {
    history.push('/Customer/Customers', { backTo: location.pathname });
  };

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    setBillingData((prev) => ({ ...prev, date: newDate }));
    if (dayjs(newDate).isAfter(dayjs(billingData.dueDate))) {
      setFormErrors((prev) => ({ ...prev, dueDate: 'วันครบกำหนดต้องไม่เร็วกว่าวันที่เอกสาร' }));
    } else {
      setFormErrors((prev) => ({ ...prev, date: '' }));
    }
  }, [billingData.dueDate]);

  const handleDueDateChange = useCallback((e) => {
    const newDueDate = e.target.value;
    if (dayjs(newDueDate).isBefore(dayjs(billingData.date))) {
      setFormErrors((prev) => ({ ...prev, dueDate: 'วันครบกำหนดต้องไม่เร็วกว่าวันที่เอกสาร' }));
    } else {
      setFormErrors((prev) => ({ ...prev, dueDate: '' }));
      setBillingData((prev) => ({ ...prev, dueDate: newDueDate }));
    }
  }, [billingData.date]);

  const handleSalespersonChange = useCallback((e) => {
    setBillingData((prev) => ({ ...prev, salesperson: e.target.value }));
    setFormErrors((prev) => ({ ...prev, salesperson: '' }));
  }, []);

  const handleCurrencyChange = useCallback((e) => {
    setBillingData((prev) => ({ ...prev, currency: e.target.value }));
  }, []);

  const handlePaymentStatusChange = useCallback((e) => {
    setBillingData((prev) => ({ ...prev, paymentStatus: e.target.value }));
  }, []);

  const handleProjectChange = useCallback((e, value) => {
    if (value?.id === ADD_PROJECT_ID || value?.inputValue) {
      setProjectForm((prev) => ({ ...prev, name: value?.inputValue || '' }));
      setOpenProjectModal(true);
      return;
    }
    setBillingData((prev) => ({ ...prev, project: value?.label || '' }));
  }, []);

  const handleReferenceNumberChange = useCallback((e) => {
    setBillingData((prev) => ({ ...prev, referenceNumber: e.target.value }));
  }, []);

  const handlePriceTypeChange = useCallback((e) => {
    setBillingData((prev) => ({ ...prev, priceType: e.target.value }));
  }, []);

  const handleWarehouseChange = useCallback((e) => {
    setBillingData((prev) => ({ ...prev, warehouse: e.target.value }));
  }, []);

  const handleMoreOptionsClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMoreOptionsClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handlePrintEnvelope = useCallback(() => {
    setOpenEnvelopePreview(true);
    setSnackbar({ open: true, message: 'กำลังแสดงพรีวิวซอง...', severity: 'info' });
  }, []);

  const handleViewHistory = useCallback(() => {
    const quotations = JSON.parse(localStorage.getItem('quotations')) || [];
    const filteredHistory = quotations.filter((q) => q.billingData.billingNumber === billingData.billingNumber);
    setHistoryData(filteredHistory);
    setOpenHistoryModal(true);
    setSnackbar({ open: true, message: 'กำลังแสดงประวัติเอกสาร...', severity: 'info' });
  }, [billingData.billingNumber]);

  const handleDocumentSettings = useCallback(() => {
    setSnackbar({ open: true, message: 'กำลังตั้งค่าเอกสาร...', severity: 'info' });
    console.log('Opening document settings for:', billingData.billingNumber);
    handleMoreOptionsClose();
  }, [billingData.billingNumber, handleMoreOptionsClose]);

  const handleFileChange = useCallback((e) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;
    const newFiles = Array.from(e.target.files).filter((file) => allowedTypes.includes(file.type) && file.size <= maxSize);
    if (newFiles.length !== e.target.files.length) {
      setSnackbar({ open: true, message: 'บางไฟล์ไม่ได้รับการอัปโหลด เนื่องจากประเภทไฟล์ไม่ถูกต้องหรือขนาดเกิน 5MB', severity: 'warning' });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      setSnackbar({ open: true, message: `อัปโหลดไฟล์สำเร็จ: ${newFiles.map((f) => f.name).join(', ')}`, severity: 'success' });
    }
    setFormErrors((prev) => ({ ...prev, files: '' }));
  }, []);

  const CardPaper = ({ children, sx }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
        ...sx,
      }}
    >
      {children}
    </Paper>
  );

  const SectionTitle = ({ icon, children }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 2 }}>
      {icon}
      <Typography variant="h6" fontWeight={700}>{children}</Typography>
    </Stack>
  );

  const filter = createFilterOptions();

  const renderHeader = () => (
    <CardPaper sx={{ mb: 4, p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <DescriptionIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight={800} sx={{ background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {initialQuotationData.billingNumber ? 'แก้ไขใบเสนอราคา' : 'สร้างใบเสนอราคา'}
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <Tooltip title="คลิกเพื่อแก้ไขเลขที่เอกสาร">
              <Chip icon={<EditIcon />} label={`เลขที่: ${billingData.billingNumber}`} variant="outlined" onClick={handleOpenBillingNumberModal} sx={{ borderRadius: 2, fontWeight: 500, cursor: 'pointer' }} />
            </Tooltip>
            <Tooltip title="สถานะการชำระเงิน">
              <Chip icon={<CheckCircleIcon />} label={`สถานะ: ${billingData.paymentStatus}`} color={billingData.paymentStatus === 'ชำระแล้ว' ? 'success' : 'warning'} variant="outlined" sx={{ borderRadius: 2, fontWeight: 500 }} />
            </Tooltip>
            <Tooltip title="จำนวนรายการสินค้า">
              <Chip icon={<AddIcon />} label={`รายการ: ${billingData.items.length}`} color={billingData.items.length > 0 ? 'primary' : 'default'} variant="outlined" sx={{ borderRadius: 2, fontWeight: 500 }} />
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <Tooltip title="รีเซ็ตฟอร์ม">
              <Button variant="outlined" color="warning" size="small" onClick={handleResetForm} startIcon={<ResetIcon />}>รีเซ็ต</Button>
            </Tooltip>
            <Tooltip title="ปิดหน้าต่าง">
              <Button variant="outlined" color="secondary" size="small" onClick={handleCloseWindow} startIcon={<CloseIcon />}>ปิด</Button>
            </Tooltip>
            <Tooltip title="บันทึกเอกสาร">
              <Button variant="contained" color="primary" size="small" onClick={handleSaveDocument} startIcon={<CheckCircleIcon />}>บันทึก</Button>
            </Tooltip>
            <Tooltip title="พิมพ์ PDF">
              <Button variant="contained" color="info" size="small" onClick={handlePrint} startIcon={<PrintIcon />}>พิมพ์</Button>
            </Tooltip>
            <Tooltip title="แชร์ใบเสนอราคา">
              <Button variant="contained" color="success" size="small" onClick={handleShare} startIcon={<ShareIcon />}>แชร์</Button>
            </Tooltip>
            <Tooltip title="ดาวน์โหลดเป็น TXT">
              <Button variant="contained" color="warning" size="small" onClick={handleDownload} startIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={16} height={16}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9 6h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>ดาวน์โหลด</Button>
            </Tooltip>
            <Tooltip title="ตัวเลือกเพิ่มเติม">
              <Button variant="contained" size="small" onClick={handleMoreOptionsClick} startIcon={<MoreHorizIcon />}>เพิ่มเติม</Button>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMoreOptionsClose} PaperProps={{ style: { minWidth: 200, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}>
              <MenuItem onClick={handlePrintEnvelope}>พิมพ์จ่าหน้าซอง</MenuItem>
              <MenuItem onClick={handleViewHistory}>ดูประวัติเอกสาร</MenuItem>
              <MenuItem onClick={handleDocumentSettings}>ตั้งค่าเอกสาร</MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Stack>
    </CardPaper>
  );

  const renderBillingNumberModal = () => (
    <Modal open={openBillingNumberModal} onClose={handleCloseBillingNumberModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
      <Fade in={openBillingNumberModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          p: 0,
          overflow: 'hidden',
        }}>
          <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>แก้ไขเลขที่เอกสาร</Typography>
            <IconButton onClick={handleCloseBillingNumberModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ p: 4 }}>
            <TextField
              fullWidth
              id="billingNumber"
              label="เลขที่เอกสาร"
              value={newBillingNumber}
              onChange={(e) => setNewBillingNumber(e.target.value)}
              placeholder="เช่น BN202501010001 หรือ BN 2025-01-01 0001"
              error={!!formErrors.billingNumber}
              helperText={formErrors.billingNumber}
              sx={{ mb: 3 }}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleCloseBillingNumberModal} startIcon={<CloseIcon />}>ยกเลิก</Button>
              <Button variant="contained" onClick={confirmBillingNumber} startIcon={<CheckCircleIcon />}>ยืนยัน</Button>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderEnvelopePreview = () => (
    <Modal open={openEnvelopePreview} onClose={() => setOpenEnvelopePreview(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
      <Fade in={openEnvelopePreview}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          p: 4,
          width: envelopeSize === 'DL' ? '220mm' : envelopeSize === 'C5' ? '162mm' : `${customWidth}mm`,
          height: envelopeSize === 'DL' ? '110mm' : envelopeSize === 'C5' ? '229mm' : `${customHeight}mm`,
          border: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>พรีวิวซองจดหมาย</Typography>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>ผู้รับ: {billingData.customerName}</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>{billingData.topic || '-'}</Typography>
          <FormControl sx={{ mb: 3, minWidth: 200 }}>
            <InputLabel htmlFor="envelopeSize">ขนาดซอง</InputLabel>
            <Select id="envelopeSize" value={envelopeSize} onChange={(e) => setEnvelopeSize(e.target.value)} label="ขนาดซอง" sx={{ borderRadius: 2 }}>
              <MenuItem value="DL">DL (110x220 มม.)</MenuItem>
              <MenuItem value="C5">C5 (162x229 มม.)</MenuItem>
              <MenuItem value="Custom">กำหนดเอง</MenuItem>
            </Select>
          </FormControl>
          {envelopeSize === 'Custom' && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="ความกว้าง (มม.)"
                type="text"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 220)}
                inputProps={{ min: 50 }}
                error={customWidth < 50}
                helperText={customWidth < 50 ? 'ความกว้างต้องมากกว่า 50 มม.' : ''}
                sx={{ width: { xs: '100%', sm: 150 }, borderRadius: 2 }}
              />
              <TextField
                label="ความสูง (มม.)"
                type="text"
                value={customHeight}
                onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 110)}
                inputProps={{ min: 50 }}
                error={customHeight < 50}
                helperText={customHeight < 50 ? 'ความสูงต้องมากกว่า 50 มม.' : ''}
                sx={{ width: { xs: '100%', sm: 150 }, borderRadius: 2 }}
              />
            </Stack>
          )}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setOpenEnvelopePreview(false)} startIcon={<CloseIcon />}>ยกเลิก</Button>
            <Button variant="contained" onClick={() => window.print()} startIcon={<PrintIcon />}>พิมพ์</Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );

  const renderHistoryTimeline = () => (
    <Modal open={openHistoryModal} onClose={() => setOpenHistoryModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
      <Fade in={openHistoryModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          p: 4,
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>ประวัติเอกสาร: {billingData.billingNumber}</Typography>
          {historyData.length > 0 ? (
            <Timeline position="alternate">
              {historyData.map((item, index) => (
                item.billingData.history && item.billingData.history.map((entry, idx) => (
                  <TimelineItem key={`${index}-${idx}`}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {idx < item.billingData.history.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight={700}>{dayjs(entry.timestamp).format('DD/MM/YYYY HH:mm')}</Typography>
                      <Typography variant="body2">{entry.action}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ลูกค้า: {item.billingData.customerName} | ยอดรวม: {formatCurrency(item.summary.total)}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))
              ))}
            </Timeline>
          ) : (
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>ไม่พบประวัติเอกสาร</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setOpenHistoryModal(false)} startIcon={<CloseIcon />}>ปิด</Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );

  const renderProjectDialog = () => (
    <Dialog
      open={openProjectModal}
      onClose={() => setOpenProjectModal(false)}
      maxWidth="sm"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 600 }}>
        สร้างโปรเจกต์
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="ชื่อโปรเจกต์"
            value={projectForm.name}
            onChange={(e) =>
              setProjectForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            error={!!projectErrors.name}
            helperText={projectErrors.name || 'กรุณาระบุชื่อโปรเจกต์'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            label="ชื่อกิจการ / ชื่อบุคคล"
            value={projectForm.businessName}
            onChange={(e) =>
              setProjectForm((prev) => ({ ...prev, businessName: e.target.value }))
            }
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              บทบาท (อย่างน้อย 1 ค่า)
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={projectForm.roles.customer}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        roles: { ...prev.roles, customer: e.target.checked },
                      }))
                    }
                  />
                }
                label="ลูกค้า"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={projectForm.roles.vendor}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        roles: { ...prev.roles, vendor: e.target.checked },
                      }))
                    }
                  />
                }
                label="ผู้จำหน่าย"
              />
            </Stack>
            {!!projectErrors.roles && (
              <Typography variant="caption" color="error">
                {projectErrors.roles}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={() => {
            setOpenProjectModal(false);
            setProjectForm({ name: '', businessName: '', roles: { customer: false, vendor: false } });
            setProjectErrors({});
          }}
          color="secondary"
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{ borderRadius: 2 }}
        >
          ยกเลิก
        </Button>
        <Button
          onClick={handleSaveProject}
          color="primary"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          sx={{ borderRadius: 2 }}
        >
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderContent = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CardPaper>
            <SectionTitle icon={<DescriptionIcon color="primary" />}>ข้อมูลใบเสนอราคา</SectionTitle>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <FormControl fullWidth error={!!formErrors.contactId}>
                  <Autocomplete
                    options={optionsWithAdd}
                    getOptionLabel={(option) => option?.name || ''}
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    value={optionsWithAdd.find((c) => c.id === billingData.contactId) || null}
                    onChange={(event, value) => {
                      if (value?.id === ADD_ID) {
                        handleAddCustomerFromPayment();
                        return;
                      }
                      setBillingData((prev) => ({
                        ...prev,
                        contactId: value?.id || '',
                        customerName: value?.name || '',
                      }));
                      setFormErrors((prev) => ({ ...prev, contactId: '' }));
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.id === ADD_ID ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AddIcon fontSize="small" /> เพิ่มลูกค้าใหม่
                          </span>
                        ) : (
                          option.name
                        )}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ชื่อลูกค้า"
                        error={!!formErrors.contactId}
                        helperText={formErrors.contactId}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleAddCustomerFromPayment}
                                aria-label="เพิ่มลูกค้าใหม่"
                              >
                                <AddIcon />
                              </IconButton>
                              {params.InputProps.endAdornment}
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </FormControl>
              </Stack>
              <TextField
                fullWidth
                id="topic"
                label="ที่อยู่"
                multiline
                rows={3}
                value={billingData.topic}
                onChange={(e) => {
                  setBillingData((prev) => ({ ...prev, topic: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, topic: '' }));
                }}
                placeholder="รายละเอียดที่อยู่ลูกค้า"
                error={!!formErrors.topic}
                helperText={formErrors.topic}
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Grid container spacing={2}>
                {/* โปรเจกต์ */}
              <Grid container spacing={2} sx={{ mt: -1 }}>
                <Grid item xs={12} sm={5}>
                  <Box sx={{ width: '100%' }}>
                    <Autocomplete
                      size="small"
                      disablePortal
                      clearOnEscape
                      selectOnFocus
                      handleHomeEndKeys
                      options={[
                        { id: ADD_PROJECT_ID, label: '➕ สร้างโปรเจกต์ใหม่' },
                        ...projectOptions.map((p) => ({ id: p, label: p })),
                      ]}
                      filterOptions={(options, params) => {
                        const filtered = filter(options, params);
                        const { inputValue } = params;
                        const isExisting = options.some((opt) => opt.label === inputValue);
                        if (inputValue !== '' && !isExisting) {
                          filtered.unshift({
                            id: ADD_PROJECT_ID,
                            label: ` สร้าง "${inputValue}"`,
                            inputValue,
                          });
                        }
                        return filtered;
                      }}
                      getOptionLabel={(opt) => opt?.label ?? ''}
                      isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                      noOptionsText="ไม่พบโปรเจกต์… พิมพ์ชื่อแล้วกด ➕ เพื่อสร้าง"
                      value={
                        billingData.project
                          ? { id: billingData.project, label: billingData.project }
                          : null
                      }
                      onChange={handleProjectChange}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {option.id === ADD_PROJECT_ID ? <AddIcon fontSize="small" /> : null}
                            <span>{option.label}</span>
                          </Stack>
                        </li>
                      )}
                      componentsProps={{
                        paper: {
                          elevation: 3,
                          sx: { borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                        },
                      }}
                      ListboxProps={{ sx: { py: 1, '& li': { px: 1.5, borderRadius: 1 }, '& li.Mui-focused': { bgcolor: 'action.hover' } } }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="โปรเจกต์"
                          placeholder="เลือกหรือพิมพ์เพื่อสร้างใหม่"
                          size="small"
                          sx={UNIFORM_SX}
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              ...UNIFORM_SX['& .MuiOutlinedInput-root'] && {},
                              borderRadius: 2,
                              bgcolor: '#fff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                              transition: 'all .2s ease',
                              '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)', bgcolor: '#f8fafc' },
                              '&.Mui-focused': (theme) => ({ boxShadow: `0 0 0 3px ${theme.palette.primary.light}33` }),
                            },
                            endAdornment: (
                              <InputAdornment position="end" sx={{ mr: 0.5 }}>
                                <Tooltip title="สร้างโปรเจกต์ใหม่">
                                  <IconButton
                                    size="small"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setOpenProjectModal(true)}
                                    aria-label="สร้างโปรเจกต์ใหม่"
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {params.InputProps.endAdornment}
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Grid>

                {/* เลขที่อ้างอิง */}
                <Grid item xs={12} sm={3.5}>
                  <TextField
                    fullWidth
                    id="referenceNumber"
                    label="เลขที่อ้างอิง"
                    value={billingData.referenceNumber}
                    onChange={handleReferenceNumberChange}
                    placeholder="เลขที่อ้างอิง"
                    size="small"
                    sx={UNIFORM_SX}
                  />
                </Grid>

                {/* ราคาสินค้า */}
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="priceType">ราคาสินค้า</InputLabel>
                    <Select
                      id="priceType"
                      value={billingData.priceType}
                      onChange={handlePriceTypeChange}
                      label="ราคาสินค้า"
                      size="small"
                      sx={UNIFORM_SELECT_SX}
                    >
                      <MenuItem value="ไม่รวมภาษี">ราคาไม่รวมภาษี</MenuItem>
                      <MenuItem value="รวมภาษี">ราคารวมภาษี</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
             </Grid>
              <TextField
                fullWidth
                id="description"
                label="รายละเอียด"
                value={billingData.description}
                onChange={(e) => setBillingData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="ระบุรายละเอียด เช่น ชื่อโปรเจกต์"
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormControl fullWidth>
                <InputLabel htmlFor="warehouse">คลังสินค้า</InputLabel>
                <Select
                  id="warehouse"
                  value={billingData.warehouse}
                  onChange={handleWarehouseChange}
                  label="คลังสินค้า"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">เลือก</MenuItem>
                  <MenuItem value="คลัง A">คลัง A</MenuItem>
                  <MenuItem value="คลัง B">คลัง B</MenuItem>
                  <MenuItem value="คลัง C">คลัง C</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <CardPaper sx={{ position: { md: 'sticky' }, top: { md: 24 } }} className="no-print">
            <Stack spacing={2}>
              <SectionTitle icon={<DescriptionIcon color="primary" />}>จำนวนเงินรวมทั้งสิ้น</SectionTitle>
              <Typography sx={{ fontWeight: 800, fontSize: 28, background: `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.info.light} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {formatCurrency(summary.total)}
              </Typography>
              <Divider />
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">วันที่:</Typography>
                  <TextField
                    type="date"
                    id="date"
                    value={billingData.date}
                    onChange={handleDateChange}
                    error={!!formErrors.date}
                    helperText={formErrors.date}
                    size="small"
                    sx={inputSx}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">ครบกำหนด:</Typography>
                  <TextField
                    type="date"
                    id="dueDate"
                    value={billingData.dueDate}
                    onChange={handleDueDateChange}
                    error={!!formErrors.dueDate}
                    helperText={formErrors.dueDate}
                    size="small"
                    sx={inputSx}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">พนักงานขาย:</Typography>
                  <Select
                    id="salesperson"
                    value={billingData.salesperson}
                    onChange={handleSalespersonChange}
                    error={!!formErrors.salesperson}
                    size="small"
                    sx={selectSx}
                  >
                    <MenuItem value="Rheanyra T.">Rheanyra T.</MenuItem>
                    <MenuItem value="John Doe">John Doe</MenuItem>
                    <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                  </Select>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">สกุลเงิน:</Typography>
                  <Select
                    id="currency"
                    value={billingData.currency}
                    onChange={handleCurrencyChange}
                    size="small"
                    sx={selectSx}
                  >
                    <MenuItem value="THB - ไทย">THB - ไทย</MenuItem>
                    <MenuItem value="USD - US Dollar">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR - Euro">EUR - Euro</MenuItem>
                  </Select>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">สถานะการชำระเงิน:</Typography>
                  <Select
                    id="paymentStatus"
                    value={billingData.paymentStatus}
                    onChange={handlePaymentStatusChange}
                    size="small"
                    sx={selectSx}
                  >
                    <MenuItem value="รอชำระ">รอชำระ</MenuItem>
                    <MenuItem value="ชำระแล้ว">ชำระแล้ว</MenuItem>
                    <MenuItem value="ยกเลิก">ยกเลิก</MenuItem>
                  </Select>
                </Stack>
              </Stack>
            </Stack>
          </CardPaper>
        </Grid>

        <Grid item xs={12}>
          <CardPaper sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <SectionTitle icon={<DescriptionIcon color="primary" />}>รายการสินค้า</SectionTitle>
            </Box>
            <Divider />
            <Box sx={{ p: 3, pt: 2 }}>
              {billingData.items.length > 0 ? (
                <Box sx={{ borderRadius: 2, overflowX: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                  <table className="w-full border-collapse items-table table-fixed">
                    {/* กำหนดสัดส่วนคอลัมน์: index | ชื่อ/รายละเอียด | qty | unit | price | total */}
                    <colgroup>
                      <col style={{ width: 44 }} />   {/* ลำดับ */}
                      <col />                         {/* ชื่อสินค้า/รายละเอียด -> กว้างขึ้น กินพื้นที่ที่เหลือ */}
                      <col style={{ width: 100 }} />  {/* จำนวน */}
                      <col style={{ width: 80 }} />  {/* หน่วย */}
                      <col style={{ width: 140 }} />  {/* ราคาต่อหน่วย */}
                      <col style={{ width: 150 }} />  {/* ราคารวม */}
                      <col style={{ width: 44 }} />   {/* ถังขยะ (ใหม่) */}
                    </colgroup>

                    <thead>
                      <tr style={{ background: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                        <th className="px-4 py-3 text-center text-xs font-medium">ลำดับ</th>
                        <th className="px-4 py-3 text-sm font-medium text-left">ชื่อสินค้า/รายละเอียด</th>
                        <th className="px-2 py-2 text-sm font-medium text-center">จำนวน</th>
                        <th className="px-4 py-2 text-sm font-medium text-center">หน่วย</th>
                        <th className="px-4 py-2 text-sm font-medium text-center">ราคาต่อหน่วย</th>
                        <th className="px-4 py-2 text-sm font-medium text-center">ราคารวม</th>
                        <th className="px-2 py-2 text-sm font-medium text-center no-print" /> {/* ถังขยะ */}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {billingData.items.map((item, index) => {
                        const cellH = 40;

                        const qtySx = {
                          width: '100%',                                   // กว้างเต็มคอลัมน์ "จำนวน"
                          '& .MuiOutlinedInput-root': { borderRadius: 2, height: cellH },
                          '& input': { textAlign: 'right' },
                        };
                        const unitSx = {
                          width: '100%',                                   // กว้างเต็มคอลัมน์ "หน่วย"
                          borderRadius: 2,
                          height: cellH,
                          '& .MuiSelect-select': { py: 0.5, display: 'flex', alignItems: 'center' },
                        };
                        const priceSx = {
                          width: '100%',                                   // กว้างเต็มคอลัมน์ "ราคาต่อหน่วย"
                          '& .MuiOutlinedInput-root': { borderRadius: 2, height: cellH },
                          '& input': { textAlign: 'right' },
                        };

                        return (
                          <React.Fragment key={item.id}>
                            {/* แถวบน */}
                            <tr className="hover:bg-gray-50 transition-colors align-top">
                              {/* ลำดับ */}
                              <td rowSpan={2} className="px-4 py-3 text-center font-medium align-top">
                                {index + 1}
                              </td>

                              {/* ชื่อสินค้า/รายละเอียด (กว้างขึ้นโดยอัตโนมัติ) */}
                              <td className="px-4 py-3 align-top">
                                <TextField
                                  fullWidth
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  placeholder="ชื่อสินค้า"
                                  error={!!formErrors.items && !item.description}
                                  helperText={formErrors.items && !item.description ? 'กรุณากรอกชื่อสินค้า' : ''}
                                  size="small"
                                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, height: cellH } }}
                                  className="no-print"
                                />
                                <Typography className="text-base print-only hidden">{item.description || '-'}</Typography>
                              </td>

                              {/* จำนวน */}
                              <td className="py-3 align-top pr-1">
                                <TextField
                                  type="text"
                                  inputMode="decimal"
                                  value={item.quantity === '' || item.quantity === null ? '' : item.quantity}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    // ว่างได้ระหว่างพิมพ์
                                    updateItem(item.id, 'quantity', v === '' ? '' : Number(v));
                                  }}
                                  onBlur={(e) => {
                                    const v = e.target.value;
                                    // ออกจากช่องแล้วค่อย normalize
                                    updateItem(item.id, 'quantity', v === '' ? 0 : Number(v));
                                  }}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                                  size="small"
                                  sx={{
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                      height: 40,
                                      borderTopRightRadius: 0,
                                      borderBottomRightRadius: 0,
                                    },
                                    '& input': { textAlign: 'right' },
                                    '& input[type=number]': { MozAppearance: 'textfield' },
                                    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                      WebkitAppearance: 'none', margin: 0,
                                    },
                                  }}
                                />
                              </td>

                              {/* หน่วย (TextField ธรรมดา) */}
                              <td className="py-3 align-top pl-0">
                                <TextField
                                  value={item.unit ?? ''}
                                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                  placeholder="หน่วย"
                                  size="small"
                                  sx={{
                                    width: '100%',
                                    ml: '-1px',
                                    '& .MuiOutlinedInput-root': {
                                      height: 40,
                                      borderTopLeftRadius: 0,
                                      borderBottomLeftRadius: 0,
                                    },
                                  }}
                                />
                              </td>

                              {/* ราคาต่อหน่วย */}
                              <td className="px-4 py-3 text-center align-top">
                                <TextField
                                  type="text"
                                  inputMode="decimal"
                                  value={item.pricePerUnit === '' || item.pricePerUnit === null ? '' : item.pricePerUnit}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    updateItem(item.id, 'pricePerUnit', v === '' ? '' : Number(v));
                                  }}
                                  onBlur={(e) => {
                                    const v = e.target.value;
                                    updateItem(item.id, 'pricePerUnit', v === '' ? 0 : Number(v));
                                  }}
                                  size="small"
                                  sx={{
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': { borderRadius: 2, height: 40 },
                                    '& input': { textAlign: 'right' },
                                    '& input[type=number]': { MozAppearance: 'textfield' },
                                    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                                      WebkitAppearance: 'none', margin: 0,
                                    },
                                  }}
                                />
                              </td>

                              {/* ราคารวม (เหลือเฉพาะตัวเลข) */}
                              <td className="px-4 py-3 text-right align-top">
                                <Typography className="font-medium text-base" noWrap>
                                  {formatCurrency(item.total)}
                                </Typography>
                              </td>

                              {/* ถังขยะ (คอลัมน์ใหม่) */}
                              <td className="px-2 py-3 text-center align-top no-print">
                                {billingData.items.length > 1 && (
                                  <Tooltip title={`ลบรายการที่ ${index + 1}`}>
                                    <IconButton color="error" onClick={() => removeItem(item.id)} aria-label="ลบรายการ">
                                      <DeleteIcon sx={{ width: 20, height: 20 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </td>
                            </tr>

                            {/* แถวล่าง: รายละเอียด */}
                            <tr className="align-top">
                              <td className="px-4 pb-3 pt-0">
                                <TextField
                                  fullWidth multiline minRows={2}
                                  value={item.detail || ''}
                                  onChange={(e) => updateItem(item.id, 'detail', e.target.value)}
                                  placeholder="รายละเอียด (กด Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                                    '& .MuiInputBase-inputMultiline': { overflow: 'hidden' },
                                    '& textarea': { resize: 'none' },
                                  }}
                                />
                              </td>
                              {/* ครอบ: จำนวน + หน่วย + ราคาต่อหน่วย + ราคารวม + ถังขยะ */}
                              <td colSpan={5} className="pb-3 pt-0" />
                            </tr>

                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </Box>

              ) : (
                <Box sx={{ p: 6, textAlign: 'center', border: `2px dashed ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography sx={{ color: 'text.secondary' }}>ยังไม่มีรายการสินค้า</Typography>
                </Box>
              )}
              {!!formErrors.items && (<Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>{formErrors.items}</Typography>)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={addItem} sx={{ borderRadius: 2 }} aria-label="เพิ่มรายการใหม่">เพิ่มรายการ</Button>
              </Box>
            </Box>
          </CardPaper>
        </Grid>

        <Grid container item xs={12} spacing={3}>
          <Grid item xs={12} md={8}>
            <CardPaper>
              <SectionTitle icon={<DescriptionIcon color="primary" />}>หมายเหตุและไฟล์แนบ</SectionTitle>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="notes"
                    label="หมายเหตุ"
                    multiline
                    rows={4}
                    value={billingData.notes}
                    onChange={(e) => setBillingData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="ระบุหมายเหตุสำหรับลูกค้า"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    className="no-print"
                  />
                  <Typography className="text-base print-only hidden">{billingData.notes || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="internalNotes"
                    label="โน้ตภายในบริษัท"
                    multiline
                    rows={4}
                    value={billingData.internalNotes}
                    onChange={(e) => setBillingData((prev) => ({ ...prev, internalNotes: e.target.value }))}
                    placeholder="ระบุโน้ตสำหรับภายในบริษัท"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    className="no-print"
                  />
                  <Typography className="text-base print-only hidden">{billingData.internalNotes || '-'}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Box sx={{
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: theme.palette.primary.main, bgcolor: 'grey.50' },
              }} className="no-print">
                <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} accept="image/jpeg,image/png,application/pdf" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>คลิกเพื่อเลือกไฟล์</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>หรือลากและวางไฟล์ที่นี่ (JPEG, PNG, PDF สูงสุด 5MB)</Typography>
                </label>
                {files.length > 0 && (
                  <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {files.map((file, index) => (
                      <Box key={index} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon sx={{ color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: '0.9rem' }}>{file.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                {!!formErrors.files && (<Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>{formErrors.files}</Typography>)}
              </Box>
            </CardPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <CardPaper>
              <SectionTitle icon={<DescriptionIcon color="primary" />}>สรุปยอดเงิน</SectionTitle>
              <Divider sx={{ mb: 3 }} />
              <Box className="no-print">
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">รวมเป็นเงิน</Typography>
                    <Typography fontWeight={700}>{formatCurrency(summary.subtotal)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">ส่วนลด</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TextField
                        type="text"
                        id="discount"
                        value={billingData.discount}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value) || 0;
                          const clamped =
                            billingData.discountType === '%'
                              ? Math.min(Math.max(0, raw), 100)
                              : Math.max(0, raw);
                          setBillingData((prev) => ({ ...prev, discount: clamped }));
                        }}
                        inputProps={{ min: 0, step: '0.01' }}
                        sx={{
                          ...inputSx,
                          width: 100,
                          '& .MuiOutlinedInput-root': { height: 44 },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {billingData.discountType === '%' ? '%' : '฿'}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Select
                        id="discountType"
                        value={billingData.discountType}
                        onChange={(e) => {
                          const nextType = e.target.value;
                          setBillingData((prev) => ({
                            ...prev,
                            discount:
                              nextType === '%'
                                ? Math.min(Math.max(0, prev.discount || 0), 100)
                                : Math.max(0, prev.discount || 0),
                            discountType: nextType,
                          }));
                        }}
                        size="small"
                        sx={{
                          ...selectSx,
                          width: 100,
                          height: 44,
                        }}
                      >
                        <MenuItem value="%">%</MenuItem>
                        <MenuItem value="amount">บาท</MenuItem>
                      </Select>
                      <Typography fontWeight={700}>{formatCurrency(summary.discount)}</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary">ราคาหลังหักส่วนลด</Typography>
                    <Typography fontWeight={700}>{formatCurrency(summary.afterDiscount)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={<Checkbox checked={billingData.vatIncluded} onChange={(e) => setBillingData((prev) => ({ ...prev, vatIncluded: e.target.checked }))} size="small" />}
                      label={`ภาษีมูลค่าเพิ่ม ${billingData.vatRate}%`}
                      sx={{ color: 'text.secondary', '& .MuiTypography-root': { fontSize: '0.9rem' } }}
                    />
                    <Typography fontWeight={700}>{formatCurrency(summary.vat)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={700} color="text.secondary">จำนวนเงินรวมทั้งสิ้น</Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ background: `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.info.light} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {formatCurrency(summary.total)}
                    </Typography>
                  </Stack>
                  <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <FormControlLabel
                      control={<Checkbox checked={billingData.withholdingTax} onChange={(e) => setBillingData((prev) => ({ ...prev, withholdingTax: e.target.checked }))} size="small" />}
                      label="หักภาษี ณ ที่จ่าย"
                      sx={{ color: 'text.secondary', '& .MuiTypography-root': { fontSize: '0.9rem' } }}
                    />
                  </Box>
                </Stack>
              </Box>
            </CardPaper>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Box className="summary-section hidden print-only mt-6 p-6 border border-gray-200 rounded-lg bg-white">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" fontWeight={500}>จำนวนเงินรวมทั้งสิ้น</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>วันที่:</Typography><Typography>{dayjs(billingData.date).format('DD/MM/YYYY')}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>ครบกำหนด:</Typography><Typography>{dayjs(billingData.dueDate).format('DD/MM/YYYY')}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>พนักงานขาย:</Typography><Typography>{billingData.salesperson}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>สกุลเงิน:</Typography><Typography>{billingData.currency}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>สถานะการชำระเงิน:</Typography><Typography>{billingData.paymentStatus}</Typography></Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={700}>สรุปยอดเงิน</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>รวมเป็นเงิน:</Typography><Typography>{formatCurrency(summary.subtotal)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>ส่วนลด:</Typography><Typography>{formatCurrency(summary.discount)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>ราคาหลังหักส่วนลด:</Typography><Typography>{formatCurrency(summary.afterDiscount)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>ราคาสินค้า {billingData.vatIncluded ? '(รวมภาษี)' : '(ไม่รวมภาษี)'}:</Typography><Typography>{formatCurrency(summary.afterDiscount)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>ภาษีมูลค่าเพิ่ม {billingData.vatRate}%:</Typography><Typography>{formatCurrency(summary.vat)}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography fontWeight={700}>จำนวนเงินรวมทั้งสิ้น:</Typography><Typography fontWeight={700}>{formatCurrency(summary.total)}</Typography></Box>
              {billingData.withholdingTax && (<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>หักภาษี ณ ที่จ่าย:</Typography><Typography>ใช่</Typography></Box>)}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={700}>หมายเหตุ</Typography>
              <Typography>{billingData.notes || '-'}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={700}>โน้ตภายในบริษัท</Typography>
              <Typography>{billingData.internalNotes || '-'}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* โมดอล/ไดอะล็อกอื่น ๆ */}
      {renderBillingNumberModal()}
      {renderEnvelopePreview()}
      {renderHistoryTimeline()}

      {/* Dialog ยืนยันบันทึก */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' } }}>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 700 }}>ยืนยันการบันทึก</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>คุณต้องการบันทึกใบเสนอราคานี้หรือไม่?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSaveDialogOpen(false)} color="secondary" variant="outlined" sx={{ borderRadius: 2 }}>ยกเลิก</Button>
          <Button onClick={handleSaveDocument} color="primary" variant="contained" sx={{ borderRadius: 2 }}>บันทึก</Button>
          <Button onClick={() => onSave(null)} color="error" variant="outlined" sx={{ borderRadius: 2 }}>ปิดโดยไม่บันทึก</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ส่วนหัว/ท้ายสำหรับงานพิมพ์ */}
      <div className="print-header no-print hidden">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>ใบเสนอราคา</Typography>
        <Typography sx={{ fontWeight: 600 }}>บริษัท ตัวอย่าง จำกัด</Typography>
        <Typography>123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10100</Typography>
        <Typography>เลขประจำตัวผู้เสียภาษี: 0123456789012</Typography>
      </div>
      <div className="print-footer no-print hidden">
        <Typography>ติดต่อ: บริษัท ตัวอย่าง จำกัด | โทร: 02-123-4567 | อีเมล: contact@example.com</Typography>
        <Typography sx={{ mt: 1 }}>ขอบคุณที่ไว้วางใจในบริการของเรา</Typography>
      </div>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{
      py: 6,
      background: 'linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)',
      minHeight: '100vh',
    }}>
      <style>
        {`
          .inputStyles .MuiInputBase-root {
            height: 44px;
            font-size: 1rem;
            border-radius: 12px;
            background-color: #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
          }
          .inputStyles .MuiInputBase-root:hover {
            background-color: #f8fafc;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          }
          .inputStyles .MuiInputBase-root.Mui-focused {
            background-color: #ffffff;
            box-shadow: 0 0 0 4px ${theme.palette.primary.light}20;
          }
          .inputStyles .MuiInputBase-multiline {
            height: auto;
            padding: 10px 14px;
          }
          .inputStyles .MuiInputLabel-root {
            font-size: 0.95rem;
            font-weight: 500;
            transform: translate(14px, 12px) scale(1);
            color: ${theme.palette.text.secondary};
          }
          .inputStyles .MuiInputLabel-root.Mui-focused,
          .inputStyles .MuiInputLabel-root.MuiFormLabel-filled {
            transform: translate(14px, -9px) scale(0.75);
            color: ${theme.palette.primary.main};
            font-weight: 600;
          }
          .inputStyles .MuiOutlinedInput-root fieldset {
            border-color: ${theme.palette.divider};
          }
          .inputStyles .MuiOutlinedInput-root:hover fieldset {
            border-color: ${theme.palette.primary.main};
          }
          .inputStyles .MuiOutlinedInput-root.Mui-focused fieldset {
            border-color: ${theme.palette.primary.main};
          }
          .inputStyles .MuiOutlinedInput-root.Mui-error fieldset {
            border-color: ${theme.palette.error.main};
          }
          .inputStyles .MuiFormHelperText-root {
            font-size: 0.8rem;
            color: ${theme.palette.error.main};
            margin-top: 6px;
          }

          .items-table thead th {
            position: sticky;
            top: 0;
            z-index: 1;
            font-weight: 600;
          }
          .items-table tbody tr:nth-of-type(odd) {
            background: #f8fafc;
          }
          .items-table tbody tr:hover {
            background: #f1f5f9;
          }

          @media print {
            .print-only { display: block !important; }
            .no-print { display: none !important; }
            .print-header, .print-footer {
              display: block !important;
              width: 100%;
              padding: 12mm;
              background-color: #fff;
              border-bottom: 1px solid #ddd;
            }
            .print-footer { border-top: 1px solid #ddd; }
            table, .summary-section {
              width: 100%;
              border-collapse: collapse;
              font-size: 12pt;
            }
            th, td {
              border: 1px solid ${'#ddd'};
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: 600;
            }
            .summary-section {
              margin-top: 24px;
              border: 1px solid #ddd;
              padding: 16px;
              border-radius: 8px;
            }
            .envelope-preview {
              width: 220mm;
              height: 110mm;
              padding: 12mm;
              font-size: 12pt;
              border: 1px solid #000;
            }
            @page { size: A4; margin: 12mm; }
          }
        `}
      </style>

      {renderHeader()}
      {renderContent()}
      {renderProjectDialog()}
    </Container>
  );
};

export default CreateFormQuotation;
