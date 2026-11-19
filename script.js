/* ============================================================
   متغیرهای تم (تم نارنجی/مشکی باشگاهی)
   اگر خواستید رنگ برند را عوض کنید، فقط همین چند خط را تغییر دهید
   و بقیه‌ی صفحه به‌طور خودکار آپدیت می‌شود.
   ============================================================ */
:root {
  --orange: #ff6a00;          /* رنگ اصلی نارنجی */
  --orange-light: #ff8c3a;    /* نارنجی روشن‌تر برای گرادیانت */
  --orange-glow: rgba(255, 106, 0, 0.35); /* برای هاله‌ی درخشان اطراف عناصر */
  --black: #0a0a0a;           /* مشکی پس‌زمینه */
  --black-soft: #161616;      /* مشکی کارت (کمی روشن‌تر) */
  --black-border: #262626;    /* رنگ حاشیه */
  --white: #f5f5f5;           /* متن اصلی */
  --gray: #888;               /* متن ثانویه */
  --danger: #ff3b3b;          /* قرمز برای هشدار (جلسات کم) */
}

/* ============================================================
   ریست پایه: مرورگرها استایل پیش‌فرض متفاوتی دارند
   این چند خط استانداردسازی می‌کند تا همه‌جا یکسان باشد.
   ============================================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* اندازه‌گیری عرض/ارتفاع شامل padding و border می‌شود */
}

/* ============================================================
   استایل body
   پس‌زمینه تیره با یک هاله‌ی نارنجی ملایم در بالای صفحه
   تا حس "نور افکن" یا "گرمای باشگاه" القا شود.
   ============================================================ */
body {
  font-family: 'Vazirmatn', Tahoma, sans-serif; /* فونت با fallback */
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px; /* فاصله از لبه‌ها در موبایل */

  /* پس‌زمینه تیره */
  background-color: var(--black);

  /*
    یک گرادیانت شعاعی نارنجی محو در بالای صفحه می‌سازیم
    که با پس‌زمینه‌ی مشکی ترکیب شود و عمق بدهد
  */
  background-image: radial-gradient(
    ellipse at top,
    rgba(255, 106, 0, 0.15) 0%,
    transparent 60%
  );
  background-attachment: fixed;

  color: var(--white);
}

/* ============================================================
   کلاس کمکی برای پنهان کردن بخش‌ها
   هر بخشی که این کلاس داشته باشد دیده نمی‌شود.
   (به‌جای style.display = 'none' از کلاس استفاده می‌کنیم تا انیمیشن‌پذیر باشد)
   ============================================================ */
.hidden {
  display: none !important;
}

/* ============================================================
   صفحه‌های حالت (لودینگ و خطا)
   ============================================================ */
.state-screen {
  text-align: center;
  max-width: 400px;
}

/* اسپینر چرخان */
.spinner {
  width: 56px;
  height: 56px;
  border: 4px solid var(--black-border);
  border-top-color: var(--orange); /* فقط یک ضلع نارنجی */
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 0.9s linear infinite; /* چرخش بی‌پایان */
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--gray);
  font-size: 15px;
}

/* آیکون و متن خطا */
.error-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
#error-title {
  font-size: 22px;
  margin-bottom: 8px;
}
#error-message {
  color: var(--gray);
  font-size: 15px;
  line-height: 1.6;
}

/* ============================================================
   کارت اصلی
   ============================================================ */
.card {
  width: 100%;
  max-width: 400px;
  background: var(--black-soft);
  border: 1px solid var(--black-border);
  border-radius: 24px;
  padding: 32px 24px;
  position: relative; /* برای قرار دادن هاله‌ی نارنجی در بالای کارت */
  overflow: hidden;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.5),
    0 0 60px var(--orange-glow); /* هاله‌ی نارنجی ملایم */

  /* انیمیشن ورود کارت */
  animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* نوار نارنجی محو در بالای کارت (حس برندینگ) */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--orange), var(--orange-light));
}

/* ============================================================
   هدر کارت
   ============================================================ */
.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 28px;
}

.gym-icon {
  width: 32px;
  height: 32px;
  color: var(--orange);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--white);
}

.accent {
  color: var(--orange);
}

/* ============================================================
   بخش تعداد جلسات
   ============================================================ */
.sessions-block {
  text-align: center;
  padding: 20px 0 24px;
  border-bottom: 1px dashed var(--black-border);
  margin-bottom: 20px;
}

.label {
  display: block;
  color: var(--gray);
  font-size: 13px;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

/* عدد بزرگ */
.big-number {
  display: inline-block;
  font-size: 64px;
  font-weight: 900;
  line-height: 1;

  /* متن با گرادیانت نارنجی */
  background: linear-gradient(180deg, var(--orange-light), var(--orange));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;

  /* هاله‌ی نارنجی اطراف عدد */
  filter: drop-shadow(0 0 20px var(--orange-glow));
}

.unit {
  display: inline-block;
  margin-right: 6px;
  color: var(--gray);
  font-size: 16px;
  vertical-align: middle;
}

/* ============================================================
   بخش تاریخ انقضا
   ============================================================ */
.expiry-block {
  text-align: center;
  margin-bottom: 24px;
}

.expiry-date {
  display: inline-block;
  background: rgba(255, 106, 0, 0.08);
  border: 1px solid rgba(255, 106, 0, 0.25);
  color: var(--orange-light);
  padding: 8px 18px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
}

/* ============================================================
   دکمه‌های شبکه‌های اجتماعی
   ============================================================ */
.socials {
  display: grid;
  grid-template-columns: 1fr 1fr; /* دو ستون مساوی */
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.25s ease;
  border: 1px solid var(--black-border);
  background: #1e1e1e;
  color: var(--white);
}

/* افکت هاور (در دسکتاپ) */
.social-btn:hover {
  border-color: var(--orange);
  color: var(--orange);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--orange-glow);
}

/* لمس (در موبایل) */
.social-btn:active {
  transform: scale(0.97);
}

/* آیکون داخل دکمه */
.social-btn svg {
  flex-shrink: 0; /* جلوگیری از فشرده شدن آیکون */
}

/* ============================================================
   واکنش‌گرایی (Responsive)
   در صفحه‌های خیلی کوچک، عدد کمی کوچک‌تر شود
   ============================================================ */
@media (max-width: 360px) {
  .big-number { font-size: 52px; }
  .card { padding: 24px 18px; }
  .socials { grid-template-columns: 1fr; } /* دکمه‌ها زیر هم بیایند */
}
