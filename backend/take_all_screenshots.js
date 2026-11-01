const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../screenshots');
const ARTIFACT_DIR = '/Users/apple/.gemini/antigravity/brain/e31c6c8d-0acb-4dc7-84c4-1fc170492d17';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();

  const capture = async (name, waitMs = 1200) => {
    await new Promise((r) => setTimeout(r, waitMs));
    const localFile = path.join(OUT_DIR, name);
    const artifactFile = path.join(ARTIFACT_DIR, name);
    await page.screenshot({ path: localFile, fullPage: false });
    fs.copyFileSync(localFile, artifactFile);
    console.log(`[Captured] ${name}`);
  };

  try {
    // 1. Home Page Hero
    console.log('1. Capturing Home page hero...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await capture('01_home_hero.png', 1200);

    // 2. Home Page Featured Events
    console.log('2. Capturing Home page featured events...');
    await page.evaluate(() => window.scrollBy(0, 750));
    await capture('02_home_featured_events.png', 800);

    // 3. Events Catalog Page
    console.log('3. Capturing Events Catalog...');
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });
    await capture('03_events_catalog.png', 1200);

    // 4. Event Details Page
    console.log('4. Capturing Event Details...');
    await page.goto(`${BASE_URL}/events/1`, { waitUntil: 'networkidle2' });
    await capture('04_event_details.png', 1200);

    // 5. Student Login Page
    console.log('5. Capturing Student Login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await capture('05_student_login.png', 1000);

    // 6. Student Register Page
    console.log('6. Capturing Student Register...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await capture('06_student_register.png', 1000);

    // 7. Student Dashboard (Logged In as Rahul)
    console.log('7. Logging in as Student Rahul...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: '23311A66A6', password: 'student123' })
      });
      const data = await res.json();
      localStorage.setItem('snist_auth_token', data.token);
      localStorage.setItem('snist_user', JSON.stringify(data.user));
    });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await capture('07_student_dashboard.png', 1500);

    // 8. Open Digital QR Gate Pass Modal
    console.log('8. Opening Digital QR pass modal...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes('Open Pass QR'));
      if (target) target.click();
    });
    await capture('08_digital_qr_pass_modal.png', 1200);

    // 9. Staff & Admin Login Page
    console.log('9. Capturing Admin Login...');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await capture('09_admin_login.png', 1000);

    // 10. Admin Analytics Dashboard (Logged In as Admin)
    console.log('10. Logging in as Admin...');
    await page.evaluate(async () => {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@snist.edu.in', password: 'admin123' })
      });
      const data = await res.json();
      localStorage.setItem('snist_auth_token', data.token);
      localStorage.setItem('snist_user', JSON.stringify(data.user));
    });
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle2' });
    await capture('10_admin_analytics_dashboard.png', 2000);

    // 11. Event Management Console
    console.log('11. Capturing Event Management...');
    await page.goto(`${BASE_URL}/admin/events`, { waitUntil: 'networkidle2' });
    await capture('11_event_management.png', 1500);

    // 12. QR Gatekeeper Scanner Module
    console.log('12. Capturing QR Gatekeeper Scanner...');
    await page.goto(`${BASE_URL}/scanner`, { waitUntil: 'networkidle2' });
    await capture('12_qr_gatekeeper_scanner.png', 1500);

    console.log('SUCCESS: All 12 screenshots captured and copied to artifact directory!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();
