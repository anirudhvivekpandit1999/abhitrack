import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import RestoreIcon from "@mui/icons-material/Restore";
import GradientColorPicker from "./GradientColorPicker";

const ChartSettingsModal = ({
  open,
  onClose,
  onApply,
  onReset,
  colorPairs = [],
  colorOptions = [],
  featureSections = [],
  colorSection = true,
  title = "Chart Settings",
  description = "Customize your visualization appearance",
  minHeight = 600,
  maxWidth = "lg",
  multiDatasetColors = false,
  children
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth
      PaperProps={{ sx: { borderRadius: '16px', minHeight, backgroundColor: '#fafafa' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pb: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: 'white', borderRadius: '16px 16px 0 0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>{title}</Typography>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>{description}</Typography>
          </Box>
        </Box>
        <MuiTooltip title="Reset to Default">
          <IconButton onClick={onReset} sx={{ color: '#666' }}><RestoreIcon /></IconButton>
        </MuiTooltip>
      </DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor: '#fafafa', maxHeight: '60vh', overflowY: 'auto' }}>
        <Box sx={{ p: 3 }}>
          {featureSections.map((section, idx) => (
            <Card key={idx} sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>{section}</CardContent>
            </Card>
          ))}
          {colorSection && (
            <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                  {multiDatasetColors ? 'Dataset Colors by Variable Pair' : 'Variable Pair Colors'}
                </Typography>
                {colorPairs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, backgroundColor: '#f5f5f5', borderRadius: '8px', border: '2px dashed #ddd' }}>
                    <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>No variable pairs available</Typography>
                    <Typography variant="body2" sx={{ color: '#999' }}>Select X and Y variables to customize colors</Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {colorPairs.map((pair) => (
                      <Grid item xs={12} sm={6} md={multiDatasetColors ? 6 : 4} key={pair.key}>
                        {multiDatasetColors ? (
                          <Card sx={{ p: 2, borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', backgroundColor: '#fafafa' }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#333', textAlign: 'center' }}>
                              {pair.label}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <GradientColorPicker
                                value={pair.withProductColor}
                                onChange={color => pair.onWithProductColorChange(color)}
                                label="With Product"
                                colorOptions={colorOptions}
                              />
                              <GradientColorPicker
                                value={pair.withoutProductColor}
                                onChange={color => pair.onWithoutProductColorChange(color)}
                                label="Without Product"
                                colorOptions={colorOptions}
                              />
                            </Box>
                          </Card>
                        ) : (
                          <GradientColorPicker
                            value={pair.value}
                            onChange={color => pair.onChange(color)}
                            label={pair.label}
                            colorOptions={colorOptions}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          )}
          {children}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', backgroundColor: 'white', borderRadius: '0 0 16px 16px', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onReset} startIcon={<RestoreIcon />} sx={{ color: '#666' }}>Reset</Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#ddd', color: '#666', '&:hover': { borderColor: '#999', backgroundColor: '#f5f5f5' } }}>Cancel</Button>
          <Button onClick={onApply} variant="contained" sx={{ backgroundColor: '#1976d2', boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)', '&:hover': { backgroundColor: '#1565c0' } }}>Apply Changes</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChartSettingsModal;