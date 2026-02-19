import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Button,
    Container,
    Grid,
    Typography,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    FileUpload,
    Calculate,
    CheckCircle,
    ArrowForward,
    AttachMoney,
    Factory,
    Timeline,
    Analytics,
    CompareArrows,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'features', 'process', 'benefits', 'cta'];

            let current = 'hero';
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        current = section;
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate('/login');
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            window.scrollTo({
                behavior: 'smooth',
                top: element.offsetTop - 64
            });
        }
    };

    const processSteps = [
        {
            icon: <FileUpload fontSize="large" />,
            title: "Data Validation",
            description: "Upload your 'before' and 'after' data files. Our system validates formats, column matching, and data consistency across measurements."
        },
        {
            icon: <Calculate fontSize="large" />,
            title: "Custom Calculations",
            description: "Create calculated columns using our Excel-like formula builder with intuitive expressions based on your column names."
        },
        {
            icon: <CompareArrows fontSize="large" />,
            title: "Variable Definition",
            description: "Define dependent and independent variables with our drag & drop interface for proper statistical analysis."
        },
        {
            icon: <Analytics fontSize="large" />,
            title: "Data Visualization",
            description: "Interactive dashboards display distribution curves, correlation plots, and statistical metrics with insights."
        }
    ];
    
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const staggerChildren = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <Box
                id="hero"
                className="pt-24 pb-16 min-h-screen flex items-center"
                sx={{
                    background: 'linear-gradient(135deg, #0B3C5D 0%, #1D2D50 100%)',
                    color: 'white'
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box className="mb-8">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInUp}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Typography
                                        variant="h2"
                                        component="h1"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 4,
                                            lineHeight: 1.2,
                                            fontFamily: "'Poppins', sans-serif"
                                        }}
                                    >
                                        Advanced Data Analysis for Efficiency Optimization
                                    </Typography>
                                </motion.div>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInUp}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 6,
                                            color: '#B3E5FC',
                                            fontWeight: 300,
                                            fontFamily: "'Inter', sans-serif"
                                        }}
                                    >
                                        Measure the impact of Abhitech's solutions with statistical precision and interactive visualizations.
                                    </Typography>
                                </motion.div>
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeInUp}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="flex flex-wrap gap-4"
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => scrollToSection('cta')}
                                        sx={{
                                            background: 'white',
                                            color: '#0B3C5D',
                                            fontWeight: 600,
                                            borderRadius: '30px',
                                            padding: '12px 30px',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                            '&:hover': {
                                                background: '#F8F9FA',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Start Your Analysis
                                    </Button>
                                </motion.div>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                transition={{ duration: 0.8 }}
                            >
                                <Box className="bg-white p-6 rounded-xl shadow-xl">
                                    <Box className="bg-gray-50 p-4 rounded-lg relative overflow-hidden">
                                        <Box className="flex justify-between mb-6">
                                            <Box sx={{
                                                background: '#1D2D50',
                                                color: 'white',
                                                px: 3,
                                                py: 1.5,
                                                borderRadius: '8px',
                                                fontWeight: 500
                                            }}>
                                                Before Optimization
                                            </Box>
                                            <Box sx={{
                                                background: '#3282B8',
                                                color: 'white',
                                                px: 3,
                                                py: 1.5,
                                                borderRadius: '8px',
                                                fontWeight: 500
                                            }}>
                                                After Optimization
                                            </Box>
                                        </Box>

                                        <svg width="100%" height="220" className="mb-4">
                                            <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
                                            </pattern>
                                            <rect width="100%" height="100%" fill="url(#smallGrid)" />

                                            <text x="5" y="15" fontSize="10" fill="#666">Consumption</text>
                                            <text x="360" y="210" fontSize="10" fill="#666">Time</text>

                                            <path d="M 20 180 L 60 150 L 100 170 L 140 160 L 180 140 L 220 150 L 260 130 L 300 140 L 340 120 L 380 130 L 380 200 L 20 200 Z"
                                                fill="rgba(29, 45, 80, 0.1)" stroke="none" />

                                            <path d="M 20 180 L 60 150 L 100 170 L 140 160 L 180 140 L 220 150 L 260 130 L 300 140 L 340 120 L 380 130"
                                                stroke="#1D2D50" fill="none" strokeWidth="3" />

                                            <path d="M 20 160 L 60 130 L 100 120 L 140 100 L 180 80 L 220 70 L 260 60 L 300 50 L 340 40 L 380 30 L 380 200 L 20 200 Z"
                                                fill="rgba(50, 130, 184, 0.1)" stroke="none" />

                                            <path d="M 20 160 L 60 130 L 100 120 L 140 100 L 180 80 L 220 70 L 260 60 L 300 50 L 340 40 L 380 30"
                                                stroke="#3282B8" fill="none" strokeWidth="3" />

                                            <circle cx="20" cy="180" r="4" fill="#1D2D50" />
                                            <circle cx="100" cy="170" r="4" fill="#1D2D50" />
                                            <circle cx="180" cy="140" r="4" fill="#1D2D50" />
                                            <circle cx="260" cy="130" r="4" fill="#1D2D50" />
                                            <circle cx="340" cy="120" r="4" fill="#1D2D50" />
                                            <circle cx="380" cy="130" r="4" fill="#1D2D50" />

                                            <circle cx="20" cy="160" r="4" fill="#3282B8" />
                                            <circle cx="100" cy="120" r="4" fill="#3282B8" />
                                            <circle cx="180" cy="80" r="4" fill="#3282B8" />
                                            <circle cx="260" cy="60" r="4" fill="#3282B8" />
                                            <circle cx="340" cy="40" r="4" fill="#3282B8" />
                                            <circle cx="380" cy="30" r="4" fill="#3282B8" />

                                            <text x="20" y="215" fontSize="10" fill="#666">Jan</text>
                                            <text x="100" y="215" fontSize="10" fill="#666">Mar</text>
                                            <text x="180" y="215" fontSize="10" fill="#666">May</text>
                                            <text x="260" y="215" fontSize="10" fill="#666">Jul</text>
                                            <text x="340" y="215" fontSize="10" fill="#666">Sep</text>
                                        </svg>

                                        <Box className="flex justify-between mb-4 p-3 bg-white rounded-lg shadow-sm">
                                            <Typography variant="subtitle2" sx={{ color: '#1D2D50', fontWeight: 500 }}>
                                                Load
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ color: '#0B5394', fontWeight: 700 }}>
                                                -24.7%
                                            </Typography>
                                        </Box>

                                        <Box className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
                                            <Typography variant="subtitle2" sx={{ color: '#1D2D50', fontWeight: 500 }}>
                                                LHS RHS Spray
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ color: '#0B5394', fontWeight: 700 }}>
                                                -32.5%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box className="flex justify-between items-center mt-4 px-2">
                                        <Typography variant="caption" sx={{ color: '#0B3C5D', fontWeight: 500 }}>
                                            Abhitech Energycon Limited
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            
            <Box id="process" className="py-20" sx={{ background: '#F8FAFC' }}>
                <Container maxWidth="lg">
                    <Box className="text-center mb-16">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    color: '#0B3C5D',
                                    fontWeight: 600,
                                    letterSpacing: '1.5px',
                                    mb: 2,
                                    display: 'block'
                                }}
                            >
                                FOUR-STEP METHODOLOGY
                            </Typography>
                            <Typography
                                variant="h3"
                                component="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 4,
                                    color: '#1D2D50',
                                    fontFamily: "'Poppins', sans-serif"
                                }}
                            >
                                Comprehensive Data Analysis Workflow
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#475569',
                                    maxWidth: '42rem',
                                    mx: 'auto',
                                    fontWeight: 400,
                                    lineHeight: 1.6,
                                    fontFamily: "'Inter', sans-serif"
                                }}
                            >
                                Our systematic approach delivers clear insights through a four-stage process designed for statistical precision.
                            </Typography>
                        </motion.div>
                    </Box>

                    <Box className="relative">
                        {!isMobile && (
                            <Box
                                className="absolute top-24 left-12 right-12 h-1 rounded-full"
                                sx={{ background: 'rgba(11,60,93,0.15)' }}
                            />
                        )}

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerChildren}
                        >
                            <Grid container spacing={isMobile ? 6 : 3}>
                                {processSteps.map((step, index) => (
                                    <Grid item xs={12} md={3} key={index}>
                                        <motion.div
                                            variants={fadeInUp}
                                            className="relative"
                                        >
                                            <Box className="flex flex-col items-center">
                                                <Box sx={{
                                                    background: 'linear-gradient(135deg, #0B3C5D 0%, #3282B8 100%)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: '64px',
                                                    height: '64px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 3,
                                                    zIndex: 10,
                                                    boxShadow: '0 10px 20px rgba(11,60,93,0.2)'
                                                }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                                        {index + 1}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{
                                                    background: 'white',
                                                    p: 3,
                                                    borderRadius: '16px',
                                                    textAlign: 'center',
                                                    height: '100%',
                                                    borderBottom: '4px solid #0B3C5D',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                                                    }
                                                }}>
                                                    <Box sx={{ color: '#0B3C5D', mb: 2 }}>
                                                        {step.icon}
                                                    </Box>
                                                    <Typography
                                                        variant="h5"
                                                        component="h3"
                                                        sx={{
                                                            fontWeight: 700,
                                                            mb: 2,
                                                            color: '#1D2D50',
                                                            fontFamily: "'Poppins', sans-serif"
                                                        }}
                                                    >
                                                        {step.title}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: '#475569' }}>
                                                        {step.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Box>
                </Container>
            </Box>

            <Box id="benefits" className="py-20 bg-white">
                <Container maxWidth="lg">
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                            >
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: '#0B3C5D',
                                        fontWeight: 600,
                                        letterSpacing: '1.5px',
                                        mb: 2,
                                        display: 'block'
                                    }}
                                >
                                    DATA-DRIVEN DECISIONS
                                </Typography>
                                <Typography
                                    variant="h3"
                                    component="h2"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 4,
                                        color: '#1D2D50',
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                >
                                    Statistical Insights That Drive Performance
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#475569',
                                        mb: 5,
                                        lineHeight: 1.7,
                                        fontSize: '1.05rem'
                                    }}
                                >
                                    Our analytical tools are specifically designed for industries using solid and liquid fuels to help you:
                                </Typography>

                                <Box>
                                    {[
                                        "Compare before/after data with robust statistical methods to validate performance improvements",
                                        "Identify specific processes with highest optimization potential through correlation analysis",
                                        "Generate interactive visualizations showcasing efficiency gains with explanatory insights",
                                        "Make data-driven decisions with confidence using bootstrapping and distribution analysis"
                                    ].map((benefit, index) => (
                                        <Box key={index} className="flex items-start mb-4">
                                            <CheckCircle sx={{ color: '#0B3C5D', mr: 2, mt: 0.5 }} />
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#334155',
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {benefit}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeIn}
                                transition={{ duration: 0.7 }}
                            >
                                <Box sx={{
                                    background: '#F8FAFC',
                                    p: 4,
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                    border: '1px solid #E2E8F0'
                                }}>
                                    <Box className="mb-6">
                                        <Typography
                                            variant="h5"
                                            component="h3"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 1,
                                                color: '#1D2D50',
                                                fontFamily: "'Poppins', sans-serif"
                                            }}
                                        >
                                            Real Analysis Results
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                                            Based on actual implementation data
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        background: 'white',
                                        p: 3,
                                        borderRadius: '12px',
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                                    }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 3,
                                                color: '#1D2D50'
                                            }}
                                        >
                                            Performance Metrics
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    background: '#F8FAFC',
                                                    p: 3,
                                                    borderRadius: '10px',
                                                    textAlign: 'center',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0B3C5D' }}>Central Tendency</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    background: '#F8FAFC',
                                                    p: 3,
                                                    borderRadius: '10px',
                                                    textAlign: 'center',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0B3C5D' }}>Distribution</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    background: '#F8FAFC',
                                                    p: 3,
                                                    borderRadius: '10px',
                                                    textAlign: 'center',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0B3C5D' }}>Correlation</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{
                                                    background: '#F8FAFC',
                                                    p: 3,
                                                    borderRadius: '10px',
                                                    textAlign: 'center',
                                                    height: '100%'
                                                }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0B3C5D' }}>Bootstrapping</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Box id="cta" className="py-20" sx={{
                background: 'linear-gradient(135deg, #0B3C5D 0%, #1D2D50 100%)',
                color: 'white'
            }}>
                <Container maxWidth="md">
                    <Box className="text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    color: '#BBE1FA',
                                    fontWeight: 600,
                                    letterSpacing: '1.5px',
                                    mb: 2,
                                    display: 'block'
                                }}
                            >
                                START YOUR ANALYSIS
                            </Typography>
                            <Typography
                                variant="h3"
                                component="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 4,
                                    fontFamily: "'Poppins', sans-serif"
                                }}
                            >
                                Ready to Dive Into Your Data?
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 8,
                                    color: '#BBE1FA',
                                    fontWeight: 300,
                                    maxWidth: '42rem',
                                    mx: 'auto',
                                    lineHeight: 1.6,
                                    fontFamily: "'Inter', sans-serif"
                                }}
                            >
                                Start measuring the impact of Abhitech's solutions with our robust statistical analysis tools and interactive visualizations.
                            </Typography>
                            <Box className="flex flex-wrap justify-center gap-4">
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate('/full-excel-file')}
                                    sx={{
                                        background: 'white',
                                        color: '#0B3C5D',
                                        fontWeight: 600,
                                        borderRadius: '30px',
                                        padding: '12px 30px',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                        '&:hover': {
                                            background: '#F8F9FA',
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Upload Your Data
                                </Button>
                            </Box>
                        </motion.div>
                    </Box>
                </Container>
            </Box>
        </div>
    );
}

export default Landing;