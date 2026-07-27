import React from 'react';

import {
    Box,
    Container,
    Typography,
    IconButton,
    Tooltip,
    Divider,
    Link,
} from '@mui/material';

import {
    LinkedIn,
    PhoneRounded,
    MailRounded,
    LocationOnRounded,
    OpenInNewRounded,
} from '@mui/icons-material';

/* ============================================================================
   FOOTER
============================================================================ */

const Footer = () => {
    const currentYear = new Date().getFullYear();

    /* ==========================================================================
       CONTACT DETAILS
    ========================================================================== */

    const contactItems = [
        {
            icon: <PhoneRounded />,
            label: 'Phone',
            value: '+91-(22) 28479999 / +91-(22) 28570616',
            href: 'tel:+912228479999',
        },
        {
            icon: <MailRounded />,
            label: 'Email',
            value: 'abhitech@abhitechenergycon.com',
            href: 'mailto:abhitech@abhitechenergycon.com',
        },
    ];

    /* ==========================================================================
       RENDER
    ========================================================================== */

    return (
        <Box
            component="footer"
            sx={{
                position: 'relative',

                overflow: 'hidden',

                mt: {
                    xs: 6,
                    md: 8,
                },

                bgcolor: '#0B172A',

                color: '#FFFFFF',

                borderTop:
                    '1px solid rgba(148, 163, 184, 0.12)',
            }}
        >
            {/* ================================================================
                SUBTLE BACKGROUND DECORATION
            ================================================================= */}

            <Box
                sx={{
                    position: 'absolute',

                    width: 420,
                    height: 420,

                    borderRadius: '50%',

                    right: -180,
                    top: -250,

                    background:
                        'radial-gradient(circle, rgba(37, 99, 235, 0.13) 0%, rgba(37, 99, 235, 0) 70%)',

                    pointerEvents: 'none',
                }}
            />

            <Box
                sx={{
                    position: 'absolute',

                    width: 300,
                    height: 300,

                    borderRadius: '50%',

                    left: -180,
                    bottom: -180,

                    background:
                        'radial-gradient(circle, rgba(14, 165, 233, 0.07) 0%, rgba(14, 165, 233, 0) 70%)',

                    pointerEvents: 'none',
                }}
            />

            {/* ================================================================
                MAIN FOOTER
            ================================================================= */}

            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative',

                    pt: {
                        xs: 5,
                        md: 6,
                    },

                    pb: {
                        xs: 4,
                        md: 4.5,
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'grid',

                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'minmax(0, 1.3fr) minmax(260px, 0.7fr)',
                        },

                        gap: {
                            xs: 5,
                            md: 8,
                        },

                        alignItems: 'start',
                    }}
                >
                    {/* ========================================================
                        BRAND SECTION
                    ======================================================== */}

                    <Box>
                        {/* LOGO */}

                        <Box
                            sx={{
                                display: 'inline-flex',

                                alignItems: 'center',

                                mb: 2.5,
                            }}
                        >
                            <Box
                                component="img"
                                src="/abhitech-logo.png"
                                alt="Abhitech Energycon"
                                sx={{
                                    display: 'block',

                                    maxWidth: {
                                        xs: 170,
                                        sm: 190,
                                    },

                                    height: 'auto',

                                    maxHeight: 48,

                                    objectFit: 'contain',
                                }}
                            />
                        </Box>

                        {/* PRODUCT NAME */}

                        <Typography
                            variant="h5"
                            sx={{
                                maxWidth: 580,

                                color: '#F8FAFC',

                                fontWeight: 800,

                                fontSize: {
                                    xs: '1.25rem',
                                    sm: '1.4rem',
                                },

                                lineHeight: 1.3,

                                letterSpacing: '-0.025em',
                            }}
                        >
                            Abhitech Statistical Analysis Tool
                        </Typography>

                        {/* DESCRIPTION */}

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 1.25,

                                maxWidth: 560,

                                color: '#94A3B8',

                                fontSize: {
                                    xs: '0.8rem',
                                    sm: '0.84rem',
                                },

                                lineHeight: 1.75,
                            }}
                        >
                            Measure, compare, and validate the impact of
                            Abhitech&apos;s solutions on your operations through
                            structured statistical analysis and data
                            visualization.
                        </Typography>

                        {/* PRODUCT TAG */}

                        <Box
                            sx={{
                                mt: 2.5,

                                display: 'flex',

                                alignItems: 'center',

                                gap: 0.8,

                                flexWrap: 'wrap',
                            }}
                        >
                            <FooterBadge>
                                Statistical Analysis
                            </FooterBadge>

                            <FooterBadge>
                                Data Visualization
                            </FooterBadge>

                            <FooterBadge>
                                Industrial Analytics
                            </FooterBadge>
                        </Box>
                    </Box>

                    {/* ========================================================
                        CONTACT SECTION
                    ======================================================== */}

                    <Box>
                        <Typography
                            variant="overline"
                            sx={{
                                display: 'block',

                                mb: 1.75,

                                color: '#64748B',

                                fontSize: '0.65rem',

                                fontWeight: 800,

                                letterSpacing: '0.11em',
                            }}
                        >
                            CONTACT
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',

                                flexDirection: 'column',

                                gap: 1,
                            }}
                        >
                            {contactItems.map((item) => (
                                <ContactItem
                                    key={item.label}
                                    {...item}
                                />
                            ))}
                        </Box>

                        {/* ====================================================
                            SOCIAL
                        ==================================================== */}

                        <Box
                            sx={{
                                mt: 3,
                            }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    display: 'block',

                                    mb: 1.25,

                                    color: '#64748B',

                                    fontSize: '0.65rem',

                                    fontWeight: 800,

                                    letterSpacing: '0.11em',
                                }}
                            >
                                CONNECT
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',

                                    alignItems: 'center',

                                    gap: 1,
                                }}
                            >
                                <Tooltip
                                    title="Abhitech on LinkedIn"
                                    arrow
                                >
                                    <IconButton
                                        component="a"
                                        href="https://www.linkedin.com/company/abhitech-energycon-limited/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Visit Abhitech Energycon on LinkedIn"
                                        sx={{
                                            width: 38,
                                            height: 38,

                                            borderRadius: 1.75,

                                            color: '#CBD5E1',

                                            bgcolor:
                                                'rgba(255,255,255,0.045)',

                                            border:
                                                '1px solid rgba(255,255,255,0.08)',

                                            transition:
                                                'all 160ms ease',

                                            '&:hover': {
                                                color: '#FFFFFF',

                                                bgcolor: '#2563EB',

                                                borderColor: '#2563EB',

                                                transform:
                                                    'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        <LinkedIn
                                            sx={{
                                                fontSize: 19,
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>

                                <Link
                                    href="https://www.linkedin.com/company/abhitech-energycon-limited/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="none"
                                    sx={{
                                        display: 'flex',

                                        alignItems: 'center',

                                        gap: 0.5,

                                        color: '#94A3B8',

                                        fontSize: '0.75rem',

                                        fontWeight: 650,

                                        transition:
                                            'color 150ms ease',

                                        '&:hover': {
                                            color: '#E2E8F0',
                                        },
                                    }}
                                >
                                    LinkedIn

                                    <OpenInNewRounded
                                        sx={{
                                            fontSize: 13,
                                        }}
                                    />
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ============================================================
                    DIVIDER
                ============================================================ */}

                <Divider
                    sx={{
                        mt: {
                            xs: 5,
                            md: 5.5,
                        },

                        borderColor:
                            'rgba(148, 163, 184, 0.12)',
                    }}
                />

                {/* ============================================================
                    BOTTOM BAR
                ============================================================ */}

                <Box
                    sx={{
                        pt: 2.5,

                        display: 'flex',

                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },

                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },

                        justifyContent: 'space-between',

                        gap: 1.5,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#64748B',

                            fontSize: '0.68rem',

                            lineHeight: 1.6,
                        }}
                    >
                        © {currentYear} Abhitech Energycon Limited. All rights
                        reserved.
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',

                            alignItems: 'center',

                            gap: 0.65,

                            color: '#64748B',
                        }}
                    >
                        <LocationOnRounded
                            sx={{
                                fontSize: 14,
                            }}
                        />

                        <Typography
                            variant="caption"
                            sx={{
                                color: '#64748B',

                                fontSize: '0.68rem',
                            }}
                        >
                            Mumbai, India
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

