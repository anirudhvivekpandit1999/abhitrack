import React, { useMemo } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import EnhancedDataPreview from './EnhancedDataPreview';

class SafeFormulaEvaluator {
    constructor() {
        this.operators = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => {
                if (b === 0) throw new Error('Division by zero');
                return a / b;
            }
        };
    }

    infixToPostfix(tokens) {
        const output = [];
        const operators = [];
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

        for (const token of tokens) {
            if (typeof token === 'number') {
                output.push(token);
            } else if (token === '(') {
                operators.push(token);
            } else if (token === ')') {
                while (operators.length > 0 && operators[operators.length - 1] !== '(') {
                    output.push(operators.pop());
                }
                if (operators.length === 0) {
                    throw new Error('Mismatched parentheses');
                }
                operators.pop();
            } else if (this.operators[token]) {
                while (
                    operators.length > 0 &&
                    operators[operators.length - 1] !== '(' &&
                    precedence[operators[operators.length - 1]] >= precedence[token]
                ) {
                    output.push(operators.pop());
                }
                operators.push(token);
            } else {
                throw new Error(`Unknown operator: ${token}`);
            }
        }

        while (operators.length > 0) {
            const op = operators.pop();
            if (op === '(' || op === ')') {
                throw new Error('Mismatched parentheses');
            }
            output.push(op);
        }

        return output;
    }

    evaluatePostfix(postfix) {
        const stack = [];

        for (const token of postfix) {
            if (typeof token === 'number') {
                stack.push(token);
            } else if (this.operators[token]) {
                if (stack.length < 2) {
                    throw new Error('Invalid expression');
                }
                const b = stack.pop();
                const a = stack.pop();
                stack.push(this.operators[token](a, b));
            }
        }

        if (stack.length !== 1) {
            throw new Error('Invalid expression');
        }

        return stack[0];
    }

    evaluate(formulaElements, rowData = {}, allRows = []) {
        if (!formulaElements || formulaElements.length === 0) {
            throw new Error('Empty formula');
        }

        const tokens = formulaElements.map(element => {
            if (element.type === 'column') {
                const value = rowData[element.value];
                if (value === undefined || value === null) {
                    return 0;
                }
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    return 0;
                }
                return numValue;
            } else if (element.type === 'number') {
                const numValue = parseFloat(element.value);
                if (isNaN(numValue)) {
                    throw new Error(`Invalid number: ${element.value}`);
                }
                return numValue;
            } else if (element.type === 'operator') {
                return element.value;
            } else if (element.type === 'function') {
                const cols = element.columns || [];
                const values = cols.map(col => {
                    const v = rowData[col];
                    const num = parseFloat(v);
                    return isNaN(num) ? 0 : num;
                });
                switch (element.func) {
                    case 'AVG':
                        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                    case 'SUM':
                        return values.reduce((a, b) => a + b, 0);
                    default:
                        return 0;
                }
            } else {
                throw new Error(`Unknown element type: ${element.type}`);
            }
        });

        const postfix = this.infixToPostfix(tokens);
        const result = this.evaluatePostfix(postfix);
        return result;
    }
}

const formulaEvaluator = new SafeFormulaEvaluator();

const FormulaPreviewSection = React.memo(({ 
    formulaElements, 
    withoutProductData, 
    withProductData, 
    columnName 
}) => {
    const evaluateFormula = (row, elements, allRows) => {
        if (!elements || elements.length === 0) return null;
        try {
            const result = formulaEvaluator.evaluate(elements, row, allRows);
            if (isNaN(result)) return 'Error';
            return parseFloat(result.toFixed(3));
        } catch (error) {
            console.error('Error evaluating formula:', error);
            return 'Error';
        }
    };

    const relevantColumns = useMemo(() => {
        const columns = formulaElements
            .flatMap(el => {
                if (el.type === 'column') return [el.value];
                if (el.type === 'function' && Array.isArray(el.columns)) return el.columns;
                return [];
            });
        return [...new Set([...columns, columnName])];
    }, [formulaElements, columnName]);

    const previewWithoutProductData = useMemo(() => {
        if (!withoutProductData || !formulaElements.length) return [];
        return withoutProductData.slice(0, 10).map(row => {
            const filteredRow = relevantColumns.reduce((acc, col) => {
                acc[col] = row[col];
                return acc;
            }, {});
            return {
                ...filteredRow,
                [columnName]: evaluateFormula(row, formulaElements, withoutProductData)
            };
        });
    }, [withoutProductData, formulaElements, columnName, relevantColumns]);

    const previewWithProductData = useMemo(() => {
        if (!withProductData || !formulaElements.length) return [];
        return withProductData.slice(0, 10).map(row => {
            const filteredRow = relevantColumns.reduce((acc, col) => {
                acc[col] = row[col];
                return acc;
            }, {});
            return {
                ...filteredRow,
                [columnName]: evaluateFormula(row, formulaElements, withProductData)
            };
        });
    }, [withProductData, formulaElements, columnName, relevantColumns]);

    const hasValidData = formulaElements.length > 0 && columnName && 
                        withoutProductData?.length > 0 && withProductData?.length > 0;
   
    if (!hasValidData) return null;

    return (
        <Box sx={{ mr: 4, ml: 4, mt: 4}}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                Formula Preview: {columnName}
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
                This preview shows how your calculated column will appear in both datasets. 
                Only the first 10 rows are displayed.
            </Alert>

            <Box sx={{ mb: 2 }}>
                <EnhancedDataPreview
                    title="Without Product - Preview with Calculated Column"
                    data={previewWithoutProductData}
                />
            </Box>

            <Box>
                <EnhancedDataPreview
                    title="With Product - Preview with Calculated Column"
                    data={previewWithProductData}
                />
            </Box>
        </Box>
    );
});

FormulaPreviewSection.displayName = 'FormulaPreviewSection';

export default FormulaPreviewSection;