import { useState, useEffect } from 'react';
import { Alert } from '@mui/material';

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

    validateSyntax(tokens) {
        if (tokens.length === 0) {
            throw new Error('Empty expression');
        }

        if (typeof tokens[0] !== 'number' && tokens[0] !== '(') {
            throw new Error('Formula must start with a number or open parenthesis');
        }

        const lastToken = tokens[tokens.length - 1];
        if (typeof lastToken !== 'number' && lastToken !== ')') {
            throw new Error('Formula must end with a number or close parenthesis');
        }

        let parenCount = 0;
        for (let i = 0; i < tokens.length; i++) {
            const current = tokens[i];
            const next = tokens[i + 1];

            if (current === '(') parenCount++;
            if (current === ')') {
                parenCount--;
                if (parenCount < 0) {
                    throw new Error('Unbalanced parentheses');
                }
            }

            if (next !== undefined) {
                if (this.operators[current] && this.operators[next] && 
                    current !== '(' && current !== ')' && 
                    next !== '(' && next !== ')') {
                    throw new Error('Invalid syntax: operators cannot be adjacent');
                }

                if (typeof current === 'number' && typeof next === 'number') {
                    throw new Error('Invalid syntax: numbers must be separated by operators');
                }
            }
        }

        if (parenCount !== 0) {
            throw new Error('Unbalanced parentheses');
        }
    }

    isValidFormula(formulaElements) {
        try {
            const dummyTokens = formulaElements.map(element => {
                if (element.type === 'column') {
                    return 1;
                } else if (element.type === 'number') {
                    const numValue = parseFloat(element.value);
                    if (isNaN(numValue)) {
                        throw new Error(`Invalid number: ${element.value}`);
                    }
                    return numValue;
                } else if (element.type === 'operator') {
                    return element.value;
                } else if (element.type === 'function') {
                    return 1;
                } else {
                    throw new Error(`Unknown element type: ${element.type}`);
                }
            });

            this.validateSyntax(dummyTokens);
            const postfix = this.infixToPostfix(dummyTokens);
            this.evaluatePostfix(postfix);
            return { isValid: true, error: null };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }
}

const formulaEvaluator = new SafeFormulaEvaluator();

function FormulaValidator({ formulaElements, setIsValid }) {
    const [validationMessage, setValidationMessage] = useState("");
    const [validationSeverity, setValidationSeverity] = useState("info");

    useEffect(() => {
        if (!formulaElements || formulaElements.length === 0) {
            setValidationMessage("Start building your formula");
            setValidationSeverity("info");
            setIsValid(false);
            return;
        }

        const { isValid, error } = formulaEvaluator.isValidFormula(formulaElements);
        
        if (isValid) {
            setValidationMessage("Formula is valid");
            setValidationSeverity("success");
            setIsValid(true);
        } else {
            setValidationMessage(`Invalid formula: ${error}`);
            setValidationSeverity("error");
            setIsValid(false);
        }
    }, [formulaElements, setIsValid]);

    return (
        <Alert severity={validationSeverity} sx={{ mt: 2 }}>
            {validationMessage}
        </Alert>
    );
}

export default FormulaValidator;