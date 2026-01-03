import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

const DebouncedTextField = ({
  value,
  onChange,
  debounceTime = 300,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange({
        target: { value: localValue }
      });
    }
  };
  
  const defaultSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      },
    },
  };

  return (
    <TextField
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      sx={{ ...defaultSx, ...(props.sx || {}) }}
      {...props}
    />
  );
};

export default DebouncedTextField;