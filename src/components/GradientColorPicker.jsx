import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Slider,
  Grid,
  Tooltip
} from "@mui/material";
import ReactDOM from "react-dom";

const hexToRgba = (hex, alpha = 1) => {
  hex = hex.replace('#', '');
  
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const rgbaToHexAndAlpha = (rgba) => {
  const rgbaRegex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*([\d.]+)?\s*\)/i;
  const match = rgba.match(rgbaRegex);
  
  if (!match) return { hex: '#000000', alpha: 1 };
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
  
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    alpha: a
  };
};

const createGradientString = (colors, direction = 'to right') => {
  if (!colors || colors.length === 0) return 'transparent';
  if (colors.length === 1) return colors[0].color;
  
  const sortedColors = [...colors].sort((a, b) => a.position - b.position);
  const colorStops = sortedColors.map(stop => `${stop.color} ${stop.position * 100}%`).join(', ');
  
  return `linear-gradient(${direction}, ${colorStops})`;
};

const GradientColorPicker = ({ 
  value, 
  onChange, 
  label, 
  swatchSize = 40, 
  colorOptions = [],
  portalZIndex = 30000,
  direction = 'to right'
}) => {
  const [isGradient, setIsGradient] = useState(value.includes('gradient'));
  
  const initializeColorStops = () => {
    if (value.includes('gradient')) {
      const gradientRegex = /linear-gradient\(([^,]+),\s*(.+)\)/;
      const match = value.match(gradientRegex);
      
      if (match) {
        const colorStopsString = match[2];
        const colorStopRegex = /([^\s]+)\s+(\d+)%/g;
        let colorStopMatch;
        const stops = [];
        
        while ((colorStopMatch = colorStopRegex.exec(colorStopsString)) !== null) {
          const color = colorStopMatch[1];
          const position = parseInt(colorStopMatch[2], 10) / 100;
          stops.push({ color, position });
        }
        
        return stops.length > 0 ? stops : [{ color: '#3B82F6', position: 0 }, { color: '#EF4444', position: 1 }];
      }
    }
    
    const { hex, alpha } = value.includes('rgba') ? rgbaToHexAndAlpha(value) : { hex: value, alpha: 1 };
    const color = alpha < 1 ? hexToRgba(hex, alpha) : hex;
    return [{ color, position: 0 }, { color, position: 1 }];
  };
  
  const [colorStops, setColorStops] = useState(initializeColorStops);
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  
  const swatchRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, positionAbove: false, arrowLeftOffset: 20 });
  
  useEffect(() => {
    if (isGradient) {
      setTempValue(createGradientString(colorStops, direction));
    } else {
      setTempValue(colorStops[0]?.color || '#000000');
    }
  }, [colorStops, isGradient, direction]);
  
  const handleOpen = () => {
    if (swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const editorHeight = 500;
      const editorWidth = 320;
      
      const positionAbove = spaceAbove > spaceBelow || spaceBelow < editorHeight;
      
      let leftPos = rect.left + window.scrollX;
      let arrowLeftOffset = 20;
      
      if (leftPos + editorWidth > window.innerWidth) {
        const shift = (leftPos + editorWidth) - (window.innerWidth - 20);
        leftPos = Math.max(0, leftPos - shift);
        
        arrowLeftOffset = Math.min(rect.width / 2 + (rect.left - leftPos), editorWidth - 40);
      }
      
      let topPos;
      if (positionAbove) {
        topPos = Math.max(20, rect.top + window.scrollY - editorHeight);
      } else {
        const proposedBottom = rect.bottom + window.scrollY + editorHeight;
        if (proposedBottom > window.innerHeight + window.scrollY) {
          topPos = Math.max(20, window.innerHeight + window.scrollY - editorHeight - 20);
        } else {
          topPos = rect.bottom + window.scrollY;
        }
      }
      
      setDropdownPos({
        top: topPos,
        left: leftPos,
        positionAbove,
        arrowLeftOffset
      });
    }
    setIsOpen(true);
  };
  
  const handleApply = () => {
    onChange(tempValue);
    setIsOpen(false);
  };
  
  const handleCancel = () => {
    setIsGradient(value.includes('gradient'));
    setColorStops(initializeColorStops());
    setTempValue(value);
    setIsOpen(false);
  };
  
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColorStops(stops => {
      const newStops = [...stops];
      newStops[selectedStopIndex] = { ...newStops[selectedStopIndex], color: newColor };
      return newStops;
    });
  };
  
  const handleAlphaChange = (e, newValue) => {
    const stop = colorStops[selectedStopIndex];
    if (!stop) return;
    
    const { hex } = rgbaToHexAndAlpha(stop.color);
    const newColor = hexToRgba(hex, newValue);
    
    setColorStops(stops => {
      const newStops = [...stops];
      newStops[selectedStopIndex] = { ...newStops[selectedStopIndex], color: newColor };
      return newStops;
    });
  };
  
  const handlePositionChange = (e, newValue) => {
    setColorStops(stops => {
      const newStops = [...stops];
      newStops[selectedStopIndex] = { ...newStops[selectedStopIndex], position: newValue };
      return newStops;
    });
  };
  
  const handleAddColorStop = () => {
    const newPosition = colorStops.length > 1 
      ? (colorStops[0].position + colorStops[colorStops.length - 1].position) / 2 
      : 0.5;
      
    const newColor = colorOptions.length > 0 
      ? colorOptions[Math.floor(Math.random() * colorOptions.length)] 
      : '#00BCD4';
      
    setColorStops([...colorStops, { color: newColor, position: newPosition }]);
    setSelectedStopIndex(colorStops.length);
  };
  
  const handleRemoveColorStop = () => {
    if (colorStops.length <= 2) return;
    
    setColorStops(stops => {
      const newStops = stops.filter((_, index) => index !== selectedStopIndex);
      return newStops;
    });
    
    setSelectedStopIndex(Math.max(0, selectedStopIndex - 1));
  };
  
  const handleToggleGradient = () => {
    setIsGradient(!isGradient);
  };
  
  const getRgbaValues = () => {
    const stop = colorStops[selectedStopIndex];
    if (!stop) return { r: 0, g: 0, b: 0, a: 1 };
    
    const rgbaRegex = /rgba?\(\s*(\d+)\s*,\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*([\d.]+)?\s*\)/i;
    const match = stop.color.match(rgbaRegex);
    
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] !== undefined ? parseFloat(match[4]) : 1
      };
    }
    
    const { hex, alpha } = rgbaToHexAndAlpha(stop.color);
    const hexWithoutHash = hex.replace('#', '');
    
    return {
      r: parseInt(hexWithoutHash.substring(0, 2), 16),
      g: parseInt(hexWithoutHash.substring(2, 4), 16),
      b: parseInt(hexWithoutHash.substring(4, 6), 16),
      a: alpha
    };
  };
  
  const selectedStop = colorStops[selectedStopIndex];
  const { hex, alpha } = selectedStop ? rgbaToHexAndAlpha(selectedStop.color) : { hex: '#000000', alpha: 1 };
  
  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        ref={swatchRef}
        onClick={handleOpen}
        sx={{
          width: swatchSize,
          height: swatchSize,
          background: isGradient ? createGradientString(colorStops, direction) : colorStops[0]?.color || '#000000',
          border: '2px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          }
        }}
      />
      <Box sx={{ flex: 1, minWidth: '120px' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: '0.875rem' }}>{label}</Typography>
        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
          {isGradient ? 'Gradient' : (alpha < 1 ? 'RGBA' : hex.toUpperCase())}
        </Typography>
      </Box>
      
      {isOpen && ReactDOM.createPortal(
        <Box
          sx={{
            position: 'absolute',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: portalZIndex,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            width: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              border: '8px solid transparent',
              borderTopColor: dropdownPos.positionAbove ? 'transparent' : 'white',
              borderBottomColor: dropdownPos.positionAbove ? 'white' : 'transparent',
              top: dropdownPos.positionAbove ? 'auto' : '-16px',
              bottom: dropdownPos.positionAbove ? '-16px' : 'auto',
              left: `${dropdownPos.arrowLeftOffset}px`,
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              border: '9px solid transparent',
              borderTopColor: dropdownPos.positionAbove ? 'transparent' : '#ddd',
              borderBottomColor: dropdownPos.positionAbove ? '#ddd' : 'transparent',
              top: dropdownPos.positionAbove ? 'auto' : '-18px',
              bottom: dropdownPos.positionAbove ? '-18px' : 'auto',
              left: `${dropdownPos.arrowLeftOffset - 1}px`,
              zIndex: 0
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Color Editor</Typography>
          
          {/* Gradient Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2">Use Gradient</Typography>
            <Button 
              variant={isGradient ? "contained" : "outlined"} 
              size="small"
              onClick={handleToggleGradient}
              sx={{ minWidth: '100px' }}
            >
              {isGradient ? "Gradient" : "Solid"}
            </Button>
          </Box>
          
          {/* Gradient Preview */}
          <Box 
            sx={{
              height: '40px',
              borderRadius: '8px',
              mb: 2,
              background: isGradient ? createGradientString(colorStops, direction) : colorStops[0]?.color || '#000000',
              border: '2px solid #ddd',
              position: 'relative'
            }}
          >
            {isGradient && colorStops.map((stop, index) => (
              <Tooltip key={index} title={`Position: ${Math.round(stop.position * 100)}%`} arrow>
                <Box
                  sx={{
                    position: 'absolute',
                    left: `calc(${stop.position * 100}% - 8px)`,
                    top: '40px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: stop.color,
                    border: index === selectedStopIndex ? '2px solid #1976d2' : '2px solid #ddd',
                    cursor: 'pointer',
                    zIndex: index === selectedStopIndex ? 2 : 1,
                    boxShadow: index === selectedStopIndex ? '0 0 0 2px rgba(25, 118, 210, 0.3)' : 'none',
                    transform: index === selectedStopIndex ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onClick={() => setSelectedStopIndex(index)}
                />
              </Tooltip>
            ))}
          </Box>
          
          {/* Color Controls */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>Color</Typography>
              <input
                type="color"
                value={hex}
                onChange={handleColorChange}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>Hex</Typography>
              <TextField
                size="small"
                value={hex}
                onChange={handleColorChange}
                fullWidth
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
          </Grid>
          
          {/* RGBA Controls */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>Opacity: {alpha.toFixed(2)}</Typography>
              <Slider
                value={alpha}
                min={0}
                max={1}
                step={0.01}
                onChange={handleAlphaChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value.toFixed(2)}
              />
            </Grid>
          </Grid>
          
          {isGradient && (
            <>
              {/* Position Control */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Position: {Math.round(selectedStop?.position * 100 || 0)}%
                </Typography>
                <Slider
                  value={selectedStop?.position || 0}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={handlePositionChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Box>
              
              {/* Add/Remove Color Stops */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleAddColorStop}
                  fullWidth
                >
                  Add Color Stop
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleRemoveColorStop}
                  fullWidth
                  disabled={colorStops.length <= 2}
                >
                  Remove Stop
                </Button>
              </Box>
            </>
          )}
          
          {/* Preset Colors */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Preset Colors</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  onClick={() => {
                    if (isGradient) {
                      setColorStops(stops => {
                        const newStops = [...stops];
                        newStops[selectedStopIndex] = { ...newStops[selectedStopIndex], color };
                        return newStops;
                      });
                    } else {
                      setColorStops([{ color, position: 0 }, { color, position: 1 }]);
                    }
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: color,
                    border: selectedStop?.color === color ? '3px solid #1976d2' : '2px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleCancel}>Cancel</Button>
            <Button size="small" variant="contained" onClick={handleApply}>Apply</Button>
          </Box>
        </Box>,
        document.body
      )}
    </Box>
  );
};

export default GradientColorPicker;