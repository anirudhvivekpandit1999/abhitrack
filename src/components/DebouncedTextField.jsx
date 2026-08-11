import { useState, useEffect, useRef, useCallback } from 'react';

import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';



const DebouncedTextField = ({
  value = '',
  onChange,
  onBlur,
  debounceTime = 300,

  
  clearable = false,

  sx,

  InputProps,

  ...props
}) => {
  

  const [localValue, setLocalValue] = useState(value ?? '');

  const debounceRef = useRef(null);

  

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);



  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

 
  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const emitChange = useCallback(
    (newValue) => {
      if (typeof onChange === 'function') {
        onChange({
          target: {
            value: newValue,
          },
        });
      }
    },
    [onChange]
  );

  

  const handleChange = (event) => {
    const newValue = event.target.value;

    setLocalValue(newValue);

    clearDebounce();

    debounceRef.current = setTimeout(() => {
      emitChange(newValue);

      debounceRef.current = null;
    }, debounceTime);
  };

  

  const handleBlur = (event) => {
    clearDebounce();

    
    if (localValue !== value) {
      emitChange(localValue);
    }

    
    if (typeof onBlur === 'function') {
      onBlur(event);
    }
  };


  const handleClear = (event) => {
    
    event.preventDefault();
    event.stopPropagation();

    clearDebounce();

    setLocalValue('');

    emitChange('');
  };

  

  const existingEndAdornment = InputProps?.endAdornment;

  const shouldShowClearButton =
    clearable &&
    !props.disabled &&
    !props.readOnly &&
    String(localValue ?? '').length > 0;

  const endAdornment =
    shouldShowClearButton || existingEndAdornment ? (
      <InputAdornment position="end">
        {existingEndAdornment}

        {shouldShowClearButton && (
          <Tooltip title="Clear" arrow>
            <IconButton
              size="small"
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={handleClear}
              aria-label="Clear field"
              tabIndex={-1}
              sx={{
                width: 30,
                height: 30,

                ml: existingEndAdornment ? 0.5 : 0,

                color: '#94A3B8',

                borderRadius: 2,

                transition: 'all 150ms ease',

                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                  color: '#6366F1',
                },
              }}
            >
              <ClearRoundedIcon
                sx={{
                  fontSize: 18,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </InputAdornment>
    ) : undefined;

  

  const defaultSx = {
    
    '& .MuiInputLabel-root': {
      color: '#64748B',

      fontSize: '0.875rem',
      fontWeight: 500,

      transition: 'color 150ms ease',

      '&.Mui-focused': {
        color: '#6366F1',
      },

      '&.Mui-disabled': {
        color: '#94A3B8',
      },
    },

   
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,

      bgcolor: 'rgba(255, 255, 255, 0.9)',

      color: '#334155',

      fontSize: '0.875rem',

      transition:
        'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',

     
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D8E0EA',
        borderWidth: '1.5px',

        transition: 'border-color 150ms ease',
      },

      
      '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
        borderColor: '#AEBACA',
        backgroundColor: 'rgba(255, 255, 255, 1)',
      },

      
      '&.Mui-focused': {
        bgcolor: 'rgba(255, 255, 255, 1)',

        boxShadow:
          '0 0 0 4px rgba(99, 102, 241, 0.1)',
      },

      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#6366F1',
        borderWidth: '2px',
      },

      
      '&.Mui-disabled': {
        bgcolor: '#F8FAFC',

        color: '#94A3B8',

        cursor: 'not-allowed',
      },

      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E2E8F0',
      },

      
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#EF4444',
      },

      '&.Mui-error.Mui-focused': {
        boxShadow:
          '0 0 0 4px rgba(239, 68, 68, 0.1)',
      },

      '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#EF4444',
      },

      
      '& input': {
        py: 1.35,

        '&::placeholder': {
          color: '#94A3B8',
          opacity: 1,
        },
      },

      
      '& textarea': {
        lineHeight: 1.6,

        '&::placeholder': {
          color: '#94A3B8',
          opacity: 1,
        },
      },
    },

    
    '& .MuiFormHelperText-root': {
      mx: 0.25,
      mt: 0.65,

      color: '#94A3B8',

      fontSize: '0.7rem',
      lineHeight: 1.4,

      '&.Mui-error': {
        color: '#DC2626',
      },
    },
  };

  

  return (
    <TextField
      {...props}

      value={localValue}

      onChange={handleChange}

      onBlur={handleBlur}

      InputProps={{
        ...InputProps,

        endAdornment,
      }}

      sx={{
        ...defaultSx,
        ...(sx || {}),
      }}
    />
  );
};

export default DebouncedTextField;