import React, { useState, useCallback, useMemo } from 'react';
import {
  Box, Button, TextField, Select, MenuItem, InputLabel, FormControl, Typography, Stack, Grid, Paper, Fade, Divider,
  Checkbox, FormControlLabel, Chip, Switch, Tooltip, Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, InputAdornment, styled, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  createTheme, ThemeProvider, IconButton
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import {
  Person as PersonIcon, Business as BusinessIcon, Save as SaveIcon, Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon, Email as EmailIcon, Phone as PhoneIcon, Home as HomeIcon, AccountBalance as BankIcon,
  Visibility as VisibilityIcon, Delete as DeleteIcon, Print as PrintIcon, RestartAlt as ResetIcon, LocationOn as LocationIcon
} from '@mui/icons-material';

const isComposing = (e) => Boolean(e?.nativeEvent?.isComposing);

// Custom Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Prompt", "Roboto", sans-serif',
    h6: { fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        },
      },
    },
  },
});

// Styled Components
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 8,
    backgroundColor: '#fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': { backgroundColor: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
    '&.Mui-focused': { backgroundColor: '#fff', boxShadow: `0 0 0 3px ${theme.palette.primary.light}30` },
  },
  '& .MuiInputLabel-root': {
    backgroundColor: '#fff',
    padding: '0 8px',
    marginLeft: '-4px',
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  '& .MuiInputBase-input': { padding: '12px 14px' },
}));

const StyledCardPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 12,
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(0,0,0,0.15)' },
}));

const postalCodeData = {
  '10100': { province: 'กรุงเทพมหานคร', district: 'พระนคร' },
  '10200': { province: 'กรุงเทพมหานคร', district: 'ดุสิต' },
  '10300': { province: 'กรุงเทพมหานคร', district: 'บางรัก' },
};

