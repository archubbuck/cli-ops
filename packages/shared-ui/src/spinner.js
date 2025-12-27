"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpinner = createSpinner;
exports.withSpinner = withSpinner;
exports.spinnerTask = spinnerTask;
const ora_1 = __importDefault(require("ora"));
/**
 * Detect if running in CI or non-TTY environment
 */
function shouldDisableSpinner() {
    return Boolean(!process.stdout.isTTY ||
        process.env['CI'] ||
        process.env['CONTINUOUS_INTEGRATION'] ||
        process.env['GITHUB_ACTIONS'] ||
        process.env['GITLAB_CI'] ||
        process.env['CIRCLECI']);
}
/**
 * Create a spinner for loading states
 */
function createSpinner(options = {}) {
    const { text = '', color = 'cyan', enabled = !shouldDisableSpinner(), prefixText, suffixText, } = options;
    // In CI or non-TTY, just log text without spinner
    if (!enabled) {
        const noopSpinner = {
            start: (txt) => {
                if (txt)
                    console.log(txt);
                return noopSpinner;
            },
            stop: () => noopSpinner,
            succeed: (txt) => {
                if (txt)
                    console.log(`✓ ${txt}`);
                return noopSpinner;
            },
            fail: (txt) => {
                if (txt)
                    console.log(`✗ ${txt}`);
                return noopSpinner;
            },
            warn: (txt) => {
                if (txt)
                    console.log(`⚠ ${txt}`);
                return noopSpinner;
            },
            info: (txt) => {
                if (txt)
                    console.log(`ℹ ${txt}`);
                return noopSpinner;
            },
            clear: () => noopSpinner,
            frame: () => noopSpinner,
            isSpinning: false,
            text: '',
        };
        return noopSpinner;
    }
    const spinner = (0, ora_1.default)({
        text,
        color,
        prefixText,
        suffixText,
    });
    return spinner;
}
/**
 * Helper to wrap an async operation with spinner
 */
async function withSpinner(text, fn, options = {}) {
    const spinner = createSpinner({ text, ...options });
    spinner.start();
    try {
        const result = await fn(spinner);
        spinner.succeed();
        return result;
    }
    catch (error) {
        spinner.fail();
        throw error;
    }
}
/**
 * Run operation with spinner, customizing success/error messages
 */
async function spinnerTask(options, fn) {
    const { start, succeed, fail, ...spinnerOptions } = options;
    const spinner = createSpinner({ text: start, ...spinnerOptions });
    spinner.start();
    try {
        const result = await fn(spinner);
        spinner.succeed(succeed);
        return result;
    }
    catch (error) {
        spinner.fail(fail);
        throw error;
    }
}
//# sourceMappingURL=spinner.js.map