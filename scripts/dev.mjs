import { spawn } from 'node:child_process';
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const python = process.platform === 'win32' && existsSync('backend/.venv/Scripts/python.exe')
  ? resolve('backend/.venv/Scripts/python.exe')
  : 'python';
const children = [];

function start(label, command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  children.push(child);
  child.on('error', (error) => {
    console.error(`[${label}] failed to start: ${error.message}`);
    process.exitCode = 1;
  });
  child.on('exit', (code, signal) => {
    if (code && code !== 0) {
      console.error(`[${label}] exited with code ${code}`);
      stop(code);
    } else if (signal) {
      stop(1);
    }
  });
}

function stop(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 250);
}

start('backend', python, ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'], 'backend');
start('frontend', npm, ['run', 'dev'], 'frontend');

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
