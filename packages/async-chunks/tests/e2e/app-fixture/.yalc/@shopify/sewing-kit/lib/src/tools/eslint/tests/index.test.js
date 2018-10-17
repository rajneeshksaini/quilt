"use strict";

var _this = this;

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("tests/unit/utilities");
const __1 = require("..");
const runner_1 = require("../../../runner");
jest.mock('child_process', () => ({
    exec: jest.fn((_command, options, callback) => {
        if (typeof options === 'function') {
            return options();
        }
        return callback();
    })
}));
const { exec } = require.requireMock('child_process');
describe('eslint', () => {
    beforeEach(() => {
        exec.mockClear();
    });
    it('executes the ESLint binary with no warnings allowed', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        yield __1.default(workspace, new runner_1.default());
        const command = exec.mock.calls[0][0];
        expect(command).toMatch('node_modules/.bin/eslint');
        expect(command).toMatch(' --max-warnings 0');
    }));
    it('ignores JS generated by Rails', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace({ isRails: true });
        yield __1.default(workspace, new runner_1.default());
        const command = exec.mock.calls[0][0];
        expect(command).toMatch(' --ignore-pattern public');
        expect(command).toMatch(' --ignore-pattern tmp');
    }));
    it('does not use fixer by default', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        yield __1.default(workspace, new runner_1.default());
        const command = exec.mock.calls[0][0];
        expect(command).not.toMatch(' --fix');
    }));
    it('uses fixer when requested', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        const runner = new runner_1.default();
        yield __1.default(workspace, runner, { runFixer: true });
        const command = exec.mock.calls[0][0];
        expect(command).toMatch(' --fix');
    }));
    it('uses the .ts and .tsx extensions when typescript is enabled', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace({
            devDependencies: { typescript: 'latest' }
        });
        const runner = new runner_1.default();
        yield __1.default(workspace, runner);
        const command = exec.mock.calls[0][0];
        expect(command).toMatch(' --ext .ts');
        expect(command).toMatch(' --ext .tsx');
    }));
    it('does not use the .ts and .tsx extensions by default', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        const runner = new runner_1.default();
        yield __1.default(workspace, runner);
        const command = exec.mock.calls[0][0];
        expect(command).not.toMatch(/ --ext \.tsx?/);
    }));
    it('does not run if it has already run', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        const runner = new runner_1.default();
        yield __1.default(workspace, runner);
        yield __1.default(workspace, runner);
        expect(exec).toHaveBeenCalledTimes(1);
    }));
    it('outputs stdout for exceptions', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        const runner = new utilities_1.FakeRunner(false);
        exec.mockImplementationOnce((_executable, _options, callback) => {
            const err = new Error();
            err.stdout = 'stdout_message';
            err.stderr = 'stderr_message';
            callback(err);
        });
        yield __1.default(workspace, runner);
        expect(runner.output).toMatch('stdout_message');
        expect(runner.output).not.toMatch('stderr_message');
    }));
    it('outputs stderr when exceptions have an empty stdout', () => __awaiter(_this, void 0, void 0, function* () {
        const workspace = utilities_1.createWorkspace();
        const runner = new utilities_1.FakeRunner();
        exec.mockImplementationOnce((_executable, _options, callback) => {
            const err = new Error();
            err.stdout = '';
            err.stderr = 'stderr_message';
            callback(err);
        });
        yield __1.default(workspace, runner);
        expect(runner.output).toMatch('stderr_message');
    }));
});