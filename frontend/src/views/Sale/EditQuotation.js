import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Typography, Button, Autocomplete, TextField, Modal, Snackbar, Alert } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import CreateFormQuotation from './CreateFormQuotation';
import ContactForm from './ContactForm';

const EditQuotation = () => {
  const history = useHistory();
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [openContactModal, setOpenContactModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // โหลดข้อมูลใบเสนอราคาและผู้ติดต่อจาก localStorage
  useEffect(() => {
    try {
      // โหลดใบเสนอราคา
      const quotations = JSON.parse(localStorage.getItem('quotations')) || [];
      const foundQuotation = quotations.find((q) => q.id === id);
      if (foundQuotation) {
        setQuotation(foundQuotation);
        setSelectedContactId(foundQuotation.quotationData.contactId || '');
      } else {
        setSnackbar({
          open: true,
          message: 'ไม่พบใบเสนอราคาที่ต้องการแก้ไข',
          severity: 'error',
        });
        setTimeout(() => {
          history.push('/sale/quotation');
        }, 2000);
      }
      // โหลดผู้ติดต่อ
      const storedContacts = JSON.parse(localStorage.getItem('contacts')) || [];
      setContacts(storedContacts);
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        severity: 'error',
      });
    }
  }, [id, history]);

  // จัดการการเลือกผู้ติดต่อ
  const handleContactChange = (event, value) => {
    setSelectedContactId(value ? value.id : '');
  };

  // เปิด modal สำหรับเพิ่ม/แก้ไขผู้ติดต่อ
  const handleOpenContactModal = () => {
    setOpenContactModal(true);
  };

  // ปิด modal
  const handleCloseContactModal = () => {
    setOpenContactModal(false);
  };

  // บันทึกผู้ติดต่อใหม่
  const handleSaveContact = (newContact) => {
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
      setSelectedContactId(newContact.id);
      setSnackbar({
        open: true,
        message: 'บันทึกผู้ติดต่อสำเร็จ',
        severity: 'success',
      });
      handleCloseContactModal();
    } catch (error) {
      console.error('Error saving contact:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกผู้ติดต่อ',
        severity: 'error',
      });
    }
  };

  if (!quotation) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 4 }}>
        <Box sx={{ maxWidth: '7xl', mx: 'auto', bgcolor: 'white', borderRadius: 2, boxShadow: 1, p: 6 }}>
          <Typography variant="h5" color="error">
            กำลังโหลดหรือไม่พบใบเสนอราคา
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push('/sale/quotation')}
            sx={{ mt: 2 }}
          >
            กลับไปหน้าใบเสนอราคา
          </Button>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 4 }}>
      <Box sx={{ maxWidth: '7xl', mx: 'auto', bgcolor: 'white', borderRadius: 2, boxShadow: 1, p: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
          <DescriptionIcon sx={{ width: 24, height: 24, color: 'blue.500' }} />
          <Box>
            <Typography variant="h5">แก้ไขใบเสนอราคา</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              เลขที่: {quotation.quotationData.quotationNumber}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Autocomplete
            options={contacts}
            getOptionLabel={(option) => option.name || ''}
            value={contacts.find((contact) => contact.id === selectedContactId) || null}
            onChange={handleContactChange}
            renderInput={(params) => <TextField {...params} label="เลือกผู้ติดต่อ" />}
            fullWidth
            sx={{ maxWidth: 400 }}
          />
          <Button variant="outlined" onClick={handleOpenContactModal}>
            + เพิ่มผู้ติดต่อ
          </Button>
        </Box>
        <CreateFormQuotation
          initialQuotationData={{ ...quotation.quotationData, contactId: selectedContactId }}
          initialSummary={quotation.summary}
          onSave={(formData) => {
            if (!formData) {
              history.push('/sale/quotation');
              return;
            }
            try {
              const quotations = JSON.parse(localStorage.getItem('quotations')) || [];
              const updatedQuotations = quotations.map((q) =>
                q.id === id ? { ...q, quotationData: formData } : q
              );
              localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
              setSnackbar({
                open: true,
                message: 'บันทึกใบเสนอราคาสำเร็จ',
                severity: 'success',
              });
              setTimeout(() => {
                history.push('/sale/quotation');
              }, 2000);
            } catch (error) {
              console.error('Error saving quotation:', error);
              setSnackbar({
                open: true,
                message: 'เกิดข้อผิดพลาดในการบันทึกใบเสนอราคา',
                severity: 'error',
              });
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => history.push('/sale/quotation')}
          sx={{ mt: 4 }}
        >
          กลับไปหน้าใบเสนอราคา
        </Button>
        <Modal open={openContactModal} onClose={handleCloseContactModal}>
          <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, maxWidth: 600, mx: 'auto', mt: '10%' }}>
            <ContactForm
              initialData={contacts.find((contact) => contact.id === selectedContactId) || {}}
              onSave={handleSaveContact}
              onCancel={handleCloseContactModal}
            />
          </Box>
        </Modal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default EditQuotation;