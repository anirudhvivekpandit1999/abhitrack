import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardMedia,
  CardActionArea,
  Grid,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, PUBLIC_URL } from '../utils/s3Client';
import { useAuth } from '../hooks/useAuth';
import { getAuthData } from '../utils/authUtils';
import JSZip from 'jszip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import SelectAllIcon from '@mui/icons-material/SelectAll';

const VISUALIZATION_TYPES = [
  'All',
  'Distribution Curve',
  'Scatter Plot',
  'Multivariate Scatter',
  'Bootstrapping',
  'Correlation Analysis'
];

const SavedVisualizationsList = ({ open, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [visualizations, setVisualizations] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const currentUser = useMemo(() => {
    try {
      if (user?.name) {
        return user.name;
      }
      const authData = getAuthData();
      if (authData?.user?.name) {
        return authData.user.name;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, [user]);

  const fetchVisualizations = useCallback(async () => {
    if (!currentUser) {
      setVisualizations([]);
      return;
    }

    setLoading(true);
    try {
      const userPrefix = `AbhiStat/${currentUser}/`;
      
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: userPrefix,
      });

      const response = await s3Client.send(command);
      const files = response.Contents || [];
      
      let allFiles = files;
      if (files.length === 0) {
        const allCommand = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: 'AbhiStat/',
        });
        const allResponse = await s3Client.send(allCommand);
        const allFilesList = allResponse.Contents || [];
        
        const userNameLower = currentUser.toLowerCase().trim();
        const userNameVariations = [
          userNameLower,
          userNameLower.replace(/\s+/g, '-'),
          userNameLower.replace(/\s+/g, '_'),
          currentUser.trim()
        ];
        
        const userFiles = allFilesList.filter(file => {
          const key = file.Key;
          if (key.startsWith(`AbhiStat/${currentUser}/`) || key.startsWith(`AbhiStat/${currentUser.trim()}/`)) {
            return true;
          }
          const pathAfterAbhiStat = key.replace('AbhiStat/', '').split('/')[0];
          return userNameVariations.some(variation => 
            pathAfterAbhiStat.toLowerCase() === variation.toLowerCase()
          );
        });
        
        if (userFiles.length > 0) {
          allFiles = userFiles;
        }
      }
      
      const mappedFiles = allFiles
        .filter(file => file.Key.endsWith('.png'))
        .sort((a, b) => b.LastModified - a.LastModified)
        .map(file => {
          let displayName = '';
          let username = currentUser;
          
          if (file.Key.startsWith(userPrefix)) {
            const pathParts = file.Key.replace(userPrefix, '').split('/');
            const fileName = pathParts[pathParts.length - 1];
            displayName = fileName.replace('.png', '');
          } else {
            const pathParts = file.Key.replace('AbhiStat/', '').split('/');
            if (pathParts.length > 1) {
              username = pathParts[0];
              displayName = pathParts[pathParts.length - 1].replace('.png', '');
            } else {
              displayName = pathParts[0].replace('.png', '');
            }
          }
          
          let type = 'Other';
          if (displayName.includes('Distribution Curve')) type = 'Distribution Curve';
          else if (displayName.includes('Scatter Plot')) type = 'Scatter Plot';
          else if (displayName.includes('Multivariate Scatter')) type = 'Multivariate Scatter';
          else if (displayName.includes('Bootstrapping')) type = 'Bootstrapping';
          else if (displayName.includes('Correlation Analysis')) type = 'Correlation Analysis';

          const dateStr = file.LastModified.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return {
            key: file.Key,
            name: displayName,
            displayName: displayName,
            username: username,
            type: type,
            url: `${PUBLIC_URL}/${file.Key}`,
            lastModified: file.LastModified,
            dateStr,
            dateIso: file.LastModified.toISOString().split('T')[0]
          };
        });

      setVisualizations(mappedFiles);
    } catch (error) {
      setVisualizations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (open && currentUser) {
      fetchVisualizations();
    } else if (open && !currentUser) {
      setVisualizations([]);
    }
  }, [open, currentUser, fetchVisualizations]);

  const filteredVisualizations = useMemo(() => {
    return visualizations.filter(viz => {
      const matchesType = typeFilter === 'All' || viz.type === typeFilter;
      const matchesDate = !dateFilter || viz.dateIso === dateFilter;
      
      return matchesType && matchesDate;
    });
  }, [visualizations, typeFilter, dateFilter]);

  const handleSelectAll = () => {
    if (selectedItems.size === filteredVisualizations.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredVisualizations.map(viz => viz.key)));
    }
  };

  const handleToggleSelect = (key) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const allSelected = filteredVisualizations.length > 0 && selectedItems.size === filteredVisualizations.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < filteredVisualizations.length;

  const extractS3KeyFromUrl = (url) => {
    try {
      const publicUrl = PUBLIC_URL;
      const e2eBaseUrl = `${publicUrl}/`;
      if (url.startsWith(e2eBaseUrl)) {
        return url.replace(e2eBaseUrl, '');
      }
      const awsPattern = /https:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\//;
      if (awsPattern.test(url)) {
        return url.replace(awsPattern, '');
      }

      const urlObj = new URL(url);
      return urlObj.pathname.substring(1);
    } catch (error) {
      throw new Error('Invalid storage URL format');
    }
  };

  const downloadImageAsBlob = async (url, s3Key = null) => {
    try {
      const key = s3Key || extractS3KeyFromUrl(url);
      
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      let blob;
      
      if (response.Body && typeof response.Body.transformToByteArray === 'function') {
        const byteArray = await response.Body.transformToByteArray();
        blob = new Blob([byteArray], { type: 'image/png' });
      } else if (response.Body && typeof response.Body.getReader === 'function') {
        const chunks = [];
        const reader = response.Body.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        blob = new Blob([combined], { type: 'image/png' });
      } else if (response.Body && typeof response.Body.arrayBuffer === 'function') {
        const arrayBuffer = await response.Body.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: 'image/png' });
      } else {
        const chunks = [];
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
        blob = new Blob(chunks, { type: 'image/png' });
      }
      
      return blob;
    } catch (error) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.blob();
        }
        throw new Error('Fetch also failed');
      } catch (fetchError) {
        throw new Error('Failed to download image');
      }
    }
  };

  const handleBulkDownload = async () => {
    const selectedVizs = filteredVisualizations.filter(viz => selectedItems.has(viz.key));
    
    if (selectedVizs.length > 1) {
      try {
        const zip = new JSZip();
        
        for (const viz of selectedVizs) {
          try {
            const blob = await downloadImageAsBlob(viz.url, viz.key);
            const sanitizedName = viz.name.replace(/[<>:"/\\|?*]/g, '_') + '.png';
            zip.file(sanitizedName, blob);
          } catch (error) {
            console.error(`Failed to download ${viz.name}:`, error);
          }
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const zipUrl = window.URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = zipUrl;
        
        const username = currentUser || 'User';
        const sanitizedUsername = username.replace(/[<>:"/\\|?*]/g, '_');
        link.download = `${sanitizedUsername}-Saved Visualizations.zip`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(zipUrl);
      } catch (error) {
        console.error('Failed to create zip file:', error);
        for (let i = 0; i < selectedVizs.length; i++) {
          await handleDownload(selectedVizs[i].url, selectedVizs[i].name, selectedVizs[i].key);
          if (i < selectedVizs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
    } else {
      if (selectedVizs.length === 1) {
        await handleDownload(selectedVizs[0].url, selectedVizs[0].name, selectedVizs[0].key);
      }
    }
  };

  const handleDownload = async (url, name, s3Key = null) => {
    try {
      const key = s3Key || extractS3KeyFromUrl(url);
      
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      let blob;
      
      if (response.Body && typeof response.Body.transformToByteArray === 'function') {
        const byteArray = await response.Body.transformToByteArray();
        blob = new Blob([byteArray], { type: 'image/png' });
      } else if (response.Body && typeof response.Body.getReader === 'function') {
        const chunks = [];
        const reader = response.Body.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        blob = new Blob([combined], { type: 'image/png' });
      } else if (response.Body && typeof response.Body.arrayBuffer === 'function') {
        const arrayBuffer = await response.Body.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: 'image/png' });
      } else {
        const chunks = [];
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
        blob = new Blob(chunks, { type: 'image/png' });
      }
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${name}.png`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${name}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } else {
          throw new Error('Fetch also failed');
        }
      } catch (fetchError) {
        window.open(url, '_blank');
      }
    }
  };

  const resetFilters = () => {
    setTypeFilter('All');
    setDateFilter('');
    setSelectedItems(new Set());
  };

  useEffect(() => {
    setSelectedItems(new Set());
  }, [typeFilter, dateFilter]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterListIcon color="primary" />
              <Typography variant="h6">Saved Visualizations</Typography>
            </Box>
            {currentUser && (
              <Typography variant="caption" color="textSecondary" sx={{ ml: 4 }}>
                Showing visualizations for: <strong>{currentUser}</strong>
              </Typography>
            )}
          </Box>
          <Box>
            <IconButton onClick={fetchVisualizations} disabled={loading} size="small" title="Refresh">
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="type-filter-label">Plot Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Plot Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {VISUALIZATION_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {currentUser && (
              <Chip 
                label={`User: ${currentUser}`} 
                color="primary" 
                variant="outlined"
                size="small"
                icon={<AccountCircleIcon />}
              />
            )}
            
            <TextField
              label="Date"
              type="date"
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            
            <Button 
              variant="text" 
              size="small" 
              onClick={resetFilters}
              disabled={typeFilter === 'All' && !dateFilter}
            >
              Reset Filters
            </Button>
            
            <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto !important' }}>
              Showing {filteredVisualizations.length} of {visualizations.length}
            </Typography>
          </Stack>
        </Box>
        
        <Divider />
        
        {/* Selection Controls */}
        {filteredVisualizations.length > 0 && (
          <>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Typography>
                  }
                />
                {selectedItems.size > 0 && (
                  <>
                    <Chip 
                      label={`${selectedItems.size} selected`} 
                      color="primary" 
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={handleBulkDownload}
                    >
                      Download Selected
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setSelectedItems(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
            <Divider />
          </>
        )}
        
        <DialogContent sx={{ minHeight: '400px', bgcolor: '#f5f5f5' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : filteredVisualizations.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px" flexDirection="column" gap={1}>
              <Typography color="textSecondary">No visualizations match your filters.</Typography>
              {(typeFilter !== 'All' || dateFilter) && (
                <Button variant="outlined" size="small" onClick={resetFilters}>Clear Filters</Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredVisualizations.map((viz) => {
                const isSelected = selectedItems.has(viz.key);
                return (
                  <Grid item xs={12} sm={6} md={4} key={viz.key}>
                    <Card 
                      elevation={isSelected ? 4 : 2} 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        border: isSelected ? '2px solid' : 'none',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSelect(viz.key)}
                          onClick={(e) => e.stopPropagation()}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          sx={{ 
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' }
                          }}
                        />
                      </Box>
                      <CardActionArea onClick={() => setSelectedImage(viz)} sx={{ flexGrow: 1 }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={viz.url}
                          alt={viz.name}
                          sx={{ objectFit: 'contain', bgcolor: '#fff', p: 1 }}
                        />
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.4em'
                          }} title={viz.displayName}>
                            {viz.displayName}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                            <AccountCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              {viz.username}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            {viz.dateStr}
                          </Typography>
                        </Box>
                      </CardActionArea>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5, bgcolor: 'background.paper' }}>
                        <Tooltip title="View Large">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(viz);
                          }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(viz.url, viz.name, viz.key);
                          }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedItems.size > 0 && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleBulkDownload}
            >
              Download {selectedItems.size} Selected
            </Button>
          )}
          <Button onClick={onClose} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog 
        open={Boolean(selectedImage)} 
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>{selectedImage?.displayName}</Typography>
            <Typography variant="caption" color="textSecondary">Saved by: {selectedImage?.username}</Typography>
          </Box>
          <IconButton onClick={() => setSelectedImage(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1, bgcolor: '#f0f0f0' }}>
          {selectedImage && (
            <img 
              src={selectedImage.url} 
              alt={selectedImage.name} 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '80vh', objectFit: 'contain' }} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload(selectedImage.url, selectedImage.name, selectedImage.key)}
          >
            Download
          </Button>
          <Button onClick={() => setSelectedImage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavedVisualizationsList;