/* ============================================================================
   CONTACT ITEM
============================================================================ */

const ContactItem = ({
    icon,
    label,
    value,
    href,
}) => {
    return (
        <Box
            component="a"
            href={href}
            sx={{
                display: 'flex',

                alignItems: 'center',

                gap: 1.25,

                p: 1.25,

                borderRadius: 2,

                color: 'inherit',

                textDecoration: 'none',

                border:
                    '1px solid transparent',

                transition:
                    'background-color 150ms ease, border-color 150ms ease',

                '&:hover': {
                    bgcolor:
                        'rgba(255,255,255,0.04)',

                    borderColor:
                        'rgba(148,163,184,0.10)',

                    '& .contact-icon': {
                        bgcolor:
                            'rgba(37,99,235,0.16)',

                        color: '#60A5FA',
                    },

                    '& .contact-value': {
                        color: '#FFFFFF',
                    },
                },
            }}
        >
            {/* ICON */}

            <Box
                className="contact-icon"
                sx={{
                    width: 36,
                    height: 36,

                    display: 'grid',

                    placeItems: 'center',

                    flexShrink: 0,

                    borderRadius: 1.6,

                    bgcolor:
                        'rgba(255,255,255,0.05)',

                    color: '#94A3B8',

                    transition:
                        'all 150ms ease',

                    '& svg': {
                        fontSize: 17,
                    },
                }}
            >
                {icon}
            </Box>

            {/* DETAILS */}

            <Box
                sx={{
                    minWidth: 0,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',

                        mb: 0.15,

                        color: '#64748B',

                        fontSize: '0.62rem',

                        fontWeight: 700,

                        textTransform: 'uppercase',

                        letterSpacing: '0.05em',
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    className="contact-value"
                    variant="body2"
                    sx={{
                        color: '#CBD5E1',

                        fontSize: '0.75rem',

                        fontWeight: 600,

                        lineHeight: 1.45,

                        overflowWrap: 'anywhere',

                        transition:
                            'color 150ms ease',
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );
};

/* ============================================================================
   FOOTER BADGE
============================================================================ */

const FooterBadge = ({
    children,
}) => {
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',

                alignItems: 'center',

                px: 1,
                py: 0.45,

                borderRadius: 1.25,

                bgcolor:
                    'rgba(148, 163, 184, 0.06)',

                border:
                    '1px solid rgba(148, 163, 184, 0.10)',

                color: '#94A3B8',

                fontSize: '0.62rem',

                fontWeight: 650,

                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Box>
    );
};

export default Footer;