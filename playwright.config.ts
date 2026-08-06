import {defineConfig,devices} from '@playwright/test';

const executablePath=process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir:'./tests/e2e',
  use:{
    baseURL:process.env.PLAYWRIGHT_BASE_URL??'http://127.0.0.1:3000',
    trace:'on-first-retry',
    launchOptions:executablePath?{executablePath}:undefined,
  },
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile',use:{...devices['Pixel 7']}},
  ],
  webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{
    command:'npm run dev',
    url:'http://127.0.0.1:3000',
    reuseExistingServer:true,
    timeout:120000,
  },
});