const ContactForm = ({ initialData = {}, onSaveContact, onCancel }) => {
  // ทำฟังก์ชันสร้างค่าเริ่มต้น เพื่อใช้ซ้ำกับรีเซ็ต
  const buildDefaultContact = useCallback(() => ({
    id: initialData.id || uuidv4(),
    contactType: initialData.contactType || '',
    roles: initialData.roles || [],
    businessLocation: initialData.businessLocation || 'ไทย',
    name: initialData.name || '',
    branch: initialData.branch || '',
    branchName: initialData.branchName || '',
    creditDays: initialData.creditDays || '',
    creditLimit: initialData.creditLimit || '',
    status: initialData.status || 'Active',
    internalNotes: initialData.internalNotes || '',
    tags: initialData.tags || [],
    address: { houseNo: initialData.address?.houseNo || '', street: initialData.address?.street || '', district: initialData.address?.district || '', province: initialData.address?.province || '', postalCode: initialData.address?.postalCode || '' },
    taxId: initialData.taxId || '',
    billingAddressSameAsMain: initialData.billingAddressSameAsMain ?? true,
    billingAddress: initialData.billingAddress || { houseNo: '', street: '', district: '', province: '', postalCode: '' },
    shippingAddressSameAsMain: initialData.shippingAddressSameAsMain ?? true,
    shippingAddress: initialData.shippingAddress || { houseNo: '', street: '', district: '', province: '', postalCode: '' },
    contactPerson: initialData.contactPerson || '',
    email: initialData.email || '',
    mobile: initialData.mobile || '',
    officePhone: initialData.officePhone || '',
    phoneExtension: initialData.phoneExtension || '',
    otherChannels: initialData.otherChannels || '',
    bankDetails: {
      bankName: initialData.bankDetails?.bankName || '',
      accountName: initialData.bankDetails?.accountName || '',
      accountNumber: initialData.bankDetails?.accountNumber || '',
      branchCode: initialData.bankDetails?.branchCode || '',
      accountType: initialData.bankDetails?.accountType || '',
      qrCode: initialData.bankDetails?.qrCode || null,
      currency: initialData.bankDetails?.currency || 'THB',
    },
    internationalBankDetails: {
      enabled: initialData.internationalBankDetails?.enabled || false,
      swiftCode: initialData.internationalBankDetails?.swiftCode || '',
      iban: initialData.internationalBankDetails?.iban || '',
      bankAddress: initialData.internationalBankDetails?.bankAddress || '',
      beneficiary: initialData.internationalBankDetails?.beneficiary || '',
    },
    documents: initialData.documents || [],
    logo: initialData.logo || null,
  }), [initialData]);

  const [contactData, setContactData] = useState(buildDefaultContact());
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState('panel1');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', index: null, tag: null });

  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    if (name === 'contactType' && !value) newErrors.contactType = 'กรุณาเลือกประเภทผู้ติดต่อ';
    else delete newErrors.contactType;
    if (name === 'roles' && !value.length) newErrors.roles = 'กรุณาเลือกอย่างน้อยหนึ่งบทบาท';
    else delete newErrors.roles;
    if (name === 'name' && !value) newErrors.name = 'กรุณากรอกชื่อ';
    else delete newErrors.name;
    if (name === 'taxId' && value && contactData.businessLocation === 'ไทย' && !/^\d{13}$/.test(value)) {
      newErrors.taxId = 'เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
    } else delete newErrors.taxId;
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors.email = 'อีเมลไม่ถูกต้อง';
    } else delete newErrors.email;
    if (name === 'mobile' && value && !/^\d{10}$/.test(value)) {
      newErrors.mobile = 'เบอร์มือถือต้องเป็นตัวเลข 10 หลัก';
    } else delete newErrors.mobile;
    if (name === 'postalCode' && value && !postalCodeData[value]) {
      newErrors.postalCode = 'รหัสไปรษณีย์ไม่ถูกต้อง';
    } else delete newErrors.postalCode;
    setErrors(newErrors);
  }, [errors, contactData.businessLocation]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!contactData.contactType) newErrors.contactType = 'กรุณาเลือกประเภทผู้ติดต่อ';
    if (!contactData.roles.length) newErrors.roles = 'กรุณาเลือกอย่างน้อยหนึ่งบทบาท';
    if (!contactData.name) newErrors.name = 'กรุณากรอกชื่อ';
    if (contactData.taxId && contactData.businessLocation === 'ไทย' && !/^\d{13}$/.test(contactData.taxId)) {
      newErrors.taxId = 'เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
    }
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      newErrors.email = 'อีเมลไม่ถูกต้อง';
    }
    if (contactData.mobile && !/^\d{10}$/.test(contactData.mobile)) {
      newErrors.mobile = 'เบอร์มือถือต้องเป็นตัวเลข 10 หลัก';
    }
    if (contactData.address.postalCode && !postalCodeData[contactData.address.postalCode]) {
      newErrors.postalCode = 'รหัสไปรษณีย์ไม่ถูกต้อง';
    }
    if (contactData.documents.some((doc) => doc.size > 5 * 1024 * 1024)) {
      newErrors.documents = 'ไฟล์แนบต้องมีขนาดไม่เกิน 5MB';
    }
    if (contactData.logo && contactData.logo.size > 2 * 1024 * 1024) {
      newErrors.logo = 'โลโก้ต้องมีขนาดไม่เกิน 2MB';
    }
    if (contactData.bankDetails.qrCode && contactData.bankDetails.qrCode.size > 2 * 1024 * 1024) {
      newErrors.qrCode = 'QR code ต้องมีขนาดไม่เกิน 2MB';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [contactData]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        try {
          if (typeof onSaveContact === 'function') {
            onSaveContact(contactData);
          } else {
            const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
            const existingIndex = storedContacts.findIndex((contact) => contact.id === contactData.id);
            let updatedContacts;
            if (existingIndex >= 0) {
              updatedContacts = [...storedContacts];
              updatedContacts[existingIndex] = contactData;
            } else {
              updatedContacts = [...storedContacts, contactData];
            }
            localStorage.setItem('contacts', JSON.stringify(updatedContacts));
          }
          setIsSubmitting(false);
          setSnackbar({ open: true, message: 'บันทึกข้อมูลสำเร็จ', severity: 'success' });
        } catch (error) {
          setIsSubmitting(false);
          setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', severity: 'error' });
        }
      }, 500);
    } else {
      setSnackbar({ open: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วน', severity: 'error' });
    }
  }, [contactData, onSaveContact, validateForm]);

  const handlePostalCodeChange = useCallback((addressType, value) => {
    const data = postalCodeData[value] || { province: '', district: '' };
    setContactData((prev) => ({
      ...prev,
      [addressType]: { ...prev[addressType], postalCode: value, province: data.province, district: data.district },
    }));
    validateField('postalCode', value);
  }, [validateField]);

  const handleFileChange = useCallback((field, e) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = field === 'documents' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    const files = Array.from(e.target.files).filter((file) => allowedTypes.includes(file.type) && file.size <= maxSize);
    if (files.length !== e.target.files.length) {
      setSnackbar({ open: true, message: `บางไฟล์ไม่ถูกต้อง (ต้องเป็น JPEG, PNG, PDF และขนาดไม่เกิน ${field === 'documents' ? '5MB' : '2MB'})`, severity: 'error' });
    } else {
      setSnackbar({ open: true, message: `อัปโหลด${field === 'documents' ? 'เอกสาร' : field === 'logo' ? 'โลโก้' : 'QR Code'}สำเร็จ`, severity: 'success' });
    }
    if (field === 'documents') {
      setContactData((prev) => ({ ...prev, documents: [...prev.documents, ...files] }));
    } else if (field === 'logo') {
      setContactData((prev) => ({ ...prev, logo: files[0] || null }));
    } else if (field === 'qrCode') {
      setContactData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, qrCode: files[0] || null } }));
    }
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput && !contactData.tags.includes(tagInput)) {
      setContactData((prev) => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setSnackbar({ open: true, message: `เพิ่มแท็ก "${tagInput}" สำเร็จ`, severity: 'success' });
      setTagInput('');
    }
  }, [tagInput, contactData.tags]);

  const handleDeleteTag = useCallback((tag) => {
    setDeleteConfirm({ open: true, type: 'tag', tag });
  }, []);

  const handleDeleteFile = useCallback((type, index) => {
    setDeleteConfirm({ open: true, type, index });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm.type === 'tag') {
      setContactData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== deleteConfirm.tag) }));
      setSnackbar({ open: true, message: `ลบแท็ก "${deleteConfirm.tag}" สำเร็จ`, severity: 'success' });
    } else if (deleteConfirm.type === 'document') {
      setContactData((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== deleteConfirm.index) }));
      setSnackbar({ open: true, message: 'ลบเอกสารสำเร็จ', severity: 'success' });
    } else if (deleteConfirm.type === 'logo') {
      setContactData((prev) => ({ ...prev, logo: null }));
      setSnackbar({ open: true, message: 'ลบโลโก้สำเร็จ', severity: 'success' });
    } else if (deleteConfirm.type === 'qrCode') {
      setContactData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, qrCode: null } }));
      setSnackbar({ open: true, message: 'ลบ QR Code สำเร็จ', severity: 'success' });
    }
    setDeleteConfirm({ open: false, type: '', index: null, tag: null });
  }, [deleteConfirm]);

  const handleAccordionChange = useCallback((panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  }, []);

  const handlePreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setCancelDialogOpen(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReset = useCallback(() => {
    setContactData(buildDefaultContact());
    setErrors({});
    setTagInput('');
    setSnackbar({ open: true, message: 'รีเซ็ตฟอร์มเรียบร้อย', severity: 'info' });
  }, [buildDefaultContact]);

  const CardPaper = ({ children, title, icon }) => (
    <StyledCardPaper elevation={0}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Stack>
      <Divider sx={{ mb: 3 }} />
      {children}
    </StyledCardPaper>
  );

  const renderPreviewDialog = () => (
    <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '12px 12px 0 0' }}>
        ตัวอย่างข้อมูลผู้ติดต่อ
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">ข้อมูลทั่วไป</Typography>
          <Typography><strong>ประเภท:</strong> {contactData.contactType || '-'}</Typography>
          <Typography><strong>บทบาท:</strong> {contactData.roles.join(', ') || '-'}</Typography>
          <Typography><strong>ชื่อ:</strong> {contactData.name || '-'}</Typography>
          <Typography><strong>ที่อยู่:</strong> {`${contactData.address.houseNo} ${contactData.address.street}, ${contactData.address.district}, ${contactData.address.province} ${contactData.address.postalCode}`}</Typography>
          <Typography><strong>เลขผู้เสียภาษี:</strong> {contactData.taxId || '-'}</Typography>
          <Typography variant="h6">ข้อมูลติดต่อ</Typography>
          <Typography><strong>อีเมล:</strong> {contactData.email || '-'}</Typography>
          <Typography><strong>เบอร์มือถือ:</strong> {contactData.mobile || '-'}</Typography>
          <Typography variant="h6">ข้อมูลธนาคาร</Typography>
          <Typography><strong>ธนาคาร:</strong> {contactData.bankDetails.bankName || '-'}</Typography>
          <Typography><strong>เลขที่บัญชี:</strong> {contactData.bankDetails.accountNumber || '-'}</Typography>
          {contactData.logo && (
            <Box>
              <Typography variant="h6">โลโก้</Typography>
              <img src={URL.createObjectURL(contactData.logo)} alt="Logo" style={{ maxWidth: '200px', borderRadius: 8 }} />
            </Box>
          )}
          {contactData.bankDetails.qrCode && (
            <Box>
              <Typography variant="h6">QR Code</Typography>
              <img src={URL.createObjectURL(contactData.bankDetails.qrCode)} alt="QR Code" style={{ maxWidth: '200px', borderRadius: 8 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)} variant="outlined">ปิด</Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteConfirmDialog = () => (
    <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, type: '', index: null, tag: null })}>
      <DialogTitle>ยืนยันการลบ</DialogTitle>
      <DialogContent>
        <Typography>คุณต้องการลบ{deleteConfirm.type === 'tag' ? `แท็ก "${deleteConfirm.tag}"` : deleteConfirm.type === 'document' ? 'เอกสารนี้' : deleteConfirm.type === 'logo' ? 'โลโก้นี้' : 'QR Code นี้'} หรือไม่?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirm({ open: false, type: '', index: null, tag: null })} variant="outlined">ยกเลิก</Button>
        <Button onClick={confirmDelete} variant="contained" color="error">ลบ</Button>
      </DialogActions>
    </Dialog>
  );

  const renderCancelDialog = () => (
    <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
      <DialogTitle>ยืนยันการยกเลิก</DialogTitle>
      <DialogContent>
        <Typography>คุณต้องการยกเลิกการแก้ไขหรือไม่? การเปลี่ยนแปลงจะไม่ถูกบันทึก</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCancelDialogOpen(false)} variant="outlined">กลับ</Button>
        <Button onClick={() => { setCancelDialogOpen(false); onCancel?.(); }} variant="contained" color="error">ยกเลิก</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ThemeProvider theme={theme}>
      <Fade in={true} timeout={400}>
        <Box sx={{ p: { xs: 3, md: 6 }, maxWidth: 1200, mx: 'auto', mt: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
          {/* Print styles */}
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #print-area, #print-area * { visibility: visible; }
              #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 12mm; }
            }
          `}</style>

          <CardPaper
            title={contactData.id ? 'แก้ไขผู้ติดต่อ' : 'เพิ่มผู้ติดต่อ'}
            icon={contactData.contactType === 'บุคคล' ? <PersonIcon color="primary" /> : contactData.contactType === 'นิติบุคคล' ? <BusinessIcon color="primary" /> : <PersonIcon color="disabled" />}
          >
            <Stack spacing={4}>
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>

              {/* Actions */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="รีเซ็ตฟอร์ม">
                  <Button variant="outlined" color="warning" startIcon={<ResetIcon />} onClick={handleReset}>
                    รีเซ็ต
                  </Button>
                </Tooltip>
                <Tooltip title="ดูตัวอย่างข้อมูล">
                  <Button variant="outlined" color="info" onClick={handlePreview} startIcon={<VisibilityIcon />} sx={{ borderRadius: 8 }} aria-label="ดูตัวอย่างข้อมูล">
                    ดูตัวอย่าง
                  </Button>
                </Tooltip>
                <Tooltip title="พิมพ์">
                  <Button variant="outlined" color="primary" onClick={handlePrint} startIcon={<PrintIcon />} sx={{ borderRadius: 8 }} aria-label="พิมพ์ข้อมูล">
                    พิมพ์
                  </Button>
                </Tooltip>
                <Tooltip title="ยกเลิกการแก้ไข">
                  <Button variant="outlined" color="secondary" onClick={handleCancel} startIcon={<CancelIcon />} sx={{ borderRadius: 8 }} aria-label="ยกเลิกการแก้ไข">
                    ยกเลิก
                  </Button>
                </Tooltip>
                <Tooltip title="บันทึกข้อมูลผู้ติดต่อ">
                  <Button variant="contained" color="primary" onClick={handleSubmit} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={isSubmitting} sx={{ borderRadius: 8 }} aria-label="บันทึกข้อมูลผู้ติดต่อ">
                    บันทึก
                  </Button>
                </Tooltip>
              </Stack>

              <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">ข้อมูลทั่วไป</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.contactType}>
                          <InputLabel shrink>ประเภทผู้ติดต่อ</InputLabel>
                          <Select
                            value={contactData.contactType}
                            onChange={(e) => {
                              setContactData({ ...contactData, contactType: e.target.value });
                              validateField('contactType', e.target.value);
                            }}
                            label="ประเภทผู้ติดต่อ"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="บุคคล">บุคคล</MenuItem>
                            <MenuItem value="นิติบุคคล">นิติบุคคล</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.roles}>
                          <InputLabel shrink>บทบาท</InputLabel>
                          <Select
                            multiple
                            value={contactData.roles}
                            onChange={(e) => {
                              setContactData({ ...contactData, roles: e.target.value });
                              validateField('roles', e.target.value);
                            }}
                            label="บทบาท"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => <Chip key={value} label={value} size="small" color="primary" />)}
                              </Box>
                            )}
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="ลูกค้า">ลูกค้า</MenuItem>
                            <MenuItem value="ผู้จำหน่าย">ผู้จำหน่าย</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>ที่ตั้งธุรกิจ</InputLabel>
                          <Select
                            value={contactData.businessLocation}
                            onChange={(e) => setContactData({ ...contactData, businessLocation: e.target.value })}
                            label="ที่ตั้งธุรกิจ"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="ไทย">ไทย</MenuItem>
                            <MenuItem value="ต่างประเทศ">ต่างประเทศ</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="ชื่อกิจการ / ชื่อ-นามสกุล"
                          value={contactData.name}
                          onChange={(e) => {
                            const v = e.target.value;
                            setContactData((prev) => ({ ...prev, name: v }));
                            if (!isComposing(e)) validateField('name', v);
                          }}
                          onCompositionEnd={(e) => validateField('name', e.currentTarget.value)}
                          error={!!errors.name}
                          helperText={errors.name || 'เช่น บริษัท ตัวอย่าง จำกัด หรือ นายสมชาย ใจดี'}
                          InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>สาขา</InputLabel>
                          <Select
                            value={contactData.branch}
                            onChange={(e) => setContactData({ ...contactData, branch: e.target.value })}
                            label="สาขา"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="สำนักงานใหญ่">สำนักงานใหญ่</MenuItem>
                            <MenuItem value="สาขา">สาขา</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {contactData.branch === 'สาขา' && (
                        <Grid item xs={12} sm={6}>
                          <StyledTextField
                            fullWidth
                            label="ชื่อสาขา"
                            value={contactData.branchName}
                            onChange={(e) => setContactData({ ...contactData, branchName: e.target.value })}
                            helperText="เช่น สาขาสีลม"
                            inputProps={{ 'aria-label': 'ชื่อสาขา' }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="เครดิต (วัน)"
                          type="text"
                          value={contactData.creditDays}
                          onChange={(e) => setContactData({ ...contactData, creditDays: e.target.value })}
                          helperText="เช่น 30 วัน"
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'จำนวนวันเครดิต' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="วงเงินเครดิต"
                          type="text"
                          value={contactData.creditLimit}
                          onChange={(e) => setContactData((prev) => ({ ...prev, creditLimit: e.target.value }))}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'วงเงินเครดิต' }}
                          InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>สถานะ</InputLabel>
                          <Select
                            value={contactData.status}
                            onChange={(e) => setContactData({ ...contactData, status: e.target.value })}
                            label="สถานะ"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="หมายเหตุภายใน"
                          multiline
                          rows={3}
                          value={contactData.internalNotes}
                          onChange={(e) => setContactData({ ...contactData, internalNotes: e.target.value })}
                          helperText="บันทึกข้อมูลเพิ่มเติม เช่น ข้อมูลการติดต่อพิเศษ"
                          inputProps={{ 'aria-label': 'หมายเหตุภายใน' }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <StyledTextField
                            fullWidth
                            label="แท็ก"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && !isComposing(e)) {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            helperText="กด Enter หรือปุ่มเพื่อเพิ่มแท็ก"
                            inputProps={{ 'aria-label': 'เพิ่มแท็ก' }}
                          />
                          <Button variant="contained" onClick={handleAddTag} sx={{ borderRadius: 8, px: 4 }}>เพิ่ม</Button>
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {contactData.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              onDelete={() => handleDeleteTag(tag)}
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 16 }}
                              deleteIcon={<DeleteIcon />}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">ที่อยู่และข้อมูลภาษี</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="บ้านเลขที่"
                          value={contactData.address.houseNo}
                          onChange={(e) => setContactData({ ...contactData, address: { ...contactData.address, houseNo: e.target.value } })}
                          InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="action" /></InputAdornment> }}
                          inputProps={{ 'aria-label': 'บ้านเลขที่' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="ถนน"
                          value={contactData.address.street}
                          onChange={(e) => setContactData({ ...contactData, address: { ...contactData.address, street: e.target.value } })}
                          inputProps={{ 'aria-label': 'ถนน' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="รหัสไปรษณีย์"
                          value={contactData.address.postalCode}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (isComposing(e)) {
                              setContactData((prev) => ({ ...prev, address: { ...prev.address, postalCode: v } }));
                              return;
                            }
                            handlePostalCodeChange('address', v);
                          }}
                          onCompositionEnd={(e) => handlePostalCodeChange('address', e.currentTarget.value)}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'รหัสไปรษณีย์' }}
                          error={!!errors.postalCode}
                          helperText={errors.postalCode || 'เช่น 10100'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="ตำบล/อำเภอ"
                          value={contactData.address.district}
                          onChange={(e) => setContactData({ ...contactData, address: { ...contactData.address, district: e.target.value } })}
                          inputProps={{ 'aria-label': 'ตำบล/อำเภอ' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          label="จังหวัด"
                          value={contactData.address.province}
                          onChange={(e) => setContactData({ ...contactData, address: { ...contactData.address, province: e.target.value } })}
                          inputProps={{ 'aria-label': 'จังหวัด' }}
                        />
                      </Grid>

                      {/* แสดง preview เขต/จังหวัดจากรหัสไปรษณีย์ */}
                      {(contactData.address.district || contactData.address.province) && (
                        <Grid item xs={12}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationIcon fontSize="small" color="action" />
                            {contactData.address.district && <Chip size="small" label={contactData.address.district} />}
                            {contactData.address.province && <Chip size="small" label={contactData.address.province} />}
                          </Stack>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="เลขผู้เสียภาษี"
                          type="text"
                          value={contactData.taxId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setContactData((prev) => ({ ...prev, taxId: v }));
                            if (!isComposing(e)) validateField('taxId', v);
                          }}
                          onCompositionEnd={(e) => validateField('taxId', e.currentTarget.value)}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'เลขผู้เสียภาษี' }}
                          error={!!errors.taxId}
                          helperText={errors.taxId || 'เช่น 1234567890123'}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Checkbox checked={contactData.billingAddressSameAsMain} onChange={(e) => setContactData({ ...contactData, billingAddressSameAsMain: e.target.checked })} />}
                          label="ที่อยู่ส่งเอกสารเหมือนที่อยู่หลัก"
                        />
                      </Grid>

                      {!contactData.billingAddressSameAsMain && (
                        <Grid item xs={12}>
                          <CardPaper title="ที่อยู่ส่งเอกสาร" icon={<HomeIcon color="primary" />}>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <StyledTextField
                                  fullWidth
                                  label="บ้านเลขที่"
                                  value={contactData.billingAddress.houseNo}
                                  onChange={(e) => setContactData({ ...contactData, billingAddress: { ...contactData.billingAddress, houseNo: e.target.value } })}
                                  inputProps={{ 'aria-label': 'บ้านเลขที่ (ที่อยู่ส่งเอกสาร)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <StyledTextField
                                  fullWidth
                                  label="ถนน"
                                  value={contactData.billingAddress.street}
                                  onChange={(e) => setContactData({ ...contactData, billingAddress: { ...contactData.billingAddress, street: e.target.value } })}
                                  inputProps={{ 'aria-label': 'ถนน (ที่อยู่ส่งเอกสาร)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StyledTextField
                                  fullWidth
                                  label="รหัสไปรษณีย์"
                                  value={contactData.billingAddress.postalCode}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (isComposing(e)) {
                                      setContactData((prev) => ({ ...prev, billingAddress: { ...prev.billingAddress, postalCode: v } }));
                                      return;
                                    }
                                    handlePostalCodeChange('billingAddress', v);
                                  }}
                                  onCompositionEnd={(e) => handlePostalCodeChange('billingAddress', e.currentTarget.value)}
                                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'รหัสไปรษณีย์ (ที่อยู่ส่งเอกสาร)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StyledTextField
                                  fullWidth
                                  label="ตำบล/อำเภอ"
                                  value={contactData.billingAddress.district}
                                  onChange={(e) => setContactData({ ...contactData, billingAddress: { ...contactData.billingAddress, district: e.target.value } })}
                                  inputProps={{ 'aria-label': 'ตำบล/อำเภอ (ที่อยู่ส่งเอกสาร)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StyledTextField
                                  fullWidth
                                  label="จังหวัด"
                                  value={contactData.billingAddress.province}
                                  onChange={(e) => setContactData({ ...contactData, billingAddress: { ...contactData.billingAddress, province: e.target.value } })}
                                  inputProps={{ 'aria-label': 'จังหวัด (ที่อยู่ส่งเอกสาร)' }}
                                />
                              </Grid>
                            </Grid>
                          </CardPaper>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={<Checkbox checked={contactData.shippingAddressSameAsMain} onChange={(e) => setContactData({ ...contactData, shippingAddressSameAsMain: e.target.checked })} />}
                          label="ที่อยู่จัดส่งเหมือนที่อยู่หลัก"
                        />
                      </Grid>

                      {!contactData.shippingAddressSameAsMain && (
                        <Grid item xs={12}>
                          <CardPaper title="ที่อยู่จัดส่ง" icon={<HomeIcon color="primary" />}>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <StyledTextField
                                  fullWidth
                                  label="บ้านเลขที่"
                                  value={contactData.shippingAddress.houseNo}
                                  onChange={(e) => setContactData({ ...contactData, shippingAddress: { ...contactData.shippingAddress, houseNo: e.target.value } })}
                                  inputProps={{ 'aria-label': 'บ้านเลขที่ (ที่อยู่จัดส่ง)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <StyledTextField
                                  fullWidth
                                  label="ถนน"
                                  value={contactData.shippingAddress.street}
                                  onChange={(e) => setContactData({ ...contactData, shippingAddress: { ...contactData.shippingAddress, street: e.target.value } })}
                                  inputProps={{ 'aria-label': 'ถนน (ที่อยู่จัดส่ง)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StyledTextField
                                  fullWidth
                                  label="รหัสไปรษณีย์"
                                  value={contactData.shippingAddress.postalCode}
                                  onChange={(e) => handlePostalCodeChange('shippingAddress', e.target.value)}
                                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'รหัสไปรษณีย์ (ที่อยู่จัดส่ง)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StyledTextField
                                  fullWidth
                                  label="ตำบล/อำเภอ"
                                  value={contactData.shippingAddress.district}
                                  onChange={(e) => setContactData({ ...contactData, shippingAddress: { ...contactData.shippingAddress, district: e.target.value } })}
                                  inputProps={{ 'aria-label': 'ตำบล/อำเภอ (ที่อยู่จัดส่ง)' }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StyledTextField
                                  fullWidth
                                  label="จังหวัด"
                                  value={contactData.shippingAddress.province}
                                  onChange={(e) => setContactData({ ...contactData, shippingAddress: { ...contactData.shippingAddress, province: e.target.value } })}
                                  inputProps={{ 'aria-label': 'จังหวัด (ที่อยู่จัดส่ง)' }}
                                />
                              </Grid>
                            </Grid>
                          </CardPaper>
                        </Grid>
                      )}
                    </Grid>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">ช่องทางติดต่อ</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="ชื่อผู้ติดต่อ"
                          value={contactData.contactPerson}
                          onChange={(e) => setContactData({ ...contactData, contactPerson: e.target.value })}
                          InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                          inputProps={{ 'aria-label': 'ชื่อผู้ติดต่อ' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="อีเมล"
                          value={contactData.email}
                          onChange={(e) => {
                            const v = e.target.value;
                            setContactData((prev) => ({ ...prev, email: v }));
                            if (!isComposing(e)) validateField('email', v);
                          }}
                          onCompositionEnd={(e) => validateField('email', e.currentTarget.value)}
                          error={!!errors.email}
                          helperText={errors.email || 'เช่น example@domain.com'}
                          InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="เบอร์มือถือ"
                          type="tel"
                          value={contactData.mobile}
                          onChange={(e) => {
                            const v = e.target.value;
                            setContactData((prev) => ({ ...prev, mobile: v }));
                            if (!isComposing(e)) validateField('mobile', v);
                          }}
                          onCompositionEnd={(e) => validateField('mobile', e.currentTarget.value)}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', 'aria-label': 'เบอร์มือถือ' }}
                          error={!!errors.mobile}
                          helperText={errors.mobile || 'เช่น 0812345678'}
                          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="โทรศัพท์สำนักงาน"
                          value={contactData.officePhone}
                          onChange={(e) => setContactData({ ...contactData, officePhone: e.target.value })}
                          helperText="เช่น 021234567"
                          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment> }}
                          inputProps={{ 'aria-label': 'โทรศัพท์สำนักงาน' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="ต่อภายใน"
                          value={contactData.phoneExtension}
                          onChange={(e) => setContactData({ ...contactData, phoneExtension: e.target.value })}
                          helperText="เช่น 1234"
                          inputProps={{ 'aria-label': 'ต่อภายใน' }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <StyledTextField
                          fullWidth
                          label="ช่องทางอื่น ๆ"
                          value={contactData.otherChannels}
                          onChange={(e) => setContactData({ ...contactData, otherChannels: e.target.value })}
                          helperText="เช่น Line ID, Website URL"
                          inputProps={{ 'aria-label': 'ช่องทางอื่น ๆ' }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion expanded={expanded === 'panel4'} onChange={handleAccordionChange('panel4')} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">ข้อมูลธนาคารในประเทศ</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>ธนาคาร</InputLabel>
                          <Select
                            value={contactData.bankDetails.bankName}
                            onChange={(e) => setContactData({ ...contactData, bankDetails: { ...contactData.bankDetails, bankName: e.target.value } })}
                            label="ธนาคาร"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</MenuItem>
                            <MenuItem value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</MenuItem>
                            <MenuItem value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="ชื่อบัญชี"
                          value={contactData.bankDetails.accountName}
                          onChange={(e) => setContactData({ ...contactData, bankDetails: { ...contactData.bankDetails, accountName: e.target.value } })}
                          InputProps={{ startAdornment: <InputAdornment position="start"><BankIcon color="action" /></InputAdornment> }}
                          inputProps={{ 'aria-label': 'ชื่อบัญชี' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="เลขที่บัญชี"
                          value={contactData.bankDetails.accountNumber}
                          onChange={(e) => setContactData({ ...contactData, bankDetails: { ...contactData.bankDetails, accountNumber: e.target.value } })}
                          helperText="เช่น 123-4-56789-0"
                          inputProps={{ 'aria-label': 'เลขที่บัญชี' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StyledTextField
                          fullWidth
                          label="รหัสสาขา / ชื่อสาขา"
                          value={contactData.bankDetails.branchCode}
                          onChange={(e) => setContactData({ ...contactData, bankDetails: { ...contactData.bankDetails, branchCode: e.target.value } })}
                          helperText="เช่น 0012 หรือ สาขาสีลม"
                          inputProps={{ 'aria-label': 'รหัสสาขา / ชื่อสาขา' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>ประเภทบัญชี</InputLabel>
                          <Select
                            value={contactData.bankDetails.accountType}
                            onChange={(e) => setContactData({ ...contactData, bankDetails: { ...contactData.bankDetails, accountType: e.target.value } })}
                            label="ประเภทบัญชี"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="ออมทรัพย์">ออมทรัพย์</MenuItem>
                            <MenuItem value="กระแสรายวัน">กระแสรายวัน</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel shrink>สกุลเงินหลัก</InputLabel>
                          <Select
                            value={contactData.bankDetails.currency}
                            onChange={(e) => setContactData({ ...contactData, bankDetails: { ...contactData.bankDetails, currency: e.target.value } })}
                            label="สกุลเงินหลัก"
                            sx={{ borderRadius: 8, bgcolor: '#fff' }}
                          >
                            <MenuItem value="THB">THB - ไทย</MenuItem>
                            <MenuItem value="USD">USD - US Dollar</MenuItem>
                            <MenuItem value="EUR">EUR - Euro</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ border: '2px dashed #d0d5dd', borderRadius: 8, p: 3, textAlign: 'center', bgcolor: '#f9fafb', '&:hover': { bgcolor: '#f1f5f9' } }}>
                          <input
                            type="file"
                            id="qrCode-upload"
                            accept="image/jpeg,image/png"
                            onChange={(e) => handleFileChange('qrCode', e)}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="qrCode-upload">
                            <Typography color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>อัปโหลด QR Code ชำระเงิน</Typography>
                            <Typography variant="caption" color="text.secondary">JPEG, PNG (สูงสุด 2MB)</Typography>
                          </label>
                          {contactData.bankDetails.qrCode && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={URL.createObjectURL(contactData.bankDetails.qrCode)}
                                alt="QR Code"
                                style={{ maxWidth: '150px', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                              />
                              <Chip
                                label={contactData.bankDetails.qrCode.name}
                                onDelete={() => handleDeleteFile('qrCode')}
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 1 }}
                                deleteIcon={<DeleteIcon />}
                              />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {(contactData.businessLocation === 'ต่างประเทศ' || contactData.internationalBankDetails.enabled) && (
                <Accordion expanded={expanded === 'panel5'} onChange={handleAccordionChange('panel5')} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">ข้อมูลโอนต่างประเทศ</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <FormControlLabel
                        control={<Switch checked={contactData.internationalBankDetails.enabled} onChange={(e) => setContactData({ ...contactData, internationalBankDetails: { ...contactData.internationalBankDetails, enabled: e.target.checked } })} />}
                        label="เปิดใช้งานข้อมูลโอนต่างประเทศ"
                      />
                      {contactData.internationalBankDetails.enabled && (
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <StyledTextField
                              fullWidth
                              label="SWIFT/BIC"
                              value={contactData.internationalBankDetails.swiftCode}
                              onChange={(e) => setContactData({ ...contactData, internationalBankDetails: { ...contactData.internationalBankDetails, swiftCode: e.target.value } })}
                              helperText="เช่น BOFAUS3N"
                              inputProps={{ 'aria-label': 'SWIFT/BIC' }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <StyledTextField
                              fullWidth
                              label="IBAN"
                              value={contactData.internationalBankDetails.iban}
                              onChange={(e) => setContactData({ ...contactData, internationalBankDetails: { ...contactData.internationalBankDetails, iban: e.target.value } })}
                              helperText="เช่น DE89370400440532013000"
                              inputProps={{ 'aria-label': 'IBAN' }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <StyledTextField
                              fullWidth
                              label="ที่อยู่ธนาคาร (ภาษาอังกฤษ)"
                              multiline
                              rows={3}
                              value={contactData.internationalBankDetails.bankAddress}
                              onChange={(e) => setContactData({ ...contactData, internationalBankDetails: { ...contactData.internationalBankDetails, bankAddress: e.target.value } })}
                              inputProps={{ 'aria-label': 'ที่อยู่ธนาคาร (ภาษาอังกฤษ)' }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <StyledTextField
                              fullWidth
                              label="ชื่อ/ที่อยู่ผู้รับผลประโยชน์"
                              multiline
                              rows={3}
                              value={contactData.internationalBankDetails.beneficiary}
                              onChange={(e) => setContactData({ ...contactData, internationalBankDetails: { ...contactData.internationalBankDetails, beneficiary: e.target.value } })}
                              inputProps={{ 'aria-label': 'ชื่อ/ที่อยู่ผู้รับผลประโยชน์' }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              <Accordion expanded={expanded === 'panel6'} onChange={handleAccordionChange('panel6')} sx={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">เอกสารแนบ</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <Box sx={{ border: '2px dashed #d0d5dd', borderRadius: 8, p: 3, textAlign: 'center', bgcolor: '#f9fafb', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <input
                        type="file"
                        id="documents-upload"
                        multiple
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileChange('documents', e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="documents-upload">
                        <Typography color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>อัปโหลดเอกสาร (หนังสือรับรอง, ภ.พ.20, บัตรประชาชน)</Typography>
                        <Typography variant="caption" color="text.secondary">JPEG, PNG, PDF (สูงสุด 5MB)</Typography>
                      </label>
                      {contactData.documents.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {contactData.documents.map((doc, index) => (
                            <Chip
                              key={index}
                              label={doc.name}
                              onDelete={() => handleDeleteFile('document', index)}
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 16 }}
                              deleteIcon={<DeleteIcon />}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ border: '2px dashed #d0d5dd', borderRadius: 8, p: 3, textAlign: 'center', bgcolor: '#f9fafb', '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/jpeg,image/png"
                        onChange={(e) => handleFileChange('logo', e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logo-upload">
                        <Typography color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>อัปโหลดโลโก้ลูกค้า/ผู้ขาย</Typography>
                        <Typography variant="caption" color="text.secondary">JPEG, PNG (สูงสุด 2MB)</Typography>
                      </label>
                      {contactData.logo && (
                        <Box sx={{ mt: 2 }}>
                          <img
                            src={URL.createObjectURL(contactData.logo)}
                            alt="Logo"
                            style={{ maxWidth: '150px', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                          />
                          <Chip
                            label={contactData.logo.name}
                            onDelete={() => handleDeleteFile('logo')}
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 1 }}
                            deleteIcon={<DeleteIcon />}
                          />
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </CardPaper>

          {/* พื้นที่สำหรับพิมพ์ */}
          <Box id="print-area" sx={{ display: 'none' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>ข้อมูลผู้ติดต่อ</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1.5}>
              <Grid item xs={12}><Typography><strong>ประเภท:</strong> {contactData.contactType || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>บทบาท:</strong> {contactData.roles.join(', ') || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>ชื่อ:</strong> {contactData.name || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>ที่อยู่:</strong> {`${contactData.address.houseNo} ${contactData.address.street}, ${contactData.address.district}, ${contactData.address.province} ${contactData.address.postalCode}`}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>ภาษี:</strong> {contactData.taxId || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>อีเมล:</strong> {contactData.email || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>มือถือ:</strong> {contactData.mobile || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>โทรศัพท์สำนักงาน:</strong> {contactData.officePhone || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>หมายเหตุภายใน:</strong> {contactData.internalNotes || '-'}</Typography></Grid>
            </Grid>
          </Box>

          {renderPreviewDialog()}
          {renderDeleteConfirmDialog()}
          {renderCancelDialog()}
        </Box>
      </Fade>
    </ThemeProvider>
  );
};

export default ContactForm;
