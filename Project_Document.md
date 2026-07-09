<h1 dir="rtl" align="right">مستندات پروژه برای دانشجویان: سیستم نظرسنجی ابزارهای زیرساخت</h1>

<h3 dir="rtl" align="right">هدف پروژه</h3>

<p dir="rtl" align="right">
شما باید یک برنامه سه لایه (سه‌تیِر) شامل فرانت‌اند (Nginx)، بک‌اند (Node.js) و دیتابیس (PostgreSQL) را که سورس کدهای آن در اختیار شما قرار گرفته است، ابتدا داکرایز کرده (Image بسازید) و سپس روی کلاستر کوبرنتیز دیپلوی کنید.
</p>

<h3 dir="rtl" align="right">نیازمندی‌های استقرار (Task List)</h3>

<p dir="rtl" align="right">
شما باید منیفست‌های کوبرنتیز زیر را برای اجرای صحیح این سیستم بنویسید:
</p>

<ol dir="rtl" align="right">
  <li><strong>دیتابیس (PostgreSQL):</strong> دیپلویمنت یا StatefulSet دیتابیس + ساخت <code dir="ltr">Secret</code> برای مدیریت امن <code dir="ltr">POSTGRES_PASSWORD</code> و <code dir="ltr">POSTGRES_USER</code> + ساخت Persistent Volume (PVC) برای جلوگیری از پاک شدن آرا با ری‌استارت شدن پاد.</li>
  <li><strong>بک‌اند (API):</strong> دیپلویمنت بک‌اند + اتصال آن به دیتابیس از طریق متغیرهای محیطی (Environment Variables) با استفاده از <code dir="ltr">ConfigMap</code> و <code dir="ltr">Secret</code> + ساخت سرویس (ClusterIP).</li>
  <li><strong>فرانت‌اند (Web):</strong> دیپلویمنت فرانت‌اند + تزریق آدرس بک‌اند به فرانت‌اند در زمان اجرا + ساخت سرویس (NodePort یا LoadBalancer) برای دسترسی کاربران از بیرون کلاستر.</li>
</ol>

<h3 dir="rtl" align="right">نکات آموزشی برای راهنمایی</h3>

<ul dir="rtl" align="right">
  <li>دیتابیس رسمی PostgreSQL (<code dir="ltr">postgres:15-alpine</code>) را مستقیماً استفاده کنید.</li>
  <li>متغیرهای محیطی کانتینر Postgres (<code dir="ltr">POSTGRES_USER</code>، <code dir="ltr">POSTGRES_PASSWORD</code> و <code dir="ltr">POSTGRES_DB</code>) باید با متغیرهای Backend (<code dir="ltr">DB_USER</code>، <code dir="ltr">DB_PASSWORD</code> و <code dir="ltr">DB_NAME</code>) مطابقت داشته باشند.</li>
  <li>برای جلوگیری از خطای CORS، حتماً باید آدرس IP یا دامین NodePort مربوط به سرویس Backend را به متغیر <code dir="ltr">BACKEND_URL</code> در دیپلویمنت Frontend پاس بدهید.</li>
</ul>
