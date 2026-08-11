import React from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Analytics,
    ArrowForward,
    Calculate,
    CheckCircleRounded,
    CompareArrows,
    FileUploadOutlined,
    InsightsRounded,
    KeyboardArrowDownRounded,
    QueryStatsRounded,
    ScienceRounded,
    SecurityRounded,
    SpeedRounded,
    TrendingDownRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const COLORS = {
    navy: '#0B1F33',
    navySoft: '#12314D',
    blue: '#2563EB',
    blueLight: '#60A5FA',
    cyan: '#38BDF8',
    text: '#172033',
    muted: '#667085',
    border: '#E4E7EC',
    surface: '#F7F9FC',
    success: '#059669',
    purple: '#7C3AED',
    purpleLight: '#A78BFA',
    gradientStart: '#6366F1',
    gradientEnd: '#8B5CF6',
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

function MiniChart() {
    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: 210, sm: 250 },
                mt: 2,
                overflow: 'hidden',
                borderRadius: 3,
                bgcolor: '#FBFCFE',
                border: `1px solid ${COLORS.border}`,
            }}
        >
            <svg
                viewBox="0 0 620 250"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                aria-label="Before and after optimization performance chart"
            >
                <defs>
                    <linearGradient id="beforeArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#64748B" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="afterArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                    <pattern id="grid" width="62" height="50" patternUnits="userSpaceOnUse">
                        <path
                            d="M 62 0 L 0 0 0 50"
                            fill="none"
                            stroke="#E9EDF3"
                            strokeWidth="1"
                        />
                    </pattern>
                </defs>

                <rect width="620" height="250" fill="url(#grid)" />

                <path
                    d="M 0 184 C 50 168, 75 177, 120 160 S 205 171, 250 145 S 330 157, 375 136 S 460 146, 505 124 S 570 132, 620 112 L 620 250 L 0 250 Z"
                    fill="url(#beforeArea)"
                />
                <path
                    d="M 0 184 C 50 168, 75 177, 120 160 S 205 171, 250 145 S 330 157, 375 136 S 460 146, 505 124 S 570 132, 620 112"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                <path
                    d="M 0 164 C 55 150, 85 139, 125 128 S 200 118, 250 102 S 325 91, 375 78 S 455 65, 505 51 S 575 42, 620 30 L 620 250 L 0 250 Z"
                    fill="url(#afterArea)"
                />
                <path
                    d="M 0 164 C 55 150, 85 139, 125 128 S 200 118, 250 102 S 325 91, 375 78 S 455 65, 505 51 S 575 42, 620 30"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                {[0, 125, 250, 375, 505, 620].map((x, index) => {
                    const beforeY = [184, 160, 145, 136, 124, 112][index];
                    const afterY = [164, 128, 102, 78, 51, 30][index];
                    return (
                        <React.Fragment key={x}>
                            <circle cx={x} cy={beforeY} r="4.5" fill="#64748B" />
                            <circle cx={x} cy={afterY} r="5" fill="#2563EB" />
                        </React.Fragment>
                    );
                })}
            </svg>

            <Stack
                direction="row"
                spacing={2.5}
                sx={{
                    position: 'absolute',
                    top: 14,
                    left: 16,
                    px: 1.5,
                    py: 0.8,
                    bgcolor: 'rgba(255,255,255,.9)',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 2,
                    backdropFilter: 'blur(8px)',
                }}
            >
                <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#64748B' }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>
                        Before
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.blue }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>
                        After
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

function MetricCard({ label, value, helper, icon }) {
    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                bgcolor: '#FFFFFF',
                minWidth: 0,
                boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                    transform: 'translateY(-2px)',
                }
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.2}>
                <Box>
                    <Typography
                        sx={{
                            color: COLORS.muted,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {label}
                    </Typography>
                    <Typography
                        sx={{
                            color: COLORS.text,
                            fontSize: { xs: 24, sm: 28 },
                            fontWeight: 800,
                            lineHeight: 1.1,
                            mt: 0.8,
                            background: 'linear-gradient(135deg, #1E293B 0%, #475569 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                        color: COLORS.blue,
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                        '& svg': { fontSize: 20 },
                    }}
                >
                    {icon}
                </Box>
            </Stack>
            <Typography sx={{ mt: 1, color: COLORS.muted, fontSize: 12.5, lineHeight: 1.5 }}>
                {helper}
            </Typography>
        </Box>
    );
}

