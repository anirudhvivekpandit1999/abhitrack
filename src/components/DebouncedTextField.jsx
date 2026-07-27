import { useState, useEffect, useRef, useCallback } from 'react';

import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

/* ============================================================================
   DEBOUNCED TEXT FIELD
============================================================================ */

const DebouncedTextField = ({
  value = '',
  onChange,
  onBlur,
  debounceTime = 300,

  /*
   * Optional convenience feature.
   * Set clearable={true} when you want the field to show a clear button.
   */
  clearable = false,

  sx,

  InputProps,

  ...props
}) => {
  /* ==========================================================================
     STATE
  ========================================================================== */

  const [localValue, setLocalValue] = useState(value ?? '');

  const debounceRef = useRef(null);

  /* ==========================================================================
     SYNC EXTERNAL VALUE
  ========================================================================== */

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  /* ==========================================================================
     CLEANUP
  ========================================================================== */

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /* ==========================================================================
     HELPERS
  ========================================================================== */

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

  /* ==========================================================================
     CHANGE
  ========================================================================== */

  const handleChange = (event) => {
    const newValue = event.target.value;

    setLocalValue(newValue);

    clearDebounce();

    debounceRef.current = setTimeout(() => {
      emitChange(newValue);

      debounceRef.current = null;
    }, debounceTime);
  };

  /* ==========================================================================
     BLUR
  ========================================================================== */

  const handleBlur = (event) => {
    clearDebounce();

    /*
     * Immediately commit the latest value when the user leaves the field.
     */
    if (localValue !== value) {
      emitChange(localValue);
    }

    /*
     * Preserve any onBlur handler supplied by the parent.
     */
    if (typeof onBlur === 'function') {
      onBlur(event);
    }
  };

  /* ==========================================================================
     CLEAR
  ========================================================================== */

  const handleClear = (event) => {
    /*
     * Prevent the clear button from stealing focus before
     * the value is processed.
     */
    event.preventDefault();
    event.stopPropagation();

    clearDebounce();

    setLocalValue('');

    emitChange('');
  };

  /* ==========================================================================
     END ADORNMENT
  ========================================================================== */

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
                width: 28,
                height: 28,

                ml: existingEndAdornment ? 0.5 : 0,

                color: '#94A3B8',

                borderRadius: 1.5,

                transition: 'all 150ms ease',

                '&:hover': {
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                },
              }}
            >
              <ClearRoundedIcon
                sx={{
                  fontSize: 17,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </InputAdornment>
    ) : undefined;

  /* ==========================================================================
     DEFAULT STYLING
  ========================================================================== */

  const defaultSx = {
    /*
     * Label
     */
    '& .MuiInputLabel-root': {
      color: '#64748B',

      fontSize: '0.875rem',

      transition: 'color 150ms ease',

      '&.Mui-focused': {
        color: '#2563EB',
      },

      '&.Mui-disabled': {
        color: '#94A3B8',
      },
    },

    /*
     * Input container
     */
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,

      bgcolor: '#FFFFFF',

      color: '#334155',

      fontSize: '0.875rem',

      transition:
        'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',

      /*
       * Default border
       */
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#D8E0EA',

        transition: 'border-color 150ms ease',
      },

      /*
       * Hover
       */
      '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': {
        borderColor: '#AEBACA',
      },

      /*
       * Focus
       */
      '&.Mui-focused': {
        bgcolor: '#FFFFFF',

        boxShadow:
          '0 0 0 4px rgba(37, 99, 235, 0.07)',
      },

      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#2563EB',
        borderWidth: '1.5px',
      },

      /*
       * Disabled
       */
      '&.Mui-disabled': {
        bgcolor: '#F8FAFC',

        color: '#94A3B8',

        cursor: 'not-allowed',
      },

      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E2E8F0',
      },

      /*
       * Error
       */
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#EF4444',
      },

      '&.Mui-error.Mui-focused': {
        boxShadow:
          '0 0 0 4px rgba(239, 68, 68, 0.07)',
      },

      '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#EF4444',
      },

      /*
       * Input
       */
      '& input': {
        py: 1.35,

        '&::placeholder': {
          color: '#94A3B8',
          opacity: 1,
        },
      },

      /*
       * Multiline
       */
      '& textarea': {
        lineHeight: 1.6,

        '&::placeholder': {
          color: '#94A3B8',
          opacity: 1,
        },
      },
    },

    /*
     * Helper text
     */
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

  /* ==========================================================================
     RENDER
  ========================================================================== */

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