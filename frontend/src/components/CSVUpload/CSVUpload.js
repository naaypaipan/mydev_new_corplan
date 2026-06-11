import React, { createRef } from 'react';
import { useCSVReader } from 'react-papaparse';
import { Button } from '@mui/material';
import _ from 'lodash';
import PropTypes from 'prop-types';

const CSVUpload = ({ setCsvData, header }) => {
  const buttonRef = createRef();
  const { CSVReader } = useCSVReader();
  console.log('--------------', header);

  const handleOnFileLoad = (data) => {
    console.log('File Data');
    console.log(data);
    console.log('-----');

    // ชื่อของ Key จะอยู่ใน แถวที่ index 1 (แถวที่ 2 ใน Excel) และเอาแถวสุดท้ายออก
    const fileDataKey = data?.data?.[header];
    const fileData = _.initial(_.slice(data?.data, header + 1));

    console.log('File Data Key', fileDataKey);
    console.log('File Data', fileData);
    const fileInFormat = _.map(fileData, (_fileData) => {
      const onlyDataFileData = _fileData;
      return _.zipObject(fileDataKey, onlyDataFileData);
    });

    console.log('File In Format', fileInFormat);
    setCsvData(fileInFormat);
  };

  return (
    <div>
      <CSVReader onUploadAccepted={handleOnFileLoad}>
        {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (
          <div>
            {!acceptedFile && (
              <Button
                type="button"
                {...getRootProps()}
                variant="contained"
                color="primary"
              >
                เลือกไฟล์
              </Button>
            )}
            <div className="flex gap-2">
              <div className="self-center">
                <p>{acceptedFile && acceptedFile?.name} </p>
              </div>
              {acceptedFile && (
                <Button type="button" {...getRemoveFileProps()} color="error">
                  ลบ
                </Button>
              )}
            </div>
          </div>
        )}
      </CSVReader>
    </div>
  );
};

CSVUpload.propTypes = {
  setCsvData: PropTypes.func,
};

export default CSVUpload;