function Landing() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const processSteps = [
        {
            icon: <FileUploadOutlined />,
            number: '01',
            title: 'Validate your data',
            description:
                "Upload before and after datasets. AbhiStat checks file structure, columns and measurement consistency before analysis.",
        },
        {
            icon: <Calculate />,
            number: '02',
            title: 'Build calculations',
            description:
                'Create calculated variables with an Excel-like formula workflow using the columns already present in your dataset.',
        },
        {
            icon: <CompareArrows />,
            number: '03',
            title: 'Define relationships',
            description:
                'Choose dependent and independent variables to establish the statistical relationships you want to investigate.',
        },
        {
            icon: <Analytics />,
            number: '04',
            title: 'Explore the evidence',
            description:
                'Review distributions, correlations, bootstrapping results and interactive visualizations in one analysis workspace.',
        },
    ];

    const benefits = [
        'Compare before and after performance with statistical evidence rather than visual guesswork.',
        'Find the variables most strongly associated with changes in process performance.',
        'Inspect distributions and uncertainty before drawing conclusions from averages alone.',
        'Turn complex operating data into clear visual evidence for engineering and management teams.',
    ];

    const analysisTypes = [
        { label: 'Central tendency', icon: <QueryStatsRounded /> },
        { label: 'Distribution', icon: <ScienceRounded /> },
        { label: 'Correlation', icon: <InsightsRounded /> },
        { label: 'Bootstrapping', icon: <Analytics /> },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: COLORS.surface,
                color: COLORS.text,
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                overflowX: 'hidden',
            }}
        >
            {/* HERO */}
            <Box
                id="hero"
                sx={{
                    position: 'relative',
                    minHeight: { md: '100vh' },
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    background: `
                        radial-gradient(circle at 82% 18%, rgba(99, 102, 241, 0.15), transparent 28rem),
                        radial-gradient(circle at 18% 85%, rgba(139, 92, 246, 0.12), transparent 32rem),
                        radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08), transparent 40rem),
                        linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)
                    `,
                    color: '#fff',
                    pt: { xs: 8, md: 5 },
                    pb: { xs: 9, md: 6 },
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.2,
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        maskImage: 'linear-gradient(to bottom, black, transparent 90%)',
                        pointerEvents: 'none',
                    }}
                />

                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={{ xs: 7, md: 8 }} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={stagger}
                            >
                                <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                                    <Chip
                                        label="ABHISTAT • INDUSTRIAL ANALYTICS"
                                        size="small"
                                        sx={{
                                            mb: 3,
                                            color: '#DCEEFF',
                                            bgcolor: 'rgba(96,165,250,.10)',
                                            border: '1px solid rgba(147,197,253,.22)',
                                            fontSize: 11,
                                            fontWeight: 800,
                                            letterSpacing: '.09em',
                                            '& .MuiChip-label': { px: 1.5 },
                                        }}
                                    />
                                </motion.div>

                                <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                                    <Typography
                                        component="h1"
                                        sx={{
                                            maxWidth: 760,
                                            fontSize: {
                                                xs: '2.55rem',
                                                sm: '3.5rem',
                                                md: '4rem',
                                                lg: '4.65rem',
                                            },
                                            lineHeight: 1.02,
                                            letterSpacing: '-.045em',
                                            fontWeight: 800,
                                        }}
                                    >
                                        Turn industrial data into{' '}
                                        <Box component="span" sx={{ color: '#7DD3FC' }}>
                                            measurable evidence.
                                        </Box>
                                    </Typography>
                                </motion.div>

                                <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                                    <Typography
                                        sx={{
                                            mt: 3,
                                            maxWidth: 660,
                                            color: '#B8CADB',
                                            fontSize: { xs: 17, md: 19 },
                                            lineHeight: 1.7,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Compare operating conditions, quantify performance changes and
                                        investigate the variables behind them with a statistical workflow
                                        built for Abhitech's industrial optimization projects.
                                    </Typography>
                                </motion.div>

                                <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1.5}
                                        sx={{ mt: 4.5, alignItems: { xs: 'stretch', sm: 'center' } }}
                                    >
                                        <Button
                                            variant="contained"
                                            size="large"
                                            endIcon={<ArrowForward />}
                                            onClick={() => navigate('/full-excel-file')}
                                            sx={{
                                                minHeight: 52,
                                                px: 3.2,
                                                borderRadius: 2.5,
                                                textTransform: 'none',
                                                fontWeight: 800,
                                                fontSize: 15,
                                                bgcolor: '#FFFFFF',
                                                color: COLORS.navy,
                                                boxShadow: '0 12px 30px rgba(0,0,0,.18)',
                                                '&:hover': {
                                                    bgcolor: '#F8FAFC',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 16px 34px rgba(0,0,0,.22)',
                                                },
                                                transition: 'all .2s ease',
                                            }}
                                        >
                                            Start an analysis
                                        </Button>

                                        <Button
                                            size="large"
                                            endIcon={<KeyboardArrowDownRounded />}
                                            onClick={() => scrollToSection('process')}
                                            sx={{
                                                minHeight: 52,
                                                px: 2.4,
                                                borderRadius: 2.5,
                                                textTransform: 'none',
                                                color: '#D9E7F3',
                                                fontWeight: 700,
                                                border: '1px solid rgba(255,255,255,.15)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,.06)',
                                                    borderColor: 'rgba(255,255,255,.25)',
                                                },
                                            }}
                                        >
                                            See how it works
                                        </Button>
                                    </Stack>
                                </motion.div>

                                <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={{ xs: 1.2, sm: 3 }}
                                        sx={{ mt: 5 }}
                                    >
                                        {[
                                            [<SecurityRounded key="s" />, 'Validated workflow'],
                                            [<SpeedRounded key="p" />, 'Interactive analysis'],
                                            [<InsightsRounded key="i" />, 'Statistical insight'],
                                        ].map(([icon, text]) => (
                                            <Stack
                                                key={text}
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                sx={{ color: '#AFC4D6' }}
                                            >
                                                <Box sx={{ color: '#7DD3FC', display: 'flex', '& svg': { fontSize: 18 } }}>
                                                    {icon}
                                                </Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
                                                    {text}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </motion.div>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.75, delay: 0.18 }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        p: { xs: 1.4, sm: 2 },
                                        borderRadius: 5,
                                        bgcolor: 'rgba(255,255,255,.08)',
                                        border: '1px solid rgba(255,255,255,.12)',
                                        boxShadow: '0 32px 80px rgba(0,0,0,.3)',
                                        backdropFilter: 'blur(12px)',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: { xs: 2, sm: 2.7 },
                                            borderRadius: 3.5,
                                            bgcolor: '#FFFFFF',
                                            color: COLORS.text,
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            spacing={1.5}
                                        >
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: 11,
                                                        fontWeight: 800,
                                                        letterSpacing: '.08em',
                                                        color: COLORS.blue,
                                                        textTransform: 'uppercase',
                                                    }}
                                                >
                                                    Performance comparison
                                                </Typography>
                                                <Typography sx={{ mt: 0.4, fontWeight: 800, fontSize: 20 }}>
                                                    Optimization overview
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={<CheckCircleRounded />}
                                                label="Analysis complete"
                                                size="small"
                                                sx={{
                                                    color: '#047857',
                                                    bgcolor: '#ECFDF5',
                                                    fontWeight: 750,
                                                    '& .MuiChip-icon': { color: '#059669' },
                                                }}
                                            />
                                        </Stack>

                                        <MiniChart />

                                        <Grid container spacing={1.5} sx={{ mt: 0.3 }}>
                                            <Grid item xs={12} sm={4}>
                                                <MetricCard
                                                    label="Load"
                                                    value="-24.7%"
                                                    helper="Change after optimization"
                                                    icon={<TrendingDownRounded />}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <MetricCard
                                                    label="LHS/RHS spray"
                                                    value="-32.5%"
                                                    helper="Measured improvement"
                                                    icon={<InsightsRounded />}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <MetricCard
                                                    label="Confidence"
                                                    value="95%"
                                                    helper="Statistical interval"
                                                    icon={<Analytics />}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            sx={{
                                                mt: 2,
                                                pt: 1.8,
                                                borderTop: `1px solid ${COLORS.border}`,
                                            }}
                                        >
                                            <Typography sx={{ fontSize: 12, color: COLORS.muted, fontWeight: 650 }}>
                                                Abhitech Energycon Limited
                                            </Typography>
                                            <Typography sx={{ fontSize: 12, color: COLORS.blue, fontWeight: 800 }}>
                                                AbhiStat
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* PROCESS */}
            <Box
                id="process"
                component="section"
                sx={{ py: { xs: 9, md: 13 }, bgcolor: COLORS.surface }}
            >
                <Container maxWidth="xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                    >
                        <Box sx={{ maxWidth: 760, mb: { xs: 6, md: 8 } }}>
                            <Typography
                                sx={{
                                    color: COLORS.blue,
                                    fontSize: 12,
                                    fontWeight: 850,
                                    letterSpacing: '.11em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Analysis workflow
                            </Typography>
                            <Typography
                                component="h2"
                                sx={{
                                    mt: 1.3,
                                    color: COLORS.text,
                                    fontSize: { xs: 32, md: 45 },
                                    lineHeight: 1.12,
                                    letterSpacing: '-.035em',
                                    fontWeight: 800,
                                }}
                            >
                                From raw spreadsheet to defensible insight.
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 2.2,
                                    color: COLORS.muted,
                                    fontSize: { xs: 16, md: 18 },
                                    lineHeight: 1.7,
                                }}
                            >
                                A focused four-stage workflow keeps data preparation, variable definition
                                and statistical interpretation connected instead of scattering them across
                                disconnected tools.
                            </Typography>
                        </Box>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.12 }}
                        variants={stagger}
                    >
                        <Grid container spacing={2.2}>
                            {processSteps.map((step) => (
                                <Grid item xs={12} sm={6} lg={3} key={step.number}>
                                    <motion.div variants={fadeUp}>
                                        <Box
                                            sx={{
                                                height: '100%',
                                                minHeight: 330,
                                                p: 3.2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: 3.5,
                                                bgcolor: '#FFFFFF',
                                                border: `1px solid ${COLORS.border}`,
                                                boxShadow: '0 8px 28px rgba(16,24,40,.045)',
                                                transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    borderColor: '#BFDBFE',
                                                    boxShadow: '0 18px 42px rgba(16,24,40,.09)',
                                                },
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        borderRadius: 2.5,
                                                        color: COLORS.blue,
                                                        bgcolor: '#EFF6FF',
                                                        '& svg': { fontSize: 25 },
                                                    }}
                                                >
                                                    {step.icon}
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        color: '#D0D5DD',
                                                        fontSize: 14,
                                                        fontWeight: 850,
                                                        letterSpacing: '.08em',
                                                    }}
                                                >
                                                    {step.number}
                                                </Typography>
                                            </Stack>

                                            <Typography
                                                component="h3"
                                                sx={{
                                                    mt: 5,
                                                    color: COLORS.text,
                                                    fontSize: 22,
                                                    fontWeight: 800,
                                                    letterSpacing: '-.02em',
                                                }}
                                            >
                                                {step.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    mt: 1.5,
                                                    color: COLORS.muted,
                                                    fontSize: 14.5,
                                                    lineHeight: 1.72,
                                                }}
                                            >
                                                {step.description}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    mt: 'auto',
                                                    pt: 4,
                                                    height: 3,
                                                    width: 46,
                                                    borderBottom: `3px solid ${COLORS.blue}`,
                                                }}
                                            />
                                        </Box>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </motion.div>
                </Container>
            </Box>

            {/* BENEFITS */}
            <Box
                id="benefits"
                component="section"
                sx={{
                    py: { xs: 9, md: 13 },
                    bgcolor: '#FFFFFF',
                    borderTop: `1px solid ${COLORS.border}`,
                    borderBottom: `1px solid ${COLORS.border}`,
                }}
            >
                <Container maxWidth="xl">
                    <Grid container spacing={{ xs: 7, md: 10 }} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                variants={fadeUp}
                            >
                                <Typography
                                    sx={{
                                        color: COLORS.blue,
                                        fontSize: 12,
                                        fontWeight: 850,
                                        letterSpacing: '.11em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Data-driven decisions
                                </Typography>
                                <Typography
                                    component="h2"
                                    sx={{
                                        mt: 1.3,
                                        maxWidth: 680,
                                        color: COLORS.text,
                                        fontSize: { xs: 32, md: 45 },
                                        lineHeight: 1.12,
                                        letterSpacing: '-.035em',
                                        fontWeight: 800,
                                    }}
                                >
                                    See what changed, then investigate why.
                                </Typography>
                                <Typography
                                    sx={{
                                        mt: 2.2,
                                        maxWidth: 650,
                                        color: COLORS.muted,
                                        fontSize: 17,
                                        lineHeight: 1.72,
                                    }}
                                >
                                    AbhiStat helps engineering teams move beyond a single before-and-after
                                    percentage by exposing distributions, relationships and statistical
                                    uncertainty behind the result.
                                </Typography>

                                <Stack spacing={2.1} sx={{ mt: 4.5 }}>
                                    {benefits.map((benefit) => (
                                        <Stack key={benefit} direction="row" spacing={1.6} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    mt: '2px',
                                                    width: 28,
                                                    height: 28,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    borderRadius: '50%',
                                                    bgcolor: '#ECFDF5',
                                                    color: COLORS.success,
                                                    flexShrink: 0,
                                                    '& svg': { fontSize: 18 },
                                                }}
                                            >
                                                <CheckCircleRounded />
                                            </Box>
                                            <Typography
                                                sx={{
                                                    color: '#344054',
                                                    fontSize: 15.5,
                                                    lineHeight: 1.65,
                                                }}
                                            >
                                                {benefit}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <Box
                                    sx={{
                                        p: { xs: 2, sm: 3 },
                                        borderRadius: 4,
                                        bgcolor: COLORS.surface,
                                        border: `1px solid ${COLORS.border}`,
                                    }}
                                >
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        justifyContent="space-between"
                                        spacing={2}
                                        sx={{ mb: 3 }}
                                    >
                                        <Box>
                                            <Typography sx={{ color: COLORS.text, fontSize: 21, fontWeight: 800 }}>
                                                Analysis workspace
                                            </Typography>
                                            <Typography sx={{ mt: 0.5, color: COLORS.muted, fontSize: 13.5 }}>
                                                Multiple statistical views, one operating dataset.
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label="4 analysis modes"
                                            size="small"
                                            sx={{
                                                alignSelf: { xs: 'flex-start', sm: 'center' },
                                                bgcolor: '#EEF2FF',
                                                color: '#4338CA',
                                                fontWeight: 750,
                                            }}
                                        />
                                    </Stack>

                                    <Grid container spacing={1.5}>
                                        {analysisTypes.map((item, index) => (
                                            <Grid item xs={12} sm={6} key={item.label}>
                                                <Box
                                                    sx={{
                                                        minHeight: 145,
                                                        p: 2.5,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between',
                                                        borderRadius: 3,
                                                        bgcolor: '#FFFFFF',
                                                        border: `1px solid ${COLORS.border}`,
                                                        transition: 'all .2s ease',
                                                        '&:hover': {
                                                            borderColor: '#BFDBFE',
                                                            boxShadow: '0 10px 24px rgba(16,24,40,.06)',
                                                        },
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between">
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                display: 'grid',
                                                                placeItems: 'center',
                                                                borderRadius: 2,
                                                                bgcolor: index === 0 ? '#EFF6FF' : '#F8FAFC',
                                                                color: index === 0 ? COLORS.blue : '#475467',
                                                                '& svg': { fontSize: 22 },
                                                            }}
                                                        >
                                                            {item.icon}
                                                        </Box>
                                                        <Typography sx={{ color: '#D0D5DD', fontSize: 11, fontWeight: 800 }}>
                                                            0{index + 1}
                                                        </Typography>
                                                    </Stack>
                                                    <Typography sx={{ mt: 2.2, color: COLORS.text, fontSize: 16, fontWeight: 750 }}>
                                                        {item.label}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            p: 2.2,
                                            borderRadius: 3,
                                            bgcolor: COLORS.navy,
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            spacing={1}
                                        >
                                            <Box>
                                                <Typography sx={{ fontSize: 12, color: '#9FC2DF', fontWeight: 700 }}>
                                                    RESULT
                                                </Typography>
                                                <Typography sx={{ mt: 0.4, fontSize: 17, fontWeight: 750 }}>
                                                    Evidence you can inspect, compare and explain.
                                                </Typography>
                                            </Box>
                                            <InsightsRounded sx={{ color: '#7DD3FC' }} />
                                        </Stack>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* CTA */}
            <Box
                id="cta"
                component="section"
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    py: { xs: 9, md: 12 },
                    bgcolor: COLORS.navy,
                    color: '#FFFFFF',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        width: 420,
                        height: 420,
                        right: -160,
                        top: -180,
                        borderRadius: '50%',
                        bgcolor: 'rgba(56,189,248,.08)',
                        filter: 'blur(2px)',
                    }}
                />
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                sx={{
                                    color: '#7DD3FC',
                                    fontSize: 12,
                                    fontWeight: 850,
                                    letterSpacing: '.11em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Start your analysis
                            </Typography>
                            <Typography
                                component="h2"
                                sx={{
                                    mt: 1.4,
                                    fontSize: { xs: 34, md: 50 },
                                    lineHeight: 1.1,
                                    letterSpacing: '-.04em',
                                    fontWeight: 800,
                                }}
                            >
                                Your spreadsheet has more to say.
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 2.2,
                                    mx: 'auto',
                                    maxWidth: 650,
                                    color: '#AFC4D6',
                                    fontSize: { xs: 16, md: 18 },
                                    lineHeight: 1.7,
                                }}
                            >
                                Upload your operating data and move from raw measurements to a structured
                                statistical comparison.
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForward />}
                                onClick={() => navigate('/full-excel-file')}
                                sx={{
                                    mt: 4.5,
                                    minHeight: 54,
                                    px: 3.5,
                                    borderRadius: 2.5,
                                    textTransform: 'none',
                                    fontSize: 15,
                                    fontWeight: 800,
                                    bgcolor: '#FFFFFF',
                                    color: COLORS.navy,
                                    boxShadow: '0 12px 30px rgba(0,0,0,.2)',
                                    '&:hover': {
                                        bgcolor: '#F8FAFC',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 16px 36px rgba(0,0,0,.25)',
                                    },
                                    transition: 'all .2s ease',
                                }}
                            >
                                Upload your data
                            </Button>

                            <Typography sx={{ mt: 2, color: '#7897B1', fontSize: 12 }}>
                                AbhiStat • Abhitech Energycon Limited
                            </Typography>
                        </Box>
                    </motion.div>
                </Container>
            </Box>
        </Box>
    );
}

export default Landing;
