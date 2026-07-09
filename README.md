<div dir="rtl" align="right">

# سیستم نظرسنجی ابزارهای DevOps

اپلیکیشن سه‌لایه برای رأی‌گیری بین ابزارهای Kubernetes، Ansible و Terraform. این پروژه شامل فرانت‌اند (Nginx)، بک‌اند (Node.js/Express) و دیتابیس (PostgreSQL) است و روی کلاستر Kubernetes ابر آروان مستقر شده است.

---

## آدرس‌های استقرار

| سرویس | آدرس |
|---|---|
| **فرانت‌اند (کلاینت)** | [http://185.228.236.54.nip.io](http://185.228.236.54.nip.io/) |
| **بک‌اند (API)** | [http://185.228.236.50.nip.io](http://185.228.236.50.nip.io/) |

برای تست API بک‌اند:

<pre dir="ltr" align="left"><code>curl http://185.228.236.50.nip.io/api/votes</code></pre>

---

## معماری

<pre dir="ltr" align="left"><code>مرورگر کاربر
    │
    ▼
frontend-service (LoadBalancer) ──► Nginx + HTML/JS
    │                                    │
    │  fetch(BACKEND_URL)                │ env.js ← BACKEND_URL
    ▼                                    │
backend-service (LoadBalancer) ──► Node.js API :3000
    │
    ▼
postgres-service (ClusterIP) ──► PostgreSQL + PVC</code></pre>

| لایه | تکنولوژی | نوع سرویس | دسترسی |
|---|---|---|---|
| فرانت‌اند | Nginx + HTML/JS | LoadBalancer | عمومی |
| بک‌اند | Node.js + Express | LoadBalancer | عمومی |
| دیتابیس | PostgreSQL 15 | ClusterIP | فقط داخل کلاستر |

---

## ساختار پروژه

<pre dir="ltr" align="left"><code>devops-voting-project/
├── backend/              # API (Express + pg)
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/             # UI (Nginx + static HTML)
│   ├── Dockerfile
│   ├── entrypoint.sh     # تزریق BACKEND_URL به env.js
│   └── index.html
├── k8s/
│   ├── 01-postgres.yaml  # ConfigMap, Secret, PVC, Deployment, Service
│   ├── 02-backend.yaml   # Deployment + LoadBalancer
│   └── 03-frontend.yaml  # Deployment + LoadBalancer
├── Project_Document.md   # مستند اصلی پروژه دانشگاهی
└── README.md</code></pre>

---

## منیفست‌های Kubernetes

### `k8s/01-postgres.yaml` — دیتابیس

- **ConfigMap** (`voting-config`): نام هاست، پورت، نام دیتابیس و کاربر
- **Secret** (`postgres-secret`): رمز عبور دیتابیس
- **PVC** (`postgres-pvc`): ۱ گیگابایت فضای پایدار (StorageClass پیش‌فرض آروان)
- **Deployment**: image رسمی <code dir="ltr">postgres:15-alpine</code> با strategy <code dir="ltr">Recreate</code>
- **Service**: <code dir="ltr">ClusterIP</code> — فقط از داخل کلاستر

### `k8s/02-backend.yaml` — API

- **Deployment**: ۲ replica، env از ConfigMap/Secret
- **Service**: <code dir="ltr">LoadBalancer</code> — پورت ۸۰ به ۳۰۰۰ map شده
- **Image**: <code dir="ltr">kiananasirii/voting-backend:latest</code>

### `k8s/03-frontend.yaml` — وب

- **Deployment**: ۲ replica، متغیر <code dir="ltr">BACKEND_URL</code> در startup
- **Service**: <code dir="ltr">LoadBalancer</code> — پورت ۸۰
- **Image**: <code dir="ltr">kiananasirii/voting-frontend:latest</code>

---

## راهنمای استقرار

### پیش‌نیازها

- Docker و Docker Hub (<code dir="ltr">kiananasirii</code>)
- <code dir="ltr">kubectl</code> و kubeconfig کلاستر آروان

### گام ۱: ساخت و Push ایمیج‌ها

<pre dir="ltr" align="left"><code>docker build -t kiananasirii/voting-backend:latest ./backend
docker build -t kiananasirii/voting-frontend:latest ./frontend
docker push kiananasirii/voting-backend:latest
docker push kiananasirii/voting-frontend:latest</code></pre>

### گام ۲: اتصال به کلاستر

<pre dir="ltr" align="left"><code>export KUBECONFIG="ir-central1-uniproj.config"
kubectl get nodes</code></pre>

### گام ۳: اعمال منیفست‌ها

<pre dir="ltr" align="left"><code>kubectl apply -f k8s/
kubectl get pods,svc,pvc</code></pre>

منتظر بمانید تا پادها <code dir="ltr">Running</code> شوند و سرویس‌ها <code dir="ltr">EXTERNAL-IP</code> بگیرند.

### گام ۴: تنظیم BACKEND_URL با nip.io

از سرویس رایگان <strong>nip.io</strong> برای تبدیل IP عمومی به دامنه استفاده شده تا نیازی به خرید دامنه نباشد:

<pre dir="ltr" align="left"><code>kubectl set env deployment/frontend-deployment \
  BACKEND_URL=http://185.228.236.50.nip.io</code></pre>

### گام ۵: باز کردن اپلیکیشن

فرانت‌اند: [http://185.228.236.54.nip.io](http://185.228.236.54.nip.io/)

---

## تست پایداری دیتابیس

پس از ثبت چند رأی، پاد Postgres را حذف کنید:

<pre dir="ltr" align="left"><code>kubectl delete pod -l app=postgres
kubectl get pods</code></pre>

بعد از بالا آمدن پاد جدید، صفحه را refresh کنید. اگر PVC درست کار کند، رأی‌ها باقی می‌مانند.

---

## عیب‌یابی

<pre dir="ltr" align="left"><code># لاگ‌ها
kubectl logs deployment/backend-deployment
kubectl logs deployment/postgres-deployment
kubectl logs deployment/frontend-deployment

# وضعیت سرویس‌ها
kubectl get svc
kubectl describe svc backend-service
kubectl describe svc frontend-service

# بررسی BACKEND_URL
kubectl describe deployment frontend-deployment | grep BACKEND_URL</code></pre>

| مشکل | راه‌حل |
|---|---|
| مرورگر خطای CORS/Network | <code dir="ltr">BACKEND_URL</code> باید آدرس بک‌اند باشد، نه localhost یا postgres-service |
| پاد backend CrashLoop | لاگ Postgres را چک کنید؛ احتمالاً دیتابیس هنوز آماده نیست |
| EXTERNAL-IP در حالت pending | چند دقیقه صبر کنید؛ LoadBalancer آروان IP اختصاص می‌دهد |
| ImagePullBackOff | مطمئن شوید imageها روی Docker Hub push شده‌اند |

</div>
