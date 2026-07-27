import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Collapse,
} from '@mui/material';

import {
    CheckCircleRounded,
    ErrorRounded,
    InfoRounded,
    FunctionsRounded,
} from '@mui/icons-material';


/* ============================================================================
   SAFE FORMULA EVALUATOR
============================================================================ */

class SafeFormulaEvaluator {

    constructor() {
        this.operators = {

            '+': (a, b) => a + b,

            '-': (a, b) => a - b,

            '*': (a, b) => a * b,

            '/': (a, b) => {

                if (b === 0) {
                    throw new Error(
                        'Division by zero'
                    );
                }

                return a / b;
            },
        };
    }


    /* ========================================================================
       CONVERT INFIX TO POSTFIX
    ======================================================================== */

    infixToPostfix(tokens) {

        const output = [];

        const operators = [];

        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
        };


        for (const token of tokens) {

            if (typeof token === 'number') {

                output.push(token);

            } else if (token === '(') {

                operators.push(token);

            } else if (token === ')') {

                while (
                    operators.length > 0 &&
                    operators[
                        operators.length - 1
                    ] !== '('
                ) {
                    output.push(
                        operators.pop()
                    );
                }


                if (operators.length === 0) {
                    throw new Error(
                        'Mismatched parentheses'
                    );
                }


                operators.pop();

            } else if (this.operators[token]) {

                while (
                    operators.length > 0 &&
                    operators[
                        operators.length - 1
                    ] !== '(' &&
                    precedence[
                        operators[
                            operators.length - 1
                        ]
                    ] >= precedence[token]
                ) {
                    output.push(
                        operators.pop()
                    );
                }


                operators.push(token);

            } else {

                throw new Error(
                    `Unknown operator: ${token}`
                );
            }
        }


        while (operators.length > 0) {

            const operator =
                operators.pop();


            if (
                operator === '(' ||
                operator === ')'
            ) {
                throw new Error(
                    'Mismatched parentheses'
                );
            }


            output.push(operator);
        }


        return output;
    }


    /* ========================================================================
       EVALUATE POSTFIX
    ======================================================================== */

    evaluatePostfix(postfix) {

        const stack = [];


        for (const token of postfix) {

            if (typeof token === 'number') {

                stack.push(token);

            } else if (this.operators[token]) {

                if (stack.length < 2) {
                    throw new Error(
                        'Invalid expression'
                    );
                }


                const b = stack.pop();

                const a = stack.pop();


                stack.push(
                    this.operators[token](a, b)
                );
            }
        }


        if (stack.length !== 1) {
            throw new Error(
                'Invalid expression'
            );
        }


        return stack[0];
    }


    /* ========================================================================
       VALIDATE SYNTAX
    ======================================================================== */

    validateSyntax(tokens) {

        if (tokens.length === 0) {
            throw new Error(
                'Empty expression'
            );
        }


        /* --------------------------------------------------------------------
           START TOKEN
        -------------------------------------------------------------------- */

        if (
            typeof tokens[0] !== 'number' &&
            tokens[0] !== '('
        ) {
            throw new Error(
                'Formula must start with a number, column, or open parenthesis'
            );
        }


        /* --------------------------------------------------------------------
           END TOKEN
        -------------------------------------------------------------------- */

        const lastToken =
            tokens[tokens.length - 1];


        if (
            typeof lastToken !== 'number' &&
            lastToken !== ')'
        ) {
            throw new Error(
                'Formula must end with a number, column, or close parenthesis'
            );
        }


        /* --------------------------------------------------------------------
           TOKEN SEQUENCE
        -------------------------------------------------------------------- */

        let parenthesisCount = 0;


        for (
            let index = 0;
            index < tokens.length;
            index++
        ) {

            const current =
                tokens[index];

            const next =
                tokens[index + 1];


            /* ----------------------------------------------------------------
               PARENTHESES
            ---------------------------------------------------------------- */

            if (current === '(') {

                parenthesisCount++;
            }


            if (current === ')') {

                parenthesisCount--;


                if (parenthesisCount < 0) {
                    throw new Error(
                        'Closing parenthesis appears before an opening parenthesis'
                    );
                }
            }


            if (next === undefined) {
                continue;
            }


            /* ----------------------------------------------------------------
               ADJACENT OPERATORS
            ---------------------------------------------------------------- */

            if (
                this.operators[current] &&
                this.operators[next] &&
                current !== '(' &&
                current !== ')' &&
                next !== '(' &&
                next !== ')'
            ) {
                throw new Error(
                    'Two operators cannot appear next to each other'
                );
            }


            /* ----------------------------------------------------------------
               ADJACENT VALUES
            ---------------------------------------------------------------- */

            if (
                typeof current === 'number' &&
                typeof next === 'number'
            ) {
                throw new Error(
                    'Values must be separated by an operator'
                );
            }


            /* ----------------------------------------------------------------
               NUMBER FOLLOWED BY OPEN PARENTHESIS
            ---------------------------------------------------------------- */

            if (
                typeof current === 'number' &&
                next === '('
            ) {
                throw new Error(
                    'Add an operator before the opening parenthesis'
                );
            }


            /* ----------------------------------------------------------------
               CLOSE PARENTHESIS FOLLOWED BY NUMBER
            ---------------------------------------------------------------- */

            if (
                current === ')' &&
                typeof next === 'number'
            ) {
                throw new Error(
                    'Add an operator after the closing parenthesis'
                );
            }


            /* ----------------------------------------------------------------
               EMPTY PARENTHESES
            ---------------------------------------------------------------- */

            if (
                current === '(' &&
                next === ')'
            ) {
                throw new Error(
                    'Parentheses cannot be empty'
                );
            }


            /* ----------------------------------------------------------------
               INVALID OPERATOR AFTER OPEN PARENTHESIS
            ---------------------------------------------------------------- */

            if (
                current === '(' &&
                this.operators[next] &&
                next !== '('
            ) {
                throw new Error(
                    'An opening parenthesis must be followed by a value'
                );
            }


            /* ----------------------------------------------------------------
               INVALID OPERATOR BEFORE CLOSE PARENTHESIS
            ---------------------------------------------------------------- */

            if (
                this.operators[current] &&
                current !== ')' &&
                next === ')'
            ) {
                throw new Error(
                    'A closing parenthesis must follow a value'
                );
            }
        }


        if (parenthesisCount !== 0) {
            throw new Error(
                'Opening and closing parentheses must match'
            );
        }
    }


    /* ========================================================================
       FORMULA VALIDATION
    ======================================================================== */

    isValidFormula(formulaElements) {

        try {

            const dummyTokens =
                formulaElements.map(
                    (element) => {

                        /* ----------------------------------------------------
                           COLUMN
                        ---------------------------------------------------- */

                        if (
                            element.type ===
                            'column'
                        ) {
                            return 1;
                        }


                        /* ----------------------------------------------------
                           NUMBER
                        ---------------------------------------------------- */

                        if (
                            element.type ===
                            'number'
                        ) {

                            const numericValue =
                                parseFloat(
                                    element.value
                                );


                            if (
                                Number.isNaN(
                                    numericValue
                                )
                            ) {
                                throw new Error(
                                    `Invalid number: ${element.value}`
                                );
                            }


                            return numericValue;
                        }


                        /* ----------------------------------------------------
                           OPERATOR
                        ---------------------------------------------------- */

                        if (
                            element.type ===
                            'operator'
                        ) {
                            return element.value;
                        }


                        /* ----------------------------------------------------
                           FUNCTION
                        ---------------------------------------------------- */

                        if (
                            element.type ===
                            'function'
                        ) {
                            return 1;
                        }


                        throw new Error(
                            `Unknown element type: ${element.type}`
                        );
                    }
                );


            this.validateSyntax(
                dummyTokens
            );


            const postfix =
                this.infixToPostfix(
                    dummyTokens
                );


            this.evaluatePostfix(
                postfix
            );


            return {
                isValid: true,
                error: null,
            };

        } catch (error) {

            return {
                isValid: false,
                error:
                    error.message ||
                    'Invalid formula',
            };
        }
    }
}


