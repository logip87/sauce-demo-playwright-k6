import { defineConfig } from 'allure';

export default defineConfig({
  name: 'SauceDemo E2E',
  output: './artifacts/allure-report',
  historyPath: './artifacts/allure-history/history.jsonl',
});