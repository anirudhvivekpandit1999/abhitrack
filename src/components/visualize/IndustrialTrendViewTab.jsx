import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

/* ============================================================================
   HELPERS
============================================================================ */

const getNumeric = (row, key) => {
  if (!row || !key) return null;

  const val = parseFloat(row[key]);

  return Number.isNaN(val) ? null : val;
};

const movingAverage = (arr, window = 3) => {
  return arr.map((_, i) => {
    const slice = arr.slice(Math.max(0, i - window), i + 1);

    const vals = slice.filter(
      (v) => v !== null && v !== undefined && !Number.isNaN(v)
    );

    if (!vals.length) return null;

    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
};

const getAverage = (values) => {
  const valid = values.filter(
    (v) => v !== null && v !== undefined && !Number.isNaN(v)
  );

  if (!valid.length) return null;

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const getMin = (values) => {
  const valid = values.filter(
    (v) => v !== null && v !== undefined && !Number.isNaN(v)
  );

  return valid.length ? Math.min(...valid) : null;
};

const getMax = (values) => {
  const valid = values.filter(
    (v) => v !== null && v !== undefined && !Number.isNaN(v)
  );

  return valid.length ? Math.max(...valid) : null;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

/* ============================================================================
   ICONS
============================================================================ */

const TrendIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="14 7 21 7 21 14" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.36.7.64.97.28.27.66.42 1.05.43H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" />
  </svg>
);

const DataIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
    <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </svg>
);

/* ============================================================================
   CUSTOM TOOLTIP
============================================================================ */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const filteredPayload = payload.filter(
    (entry) =>
      entry.value !== null &&
      entry.value !== undefined &&
      !Number.isNaN(entry.value)
  );

  if (!filteredPayload.length) return null;

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.96)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "12px 14px",
        boxShadow: "0 16px 40px rgba(15,23,42,0.22)",
        minWidth: "190px",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        X: {label}
      </div>

      {filteredPayload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            marginTop: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              color: "#cbd5e1",
              fontSize: "11px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: entry.color,
              }}
            />

            {entry.name}
          </div>

          <strong
            style={{
              color: "#ffffff",
              fontSize: "11px",
            }}
          >
            {formatNumber(entry.value)}
          </strong>
        </div>
      ))}
    </div>
  );
};

/* ============================================================================
   KPI CARD
============================================================================ */

