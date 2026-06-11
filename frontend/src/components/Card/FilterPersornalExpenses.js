import { AccountCircle } from '@mui/icons-material';
import { Autocomplete, Card, InputAdornment, TextField } from '@mui/material';
import React from 'react';

export default function FilterPersornalExpenses({
  project,
  setFindProject,
  setSearch,
}) {
  const handleCheckProject = (data, index) => {
    const each = _.find(project.rows, { _id: data?._id });
    setFindProject(each);
  };
  return (
    <div className="p-2 w-full lg:grid grid-cols-2 gap-2 ">
      <div className="py-1 w-full">
        <TextField
          fullWidth
          id="input-with-icon-textfield"
          size="small"
          label="Search"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="py-1">
        <Autocomplete
          disablePortal
          id="free-solo-demo"
          freeSolo
          size="small"
          options={project?.rows || []}
          getOptionLabel={(option) =>
            `${option?.project_number} |${option?.name} `
          }
          onChange={(e, newValue) => handleCheckProject(newValue)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Project" />
          )}
        />
      </div>
    </div>
  );
}
