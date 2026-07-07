const performBootstrapAnalysis = (withValues, withoutValues, column, nBootstraps, confidenceLevel) => {
  if (!withValues.length || !withoutValues.length) {
    return null;
  }

  const withLen = withValues.length;
  const withoutLen = withoutValues.length;

  let sumWith = 0;
  let sumWithout = 0;
  for (let i = 0; i < withLen; i++) sumWith += withValues[i];
  for (let i = 0; i < withoutLen; i++) sumWithout += withoutValues[i];

  const meanWith = sumWith / withLen;
  const meanWithout = sumWithout / withoutLen;
  const observedDiff = meanWith - meanWithout;

  const bootstrapDiffs = new Float64Array(nBootstraps);
  for (let i = 0; i < nBootstraps; i++) {
    let bootSumWith = 0;
    let bootSumWithout = 0;
    for (let j = 0; j < withLen; j++) {
      bootSumWith += withValues[Math.floor(Math.random() * withLen)];
    }
    for (let j = 0; j < withoutLen; j++) {
      bootSumWithout += withoutValues[Math.floor(Math.random() * withoutLen)];
    }
    bootstrapDiffs[i] = bootSumWith / withLen - bootSumWithout / withoutLen;
  }

  bootstrapDiffs.sort();

  const lowerPercentile = (1 - confidenceLevel) / 2;
  const upperPercentile = 1 - lowerPercentile;
  const lowerIndex = Math.floor(bootstrapDiffs.length * lowerPercentile);
  const upperIndex = Math.floor(bootstrapDiffs.length * upperPercentile);

  const ciLower = bootstrapDiffs[lowerIndex];
  const ciUpper = bootstrapDiffs[upperIndex];

  let meanBootstrap = 0;
  for (let i = 0; i < nBootstraps; i++) {
    meanBootstrap += bootstrapDiffs[i];
  }
  meanBootstrap /= nBootstraps;

  let variance = 0;
  for (let i = 0; i < nBootstraps; i++) {
    const diff = bootstrapDiffs[i] - meanBootstrap;
    variance += diff * diff;
  }
  const stdDev = Math.sqrt(variance / nBootstraps);
  const isSignificant = ciLower > 0 || ciUpper < 0;

  return {
    column,
    mean_difference: observedDiff,
    standard_deviation: stdDev,
    confidence_interval: {
      lower_bound: ciLower,
      upper_bound: ciUpper,
    },
    is_significant: isSignificant,
    sample_size_with: withLen,
    sample_size_without: withoutLen,
    n_bootstraps: nBootstraps,
  };
};

self.onmessage = (event) => {
  const {
    columns = [],
    withValuesByColumn = {},
    withoutValuesByColumn = {},
    nBootstraps = 2000,
    confidenceLevel = 0.95,
  } = event.data || {};

  const significantResults = [];
  const nonSignificantResults = [];

  for (const column of columns) {
    const result = performBootstrapAnalysis(
      withValuesByColumn[column] || [],
      withoutValuesByColumn[column] || [],
      column,
      nBootstraps,
      confidenceLevel
    );

    if (!result) continue;

    if (result.is_significant) {
      significantResults.push(result);
    } else {
      nonSignificantResults.push(result);
    }
  }

  significantResults.sort((a, b) => Math.abs(b.mean_difference) - Math.abs(a.mean_difference));
  nonSignificantResults.sort((a, b) => Math.abs(b.mean_difference) - Math.abs(a.mean_difference));

  self.postMessage({
    significant_impact: significantResults,
    no_significant_impact: nonSignificantResults,
    total_columns_analyzed: significantResults.length + nonSignificantResults.length,
  });
};
