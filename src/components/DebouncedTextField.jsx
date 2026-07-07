import { useState, useEffect, useRef } from 'react';
import { TextField } from '@mui/material';

const DebouncedTextField = ({
  value,
  onChange,
  debounceTime = 300,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (typeof onChange === 'function') {
        onChange({ target: { value: newValue } });
      }
    }, debounceTime);
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (localValue !== value && typeof onChange === 'function') {
      onChange({ target: { value: localValue } });
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