/* ============================================================================
   EVALUATOR INSTANCE
============================================================================ */

const formulaEvaluator =
    new SafeFormulaEvaluator();


/* ============================================================================
   FORMULA VALIDATOR
============================================================================ */

function FormulaValidator({
    formulaElements = [],
    setIsValid,
}) {

    const [
        validationState,
        setValidationState,
    ] = useState({
        status: 'info',
        title: 'Ready to build',
        message:
            'Add a column, number, or operator to begin your formula.',
    });


    /* ========================================================================
       VALIDATION
    ======================================================================== */

    useEffect(() => {

        /* --------------------------------------------------------------------
           EMPTY FORMULA
        -------------------------------------------------------------------- */

        if (
            !formulaElements ||
            formulaElements.length === 0
        ) {

            setValidationState({
                status: 'info',

                title: 'Ready to build',

                message:
                    'Add a column, number, or operator to begin your formula.',
            });


            if (
                typeof setIsValid ===
                'function'
            ) {
                setIsValid(false);
            }


            return;
        }


        /* --------------------------------------------------------------------
           VALIDATE
        -------------------------------------------------------------------- */

        const {
            isValid,
            error,
        } =
            formulaEvaluator.isValidFormula(
                formulaElements
            );


        /* --------------------------------------------------------------------
           VALID
        -------------------------------------------------------------------- */

        if (isValid) {

            setValidationState({
                status: 'success',

                title: 'Formula is valid',

                message:
                    'The expression is ready to preview or add as a calculated column.',
            });


            if (
                typeof setIsValid ===
                'function'
            ) {
                setIsValid(true);
            }

        }

        /* --------------------------------------------------------------------
           INVALID
        -------------------------------------------------------------------- */

        else {

            setValidationState({
                status: 'error',

                title:
                    'Formula needs attention',

                message:
                    error ||
                    'Check the expression and try again.',
            });


            if (
                typeof setIsValid ===
                'function'
            ) {
                setIsValid(false);
            }
        }

    }, [
        formulaElements,
        setIsValid,
    ]);


    /* ========================================================================
       CONFIGURATION
    ======================================================================== */

    const config =
        getValidationConfig(
            validationState.status
        );


    /* ========================================================================
       RENDER
    ======================================================================== */

    return (
        <Collapse
            in
            timeout={200}
        >

            <Box
                role={
                    validationState.status ===
                    'error'
                        ? 'alert'
                        : 'status'
                }
                aria-live="polite"
                sx={{
                    width: '100%',

                    minHeight: 52,

                    px: 1.25,

                    py: 1,

                    display: 'flex',

                    alignItems:
                        'flex-start',

                    gap: 1,

                    border:
                        '1px solid',

                    borderColor:
                        config.border,

                    borderRadius: 1.75,

                    bgcolor:
                        config.background,

                    transition:
                        'background-color 180ms ease, border-color 180ms ease',
                }}
            >

                {/* ============================================================
                    STATUS ICON
                ============================================================ */}

                <Box
                    sx={{
                        width: 30,

                        height: 30,

                        display: 'grid',

                        placeItems:
                            'center',

                        flexShrink: 0,

                        mt: 0.05,

                        borderRadius:
                            1.4,

                        bgcolor:
                            config.iconBackground,

                        color:
                            config.iconColor,

                        '& svg': {
                            fontSize: 17,
                        },
                    }}
                >
                    {config.icon}
                </Box>


                {/* ============================================================
                    MESSAGE
                ============================================================ */}

                <Box
                    sx={{
                        minWidth: 0,

                        flex: 1,

                        pt: 0.05,
                    }}
                >

                    <Typography
                        variant="body2"
                        sx={{
                            color:
                                config.titleColor,

                            fontSize:
                                '0.72rem',

                            fontWeight:
                                800,

                            lineHeight:
                                1.4,
                        }}
                    >
                        {
                            validationState.title
                        }
                    </Typography>


                    <Typography
                        variant="caption"
                        sx={{
                            display:
                                'block',

                            mt: 0.15,

                            color:
                                config.textColor,

                            fontSize:
                                '0.63rem',

                            lineHeight:
                                1.45,
                        }}
                    >
                        {
                            validationState.message
                        }
                    </Typography>

                </Box>


                {/* ============================================================
                    STATUS LABEL
                ============================================================ */}

                <Box
                    sx={{
                        display: {
                            xs: 'none',
                            sm: 'inline-flex',
                        },

                        alignItems:
                            'center',

                        flexShrink: 0,

                        mt: 0.2,

                        px: 0.8,

                        py: 0.35,

                        borderRadius:
                            10,

                        bgcolor:
                            config.badgeBackground,

                        color:
                            config.badgeColor,

                        border:
                            '1px solid',

                        borderColor:
                            config.badgeBorder,
                    }}
                >

                    <Typography
                        variant="caption"
                        sx={{
                            fontSize:
                                '0.55rem',

                            fontWeight:
                                800,

                            lineHeight: 1,

                            textTransform:
                                'uppercase',

                            letterSpacing:
                                '0.04em',
                        }}
                    >
                        {config.badge}
                    </Typography>

                </Box>

            </Box>

        </Collapse>
    );
}


