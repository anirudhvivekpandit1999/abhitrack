import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import DebouncedTextField from '../DebouncedTextField';
import { useLocation } from "react-router-dom"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Autocomplete,
  Paper,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip as MuiTooltip,
  Button,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import ZoomInIcon from "@mui/icons-material/ZoomIn"
import ZoomOutIcon from "@mui/icons-material/ZoomOut"
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong"
import PanToolIcon from "@mui/icons-material/PanTool"
import RefreshIcon from "@mui/icons-material/Refresh"
import SettingsIcon from "@mui/icons-material/Settings"
import AnalyticsIcon from "@mui/icons-material/Analytics"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import InfoIcon from "@mui/icons-material/Info"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import BarChartIcon from "@mui/icons-material/BarChart"
import * as d3 from "d3"
import logo from "../../assets/abhitech-logo.png"
import html2canvas from "html2canvas"
import ChartSettingsModal from '../ChartSettingsModal'
import SaveVisualizationButton from '../SaveVisualizationButton'

const ScatterPlotTab = ({ withProductData, withoutProductData, clientName = '', plantName = '', productName = '' }) => {
  const location = useLocation()
  const { dependentVariables = [], independentVariables = [] } = location.state || {}

  const [selectedDependentVar, setSelectedDependentVar] = useState("")
  const [selectedIndependentVar, setSelectedIndependentVar] = useState("")
  const [datasetView, setDatasetView] = useState("both")

  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showSummaryCards, setShowSummaryCards] = useState(false)

  const [customXRange, setCustomXRange] = useState({ min: "", max: "", auto: true })
  const [customYRange, setCustomYRange] = useState({ min: "", max: "", auto: true })
  const [scatterLegendLabels, setScatterLegendLabels] = useState({
    withProduct: 'With Product',
    withoutProduct: 'Without Product',
  })
  const [scatterXAxisLabel, setScatterXAxisLabel] = useState('')
  const [scatterYAxisLabel, setScatterYAxisLabel] = useState('')
  const [scatterColors, setScatterColors] = useState({
    withProduct: '#4caf50',
    withoutProduct: '#f44336',
  })

  const [showTrendLines, setShowTrendLines] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showOutliers, setShowOutliers] = useState(false)
  const [pointSize, setPointSize] = useState(4)
  const [opacity, setOpacity] = useState(0.7)
  const [showCorrelation, setShowCorrelation] = useState(false)

  const [draftSettings, setDraftSettings] = useState(null)

  const [filterColumn, setFilterColumn] = useState('')
  const [filterMin, setFilterMin] = useState('')

  // Generate custom filename based on project information
  const generateFileName = (visualizationName) => {
    const parts = [];
    if (clientName) parts.push(clientName.replace(/\s+/g, '_'));
    if (plantName) parts.push(plantName.replace(/\s+/g, '_'));
    if (productName) parts.push(productName.replace(/\s+/g, '_'));
    parts.push(visualizationName.replace(/\s+/g, '_'));
    return parts.join('-');
  };
  const [filterMax, setFilterMax] = useState('')

  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const zoomRef = useRef(null)
  const plotGroupRef = useRef(null)
  const zoomRectRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null })
  const pageRef = useRef(null)

  useEffect(() => {
    if (dependentVariables.length > 0) {
      setSelectedDependentVar(dependentVariables[0])
    }
    if (independentVariables.length > 0) {
      setSelectedIndependentVar(independentVariables[0])
    }
  }, [dependentVariables, independentVariables])

  useEffect(() => {
    setScatterXAxisLabel(selectedIndependentVar || '')
    setScatterYAxisLabel(selectedDependentVar || '')
  }, [selectedIndependentVar, selectedDependentVar])

  const isDateTimeColumn = (data, columnName) => {
    if (!data || !Array.isArray(data) || data.length === 0 || !columnName) return false

    const sampleValues = data
      .slice(0, 10)
      .map((row) => row[columnName])
      .filter((val) => val != null)
    if (sampleValues.length === 0) return false

    return sampleValues.every((val) => {
      const str = String(val).trim()
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2}([\sT]\d{2}:\d{2}:\d{2}(\.\d{3})?)?$/
      return dateTimeRegex.test(str) && !isNaN(Date.parse(str))
    })
  }

  const parseValue = (value, isDateTime) => {
    if (isDateTime) {
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date.getTime()
    }
    const num = Number(value)
    return isNaN(num) ? null : num
  }

  const formatValue = (value, isDateTime) => {
    if (isDateTime) {
      const date = new Date(value)
      const dateStr = date.toISOString().split("T")[0]
      const timeStr = date.toTimeString().split(" ")[0]
      return timeStr === "00:00:00" ? dateStr : `${dateStr} ${timeStr}`
    }
    return typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : value
  }

  const parseDateTimeFromInput = (inputValue) => {
    if (!inputValue) return null
    const date = new Date(inputValue)
    return isNaN(date.getTime()) ? null : date.getTime()
  }

  const availableColumnsForFilter = useMemo(() => {
    const all = [...(withProductData || []), ...(withoutProductData || [])]
    const first = all.find(r => r && typeof r === 'object')
    return first ? Object.keys(first) : []
  }, [withProductData, withoutProductData])

  const columnIsDateTime = useMemo(() => {
    const all = [...(withProductData || []), ...(withoutProductData || [])]
    return isDateTimeColumn(all, filterColumn)
  }, [withProductData, withoutProductData, filterColumn])

  const filteredWithProductData = useMemo(() => {
    if (!filterColumn) return withProductData || []
    const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null)
    const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null)
    
    if (minVal == null && maxVal == null) return withProductData || []
    
    return (withProductData || []).filter(row => {
      const raw = row?.[filterColumn]
      if (raw == null) return false
      const v = parseValue(raw, columnIsDateTime)
      if (v == null) return false
      if (minVal != null && v < minVal) return false
      if (maxVal != null && v > maxVal) return false
      return true
    })
  }, [withProductData, filterColumn, filterMin, filterMax, columnIsDateTime])

  const filteredWithoutProductData = useMemo(() => {
    if (!filterColumn) return withoutProductData || []
    const minVal = columnIsDateTime ? (filterMin ? parseDateTimeFromInput(filterMin) : null) : (filterMin !== '' ? Number.parseFloat(filterMin) : null)
    const maxVal = columnIsDateTime ? (filterMax ? parseDateTimeFromInput(filterMax) : null) : (filterMax !== '' ? Number.parseFloat(filterMax) : null)
    
    if (minVal == null && maxVal == null) return withoutProductData || []
    
    return (withoutProductData || []).filter(row => {
      const raw = row?.[filterColumn]
      if (raw == null) return false
      const v = parseValue(raw, columnIsDateTime)
      if (v == null) return false
      if (minVal != null && v < minVal) return false
      if (maxVal != null && v > maxVal) return false
      return true
    })
  }, [withoutProductData, filterColumn, filterMin, filterMax, columnIsDateTime])

  const resetLocalFilter = () => {
    setFilterColumn('')
    setFilterMin('')
    setFilterMax('')
  }

  const processScatterData = (data, xKey, yKey) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }

    if (!xKey || !yKey) {
      return []
    }

    const allData = [...(withProductData || []), ...(withoutProductData || [])]
    const isXDateTime = isDateTimeColumn(allData, xKey)
    const isYDateTime = isDateTimeColumn(allData, yKey)

    const processed = data
      .filter((row) => row && typeof row === "object")
      .map((row, index) => {
        const xVal = row[xKey]
        const yVal = row[yKey]

        if (xVal === undefined || yVal === undefined) {
          return null
        }

        const parsedX = parseValue(xVal, isXDateTime)
        const parsedY = parseValue(yVal, isYDateTime)

        if (parsedX === null || parsedY === null) {
          return null
        }

        return {
          x: parsedX,
          y: parsedY,
          originalX: xVal,
          originalY: yVal,
          index: index,
          isXDateTime,
          isYDateTime,
        }
      })
      .filter((item) => item !== null)

    return processed
  }

  const withProductScatterData = useMemo(() => {
    return processScatterData(filteredWithProductData, selectedIndependentVar, selectedDependentVar)
  }, [filteredWithProductData, selectedIndependentVar, selectedDependentVar])

  const withoutProductScatterData = useMemo(() => {
    return processScatterData(filteredWithoutProductData, selectedIndependentVar, selectedDependentVar)
  }, [filteredWithoutProductData, selectedIndependentVar, selectedDependentVar])

  const calculateCorrelation = (data) => {
    if (!data || data.length < 2) return null

    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0)
    const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  const detectOutliers = (data, threshold = 1.5) => {
    if (!data || data.length < 4) return []

    const xValues = data.map(d => d.x)
    const yValues = data.map(d => d.y)

    const xQ1 = d3.quantile(xValues, 0.25)
    const xQ3 = d3.quantile(xValues, 0.75)
    const xIQR = xQ3 - xQ1
    const xLowerBound = xQ1 - threshold * xIQR
    const xUpperBound = xQ3 + threshold * xIQR

    const yQ1 = d3.quantile(yValues, 0.25)
    const yQ3 = d3.quantile(yValues, 0.75)
    const yIQR = yQ3 - yQ1
    const yLowerBound = yQ1 - threshold * yIQR
    const yUpperBound = yQ3 + threshold * yIQR

    return data.filter(point =>
      point.x < xLowerBound || point.x > xUpperBound ||
      point.y < yLowerBound || point.y > yUpperBound
    )
  }

  const calculateRegressionStats = (data) => {
    if (!data || data.length < 2) return null

    const n = data.length
    const sumX = data.reduce((sum, point) => sum + point.x, 0)
    const sumY = data.reduce((sum, point) => sum + point.y, 0)
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    const rSquared = Math.pow(calculateCorrelation(data), 2)

    return {
      slope,
      intercept,
      rSquared,
      equation: `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`,
      rSquaredFormatted: (rSquared * 100).toFixed(1)
    }
  }

  const assessDataQuality = (data) => {
    if (!data || data.length === 0) return null

    const totalPoints = data.length
    const outliers = detectOutliers(data)
    const outlierPercentage = (outliers.length / totalPoints) * 100
    const correlation = Math.abs(calculateCorrelation(data))

    let quality = 'Excellent'
    let score = 100

    if (outlierPercentage > 10) {
      quality = 'Poor'
      score -= 30
    } else if (outlierPercentage > 5) {
      quality = 'Fair'
      score -= 15
    }

    if (correlation < 0.3) {
      quality = 'Weak Correlation'
      score -= 20
    }

    return {
      quality,
      score: Math.max(0, score),
      outlierPercentage: outlierPercentage.toFixed(1),
      correlationStrength: correlation < 0.3 ? 'Weak' : correlation < 0.7 ? 'Moderate' : 'Strong'
    }
  }

  const autoRanges = useMemo(() => {
    const allData = []
    if (withProductScatterData.length > 0) allData.push(...withProductScatterData)
    if (withoutProductScatterData.length > 0) allData.push(...withoutProductScatterData)

    if (allData.length === 0) {
      return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    }

    const xExtent = d3.extent(allData, (d) => d.x)
    const yExtent = d3.extent(allData, (d) => d.y)

    const xPadding = (xExtent[1] - xExtent[0]) * 0.05
    const yPadding = (yExtent[1] - yExtent[0]) * 0.05

    return {
      xMin: xExtent[0] - xPadding,
      xMax: xExtent[1] + xPadding,
      yMin: yExtent[0] - yPadding,
      yMax: yExtent[1] + yPadding,
    }
  }, [withProductScatterData, withoutProductScatterData])

  useEffect(() => {
    setCustomXRange({ min: "", max: "", auto: true })
    setCustomYRange({ min: "", max: "", auto: true })
  }, [selectedDependentVar, selectedIndependentVar])

  const calculateTrendLine = (data) => {
    if (!data || data.length < 2) return []

    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0
    const n = data.length

    data.forEach((point) => {
      sumX += point.x
      sumY += point.y
      sumXY += point.x * point.y
      sumXX += point.x * point.x
    })

    const denominator = n * sumXX - sumX * sumX
    if (denominator === 0) return []

    const slope = (n * sumXY - sumX * sumY) / denominator
    const intercept = (sumY - slope * sumX) / n

    if (isNaN(slope) || isNaN(intercept)) return []

    const minX = Math.min(...data.map((point) => point.x))
    const maxX = Math.max(...data.map((point) => point.x))

    return [
      { x: minX, y: minX * slope + intercept },
      { x: maxX, y: maxX * slope + intercept },
    ]
  }

  const withProductTrendLine = useMemo(() => {
    return calculateTrendLine(withProductScatterData)
  }, [withProductScatterData])

  const withoutProductTrendLine = useMemo(() => {
    return calculateTrendLine(withoutProductScatterData)
  }, [withoutProductScatterData])

  const withProductCorrelation = useMemo(() => {
    return calculateCorrelation(withProductScatterData)
  }, [withProductScatterData, filterColumn, filterMin, filterMax])

  const withoutProductCorrelation = useMemo(() => {
    return calculateCorrelation(withoutProductScatterData)
  }, [withoutProductScatterData, filterColumn, filterMin, filterMax])

  const withProductOutliers = useMemo(() => {
    return detectOutliers(withProductScatterData)
  }, [withProductScatterData, filterColumn, filterMin, filterMax])

  const withoutProductOutliers = useMemo(() => {
    return detectOutliers(withoutProductScatterData)
  }, [withoutProductScatterData, filterColumn, filterMin, filterMax])

  const withProductRegression = useMemo(() => {
    return calculateRegressionStats(withProductScatterData)
  }, [withProductScatterData, filterColumn, filterMin, filterMax])

  const withoutProductRegression = useMemo(() => {
    return calculateRegressionStats(withoutProductScatterData)
  }, [withoutProductScatterData, filterColumn, filterMin, filterMax])

  const withProductQuality = useMemo(() => {
    return assessDataQuality(withProductScatterData)
  }, [withProductScatterData, filterColumn, filterMin, filterMax])

  const withoutProductQuality = useMemo(() => {
    return assessDataQuality(withoutProductScatterData)
  }, [withoutProductScatterData, filterColumn, filterMin, filterMax])

  const combinedInsights = useMemo(() => {
    const allData = [...withProductScatterData, ...withoutProductScatterData]
    return {
      correlation: calculateCorrelation(allData),
      outliers: detectOutliers(allData),
      regression: calculateRegressionStats(allData),
      quality: assessDataQuality(allData)
    }
  }, [withProductScatterData, withoutProductScatterData, filterColumn, filterMin, filterMax])

  const hasWithProductData = withProductScatterData && withProductScatterData.length > 0
  const hasWithoutProductData = withoutProductScatterData && withoutProductScatterData.length > 0

  const WatermarkContent = () => {
    const containerRect = containerRef.current?.getBoundingClientRect()
    const isSmallScreen = containerRect ? containerRect.width < 768 : false

    return (
      <div
        style={{
          position: "absolute",
          top: isSmallScreen ? "5px" : "10px",
          right: isSmallScreen ? "10px" : "20px",
          display: "flex",
          alignItems: "center",
          gap: isSmallScreen ? "4px" : "6px",
          background: "rgba(255, 255, 255, 0.95)",
          padding: isSmallScreen ? "2px 6px" : "4px 10px",
          borderRadius: "4px",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          fontSize: isSmallScreen ? "8px" : "10px",
          color: "#666",
          fontFamily: "Arial, sans-serif",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: isSmallScreen ? "16px" : "22px",
            height: isSmallScreen ? "16px" : "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={logo || "/placeholder.svg"}
            alt="Abhitech Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: isSmallScreen ? "6px" : "8px", lineHeight: "1" }}>Powered by</div>
          <div
            style={{
              fontSize: isSmallScreen ? "8px" : "10px",
              fontWeight: "bold",
              color: "#1976d2",
              lineHeight: "1.1",
            }}
          >
            Abhitech's AbhiStat
          </div>
        </div>
      </div>
    )
  }

  const resetZoom = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current)
      zoomRect.transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity)
    }
  }, [])

  const zoomIn = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current)
      zoomRect.transition().duration(300).call(zoomRef.current.scaleBy, 1.5)
    }
  }, [])

  const zoomOut = useCallback(() => {
    if (zoomRef.current && zoomRectRef.current) {
      const zoomRect = d3.select(zoomRectRef.current)
      zoomRect
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1 / 1.5)
    }
  }, [])

  const resetAxisRanges = () => {
    setCustomXRange({ min: "", max: "", auto: true })
    setCustomYRange({ min: "", max: "", auto: true })
  }

  const handleXRangeChange = (field, value) => {
    setCustomXRange((prev) => ({
      ...prev,
      [field]: value,
      auto: field === "min" || field === "max" ? false : prev.auto,
    }))
  }

  const handleYRangeChange = (field, value) => {
    setCustomYRange((prev) => ({
      ...prev,
      [field]: value,
      auto: field === "min" || field === "max" ? false : prev.auto,
    }))
  }

  const getEffectiveRanges = () => {
    const allData = [...withProductScatterData, ...withoutProductScatterData]
    const isXDateTime = allData[0]?.isXDateTime
    const isYDateTime = allData[0]?.isYDateTime

    let xMin, xMax, yMin, yMax

    if (customXRange.auto || customXRange.min === "") {
      xMin = autoRanges.xMin
    } else {
      xMin = isXDateTime ? parseDateTimeFromInput(customXRange.min) : Number.parseFloat(customXRange.min)
    }

    if (customXRange.auto || customXRange.max === "") {
      xMax = autoRanges.xMax
    } else {
      xMax = isXDateTime ? parseDateTimeFromInput(customXRange.max) : Number.parseFloat(customXRange.max)
    }

    if (customYRange.auto || customYRange.min === "") {
      yMin = autoRanges.yMin
    } else {
      yMin = isYDateTime ? parseDateTimeFromInput(customYRange.min) : Number.parseFloat(customYRange.min)
    }

    if (customYRange.auto || customYRange.max === "") {
      yMax = autoRanges.yMax
    } else {
      yMax = isYDateTime ? parseDateTimeFromInput(customYRange.max) : Number.parseFloat(customYRange.max)
    }

    return { xMin, xMax, yMin, yMax }
  }

  const drawScatterPlot = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return

    const showWithoutProduct = (datasetView === "both" || datasetView === "withoutProduct") && hasWithoutProductData
    const showWithProduct = (datasetView === "both" || datasetView === "withProduct") && hasWithProductData

    if (!showWithoutProduct && !showWithProduct) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width

    const isSmallScreen = containerWidth < 768
    const isMediumScreen = containerWidth >= 768 && containerWidth < 1024

    let containerHeight
    if (isSmallScreen) {
      containerHeight = Math.min(500, window.innerHeight * 0.6)
    } else if (isMediumScreen) {
      containerHeight = 550
    } else {
      containerHeight = 600
    }

    const getTextWidth = (text, fontSize = 14) => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      context.font = `${fontSize}px Arial`
      return context.measureText(text).width
    }

    const xLabelWidth = getTextWidth(selectedIndependentVar || "")
    const yLabelWidth = getTextWidth(selectedDependentVar || "")
    const titleHeight = isSmallScreen ? 30 : 40

    const legendItems = []
    if (showWithoutProduct) legendItems.push(scatterLegendLabels.withoutProduct)
    if (showWithProduct) legendItems.push(scatterLegendLabels.withProduct)
    const legendHeight = 40

    const margin = {
      top: titleHeight + legendHeight + 20,
      right: 40,
      bottom: Math.max(60, xLabelWidth / 2 + 50) + 30,
      left: Math.max(60, yLabelWidth / 2 + 60) + 40,
    }

    const plotWidth = Math.max(200, containerWidth - margin.left - margin.right)
    const plotHeight = Math.max(200, containerHeight - margin.top - margin.bottom)

    if (plotWidth < 200 || plotHeight < 200) {
      console.warn("Container too small for plot")
      return
    }

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current).attr("width", containerWidth).attr("height", containerHeight)

    const allData = []
    if (showWithoutProduct) allData.push(...withoutProductScatterData)
    if (showWithProduct) allData.push(...withProductScatterData)

    if (allData.length === 0) return

    const isXDateTime = allData[0]?.isXDateTime
    const isYDateTime = allData[0]?.isYDateTime
    const effectiveRanges = getEffectiveRanges()

    const xScale = d3.scaleLinear().domain([effectiveRanges.xMin, effectiveRanges.xMax]).range([0, plotWidth])

    const yScale = d3.scaleLinear().domain([effectiveRanges.yMin, effectiveRanges.yMax]).range([plotHeight, 0])

    const plotGroup = svg
      .append("g")
      .attr("class", "plot-group")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    plotGroupRef.current = plotGroup.node()

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "plot-clip")
      .append("rect")
      .attr("width", plotWidth)
      .attr("height", plotHeight)

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 50])
      .extent([
        [0, 0],
        [plotWidth, plotHeight],
      ])
      .on("zoom", (event) => {
        const { transform } = event

        const newXScale = transform.rescaleX(xScale)
        const newYScale = transform.rescaleY(yScale)

        const xTickFormat = isXDateTime
          ? (d) => formatValue(d, true).split(" ")[0]
          : isSmallScreen
            ? (d) => d.toFixed(1)
            : (d) => d.toFixed(2)

        const yTickFormat = isYDateTime
          ? (d) => formatValue(d, true).split(" ")[0]
          : isSmallScreen
            ? (d) => d.toFixed(1)
            : (d) => d.toFixed(2)

        plotGroup.select(".x-axis").call(d3.axisBottom(newXScale).tickFormat(xTickFormat))
        plotGroup.select(".y-axis").call(d3.axisLeft(newYScale).tickFormat(yTickFormat))

        if (showGrid) {
          plotGroup.select(".grid-x").call(d3.axisBottom(newXScale).tickSize(-plotHeight).tickFormat(""))
          plotGroup.select(".grid-y").call(d3.axisLeft(newYScale).tickSize(-plotWidth).tickFormat(""))
        }

        plotGroup
          .selectAll(".data-point")
          .attr("cx", (d) => newXScale(d.x))
          .attr("cy", (d) => newYScale(d.y))

        if (showTrendLines) {
          plotGroup
            .selectAll(".trend-line")
            .attr("x1", (d) => newXScale(d[0].x))
            .attr("y1", (d) => newYScale(d[0].y))
            .attr("x2", (d) => newXScale(d[1].x))
            .attr("y2", (d) => newYScale(d[1].y))
        }
      })

    zoomRef.current = zoom

    const zoomRect = plotGroup
      .append("rect")
      .attr("width", plotWidth)
      .attr("height", plotHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(zoom)

    zoomRectRef.current = zoomRect.node()

    svg
      .append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", isSmallScreen ? "14px" : "16px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(`${scatterYAxisLabel} vs ${scatterXAxisLabel}`)

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left}, ${titleHeight + 10})`)

    const legendItemSpacing = isSmallScreen ? 120 : 150
    const legendFontSize = isSmallScreen ? "12px" : "14px"

    legendItems.forEach((text, i) => {
      const color = text === scatterLegendLabels.withoutProduct ? scatterColors.withoutProduct : scatterColors.withProduct
      const stroke = text === scatterLegendLabels.withoutProduct ? scatterColors.withoutProduct : scatterColors.withProduct

      const legendItem = legend.append("g").attr("transform", `translate(${i * legendItemSpacing}, 0)`)

      legendItem
        .append("circle")
        .attr("cx", 6)
        .attr("cy", 6)
        .attr("r", pointSize)
        .style("fill", color)
        .style("stroke", stroke)

      legendItem
        .append("text")
        .attr("x", 20)
        .attr("y", 6)
        .attr("dy", "0.35em")
        .style("font-size", legendFontSize)
        .style("font-weight", "500")
        .text(text)
    })

    if (showGrid) {
      const gridGroup = plotGroup.append("g").attr("class", "grid-group").attr("clip-path", "url(#plot-clip)")

      const tickCount = isSmallScreen ? 4 : isMediumScreen ? 6 : 8

      gridGroup
        .append("g")
        .attr("class", "grid-x")
        .attr("transform", `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-plotHeight).tickFormat(""))
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3)

      gridGroup
        .append("g")
        .attr("class", "grid-y")
        .call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-plotWidth).tickFormat(""))
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3)
    }

    const xTickFormat = isXDateTime
      ? (d) => formatValue(d, true).split(" ")[0]
      : isSmallScreen
        ? (d) => d.toFixed(1)
        : (d) => d.toFixed(2)

    const yTickFormat = isYDateTime
      ? (d) => formatValue(d, true).split(" ")[0]
      : isSmallScreen
        ? (d) => d.toFixed(1)
        : (d) => d.toFixed(2)

    const tickFontSize = isSmallScreen ? "10px" : "12px"
    const tickCount = isSmallScreen ? 4 : isMediumScreen ? 6 : 8

    plotGroup
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale).ticks(tickCount).tickFormat(xTickFormat))
      .selectAll("text")
      .style("font-size", tickFontSize)

    plotGroup
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale).ticks(tickCount).tickFormat(yTickFormat))
      .selectAll("text")
      .style("font-size", tickFontSize)

    const labelFontSize = isSmallScreen ? "12px" : "14px"

    plotGroup
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", plotWidth / 2)
      .attr("y", plotHeight + (isSmallScreen ? 35 : 60))
      .style("text-anchor", "middle")
      .style("font-size", labelFontSize)
      .style("font-weight", "500")
      .style("fill", "#666")
      .text(scatterXAxisLabel)

    plotGroup
      .append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -plotHeight / 2)
      .attr("y", isSmallScreen ? -35 : -80)
      .style("text-anchor", "middle")
      .style("font-size", labelFontSize)
      .style("font-weight", "500")
      .style("fill", "#666")
      .text(scatterYAxisLabel)

    const dataGroup = plotGroup.append("g").attr("class", "data-group").attr("clip-path", "url(#plot-clip)")

    const hoverRadius = pointSize + 2

    if (showTrendLines) {
      if (showWithoutProduct && withoutProductTrendLine.length > 0) {
        dataGroup
          .selectAll(".trend-line-without")
          .data([withoutProductTrendLine])
          .enter()
          .append("line")
          .attr("class", "trend-line trend-line-without")
          .attr("x1", (d) => xScale(d[0].x))
          .attr("y1", (d) => yScale(d[0].y))
          .attr("x2", (d) => xScale(d[1].x))
          .attr("y2", (d) => yScale(d[1].y))
          .style("stroke", scatterColors.withoutProduct)
          .style("stroke-width", isSmallScreen ? 1.5 : 2)
          .style("opacity", 0.8)
      }

      if (showWithProduct && withProductTrendLine.length > 0) {
        dataGroup
          .selectAll(".trend-line-with")
          .data([withProductTrendLine])
          .enter()
          .append("line")
          .attr("class", "trend-line trend-line-with")
          .attr("x1", (d) => xScale(d[0].x))
          .attr("y1", (d) => yScale(d[0].y))
          .attr("x2", (d) => xScale(d[1].x))
          .attr("y2", (d) => yScale(d[1].y))
          .style("stroke", scatterColors.withProduct)
          .style("stroke-width", isSmallScreen ? 1.5 : 2)
          .style("opacity", 0.8)
      }
    }

    if (showWithoutProduct) {
      const withoutProductPoints = dataGroup
        .selectAll(".data-point-without")
        .data(withoutProductScatterData)
        .enter()
        .append("circle")
        .attr("class", "data-point data-point-without")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", (d) => {
          if (showOutliers && withoutProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return pointSize * 1.5
          }
          return pointSize
        })
        .style("fill", (d) => {
          if (showOutliers && withoutProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return "#ff9800"
          }
          return scatterColors.withoutProduct
        })
        .style("fill-opacity", opacity)
        .style("stroke", (d) => {
          if (showOutliers && withoutProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return "#ff9800"
          }
          return scatterColors.withoutProduct
        })
        .style("stroke-width", (d) => {
          if (showOutliers && withoutProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return 2
          }
          return 1
        })
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("r", hoverRadius)
          const [mouseX, mouseY] = d3.pointer(event, containerRef.current)
          setTooltip({
            visible: true,
            x: mouseX,
            y: mouseY,
            data: { ...d, dataset: "Without Product" },
          })
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", (d) => {
            if (showOutliers && withoutProductOutliers.some(outlier =>
              outlier.x === d.x && outlier.y === d.y
            )) {
              return pointSize * 1.5
            }
            return pointSize
          })
          setTooltip({ visible: false, x: 0, y: 0, data: null })
        })
    }

    if (showWithProduct) {
      const withProductPoints = dataGroup
        .selectAll(".data-point-with")
        .data(withProductScatterData)
        .enter()
        .append("circle")
        .attr("class", "data-point data-point-with")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", (d) => {
          if (showOutliers && withProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return pointSize * 1.5
          }
          return pointSize
        })
        .style("fill", (d) => {
          if (showOutliers && withProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return "#ff9800"
          }
          return scatterColors.withProduct
        })
        .style("fill-opacity", opacity)
        .style("stroke", (d) => {
          if (showOutliers && withProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return "#ff9800"
          }
          return scatterColors.withProduct
        })
        .style("stroke-width", (d) => {
          if (showOutliers && withProductOutliers.some(outlier =>
            outlier.x === d.x && outlier.y === d.y
          )) {
            return 2
          }
          return 1
        })
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("r", hoverRadius)
          const [mouseX, mouseY] = d3.pointer(event, containerRef.current)
          setTooltip({
            visible: true,
            x: mouseX,
            y: mouseY,
            data: { ...d, dataset: "With Product" },
          })
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", (d) => {
            if (showOutliers && withProductOutliers.some(outlier =>
              outlier.x === d.x && outlier.y === d.y
            )) {
              return pointSize * 1.5
            }
            return pointSize
          })
          setTooltip({ visible: false, x: 0, y: 0, data: null })
        })
    }

    if (showCorrelation && combinedInsights.correlation !== null) {
      const correlationText = svg
        .append("text")
        .attr("x", containerWidth - 20)
        .attr("y", containerHeight - 20)
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#666")
        .text(`r = ${combinedInsights.correlation.toFixed(3)}`)
    }
  }, [
    withProductScatterData,
    withoutProductScatterData,
    datasetView,
    selectedIndependentVar,
    selectedDependentVar,
    hasWithProductData,
    hasWithoutProductData,
    withProductTrendLine,
    withoutProductTrendLine,
    customXRange,
    customYRange,
    autoRanges,
    scatterLegendLabels,
    scatterXAxisLabel,
    scatterYAxisLabel,
    scatterColors,
    showTrendLines,
    showGrid,
    showOutliers,
    pointSize,
    opacity,
    showCorrelation,
    combinedInsights,
    withProductOutliers,
    withoutProductOutliers,
  ])

  useEffect(() => {
    drawScatterPlot()
  }, [drawScatterPlot])

  useEffect(() => {
    const handleResize = () => {
      drawScatterPlot()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [drawScatterPlot])

  const downloadChartAsPNG = () => {
    if (!svgRef.current) return

    const svgElement = svgRef.current
    const svgRect = svgElement.getBoundingClientRect()
    const scaleFactor = 2

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = svgRect.width * scaleFactor
    canvas.height = (svgRect.height + 50) * scaleFactor

    const convertImageToDataURL = (imgSrc) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => resolve(null)
        img.src = imgSrc
      })
    }

    convertImageToDataURL(logo).then((logoDataURL) => {
      const svgClone = svgElement.cloneNode(true)

      if (logoDataURL) {
        const watermarkGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
        watermarkGroup.setAttribute("transform", `translate(${svgRect.width - 170}, 10)`)
        const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        bgRect.setAttribute("x", "0")
        bgRect.setAttribute("y", "0")
        bgRect.setAttribute("width", "160")
        bgRect.setAttribute("height", "36")
        bgRect.setAttribute("fill", "rgba(255,255,255,0.95)")
        bgRect.setAttribute("stroke", "rgba(0,0,0,0.1)")
        bgRect.setAttribute("stroke-width", "1")
        bgRect.setAttribute("rx", "4")
        
        const logoImg = document.createElementNS("http://www.w3.org/2000/svg", "image")
        logoImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoDataURL)
        logoImg.setAttribute("x", "8")
        logoImg.setAttribute("y", "6")
        logoImg.setAttribute("width", "24")
        logoImg.setAttribute("height", "24")
        logoImg.setAttribute("preserveAspectRatio", "xMidYMid meet")
        
        const poweredByText = document.createElementNS("http://www.w3.org/2000/svg", "text")
        poweredByText.setAttribute("x", "40")
        poweredByText.setAttribute("y", "18")
        poweredByText.setAttribute("fill", "#666")
        poweredByText.setAttribute("font-size", "10")
        poweredByText.setAttribute("font-family", "Arial, sans-serif")
        poweredByText.textContent = "Powered by"
        
        const brandText = document.createElementNS("http://www.w3.org/2000/svg", "text")
        brandText.setAttribute("x", "40")
        brandText.setAttribute("y", "30")
        brandText.setAttribute("fill", "#1976d2")
        brandText.setAttribute("font-size", "11")
        brandText.setAttribute("font-weight", "bold")
        brandText.setAttribute("font-family", "Arial, sans-serif")
        brandText.textContent = "Abhitech's AbhiStat"
        
        watermarkGroup.appendChild(bgRect)
        watermarkGroup.appendChild(logoImg)
        watermarkGroup.appendChild(poweredByText)
        watermarkGroup.appendChild(brandText)
        svgClone.appendChild(watermarkGroup)
      }

      const svgData = new XMLSerializer().serializeToString(svgClone)
      const img = new Image()

      img.onload = () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = 'black'
        ctx.font = `${16 * scaleFactor}px Arial`
        ctx.textAlign = 'center'
        const datasetLabel = datasetView === "both" ? "Both" : datasetView === "withProduct" ? "With Product" : "Without Product"
        ctx.fillText(`Scatter Plot: ${selectedDependentVar} vs ${selectedIndependentVar} (${datasetLabel})`, canvas.width / 2, 30 * scaleFactor)

        ctx.drawImage(img, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor)

        if (!logoDataURL) {
          const watermarkX = canvas.width - 160 * scaleFactor - 10 * scaleFactor
          const watermarkY = 10 * scaleFactor
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.fillRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor)
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
          ctx.lineWidth = 1 * scaleFactor
          ctx.strokeRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor)
          
          ctx.fillStyle = '#666'
          ctx.font = `${10 * scaleFactor}px Arial`
          ctx.fillText('Powered by', watermarkX + 8 * scaleFactor, watermarkY + 18 * scaleFactor)
          
          ctx.fillStyle = '#1976d2'
          ctx.font = `bold ${11 * scaleFactor}px Arial`
          ctx.fillText("Abhitech's AbhiStat", watermarkX + 8 * scaleFactor, watermarkY + 30 * scaleFactor)
        }

        const downloadLink = document.createElement("a")
        const filename = generateFileName(`ScatterPlot_${selectedDependentVar}`)
        downloadLink.download = `${filename}.png`
        downloadLink.href = canvas.toDataURL("image/png")
        downloadLink.click()
      }

      img.onerror = () => {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = 'black'
        ctx.font = `${16 * scaleFactor}px Arial`
        ctx.textAlign = 'center'
        const datasetLabel = datasetView === "both" ? "Both" : datasetView === "withProduct" ? "With Product" : "Without Product"
        ctx.fillText(`Scatter Plot: ${selectedDependentVar} vs ${selectedIndependentVar} (${datasetLabel})`, canvas.width / 2, 30 * scaleFactor)

        ctx.drawImage(svgElement, 0, 50 * scaleFactor, svgRect.width * scaleFactor, svgRect.height * scaleFactor)

        const watermarkX = canvas.width - 160 * scaleFactor - 10 * scaleFactor
        const watermarkY = 10 * scaleFactor
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.lineWidth = 1 * scaleFactor
        ctx.strokeRect(watermarkX, watermarkY, 160 * scaleFactor, 36 * scaleFactor)
        
        ctx.fillStyle = '#666'
        ctx.font = `${10 * scaleFactor}px Arial`
        ctx.fillText('Powered by', watermarkX + 8 * scaleFactor, watermarkY + 18 * scaleFactor)
        
        ctx.fillStyle = '#1976d2'
        ctx.font = `bold ${13 * scaleFactor}px Arial`
        ctx.fillText("Abhitech's AbhiStat", watermarkX + 8 * scaleFactor, watermarkY + 30 * scaleFactor)

        const downloadLink = document.createElement("a")
        const filename = generateFileName(`ScatterPlot_${selectedDependentVar}`)
        downloadLink.download = `${filename}.png`
        downloadLink.href = canvas.toDataURL("image/png")
        downloadLink.click()
      }

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    })
  }

  const containerStyle = useMemo(
    () => ({
      width: "100%",
      height: "auto",
      minHeight: "400px",
      position: "relative",
      "@media (max-width: 768px)": {
        minHeight: "350px",
      },
    }),
    [],
  )

  const showWithoutProduct = (datasetView === "both" || datasetView === "withoutProduct") && hasWithoutProductData
  const showWithProduct = (datasetView === "both" || datasetView === "withProduct") && hasWithProductData

  const allData = [...withProductScatterData, ...withoutProductScatterData]
  const isXDateTime = allData[0]?.isXDateTime
  const isYDateTime = allData[0]?.isYDateTime

  const SummaryCards = () => (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box
        sx={{
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: showSummaryCards ? '1px solid' : 'none',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
        onClick={() => setShowSummaryCards(!showSummaryCards)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
            Data Summary
          </Typography>
        </Box>
        <IconButton size="small" sx={{ transform: showSummaryCards ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Collapse in={showSummaryCards} timeout={300} easing="ease-in-out">
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Total Points
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {withProductScatterData.length + withoutProductScatterData.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {withProductScatterData.length} with product, {withoutProductScatterData.length} without
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Correlation
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {combinedInsights.correlation ? Math.abs(combinedInsights.correlation).toFixed(3) : 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {combinedInsights.correlation ?
                      (Math.abs(combinedInsights.correlation) > 0.7 ? 'Strong' :
                        Math.abs(combinedInsights.correlation) > 0.3 ? 'Moderate' : 'Weak') : 'N/A'} relationship
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BarChartIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      R² Score
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {combinedInsights.regression ? combinedInsights.regression.rSquaredFormatted : 'N/A'}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {combinedInsights.regression ?
                      (combinedInsights.regression.rSquared > 0.7 ? 'Excellent' :
                        combinedInsights.regression.rSquared > 0.5 ? 'Good' : 'Poor') : 'N/A'} fit
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Data Quality
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {combinedInsights.quality ? combinedInsights.quality.score : 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {combinedInsights.quality ? combinedInsights.quality.quality : 'N/A'} quality score
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  )

  const InsightsPanel = () => (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, border: '1px solid', borderColor: 'primary.light' }}>
      <Box
        sx={{
          p: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: showInsights ? '1px solid' : 'none',
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' }
        }}
        onClick={() => setShowInsights(!showInsights)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
            Analysis Insights
          </Typography>
        </Box>
        <IconButton size="small" sx={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Collapse in={showInsights} timeout={300} easing="ease-in-out">
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                With Product Analysis
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Correlation Coefficient"
                    secondary={withProductCorrelation ? withProductCorrelation.toFixed(4) : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BarChartIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Regression Equation"
                    secondary={withProductRegression ? withProductRegression.equation : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Quality"
                    secondary={withProductQuality ? `${withProductQuality.quality} (${withProductQuality.score}/100)` : 'N/A'}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                Without Product Analysis
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Correlation Coefficient"
                    secondary={withoutProductCorrelation ? withoutProductCorrelation.toFixed(4) : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BarChartIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Regression Equation"
                    secondary={withoutProductRegression ? withoutProductRegression.equation : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Quality"
                    secondary={withoutProductQuality ? `${withoutProductQuality.quality} (${withoutProductQuality.score}/100)` : 'N/A'}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>

          {combinedInsights.outliers && combinedInsights.outliers.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                ⚠️ Outlier Detection
              </Typography>
              <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                {combinedInsights.outliers.length} outliers detected using IQR method (1.5 × IQR threshold)
              </Typography>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )

  const openSettingsModal = () => {
    setDraftSettings({
      showTrendLines,
      showGrid,
      showOutliers,
      showCorrelation,
      pointSize,
      opacity,
      scatterColors: { ...scatterColors },
      scatterXAxisLabel,
      scatterYAxisLabel,
      scatterLegendLabels: { ...scatterLegendLabels },
    })
    setSettingsModalOpen(true)
  }

  const handleSettingsModalClose = () => {
    setSettingsModalOpen(false)
    setDraftSettings(null)
  }

  const handleSettingsSave = () => {
    if (!draftSettings) return
    setShowTrendLines(draftSettings.showTrendLines)
    setShowGrid(draftSettings.showGrid)
    setShowOutliers(draftSettings.showOutliers)
    setShowCorrelation(draftSettings.showCorrelation)
    setPointSize(draftSettings.pointSize)
    setOpacity(draftSettings.opacity)
    setScatterColors({ ...draftSettings.scatterColors })
    setScatterXAxisLabel(draftSettings.scatterXAxisLabel)
    setScatterYAxisLabel(draftSettings.scatterYAxisLabel)
    setScatterLegendLabels({ ...draftSettings.scatterLegendLabels })
    setSettingsModalOpen(false)
    setDraftSettings(null)
  }

  const CustomSlider = ({ value, onChange, min, max, step, label, formatValue }) => {
    const [tempValue, setTempValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => {
      setIsDragging(false);
      onChange(tempValue);
    };

    const handleChange = (newValue) => {
      setTempValue(newValue);
    };

    useEffect(() => {
      if (!isDragging) {
        setTempValue(value);
      }
    }, [value, isDragging]);

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              backgroundColor: '#f5f5f5',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}
          >
            {formatValue ? formatValue(tempValue) : tempValue}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'relative',
            height: '6px',
            backgroundColor: '#e0e0e0',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              backgroundColor: '#1976d2',
              borderRadius: '3px',
              width: `${((tempValue - min) / (max - min)) * 100}%`,
              transition: isDragging ? 'none' : 'width 0.2s ease'
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={tempValue}
            onChange={(e) => handleChange(Number(e.target.value))}
            style={{
              position: 'absolute',
              top: '-8px',
              left: 0,
              width: '100%',
              height: '22px',
              opacity: 0,
              cursor: 'pointer'
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />
        </Box>
      </Box>
    );
  };

  const SettingsModal = () => {
    const featureSections = [
      <Box key="chart-features">
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          Chart Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!draftSettings?.showTrendLines}
                  onChange={e => setDraftSettings(ds => ({ ...ds, showTrendLines: e.target.checked }))}
                />
              }
              label="Show Trend Lines"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!draftSettings?.showGrid}
                  onChange={e => setDraftSettings(ds => ({ ...ds, showGrid: e.target.checked }))}
                />
              }
              label="Show Grid"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!draftSettings?.showOutliers}
                  onChange={e => setDraftSettings(ds => ({ ...ds, showOutliers: e.target.checked }))}
                />
              }
              label="Highlight Outliers"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!draftSettings?.showCorrelation}
                  onChange={e => setDraftSettings(ds => ({ ...ds, showCorrelation: e.target.checked }))}
                />
              }
              label="Show Correlation"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomSlider
              value={draftSettings?.pointSize ?? 4}
              onChange={(value) => setDraftSettings(ds => ({ ...ds, pointSize: value }))}
              min={2}
              max={8}
              step={1}
              label="Point Size"
              formatValue={(val) => `${val}px`}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomSlider
              value={draftSettings?.opacity ?? 0.7}
              onChange={(value) => setDraftSettings(ds => ({ ...ds, opacity: value }))}
              min={0.3}
              max={1}
              step={0.1}
              label="Opacity"
              formatValue={(val) => `${Math.round(val * 100)}%`}
            />
          </Grid>
        </Grid>
      </Box>,
      <Box key="labels">
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          Labels
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                With Product Legend
              </Typography>
              <DebouncedTextField
                value={draftSettings?.scatterLegendLabels?.withProduct || ''}
                onChange={e => setDraftSettings(ds => ({ ...ds, scatterLegendLabels: { ...ds.scatterLegendLabels, withProduct: e.target.value } }))}
                size="small"
                fullWidth
                placeholder="Enter legend label"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                Without Product Legend
              </Typography>
              <DebouncedTextField
                value={draftSettings?.scatterLegendLabels?.withoutProduct || ''}
                onChange={e => setDraftSettings(ds => ({ ...ds, scatterLegendLabels: { ...ds.scatterLegendLabels, withoutProduct: e.target.value } }))}
                size="small"
                fullWidth
                placeholder="Enter legend label"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                X Axis Label
              </Typography>
              <DebouncedTextField
                value={draftSettings?.scatterXAxisLabel || ''}
                onChange={e => setDraftSettings(ds => ({ ...ds, scatterXAxisLabel: e.target.value }))}
                size="small"
                fullWidth
                placeholder="Enter X axis label"
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
                Y Axis Label
              </Typography>
              <DebouncedTextField
                value={draftSettings?.scatterYAxisLabel || ''}
                onChange={e => setDraftSettings(ds => ({ ...ds, scatterYAxisLabel: e.target.value }))}
                size="small"
                fullWidth
                placeholder="Enter Y axis label"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    ];

    const colorPairs = [
      {
        key: 'withProduct',
        value: draftSettings?.scatterColors?.withProduct || '#4caf50',
        onChange: (color) => setDraftSettings(ds => ({ ...ds, scatterColors: { ...ds.scatterColors, withProduct: color } })),
        label: 'With Product Color'
      },
      {
        key: 'withoutProduct',
        value: draftSettings?.scatterColors?.withoutProduct || '#f44336',
        onChange: (color) => setDraftSettings(ds => ({ ...ds, scatterColors: { ...ds.scatterColors, withoutProduct: color } })),
        label: 'Without Product Color'
      }
    ];

    return (
      <ChartSettingsModal
        open={settingsModalOpen}
        onClose={handleSettingsModalClose}
        onApply={handleSettingsSave}
        onReset={() => setDraftSettings(null)}
        settings={null}
        draftSettings={draftSettings}
        setDraftSettings={setDraftSettings}
        colorPairs={colorPairs}
        colorOptions={['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#607d8b', '#ffc107', '#3f51b5']}
        featureSections={featureSections}
        colorSection={true}
        title="Chart Settings"
        description="Customize your scatter plot appearance"
        minHeight={600}
        maxWidth="md"
      />
    );
  }

  const downloadPageAsPNG = async () => {
    if (!pageRef.current) return
    
    const originalShowSummaryCards = showSummaryCards
    const originalShowInsights = showInsights
    
    setShowSummaryCards(true)
    setShowInsights(true)
    
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const element = pageRef.current
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#fff',
      scale: 2,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })
    
    setShowSummaryCards(originalShowSummaryCards)
    setShowInsights(originalShowInsights)
    
    const link = document.createElement('a')
    const filename = generateFileName(`ScatterPlot_Page_${selectedDependentVar}`)
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <Box sx={{ width: "100%", p: { xs: 1, sm: 2, md: 3 } }}>
      <SettingsModal />

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Autocomplete
            options={dependentVariables}
            value={selectedDependentVar}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedDependentVar(newValue)
              }
            }}
            renderInput={(params) => (
              <DebouncedTextField {...params} label="Select Dependent Variable" variant="outlined" fullWidth size="small" />
            )}
            disableClearable
            disabled={dependentVariables.length === 0}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Autocomplete
            options={independentVariables}
            value={selectedIndependentVar}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedIndependentVar(newValue)
              }
            }}
            renderInput={(params) => (
              <DebouncedTextField {...params} label="Select Independent Variable" variant="outlined" fullWidth size="small" />
            )}
            disableClearable
            disabled={independentVariables.length === 0}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <FormControl fullWidth>
            <ToggleButtonGroup
              value={datasetView}
              exclusive
              onChange={(event, newValue) => {
                if (newValue) setDatasetView(newValue)
              }}
              color="primary"
              aria-label="dataset view"
              fullWidth
              orientation="horizontal"
              sx={{
                height: { xs: "48px", sm: "56px" },
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  px: { xs: 1.5, sm: 2 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  border: "1px solid",
                  borderColor: "primary.main",
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    }
                  }
                },
              }}
            >
              <ToggleButton value="both">Both</ToggleButton>
              <ToggleButton value="withoutProduct">Without Product</ToggleButton>
              <ToggleButton value="withProduct">With Product</ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Data Filter
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={availableColumnsForFilter}
                value={filterColumn}
                onChange={(e, v) => setFilterColumn(v || '')}
                renderInput={(params) => (
                  <DebouncedTextField {...params} label="Filter Column" variant="outlined" size="small" />
                )}
                disableClearable={false}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <DebouncedTextField
                type={columnIsDateTime ? 'datetime-local' : 'number'}
                size="small"
                label={columnIsDateTime ? 'Min (datetime)' : 'Min'}
                value={filterMin}
                onChange={(e) => setFilterMin(e.target.value)}
                disabled={!filterColumn}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2.5}>
              <DebouncedTextField
                type={columnIsDateTime ? 'datetime-local' : 'number'}
                size="small"
                label={columnIsDateTime ? 'Max (datetime)' : 'Max'}
                value={filterMax}
                onChange={(e) => setFilterMax(e.target.value)}
                disabled={!filterColumn}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Button 
                onClick={resetLocalFilter} 
                variant="outlined" 
                size="small" 
                sx={{ 
                  textTransform: 'none',
                  width: { xs: '100%', md: 'auto' },
                  minWidth: '120px'
                }}
              >
                Reset Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <div ref={pageRef}>

        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
              <MuiTooltip title="Download entire page as PNG">
                <Button
                  color="primary"
                  onClick={downloadPageAsPNG}
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  Download Page
                </Button>
              </MuiTooltip>
            </Box>

            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 3, 
              flexDirection: { xs: "column", sm: "row" },
              gap: 2 
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  textAlign: { xs: "center", sm: "left" }
                }}
              >
                Interactive Scatter Plot
              </Typography>
            </Box>

            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, bgcolor: 'grey.50' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  mb: 3,
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
                    Axis Scale Controls
                  </Typography>
                  <MuiTooltip title="Reset to Auto Scale">
                    <Button 
                      onClick={resetAxisRanges} 
                      size="small" 
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Reset Auto
                    </Button>
                  </MuiTooltip>
                </Box>
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "primary.main" }}>
                      X-Axis ({selectedIndependentVar}) Range:
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={5}>
                        <DebouncedTextField
                          type={isXDateTime ? "datetime-local" : "number"}
                          size="small"
                          value={customXRange.min}
                          onChange={(e) => handleXRangeChange("min", e.target.value)}
                          placeholder={isXDateTime ? "" : autoRanges.xMin.toFixed(2)}
                          helperText={isXDateTime ? `Auto: ${formatValue(autoRanges.xMin, true)}` : ""}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              fontSize: "0.7rem",
                              margin: "2px 0 0 0",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          to
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <DebouncedTextField
                          type={isXDateTime ? "datetime-local" : "number"}
                          size="small"
                          value={customXRange.max}
                          onChange={(e) => handleXRangeChange("max", e.target.value)}
                          placeholder={isXDateTime ? "" : autoRanges.xMax.toFixed(2)}
                          helperText={isXDateTime ? `Auto: ${formatValue(autoRanges.xMax, true)}` : ""}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              fontSize: "0.7rem",
                              margin: "2px 0 0 0",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 500, color: "success.main" }}>
                      Y-Axis ({selectedDependentVar}) Range:
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={5}>
                        <DebouncedTextField
                          type={isYDateTime ? "datetime-local" : "number"}
                          size="small"
                          value={customYRange.min}
                          onChange={(e) => handleYRangeChange("min", e.target.value)}
                          placeholder={isYDateTime ? "" : autoRanges.yMin.toFixed(2)}
                          helperText={isYDateTime ? `Auto: ${formatValue(autoRanges.yMin, true)}` : ""}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              fontSize: "0.7rem",
                              margin: "2px 0 0 0",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={2} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          to
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <DebouncedTextField
                          type={isYDateTime ? "datetime-local" : "number"}
                          size="small"
                          value={customYRange.max}
                          onChange={(e) => handleYRangeChange("max", e.target.value)}
                          placeholder={isYDateTime ? "" : autoRanges.yMax.toFixed(2)}
                          helperText={isYDateTime ? `Auto: ${formatValue(autoRanges.yMax, true)}` : ""}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              fontSize: "0.7rem",
                              margin: "2px 0 0 0",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              borderRadius: 2,
              fontSize: { xs: "0.8rem", sm: "0.875rem" }
            }}>
              <PanToolIcon fontSize="small" />
              <Typography variant="body2">
                Use mouse wheel to zoom, drag to pan, axis scale controls, or zoom buttons. Hover over points for details.
              </Typography>
            </Alert>
          </Box>

          <Box sx={{ 
            display: "flex", 
            gap: 1, 
            alignItems: "center", 
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-end" },
            mt: 2,
            mb: 2
          }}>
            <ButtonGroup variant="outlined" size="small" sx={{ order: { xs: 2, sm: 1 } }}>
              <MuiTooltip title="Zoom In">
                <Button onClick={zoomIn} sx={{ minWidth: "40px", px: 1 }}>
                  <ZoomInIcon fontSize="small" />
                </Button>
              </MuiTooltip>
              <MuiTooltip title="Zoom Out">
                <Button onClick={zoomOut} sx={{ minWidth: "40px", px: 1 }}>
                  <ZoomOutIcon fontSize="small" />
                </Button>
              </MuiTooltip>
              <MuiTooltip title="Reset Zoom">
                <Button onClick={resetZoom} sx={{ minWidth: "40px", px: 1 }}>
                  <CenterFocusStrongIcon fontSize="small" />
                </Button>
              </MuiTooltip>
            </ButtonGroup>

            <Box sx={{ display: "flex", gap: 1, order: { xs: 1, sm: 2 }, alignItems: 'center' }}>
              <MuiTooltip title="Chart Settings">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={openSettingsModal}
                  startIcon={<SettingsIcon />}
                  size="small"
                  sx={{ 
                    textTransform: 'none',
                    height: 32,
                    border: "1px solid",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.light",
                      color: "white"
                    }
                  }}
                >
                  Settings
                </Button>
              </MuiTooltip>

              <SaveVisualizationButton 
                elementId="visualization-content" 
                fileNamePrefix="scatter_plot"
                variableNames={[selectedDependentVar, selectedIndependentVar].filter(Boolean)}
              />

              <MuiTooltip title="Download Plot as PNG">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={downloadChartAsPNG}
                  startIcon={<DownloadIcon />}
                  size="small"
                  sx={{ 
                    textTransform: 'none',
                    height: 32,
                    border: "1px solid",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.light",
                      color: "white"
                    }
                  }}
                >
                  Download PNG
                </Button>
              </MuiTooltip>
            </Box>
          </Box>

            {!showWithoutProduct && !showWithProduct ? (
              <Alert severity="info" sx={{ width: "100%", my: 3, borderRadius: 2 }}>
                No data available for the selected variables
              </Alert>
            ) : (
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={containerStyle}>
                    <div ref={containerRef} className="abhitech-plot-area" style={{ width: "100%", height: "100%" }}>
                      <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }}></svg>
                      <WatermarkContent />
                    </div>

                    {tooltip.visible && tooltip.data && (
                      <Paper
                        elevation={3}
                        sx={{
                          position: "absolute",
                          left: Math.min(tooltip.x + 10, window.innerWidth - 320),
                          top: Math.max(tooltip.y - 10, 10),
                          p: { xs: 1.5, md: 2 },
                          backgroundColor: "background.paper",
                          maxWidth: { xs: 250, md: 300 },
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: tooltip.data.dataset === "With Product" ? "success.light" : "error.light",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          pointerEvents: "none",
                          zIndex: 1000,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            color: tooltip.data.dataset === "With Product" ? "success.main" : "error.main",
                            fontWeight: "bold",
                            fontSize: { xs: "0.75rem", md: "0.875rem" },
                          }}
                        >
                          {tooltip.data.dataset}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                          >
                            {selectedIndependentVar}:{" "}
                            <span style={{ fontWeight: "normal" }}>
                              {formatValue(tooltip.data.originalX, tooltip.data.isXDateTime)}
                            </span>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium", fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                          >
                            {selectedDependentVar}:{" "}
                            <span style={{ fontWeight: "normal" }}>
                              {formatValue(tooltip.data.originalY, tooltip.data.isYDateTime)}
                            </span>
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <SummaryCards />
        <InsightsPanel />
      </div>
    </Box>
  )
}

export default ScatterPlotTab;