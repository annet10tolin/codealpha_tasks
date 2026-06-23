const formulaElement = document.getElementById("formula");
const display = document.getElementById("display");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");

let currentExpression = "";
let history = [];

const FUNCTIONS = {
    sin: value => Math.sin(value),
    cos: value => Math.cos(value),
    tan: value => Math.tan(value),
    sqrt: value => Math.sqrt(value),
    log: value => Math.log10(value),
    ln: value => Math.log(value)
};

const OPERATORS = {
    '^': { precedence: 5, associativity: 'right' },
    'u-': { precedence: 6, associativity: 'right' },
    '%': { precedence: 4, associativity: 'left' },
    '*': { precedence: 3, associativity: 'left' },
    '/': { precedence: 3, associativity: 'left' },
    '+': { precedence: 2, associativity: 'left' },
    '-': { precedence: 2, associativity: 'left' }
};

function updateDisplay(value = null) {
    if (value !== null) {
        display.value = value;
    } else {
        display.value = currentExpression || '0';
    }
    formulaElement.textContent = currentExpression || '0';
}

function appendValue(value) {
    if (display.value === 'Error' || display.value === 'Infinity') {
        currentExpression = '';
    }
    currentExpression += value;
    updateDisplay();
}

function setFunction(value) {
    if (display.value === 'Error' || display.value === 'Infinity') {
        currentExpression = '';
    }
    currentExpression += value;
    updateDisplay();
}

function clearDisplay() {
    currentExpression = '';
    updateDisplay('0');
}

function deleteLast() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

function calculate() {
    if (!currentExpression) {
        return;
    }

    try {
        const result = evaluateExpression(currentExpression);
        addHistoryItem(currentExpression, result);
        currentExpression = String(result);
        updateDisplay(currentExpression);
    } catch (error) {
        updateDisplay('Error');
        formulaElement.textContent = 'Invalid expression';
    }
}

function addHistoryItem(expression, result) {
    history.unshift({ expression, result });
    if (history.length > 10) {
        history.pop();
    }
    renderHistory();
}

function clearHistory() {
    history = [];
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = history
        .map(item => `
            <li class="history-item">
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">${item.result}</span>
            </li>
        `)
        .join('');
}

function evaluateExpression(expression) {
    const normalized = normalizeExpression(expression);
    const tokens = tokenize(normalized);
    const rpn = toRPN(tokens);
    return evaluateRPN(rpn);
}

function normalizeExpression(expression) {
    return expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/--/g, '+')
        .replace(/\s+/g, '');
}

function tokenize(expression) {
    const tokenPattern = /(?:pi|e|sqrt|sin|cos|tan|ln|log|[0-9]*\.?[0-9]+|[()+\-*/^%])/gi;
    const tokens = expression.match(tokenPattern) || [];
    const parsed = [];
    let lastToken = null;

    tokens.forEach(token => {
        const lowerToken = token.toLowerCase();

        if (lowerToken === '-' && (!lastToken || /^(?:[+\-*/^%(]|\()$/.test(lastToken))) {
            parsed.push('u-');
        } else {
            parsed.push(lowerToken);
        }

        lastToken = lowerToken;
    });

    const fullExpression = parsed.join('');
    if (fullExpression.length === 0 || /[^0-9a-z%()+\-*/^\.]/i.test(fullExpression)) {
        throw new Error('Invalid characters detected');
    }

    return parsed;
}

function toRPN(tokens) {
    const output = [];
    const operators = [];

    tokens.forEach(token => {
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(token) || token === 'pi' || token === 'e') {
            output.push(token);
            return;
        }

        if (token in FUNCTIONS) {
            operators.push(token);
            return;
        }

        if (token === 'u-') {
            operators.push(token);
            return;
        }

        if (token in OPERATORS) {
            while (operators.length > 0) {
                const peek = operators[operators.length - 1];
                if (peek === '(') break;
                const current = OPERATORS[token];
                const top = OPERATORS[peek];
                if (!top) break;
                if ((current.associativity === 'left' && current.precedence <= top.precedence) ||
                    (current.associativity === 'right' && current.precedence < top.precedence)) {
                    output.push(operators.pop());
                    continue;
                }
                break;
            }
            operators.push(token);
            return;
        }

        if (token === '(') {
            operators.push(token);
            return;
        }

        if (token === ')') {
            while (operators.length && operators[operators.length - 1] !== '(') {
                output.push(operators.pop());
            }
            if (!operators.length || operators.pop() !== '(') {
                throw new Error('Mismatched parentheses');
            }
            const next = operators[operators.length - 1];
            if (next in FUNCTIONS) {
                output.push(operators.pop());
            }
            return;
        }

        throw new Error(`Unknown token: ${token}`);
    });

    while (operators.length) {
        const op = operators.pop();
        if (op === '(' || op === ')') {
            throw new Error('Mismatched parentheses');
        }
        output.push(op);
    }

    return output;
}

function evaluateRPN(rpn) {
    const stack = [];

    rpn.forEach(token => {
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(token)) {
            stack.push(Number(token));
            return;
        }

        if (token === 'pi') {
            stack.push(Math.PI);
            return;
        }

        if (token === 'e') {
            stack.push(Math.E);
            return;
        }

        if (token in FUNCTIONS) {
            const value = stack.pop();
            if (value === undefined) {
                throw new Error('Missing function argument');
            }
            stack.push(FUNCTIONS[token](value));
            return;
        }

        if (token === 'u-') {
            const value = stack.pop();
            if (value === undefined) {
                throw new Error('Missing unary argument');
            }
            stack.push(-value);
            return;
        }

        if (token in OPERATORS) {
            const right = stack.pop();
            const left = stack.pop();
            if (left === undefined || right === undefined) {
                throw new Error('Missing operator operand');
            }

            switch (token) {
                case '+':
                    stack.push(left + right);
                    break;
                case '-':
                    stack.push(left - right);
                    break;
                case '*':
                    stack.push(left * right);
                    break;
                case '/':
                    stack.push(left / right);
                    break;
                case '^':
                    stack.push(Math.pow(left, right));
                    break;
                case '%':
                    stack.push((left * right) / 100);
                    break;
                default:
                    throw new Error(`Unsupported operator: ${token}`);
            }
            return;
        }

        throw new Error(`Unknown token during evaluation: ${token}`);
    });

    if (stack.length !== 1) {
        throw new Error('Expression did not reduce to single value');
    }

    const result = stack[0];
    return Number.isFinite(result) ? parseFloat(result.toPrecision(12)) : result;
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const active = document.body.classList.contains('light-theme');
    themeToggle.textContent = active ? 'DARK' : 'LIGHT';
}

themeToggle.addEventListener('click', toggleTheme);

document.addEventListener('keydown', function (event) {
    const key = event.key;

    if (/^[0-9]$/.test(key) || ['+', '-', '*', '/', '^', '%', '.', '(', ')'].includes(key)) {
        appendValue(key);
        return;
    }

    if (key === 'Enter') {
        event.preventDefault();
        calculate();
        return;
    }

    if (key === 'Backspace') {
        deleteLast();
        return;
    }

    if (key === 'Escape') {
        clearDisplay();
    }
});

updateDisplay();