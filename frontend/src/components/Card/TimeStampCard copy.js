import {
  Card,
  Button,
  Chip,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Cameras from '../Camera/Cameras';

export default function TimeStampCard({
  me,
  date,
  imgSrc,
  setImgSrc,
  setNoteCheckin,
  project,
  projectSelect,
  setProjectSelect,
  onSubmit,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Project', 'Take Photo', 'Save'];

  const handleCheckLevel = (data) => {
    const each = _.find(project.rows, { _id: data?._id });
    setProjectSelect(each);
    setActiveStep(1); // Move to the next step after selecting a project
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSubmit(); // Call the submit function on the last step
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <div>
      <Card>
        <div className="mt-2 p-4 overflow-auto">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <div className="flex justify-center items-center lg:py-16 py-8   ">
              <div className="w-1/2">
                {/* <Chip label="Select Project" color="success" /> */}
                <Autocomplete
                  disablePortal
                  id="free-solo-demo"
                  freeSolo
                  fullWidth
                  options={project?.rows || []}
                  getOptionLabel={(option) =>
                    `${option.project_number} | ${option.name}`
                  }
                  onChange={(e, newValue) => handleCheckLevel(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Select Project"
                    />
                  )}
                />
              </div>
            </div>
          )}

          {activeStep === 1 && projectSelect && (
            <div className=" lg:py-16 py-8 ">
              <div className="flex justify-center">
                <div>
                  <Cameras imgSrc={imgSrc} setImgSrc={setImgSrc} />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className=" lg:py-16 py-8 ">
              <div>
                <img
                  src={imgSrc}
                  alt="webcam"
                  style={{ width: '300px', height: 'auto' }}
                />
              </div>
              <h1 className="text-red-700 mx-8">
                หากตรวจพบการทุจริต การเข้างานครั้งนี้จะถูกยกเลิกทันที
              </h1>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button variant="contained" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Save' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
