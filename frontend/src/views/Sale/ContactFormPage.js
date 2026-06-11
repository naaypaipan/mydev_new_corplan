import React, { useState } from "react";
import {
  Box, Container, Paper, Grid, Stack, Divider, Typography, TextField,
  Select, MenuItem, InputLabel, FormControl, FormControlLabel, Checkbox,
  RadioGroup, Radio, Chip, Button, Stepper, Step, StepLabel, Switch,
  alpha, useTheme
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import QrCodeIcon from "@mui/icons-material/QrCode2";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const banks = ["ธนาคารกสิกรไทย", "ธนาคารไทยพาณิชย์", "ธนาคารกรุงเทพ", "ธนาคารกรุงไทย"];
const accountTypes = ["ออมทรัพย์", "กระแสรายวัน"];

const CardPaper = ({ title, icon, children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      background: "linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)",
      boxShadow: "0 10px 30px rgba(2,16,26,0.06)",
      transition: "transform .2s ease, box-shadow .2s ease",
      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 40px rgba(2,16,26,0.10)" },
      ...sx,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      {icon}
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
    </Stack>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Paper>
);

export default function ContactFormPage({ onSave, onCancel, initialValues }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [qrFile, setQrFile] = useState(null);
  const [intlEnabled, setIntlEnabled] = useState(false);

  const {
    control, handleSubmit, watch, trigger, formState: { errors }
  } = useForm({
    defaultValues: {
      // Step 1
      contactType: "",
      businessLocation: "ไทย",
      roles: [],
      creditDays: "",
      contactCode: "",
      name: "",
      address: "",
      postalCode: "",
      taxId: "",
      officeType: "สำนักงานใหญ่",
      branchName: "",
      // Step 2
      contactPerson: "",
      email: "",
      mobile: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchCode: "",
      branchText: "",
      accountType: "",
      // Step 3
      swift: "",
      bankAddress: "",
      ...(initialValues || {}),
    },
  });
 // เมื่อเป็นโหมดแก้ไข ถ้ามีค่าจาก initialValues ต้องเปิด foreign fields ด้วย
 React.useEffect(() => {
   if (initialValues?.swift || initialValues?.bankAddress) {
     setIntlEnabled(true);
   }
 }, [initialValues]);

  const isThai = watch("businessLocation") === "ไทย";
  const officeType = watch("officeType");
  const roles = watch("roles");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobilePattern = /^\d{10}$/;
  const postalPattern = /^\d{5}$/;

  const steps = [
    "ข้อมูลทั่วไป/ภาษี/ที่อยู่",
    "รายละเอียดผู้ติดต่อ & ธนาคาร",
    "ช่องทางชำระเงิน & โอนต่างประเทศ",
  ];

  // -------- Header (โทนเดียวกับ NewPayment) ----------
  const Header = (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <BusinessIcon color="primary" />
          <Typography variant="h5" fontWeight={800}>เพิ่ม/แก้ไข ผู้ติดต่อ</Typography>
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label={`ที่ตั้งธุรกิจ: ${watch("businessLocation") || "-"}`}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label={`บทบาทที่เลือก: ${roles.length} รายการ`}
              color={roles.length ? "primary" : "default"}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label={`ขั้นตอน: ${activeStep + 1}/${steps.length}`}
              color="info"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );

  // -------- Step 1 ----------
  const Step1 = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.contactType}>
          <Typography sx={{ mb: 0.5 }}>ประเภทผู้ติดต่อ</Typography>
          <Controller
            name="contactType"
            control={control}
            rules={{ required: "กรุณาเลือกประเภทผู้ติดต่อ" }}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="นิติบุคคล" control={<Radio />} label="นิติบุคคล" />
                <FormControlLabel value="บุคคลธรรมดา" control={<Radio />} label="บุคคลธรรมดา" />
              </RadioGroup>
            )}
          />
          {errors.contactType && <Typography variant="caption" color="error">{errors.contactType.message}</Typography>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <Typography sx={{ mb: 0.5 }}>ที่ตั้งธุรกิจ</Typography>
          <Controller
            name="businessLocation"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="ไทย" control={<Radio />} label="ไทย" />
                <FormControlLabel value="ต่างประเทศ" control={<Radio />} label="ต่างประเทศ" />
              </RadioGroup>
            )}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.roles}>
          <Typography sx={{ mb: 0.5 }}>ประเภทบทบาท</Typography>
          <Controller
            name="roles"
            control={control}
            rules={{ validate: (arr) => (arr?.length ? true : "กรุณาเลือกอย่างน้อย 1 บทบาท") }}
            render={({ field }) => (
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {["ลูกค้า", "ผู้จำหน่าย"].map((role) => (
                  <FormControlLabel
                    key={role}
                    control={
                      <Checkbox
                        checked={field.value?.includes(role)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const current = new Set(field.value || []);
                          checked ? current.add(role) : current.delete(role);
                          field.onChange(Array.from(current));
                        }}
                      />
                    }
                    label={role}
                  />
                ))}
              </Stack>
            )}
          />
          {errors.roles && <Typography variant="caption" color="error">{errors.roles.message}</Typography>}
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller name="creditDays" control={control} render={({ field }) => (
          <TextField {...field} label="เครดิต (วัน)" fullWidth type="number" />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller name="contactCode" control={control} render={({ field }) => (
          <TextField {...field} label="รหัสผู้ติดต่อ" fullWidth />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="name"
          control={control}
          rules={{ required: "กรุณากรอกชื่อธุรกิจ/ชื่อกิจการ" }}
          render={({ field }) => (
            <TextField {...field} label="ชื่อธุรกิจ / ชื่อกิจการ" fullWidth error={!!errors.name} helperText={errors.name?.message} />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller name="address" control={control} render={({ field }) => (
          <TextField {...field} label="ที่อยู่" fullWidth multiline rows={3} />
        )}/>
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller
          name="postalCode"
          control={control}
          rules={{ validate: (v) => !v || /^\d{5}$/.test(v) || "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" }}
          render={({ field }) => (
            <TextField {...field} label="รหัสไปรษณีย์" fullWidth error={!!errors.postalCode} helperText={errors.postalCode?.message} />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller
          name="taxId"
          control={control}
          rules={{ validate: (v) => !isThai || !v || /^\d{10,13}$/.test(v) || "เลขผู้เสียภาษีต้องเป็นตัวเลข 10–13 หลัก" }}
          render={({ field }) => (
            <TextField {...field} label="เลขผู้เสียภาษี" fullWidth error={!!errors.taxId} helperText={errors.taxId?.message || "สำหรับไทย 10–13 หลัก"} />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <Typography sx={{ mb: 0.5 }}>สำนักงาน/สาขา</Typography>
          <Controller
            name="officeType"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="สำนักงานใหญ่" control={<Radio />} label="สำนักงานใหญ่" />
                <FormControlLabel value="สาขา" control={<Radio />} label="สาขา" />
              </RadioGroup>
            )}
          />
        </FormControl>
        {officeType === "สาขา" && (
          <Box sx={{ mt: 1 }}>
            <Controller
              name="branchName"
              control={control}
              rules={{ required: "กรุณาระบุชื่อสาขา" }}
              render={({ field }) => (
                <TextField {...field} label="ชื่อสาขา" fullWidth error={!!errors.branchName} helperText={errors.branchName?.message} />
              )}
            />
          </Box>
        )}
      </Grid>
    </Grid>
  );

  // -------- Step 2 ----------
  const Step2 = (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>รายละเอียดผู้ติดต่อ</Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller name="contactPerson" control={control} render={({ field }) => (
          <TextField {...field} label="ชื่อผู้ติดต่อ" fullWidth />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="email"
          control={control}
          rules={{ validate: (v) => !v || emailPattern.test(v) || "อีเมลไม่ถูกต้อง" }}
          render={({ field }) => (
            <TextField {...field} label="อีเมล" fullWidth error={!!errors.email} helperText={errors.email?.message} />
          )}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller
          name="mobile"
          control={control}
          rules={{ validate: (v) => !v || mobilePattern.test(v) || "เบอร์มือถือต้องเป็นตัวเลข 10 หลัก" }}
          render={({ field }) => (
            <TextField {...field} label="เบอร์มือถือ" fullWidth error={!!errors.mobile} helperText={errors.mobile?.message} />
          )}
        />
      </Grid>

      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>ข้อมูลธนาคาร (ในประเทศ)</Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>ธนาคาร</InputLabel>
          <Controller name="bankName" control={control} render={({ field }) => (
            <Select {...field} label="ธนาคาร">
              {banks.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </Select>
          )}/>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller name="accountName" control={control} render={({ field }) => (
          <TextField {...field} label="ชื่อบัญชี" fullWidth />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller name="accountNumber" control={control} render={({ field }) => (
          <TextField {...field} label="เลขที่บัญชี" fullWidth />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller name="branchCode" control={control} render={({ field }) => (
          <TextField {...field} label="รหัสสาขา" fullWidth />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <Controller name="branchText" control={control} render={({ field }) => (
          <TextField {...field} label="ชื่อสาขา" fullWidth />
        )}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>ประเภทบัญชี</InputLabel>
          <Controller name="accountType" control={control} render={({ field }) => (
            <Select {...field} label="ประเภทบัญชี">
              {accountTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          )}/>
        </FormControl>
      </Grid>
    </Grid>
  );

  // -------- Step 3 ----------
  const Step3 = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography sx={{ mb: 1 }}>คิวอาร์ชำระเงิน (QR Code)</Typography>
        <Box sx={{ border: "1px dashed", borderColor: "divider", p: 2, borderRadius: 2, textAlign: "center", bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <input
            id="qr-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > 2 * 1024 * 1024) { alert("ขนาดไฟล์เกิน 2MB"); return; }
              setQrFile(f || null);
            }}
          />
          <label htmlFor="qr-upload" style={{ cursor: "pointer" }}>
            <QrCodeIcon color="primary" />
            <Typography color="primary">อัปโหลด QR Code</Typography>
            <Typography variant="caption" color="text.secondary">JPEG/PNG ≤ 2MB</Typography>
          </label>
          {qrFile && (
            <Box sx={{ mt: 1 }}>
              <Chip label={qrFile.name} onDelete={() => setQrFile(null)} color="primary" variant="outlined" />
            </Box>
          )}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={<Switch checked={intlEnabled} onChange={(e) => setIntlEnabled(e.target.checked)} />}
          label="เปิดข้อมูลโอนต่างประเทศ"
        />
      </Grid>

      {intlEnabled && (
        <>
          <Grid item xs={12} md={6}>
            <Controller
              name="swift"
              control={control}
              rules={{ validate: (v) => !intlEnabled || v || "กรุณากรอก Swift Code" }}
              render={({ field }) => (
                <TextField {...field} label="Swift Code" fullWidth error={!!errors.swift} helperText={errors.swift?.message} />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="bankAddress" control={control} render={({ field }) => (
              <TextField {...field} label="ที่อยู่ธนาคาร (ภาษาอังกฤษ)" fullWidth multiline rows={3} />
            )}/>
          </Grid>
        </>
      )}
    </Grid>
  );

  // -------- validate step ----------
  const validateStep = async () => {
    if (activeStep === 0) {
      return trigger([
        "contactType", "roles", "name",
        ...(officeType === "สาขา" ? ["branchName"] : []),
        "postalCode", "taxId"
      ]);
    }
    if (activeStep === 1) return trigger(["email", "mobile"]);
    if (activeStep === 2) return trigger(["swift"]);
    return true;
  };

  const handleNext = async () => { if (await validateStep()) setActiveStep((s) => Math.min(s + 1, steps.length - 1)); };
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));
  const submit = (values) => onSave?.({
   ...values,
   id: initialValues?.id,               // ส่ง id กลับเพื่อ upsert
   qrFile,                              // ไฟล์ใหม่ (ถ้ามี)
   internationalEnabled: intlEnabled,
 });

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        background: "linear-gradient(180deg, #f3f6fb 0%, #f9fbff 100%)",
        minHeight: "100vh",
      }}
    >
      {Header}

      <CardPaper
        title={steps[activeStep]}
        icon={
          activeStep === 0 ? <PersonIcon color="primary" /> :
          activeStep === 1 ? <BusinessIcon color="primary" /> :
          <AccountBalanceIcon color="primary" />
        }
      >
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Stack>

        <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
          {activeStep === 0 && Step1}
          {activeStep === 1 && Step2}
          {activeStep === 2 && Step3}

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={onCancel || (() => window.history.back())}
            >
              ยกเลิก
            </Button>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" disabled={activeStep === 0} onClick={handleBack}>
                ย้อนกลับ
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  ถัดไป
                </Button>
              ) : (
                <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                  บันทึก
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </CardPaper>
    </Container>
  );
}