const MetricCard = ({
  label,
  value,
  helper,
  icon,
  iconBackground = "#eff6ff",
  iconColor = "#2563eb",
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5eaf2",
        borderRadius: "14px",
        padding: "18px",
        boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "15px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              fontWeight: 600,
              marginBottom: "7px",
            }}
          >
            {label}
          </div>

          <div
            style={{
              color: "#0f172a",
              fontWeight: 800,
              fontSize: "25px",
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "11px",
              color: "#94a3b8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {helper}
          </div>
        </div>

        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconBackground,
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   COMPONENT
============================================================================ */

const IndustrialTrendViewTab = ({
  withProductData = [],
  withoutProductData = [],
  availableColumns = [],
  title = "Industrial Trend Comparison",
}) => {
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");

  const [showRaw, setShowRaw] = useState(true);
  const [showTrend, setShowTrend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showReference, setShowReference] = useState(true);

  const [movingAverageWindow, setMovingAverageWindow] = useState(3);
  const [referenceValue, setReferenceValue] = useState(7);

  /* ==========================================================================
     INITIAL AXES
  ========================================================================== */

  useEffect(() => {
    if (!availableColumns.length) return;

    setXAxis((current) => {
      if (current && availableColumns.includes(current)) {
        return current;
      }

      return availableColumns[0] || "";
    });

    setYAxis((current) => {
      if (current && availableColumns.includes(current)) {
        return current;
      }

      return availableColumns[1] || availableColumns[0] || "";
    });
  }, [availableColumns]);

  /* ==========================================================================
     DATA
  ========================================================================== */

  const mergedData = useMemo(() => {
    if (!xAxis || !yAxis) return [];

    const maxLen = Math.max(
      withProductData?.length || 0,
      withoutProductData?.length || 0
    );

    const raw = [];

    for (let i = 0; i < maxLen; i++) {
      raw.push({
        xValue:
          withProductData[i]?.[xAxis] ??
          withoutProductData[i]?.[xAxis] ??
          i + 1,

        withVal: getNumeric(withProductData[i], yAxis),

        withoutVal: getNumeric(withoutProductData[i], yAxis),
      });
    }

    const withSmooth = movingAverage(
      raw.map((d) => d.withVal),
      movingAverageWindow
    );

    const withoutSmooth = movingAverage(
      raw.map((d) => d.withoutVal),
      movingAverageWindow
    );

    return raw.map((d, i) => ({
      ...d,
      withSmooth: withSmooth[i],
      withoutSmooth: withoutSmooth[i],
    }));
  }, [
    withProductData,
    withoutProductData,
    xAxis,
    yAxis,
    movingAverageWindow,
  ]);

  /* ==========================================================================
     METRICS
  ========================================================================== */

  const metrics = useMemo(() => {
    const withValues = mergedData
      .map((d) => d.withVal)
      .filter((v) => v !== null);

    const withoutValues = mergedData
      .map((d) => d.withoutVal)
      .filter((v) => v !== null);

    const withAverage = getAverage(withValues);
    const withoutAverage = getAverage(withoutValues);

    const difference =
      withAverage !== null && withoutAverage !== null
        ? withAverage - withoutAverage
        : null;

    return {
      withAverage,
      withoutAverage,
      difference,

      withMin: getMin(withValues),
      withMax: getMax(withValues),

      withoutMin: getMin(withoutValues),
      withoutMax: getMax(withoutValues),

      withCount: withValues.length,
      withoutCount: withoutValues.length,
    };
  }, [mergedData]);

  /* ==========================================================================
     STYLES
  ========================================================================== */

  const styles = {
    page: {
      width: "100%",
      boxSizing: "border-box",
      background:
        "linear-gradient(180deg, #f6f8fc 0%, #fbfcfe 45%, #ffffff 100%)",
      padding: "24px",
      borderRadius: "18px",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#0f172a",
    },

    surface: {
      background: "#ffffff",
      border: "1px solid #e5eaf2",
      borderRadius: "16px",
      boxShadow: "0 8px 28px rgba(15,23,42,0.055)",
    },

    label: {
      display: "block",
      color: "#475569",
      fontSize: "12px",
      fontWeight: 700,
      marginBottom: "7px",
    },

    select: {
      width: "100%",
      height: "42px",
      borderRadius: "9px",
      border: "1px solid #d8e0ec",
      background: "#ffffff",
      padding: "0 12px",
      color: "#334155",
      fontSize: "13px",
      outline: "none",
      cursor: "pointer",
    },

    button: {
      border: "1px solid #d8e0ec",
      background: "#ffffff",
      borderRadius: "9px",
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: 700,
      color: "#475569",
      cursor: "pointer",
    },
  };

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div style={styles.page}>
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div
        style={{
          ...styles.surface,
          position: "relative",
          overflow: "hidden",
          padding: "22px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "#eff6ff",
            right: "-75px",
            top: "-130px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "#172b4d",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(23,43,77,0.18)",
              }}
            >
              <TrendIcon />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "21px",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  color: "#0f172a",
                }}
              >
                {title}
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                }}
              >
                Compare process behavior with and without product intervention.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "#eff6ff",
                color: "#2563eb",
                borderRadius: "20px",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {metrics.withCount} With Product
            </span>

            <span
              style={{
                background: "#f1f5f9",
                color: "#475569",
                borderRadius: "20px",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {metrics.withoutCount} Without Product
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          CONFIGURATION
      ================================================================= */}

      <div
        style={{
          ...styles.surface,
          padding: "20px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "17px",
          }}
        >
          <div style={{ color: "#64748b" }}>
            <SettingsIcon />
          </div>

          <div>
            <div
              style={{
                fontWeight: 800,
                color: "#172b4d",
                fontSize: "14px",
              }}
            >
              Chart Configuration
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: "11px",
                marginTop: "2px",
              }}
            >
              Select variables and adjust trend analysis.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label style={styles.label}>X Axis</label>

            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              style={styles.select}
            >
              <option value="">Select X Axis</option>

              {availableColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Y Axis</label>

            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Y Axis</option>

              {availableColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Moving Average Window</label>

            <select
              value={movingAverageWindow}
              onChange={(e) =>
                setMovingAverageWindow(Number(e.target.value))
              }
              style={styles.select}
            >
              <option value={2}>2 points</option>
              <option value={3}>3 points</option>
              <option value={5}>5 points</option>
              <option value={7}>7 points</option>
              <option value={10}>10 points</option>
              <option value={15}>15 points</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Reference Limit</label>

            <input
              type="number"
              value={referenceValue}
              onChange={(e) => setReferenceValue(Number(e.target.value))}
              style={{
                ...styles.select,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          KPI CARDS
      ================================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <MetricCard
          label="With Product Average"
          value={formatNumber(metrics.withAverage)}
          helper={
            metrics.withMin !== null
              ? `Range ${formatNumber(metrics.withMin)} – ${formatNumber(
                  metrics.withMax
                )}`
              : "No valid data"
          }
          icon={<TrendIcon />}
          iconBackground="#eff6ff"
          iconColor="#2563eb"
        />

        <MetricCard
          label="Without Product Average"
          value={formatNumber(metrics.withoutAverage)}
          helper={
            metrics.withoutMin !== null
              ? `Range ${formatNumber(metrics.withoutMin)} – ${formatNumber(
                  metrics.withoutMax
                )}`
              : "No valid data"
          }
          icon={<TrendIcon />}
          iconBackground="#f1f5f9"
          iconColor="#334155"
        />

        <MetricCard
          label="Average Difference"
          value={
            metrics.difference !== null
              ? `${metrics.difference > 0 ? "+" : ""}${formatNumber(
                  metrics.difference
                )}`
              : "N/A"
          }
          helper="With Product − Without Product"
          icon={<DataIcon />}
          iconBackground="#f5f3ff"
          iconColor="#7c3aed"
        />

        <MetricCard
          label="Trend Window"
          value={`${movingAverageWindow}`}
          helper="Moving average points"
          icon={<SettingsIcon />}
          iconBackground="#ecfdf5"
          iconColor="#059669"
        />
      </div>

      {/* ================================================================
          CHART
      ================================================================= */}

      <div
        style={{
          ...styles.surface,
          padding: "20px",
        }}
      >
        {/* Chart header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "18px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Analysis Output
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#172b4d",
                fontSize: "16px",
                fontWeight: 800,
              }}
            >
              Process Trend
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                marginTop: "3px",
              }}
            >
              {xAxis || "X variable"} against {yAxis || "Y variable"}
            </div>
          </div>

          {/* Chart controls */}

          <div
            style={{
              display: "flex",
              gap: "7px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={{
                ...styles.button,
                background: showRaw ? "#eff6ff" : "#ffffff",
                borderColor: showRaw ? "#bfdbfe" : "#d8e0ec",
                color: showRaw ? "#1d4ed8" : "#64748b",
              }}
              onClick={() => setShowRaw((prev) => !prev)}
            >
              Raw Data
            </button>

            <button
              type="button"
              style={{
                ...styles.button,
                background: showTrend ? "#f5f3ff" : "#ffffff",
                borderColor: showTrend ? "#ddd6fe" : "#d8e0ec",
                color: showTrend ? "#6d28d9" : "#64748b",
              }}
              onClick={() => setShowTrend((prev) => !prev)}
            >
              Trend Lines
            </button>

            <button
              type="button"
              style={{
                ...styles.button,
                background: showGrid ? "#f8fafc" : "#ffffff",
              }}
              onClick={() => setShowGrid((prev) => !prev)}
            >
              Grid
            </button>

            <button
              type="button"
              style={{
                ...styles.button,
                background: showReference ? "#fef2f2" : "#ffffff",
                borderColor: showReference ? "#fecaca" : "#d8e0ec",
                color: showReference ? "#b91c1c" : "#64748b",
              }}
              onClick={() => setShowReference((prev) => !prev)}
            >
              Reference
            </button>
          </div>
        </div>

        {/* Custom legend */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            background: "#fafbfd",
            border: "1px solid #edf0f5",
            borderRadius: "10px",
            padding: "9px 12px",
            marginBottom: "12px",
          }}
        >
          <LegendItem color="#2563eb" label="With Product" />

          <LegendItem color="#334155" label="Without Product" />

          {showTrend && (
            <LegendItem
              color="#7c3aed"
              label="Smoothed Trends"
              dashed
            />
          )}

          {showReference && (
            <LegendItem
              color="#dc2626"
              label={`Reference: ${formatNumber(referenceValue)}`}
              dashed
            />
          )}
        </div>

        {/* Actual chart */}

        <div
          style={{
            width: "100%",
            height: "500px",
            border: "1px solid #edf0f5",
            borderRadius: "12px",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          {!xAxis || !yAxis ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "8px",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "11px",
                  background: "#f1f5f9",
                  color: "#64748b",
                }}
              >
                <TrendIcon />
              </div>

              <strong
                style={{
                  color: "#334155",
                  fontSize: "13px",
                }}
              >
                Select your chart variables
              </strong>

              <span style={{ fontSize: "11px" }}>
                Choose an X and Y axis above to generate the trend comparison.
              </span>
            </div>
          ) : mergedData.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              No numeric data is available for the selected variables.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mergedData}
                margin={{
                  top: 30,
                  right: 35,
                  left: 15,
                  bottom: 35,
                }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e9edf3"
                    vertical={false}
                  />
                )}

                <XAxis
                  dataKey="xValue"
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={{
                    stroke: "#cbd5e1",
                  }}
                  label={{
                    value: xAxis,
                    position: "insideBottom",
                    offset: -20,
                    fill: "#475569",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <YAxis
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={65}
                  label={{
                    value: yAxis,
                    angle: -90,
                    position: "insideLeft",
                    fill: "#475569",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Hidden native legend prevents Recharts from
                    reserving space while custom legend is used */}
                <Legend content={() => null} />

                {showReference && (
                  <ReferenceLine
                    y={referenceValue}
                    stroke="#dc2626"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    label={{
                      value: `Reference ${formatNumber(referenceValue)}`,
                      position: "insideTopRight",
                      fill: "#dc2626",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}

                {/* WITHOUT PRODUCT RAW */}

                {showRaw && (
                  <Line
                    type="linear"
                    dataKey="withoutVal"
                    stroke="#334155"
                    strokeWidth={2}
                    dot={{
                      r: 2.5,
                      fill: "#334155",
                      stroke: "#ffffff",
                      strokeWidth: 1,
                    }}
                    activeDot={{
                      r: 5,
                      fill: "#334155",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    name="Without Product"
                    connectNulls
                    isAnimationActive={false}
                  />
                )}

                {/* WITH PRODUCT RAW */}

                {showRaw && (
                  <Line
                    type="linear"
                    dataKey="withVal"
                    stroke="#2563eb"
                    strokeWidth={2.25}
                    dot={{
                      r: 2.5,
                      fill: "#2563eb",
                      stroke: "#ffffff",
                      strokeWidth: 1,
                    }}
                    activeDot={{
                      r: 5,
                      fill: "#2563eb",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    name="With Product"
                    connectNulls
                    isAnimationActive={false}
                  />
                )}

                {/* WITHOUT PRODUCT TREND */}

                {showTrend && (
                  <Line
                    type="monotone"
                    dataKey="withoutSmooth"
                    stroke="#94a3b8"
                    strokeWidth={2.5}
                    strokeDasharray="7 5"
                    dot={false}
                    name="Without Trend"
                    connectNulls
                    isAnimationActive={false}
                  />
                )}

                {/* WITH PRODUCT TREND */}

                {showTrend && (
                  <Line
                    type="monotone"
                    dataKey="withSmooth"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    strokeDasharray="7 5"
                    dot={false}
                    name="With Trend"
                    connectNulls
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "12px",
            color: "#94a3b8",
            fontSize: "10px",
          }}
        >
          <span>
            Solid lines represent raw process measurements. Dashed lines show
            moving-average trends.
          </span>

          <span>
            Moving average window: {movingAverageWindow} points
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   LEGEND ITEM
============================================================================ */

const LegendItem = ({
  color,
  label,
  dashed = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
      }}
    >
      <span
        style={{
          width: "22px",
          height: 0,
          borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`,
        }}
      />

      <span
        style={{
          color: "#475569",
          fontSize: "11px",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export default IndustrialTrendViewTab;