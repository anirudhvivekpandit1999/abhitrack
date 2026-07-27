import React, { useState } from 'react';

import {
  Button,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Box,
  Typography,
} from '@mui/material';

import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import html2canvas from 'html2canvas';
import { Upload } from '@aws-sdk/lib-storage';

import {
  s3Client,
  BUCKET_NAME,
} from '../utils/s3Client';


/* ============================================================================
   DESIGN TOKENS
============================================================================ */

const COLORS = {
  navy: '#1A2B4B',
  navyDark: '#13213A',

  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primarySoft: '#EFF6FF',

  success: '#059669',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',

  error: '#DC2626',
  errorSoft: '#FEF2F2',
  errorBorder: '#FECACA',

  textPrimary: '#1E293B',
  textSecondary: '#64748B',

  border: '#DCE4EE',
  white: '#FFFFFF',
};


/* ============================================================================
   COMPONENT
============================================================================ */

const SaveVisualizationButton = ({
  elementId,
  fileNamePrefix = 'visualization',
  variableNames,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });


  /* ==========================================================================
     SNACKBAR HELPERS
  ========================================================================== */

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };


  const handleSnackbarClose = (_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar((previous) => ({
      ...previous,
      open: false,
    }));
  };


  /* ==========================================================================
     SAVE VISUALIZATION
  ========================================================================== */

  const handleSave = async () => {
    let element = document.getElementById(elementId);


    /* ------------------------------------------------------------------------
       VALIDATE CHART
    ------------------------------------------------------------------------ */

    if (!element) {
      showSnackbar(
        'Chart element could not be found.',
        'error'
      );

      return;
    }


    /* ------------------------------------------------------------------------
       FIND BEST CAPTURE AREA
    ------------------------------------------------------------------------ */

    const plotArea =
      element.querySelector('.recharts-responsive-container') ||
      element.querySelector('.abhitech-plot-area') ||
      element.querySelector('svg');


    if (plotArea) {
      const parent = plotArea.parentElement;

      if (
        parent &&
        parent.offsetHeight > 50 &&
        parent.offsetWidth > 50
      ) {
        element = parent;
      } else if (
        plotArea.offsetHeight > 50 &&
        plotArea.offsetWidth > 50
      ) {
        element = plotArea;
      }
    }


    setIsSaving(true);


    /* ------------------------------------------------------------------------
       SMALL DELAY ALLOWS UI TO SETTLE
    ------------------------------------------------------------------------ */

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });


    let temporaryIdAdded = false;


    try {
      /* ======================================================================
         PREPARE ELEMENT
      ====================================================================== */

      const originalId = element.id;

      const hasId = Boolean(originalId);


      if (!hasId) {
        element.id = 'html2canvas-temp-id';

        temporaryIdAdded = true;
      }


      /* ======================================================================
         CAPTURE VISUALIZATION
      ====================================================================== */

      const canvas = await html2canvas(element, {
        useCORS: true,

        scale: 2,

        backgroundColor: '#ffffff',

        logging: false,

        onclone: (clonedDoc) => {
          /*
           * Hide Recharts tooltips so hover states do not
           * accidentally appear in the exported image.
           */

          const tooltips = clonedDoc.querySelectorAll(
            '.recharts-tooltip-wrapper'
          );

          tooltips.forEach((tooltip) => {
            tooltip.style.display = 'none';
          });


          const elementToFind = hasId
            ? originalId
            : 'html2canvas-temp-id';


          if (!clonedDoc.getElementById(elementToFind)) {
            console.warn(
              `Element with ID ${elementToFind} not found in cloned document`
            );
          }
        },
      });


      /* ======================================================================
         REMOVE TEMPORARY ID
      ====================================================================== */

      if (temporaryIdAdded) {
        element.removeAttribute('id');

        temporaryIdAdded = false;
      }


      /* ======================================================================
         CANVAS → PNG BLOB
      ====================================================================== */

      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          'image/png'
        );
      });


      if (!blob) {
        throw new Error(
          'Failed to create visualization image.'
        );
      }


      /* ======================================================================
         CURRENT USER
      ====================================================================== */

      let employeeName = 'anonymous';


      try {
        const user = JSON.parse(
          localStorage.getItem('user') || '{}'
        );

        employeeName =
          user.name || 'anonymous';
      } catch (error) {
        console.warn(
          'Unable to read user from localStorage:',
          error
        );
      }


      /* ======================================================================
         DATE
      ====================================================================== */

      const now = new Date();


      const dateStr = now
        .toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/ /g, '-')
        .replace(',', '');


      const timeStr = now
        .toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        .replace(/[: ]/g, '-');


      /* ======================================================================
         FORMAT VISUALIZATION NAME
      ====================================================================== */

      const readablePrefix = fileNamePrefix
        .split('_')
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(' ');


      /* ======================================================================
         FORMAT VARIABLE NAMES
      ====================================================================== */

      let variableNamesStr = '';


      if (variableNames) {
        /*
         * Array of variables
         */

        if (Array.isArray(variableNames)) {
          const validVars = variableNames.filter(
            (variable) =>
              typeof variable === 'string' &&
              variable.trim() !== ''
          );


          if (validVars.length > 0) {
            const varsToShow = validVars.slice(0, 3);

            variableNamesStr = varsToShow.join(', ');


            if (validVars.length > 3) {
              variableNamesStr += '...';
            }
          }
        }

        /*
         * Single variable string
         */

        else if (
          typeof variableNames === 'string' &&
          variableNames.trim() !== ''
        ) {
          variableNamesStr = variableNames.trim();
        }
      }


      /* ======================================================================
         BUILD FILE NAME
      ====================================================================== */

      let fileName;


      if (variableNamesStr) {
        /*
         * Remove characters that are problematic in file names.
         */

        const sanitizedVars = variableNamesStr
          .replace(/[<>:"/\\|?*]/g, '_')
          .substring(0, 100);


        fileName =
          `AbhiStat/${employeeName}/` +
          `${readablePrefix} - ` +
          `${sanitizedVars} - ` +
          `${dateStr} at ${timeStr}.png`;
      } else {
        fileName =
          `AbhiStat/${employeeName}/` +
          `${readablePrefix} - ` +
          `${dateStr} at ${timeStr}.png`;
      }


      /* ======================================================================
         UPLOAD TO STORAGE
      ====================================================================== */

      const upload = new Upload({
        client: s3Client,

        params: {
          Bucket: BUCKET_NAME,

          Key: fileName,

          Body: blob,

          ContentType: 'image/png',
        },
      });


      await upload.done();


      /* ======================================================================
         SUCCESS
      ====================================================================== */

      showSnackbar(
        'Visualization saved successfully.',
        'success'
      );
    } catch (error) {
      console.error(
        'Error saving visualization:',
        error
      );


      showSnackbar(
        'Unable to save visualization. Please try again.',
        'error'
      );
    } finally {
      /*
       * Safety cleanup in case capture/upload failed after
       * adding the temporary ID.
       */

      if (temporaryIdAdded && element) {
        element.removeAttribute('id');
      }


      setIsSaving(false);
    }
  };


  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      {/* ======================================================================
          SAVE BUTTON
      ====================================================================== */}

      <Tooltip
        title={
          isSaving
            ? 'Saving visualization...'
            : 'Save this visualization'
        }
        arrow
        placement="top"
      >
        <span>
          <Button
            id="save-visualization-btn"
            variant="outlined"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save visualization"
            startIcon={
              isSaving ? (
                <CircularProgress
                  size={15}
                  thickness={5}
                  sx={{
                    color: 'inherit',
                  }}
                />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            sx={{
              ml: 1,

              minWidth: 94,
              minHeight: 36,

              px: 1.6,
              py: 0.7,

              borderRadius: '8px',

              borderColor: COLORS.border,

              backgroundColor: COLORS.white,

              color: COLORS.navy,

              fontSize: '0.72rem',

              fontWeight: 700,

              lineHeight: 1,

              letterSpacing: '-0.01em',

              textTransform: 'none',

              boxShadow:
                '0 1px 2px rgba(15, 23, 42, 0.04)',

              transition:
                'background-color 160ms ease, ' +
                'border-color 160ms ease, ' +
                'color 160ms ease, ' +
                'box-shadow 160ms ease, ' +
                'transform 160ms ease',

              '& .MuiButton-startIcon': {
                marginRight: '6px',

                '& svg': {
                  fontSize: 17,
                },
              },

              '&:hover': {
                backgroundColor: COLORS.primarySoft,

                borderColor: '#BFDBFE',

                color: COLORS.primary,

                boxShadow:
                  '0 3px 8px rgba(37, 99, 235, 0.10)',

                transform: 'translateY(-1px)',
              },

              '&:active': {
                transform: 'translateY(0)',

                boxShadow:
                  '0 1px 3px rgba(37, 99, 235, 0.08)',
              },

              '&.Mui-disabled': {
                backgroundColor: '#F8FAFC',

                borderColor: '#E2E8F0',

                color: COLORS.textSecondary,

                opacity: 0.8,
              },
            }}
          >
            {isSaving ? 'Saving' : 'Save'}
          </Button>
        </span>
      </Tooltip>


      {/* ======================================================================
          STATUS SNACKBAR
      ====================================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={{
          mb: 1,
          mr: {
            xs: 0,
            sm: 1,
          },
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          icon={
            snackbar.severity === 'success' ? (
              <CheckCircleRoundedIcon />
            ) : (
              <ErrorOutlineRoundedIcon />
            )
          }
          sx={{
            width: {
              xs: 'calc(100vw - 32px)',
              sm: 390,
            },

            alignItems: 'center',

            borderRadius: '10px',

            border:
              snackbar.severity === 'success'
                ? `1px solid ${COLORS.successBorder}`
                : `1px solid ${COLORS.errorBorder}`,

            backgroundColor:
              snackbar.severity === 'success'
                ? COLORS.successSoft
                : COLORS.errorSoft,

            color:
              snackbar.severity === 'success'
                ? '#065F46'
                : '#991B1B',

            boxShadow:
              '0 12px 30px rgba(15, 23, 42, 0.12)',

            '& .MuiAlert-icon': {
              color:
                snackbar.severity === 'success'
                  ? COLORS.success
                  : COLORS.error,

              alignItems: 'center',
            },

            '& .MuiAlert-action': {
              alignItems: 'center',
              pt: 0,
            },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 750,
                lineHeight: 1.35,
              }}
            >
              {snackbar.severity === 'success'
                ? 'Visualization Saved'
                : 'Save Failed'}
            </Typography>

            <Typography
              sx={{
                mt: 0.15,

                color: 'inherit',

                fontSize: '0.62rem',

                lineHeight: 1.45,

                opacity: 0.85,
              }}
            >
              {snackbar.message}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};


export default SaveVisualizationButton;