import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';

const Footer = () => {
    return (
        <Box sx={{ background: '#0A1929', color: 'white', py: 6 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'start', gap: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'start', md: 'start' }, mb: { xs: 6, md: 0 }, gap: 2 }}>
                        <img src="/abhitech-logo.png" alt="Abhitech Logo" style={{ height: '40px', marginBottom: '8px' }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.5rem', fontFamily: "'Poppins', sans-serif", textAlign: { xs: 'left', md: 'left' } }}>
                            Abhitech Statistical Analysis Tool
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4, maxWidth: '80%' }}>
                            Our statistical analysis tool helps you measure and validate the impact of Abhitech's solutions on your operations.
                        </Typography>
                    </Box>

                    <Box sx={{ mt: { xs: 6, md: 0 }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'start', md: 'end' }, gap: 4 }}>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Follow us on
                            </Typography>
                            <a
                                href="https://www.linkedin.com/company/abhitech-energycon-limited/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', color: 'white', textDecoration: 'none', transition: 'color 0.3s, transform 0.3s' }}
                                onMouseOver={(e) => (e.currentTarget.style.color = '#60A5FA')}
                                onMouseOut={(e) => (e.currentTarget.style.color = 'white')}
                            >
                                <span style={{ marginRight: '8px' }}>LinkedIn</span>
                                <LinkedInIcon style={{ fontSize: 24 }} />
                            </a>
                        </Box>

                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Contact Us
                            </Typography>
                            <a
                                href="tel:+912228479999"
                                style={{ display: 'inline-flex', alignItems: 'center', color: 'white', textDecoration: 'none', transition: 'color 0.3s, transform 0.3s' }}
                                onMouseOver={(e) => (e.currentTarget.style.color = '#60A5FA')}
                                onMouseOut={(e) => (e.currentTarget.style.color = 'white')}
                            >
                                <PhoneIcon style={{ fontSize: 20, marginRight: '8px' }} />
                                <span>+91-(22) 28479999 / +91-(22) 28570616</span>
                            </a>
                            <a
                                href="mailto:abhitech@abhitechenergycon.com"
                                style={{ display: 'inline-flex', alignItems: 'center', color: 'white', textDecoration: 'none', transition: 'color 0.3s, transform 0.3s' }}
                                onMouseOver={(e) => (e.currentTarget.style.color = '#60A5FA')}
                                onMouseOut={(e) => (e.currentTarget.style.color = 'white')}
                            >
                                <MailIcon style={{ fontSize: 20, marginRight: '8px' }} />
                                <span>abhitech@abhitechenergycon.com</span>
                            </a>
                        </Box>
                    </Box>
                </Box>
                < Box sx={{ textAlign: 'center', mt: 10, pt: 6, borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                        © Abhitechenergycon, 2025 All rights Reserved
                    </Typography>
                </Box >
            </Container >
        </Box >
    );
};

export default Footer;