/* ============================================================================
   VALIDATION STYLE CONFIG
============================================================================ */

const getValidationConfig = (
    status
) => {

    /* ========================================================================
       SUCCESS
    ======================================================================== */

    if (status === 'success') {

        return {
            icon: (
                <CheckCircleRounded />
            ),

            background:
                '#F7FEF9',

            border:
                '#BBF7D0',

            iconBackground:
                '#DCFCE7',

            iconColor:
                '#16A34A',

            titleColor:
                '#166534',

            textColor:
                '#4B7A5A',

            badge:
                'Valid',

            badgeBackground:
                '#ECFDF5',

            badgeColor:
                '#047857',

            badgeBorder:
                '#D1FAE5',
        };
    }


    /* ========================================================================
       ERROR
    ======================================================================== */

    if (status === 'error') {

        return {
            icon: (
                <ErrorRounded />
            ),

            background:
                '#FFF8F8',

            border:
                '#FECACA',

            iconBackground:
                '#FEE2E2',

            iconColor:
                '#DC2626',

            titleColor:
                '#991B1B',

            textColor:
                '#9F4B4B',

            badge:
                'Invalid',

            badgeBackground:
                '#FEF2F2',

            badgeColor:
                '#B91C1C',

            badgeBorder:
                '#FECACA',
        };
    }


    /* ========================================================================
       INFO / EMPTY
    ======================================================================== */

    return {
        icon: (
            <InfoRounded />
        ),

        background:
            '#F8FAFC',

        border:
            '#E2E8F0',

        iconBackground:
            '#F1F5F9',

        iconColor:
            '#64748B',

        titleColor:
            '#475569',

        textColor:
            '#94A3B8',

        badge:
            'Waiting',

        badgeBackground:
            '#F8FAFC',

        badgeColor:
            '#64748B',

        badgeBorder:
            '#E2E8F0',
    };
};


/* ============================================================================
   EXPORT
============================================================================ */

export default FormulaValidator;