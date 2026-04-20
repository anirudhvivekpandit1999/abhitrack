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
  Dot
} from "recharts";

const getNumeric = (row, key) => {
  if (!row || !key) return null;
  const val = parseFloat(row[key]);
  return isNaN(val) ? null : val;
};

const movingAverage = (arr, window = 3) => {
  return arr.map((_, i) => {
    const slice = arr.slice(Math.max(0, i - window), i + 1);
    const vals = slice.filter(v => v !== null && v !== undefined);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
};

const IndustrialTrendViewTab = ({
  withProductData = [],
  withoutProductData = [],
  availableColumns = [],
  title = "Industrial Trend Comparison"
}) => {

  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");

  useEffect(() => {
    if (availableColumns.length >= 2) {
      setXAxis(availableColumns[0]);
      setYAxis(availableColumns[1]);
    }
  }, [availableColumns]);

  const mergedData = useMemo(() => {

    if (!xAxis || !yAxis) return [];

    const maxLen = Math.max(
      withProductData?.length || 0,
      withoutProductData?.length || 0
    );

    const raw = [];

    for (let i = 0; i < maxLen; i++) {
      raw.push({
        xValue: withProductData[i]?.[xAxis] ?? withoutProductData[i]?.[xAxis] ?? i + 1,
        withVal: getNumeric(withProductData[i], yAxis),
        withoutVal: getNumeric(withoutProductData[i], yAxis)
      });
    }

    const withSmooth = movingAverage(raw.map(d => d.withVal));
    const withoutSmooth = movingAverage(raw.map(d => d.withoutVal));

    return raw.map((d, i) => ({
      ...d,
      withSmooth: withSmooth[i],
      withoutSmooth: withoutSmooth[i]
    }));

  }, [withProductData, withoutProductData, xAxis, yAxis]);

  return (
    <div className="w-full bg-white rounded-2xl border p-4 shadow-sm">

      {/* HEADER */}
      <div className="text-sm font-semibold mb-4 text-gray-700">
        {title}
      </div>

      {/* AXIS SELECTORS */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            X Axis
          </label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select X Axis</option>
            {availableColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">
            Y Axis
          </label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select Y Axis</option>
            {availableColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

      </div>

      {/* CHART */}
      <div className="w-full h-[500px]">
        {!xAxis || !yAxis ? (
          <div className="text-sm text-gray-500 p-4">
            Please select X and Y axes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="xValue" />
              <YAxis />
              <Tooltip />

              {/* Without Product */}
              <Line
                type="linear"
                dataKey="withoutVal"
                stroke="#111827"
                strokeWidth={2}
                dot={<Dot r={3} />}
                name="Without OB"
                connectNulls
              />

              {/* With Product */}
              <Line
                type="linear"
                dataKey="withVal"
                stroke="#2563eb"
                strokeWidth={2}
                dot={<Dot r={3} />}
                name="With OB"
                connectNulls
              />

              {/* Trend lines */}
              <Line
                type="monotone"
                dataKey="withoutSmooth"
                stroke="#111827"
                strokeDasharray="5 5"
                dot={false}
                name="Without Trend"
                connectNulls
              />

              <Line
                type="monotone"
                dataKey="withSmooth"
                stroke="#2563eb"
                strokeDasharray="5 5"
                dot={false}
                name="With Trend"
                connectNulls
              />

              <ReferenceLine y={7} stroke="red" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default IndustrialTrendViewTab;