import React, { useState } from 'react';
import { Button, CircularProgress, Tooltip, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import html2canvas from 'html2canvas';
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client, BUCKET_NAME } from '../utils/s3Client';

const SaveVisualizationButton = ({ elementId, fileNamePrefix = 'visualization', variableNames }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    let element = document.getElementById(elementId);
    if (!element) {
      setSnackbar({ open: true, message: 'Chart element not found', severity: 'error' });
      return;
    }

    const plotArea = element.querySelector('.recharts-responsive-container') || 
                    element.querySelector('.abhitech-plot-area') ||
                    element.querySelector('svg');
    
    if (plotArea) {
      const parent = plotArea.parentElement;
      if (parent && parent.offsetHeight > 50 && parent.offsetWidth > 50) {
        element = parent;
      } else if (plotArea.offsetHeight > 50 && plotArea.offsetWidth > 50) {
        element = plotArea;
      }
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const originalId = element.id;
      const hasId = !!originalId;
      if (!hasId) {
        element.id = 'html2canvas-temp-id';
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const tooltips = clonedDoc.querySelectorAll('.recharts-tooltip-wrapper');
          tooltips.forEach(t => t.style.display = 'none');
          
          const elementToFind = hasId ? originalId : 'html2canvas-temp-id';
          if (!clonedDoc.getElementById(elementToFind)) {
            console.warn(`Element with ID ${elementToFind} not found in cloned document`);
          }
        }
      });

      if (!hasId) {
        element.removeAttribute('id');
      }
      
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create image blob');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const employeeName = user.name || 'anonymous';
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).replace(/ /g, '-').replace(',', '');
      
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }).replace(/[: ]/g, '-');
      
      const readablePrefix = fileNamePrefix
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format variable names for filename
      let variableNamesStr = '';
      if (variableNames) {
        if (Array.isArray(variableNames)) {
          // Filter out empty values and join with comma
          const validVars = variableNames.filter(v => v && v.trim() !== '');
          if (validVars.length > 0) {
            // Limit to first 3 variables to keep filename manageable
            const varsToShow = validVars.slice(0, 3);
            variableNamesStr = varsToShow.join(', ');
            if (validVars.length > 3) {
              variableNamesStr += '...';
            }
          }
        } else if (typeof variableNames === 'string' && variableNames.trim() !== '') {
          variableNamesStr = variableNames.trim();
        }
      }
      
      // Build filename with variable names if available
      let fileName;
      if (variableNamesStr) {
        // Sanitize variable names for filename (remove special characters, limit length)
        const sanitizedVars = variableNamesStr
          .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid filename characters
          .substring(0, 100); // Limit length
        fileName = `AbhiStat/${employeeName}/${readablePrefix} - ${sanitizedVars} - ${dateStr} at ${timeStr}.png`;
      } else {
        fileName = `AbhiStat/${employeeName}/${readablePrefix} - ${dateStr} at ${timeStr}.png`;
      }

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
      setSnackbar({ open: true, message: 'Visualization saved successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error saving visualization:', error);
      setSnackbar({ open: true, message: 'Failed to save visualization', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Tooltip title="Save Visualization">
        <Button
          variant="outlined"
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
          size="small"
          sx={{ ml: 1 }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Tooltip>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SaveVisualizationButton;
