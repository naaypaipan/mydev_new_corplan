import React from 'react';
import {
  Modal,
  Fade,
  Card,
  Button,
  Backdrop,
  Alert,
  AlertTitle,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { CSVUpload } from '../CSVUpload';

const CSVUploadModal = ({
  isOpen,
  handleClose,
  typeRows,
  csvData,
  setCsvData,
  handleAddFromFile,
  fileTemplateURL = '/filetemplate/Material.csv',
  titleName = 'วัสดุ',
  otherNameForTypes,
  anotherComponent,
  header = 1,
}) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <Card sx={style} className="max-w-4xl ">
          <div className="overflow-y-auto" style={{ height: '500px' }}>
            <div className="pt-2">อัพโหลดข้อมูล</div>
            <div className="py-2 font-system">
              อัพโหลดไฟล์ .csv โดยมีโครงสร้างตามไฟล์เทมเพลต แถวที่ 1-2
              และแถวสุดท้าย จะไม่ถูกนำมาคิดในระบบ <br />
              <Button>
                <Link to={fileTemplateURL} target="_blank">
                  ดาวน์โหลดเทมเพลต
                </Link>
              </Button>
            </div>
            {typeRows && !_.isEmpty(typeRows?.rows) && (
              <div className="my-2">
                <Alert severity="info">
                  {otherNameForTypes ? (
                    <AlertTitle>
                      โปรดแทนที่ข้อมูลใน <strong>{otherNameForTypes}</strong>{' '}
                      ด้วยรหัสดังต่อไปนี้
                    </AlertTitle>
                  ) : (
                    <AlertTitle>
                      โปรดแทนที่ข้อมูลใน <strong>ประเภท{titleName}</strong>{' '}
                      ด้วยรหัสดังต่อไปนี้
                    </AlertTitle>
                  )}
                  <div className="border rounded-sm h-80 overflow-y-auto">
                    <Table
                      sx={{
                        '&:last-child td, &:last-child th': { border: 1 },
                      }}
                    >
                      <TableHead>
                        <TableCell>ชื่อประเภทของ{titleName}</TableCell>
                        <TableCell>รหัส</TableCell>
                      </TableHead>
                      <TableBody>
                        {_.map(typeRows?.rows, (_type, index) => (
                          <TableRow key={index}>
                            <TableCell>{_type?.name} </TableCell>
                            <TableCell>{_type?._id} </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {anotherComponent}
                </Alert>
              </div>
            )}
            <div className="py-2">
              <div className="flex justify-center">
                <div>
                  <CSVUpload setCsvData={setCsvData} header={header} />
                  {!_.isEmpty(csvData) && (
                    <div>
                      <p className="font-system my-1">
                        พบข้อมูล {_.size(csvData)} รายการ
                      </p>
                      <Button
                        color="primary"
                        variant="contained"
                        type="button"
                        onClick={handleAddFromFile}
                      >
                        บันทึก
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Fade>
    </Modal>
  );
};

CSVUploadModal.propTypes = {
  isOpen: PropTypes.bool,
  handleClose: PropTypes.func,
  typeRows: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.object),
  }),
  csvData: PropTypes.arrayOf(PropTypes.object),
  setCsvData: PropTypes.func,
  handleAddFromFile: PropTypes.func,
  fileTemplateURL: PropTypes.string,
  titleName: PropTypes.string,
  otherNameForTypes: PropTypes.string,
};

export default CSVUploadModal;
