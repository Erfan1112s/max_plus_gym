// ============================================================
// ⚙️ بخش ۱: تنظیمات
// ⚠️ این دو مقدار را از پنل Supabase → Settings → API بردارید
// و جایگزین کنید. بدون این دو، صفحه کار نمی‌کند.
// ============================================================
const SUPABASE_URL = 'https://aykilcqlydloxmvgjuwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WPN3BAGfDaSu9i5K4pnUhw_Mzqv0_7r';

// ============================================================
// 📌 بخش ۲: گرفتن ارجاع به المان‌های صفحه
// این کار را یک بار انجام می‌دهیم تا در جاهای مختلف کد مجبور نباشیم
// هر بار document.getElementById صدا بزنیم (هم سریع‌تر است هم تمیزتر)
// ============================================================
const loadingEl     = document.getElementById('loading');
const errorStateEl  = document.getElementById('error-state');
const errorTitleEl  = document.getElementById('error-title');
const errorMsgEl    = document.getElementById('error-message');
const contentEl     = document.getElementById('content');
const sessionsEl    = document.getElementById('remaining-sessions');
const expiryEl      = document.getElementById('expiry-date');
const instagramBtn  = document.getElementById('instagram-btn');
const telegramBtn   = document.getElementById('telegram-btn');

// ============================================================
// 🧰 بخش ۳: توابع کمکی
// ============================================================

/**
 * نمایش پیام خطا و پنهان کردن بقیه بخش‌ها
 * @param {string} title - عنوان خطا (مثلاً "کارت پیدا نشد")
 * @param {string} message - توضیح خطا
 */
function showError(title, message) {
  loadingEl.classList.add('hidden');
  contentEl.classList.add('hidden');
  errorStateEl.classList.remove('hidden');
  errorTitleEl.textContent = title;
  errorMsgEl.textContent = message;
}

/**
 * نمایش محتوای اصلی و پنهان کردن بقیه
 */
function showContent() {
  loadingEl.classList.add('hidden');
  errorStateEl.classList.add('hidden');
  contentEl.classList.remove('hidden');
}

/**
 * تبدیل تاریخ میلادی (YYYY-MM-DD) به تاریخ شمسی خوانا
 * اگر تبدیل ناموفق بود، همان مقدار خام را برمی‌گرداند تا صفحه خراب نشود.
 * @param {string} dateStr
 * @returns {string}
 */
function toPersianDate(dateStr) {
  if (!dateStr) return 'نامشخص';

  try {
    const date = new Date(dateStr);
    // بررسی اینکه تاریخ معتبر است
    if (isNaN(date.getTime())) return dateStr;

    // Intl.DateTimeFormat به‌طور بومی تاریخ را به تقویم شمسی تبدیل می‌کند
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (err) {
    console.error('خطا در تبدیل تاریخ:', err);
    return dateStr; // fallback
  }
}

/**
 * قرار دادن امن متن داخل المان
 * (به‌جای innerHTML که خطر XSS دارد)
 */
function setSafeText(el, text) {
  el.textContent = text;
}

// ============================================================
// 🚀 بخش ۴: منطق اصلی برنامه
// ============================================================

/**
 * تابع اصلی که صفحه با لود شدن اجرا می‌شود
 */
async function init() {
  // --- گام ۱: خواندن توکن از آدرس صفحه ---
  // مثال آدرس: https://user.github.io/repo/?token=ABC123
  // URLSearchParams به‌طور خودکار پارامترها را از ? به بعد جدا می‌کند
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  // اگر توکن در آدرس نبود، خطا بده
  if (!token) {
    showError(
      'توکن پیدا نشد',
      'لطفاً کارت باشگاه را به گوشی نزدیک کنید تا صفحه به‌درستی باز شود.'
    );
    return;
  }

  // --- گام ۲: بررسی اینکه کتابخانه Supabase لود شده است یا نه ---
  // اگر CDN در دسترس نبود یا اسکریپت لود نشد، اینجا خطا می‌دهیم
  // تا به‌جای کرش کردن، پیام مناسب به کاربر نشان داده شود.
  if (typeof supabase === 'undefined') {
    showError(
      'خطای اتصال',
      'کتابخانه دیتابیس لود نشد. لطفاً اتصال اینترنت خود را بررسی کنید.'
    );
    return;
  }

  // --- گام ۳: ساخت کلاینت Supabase ---
  // هر بار که صفحه باز می‌شود یک کلاینت جدید ساخته می‌شود (که اشکالی ندارد)
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // --- گام ۴: درخواست به دیتابیس ---
  try {
    // از جدول members ردیفی را می‌خواهیم که ستون token آن برابر توکن باشد
    // .single() یعنی "فقط یک ردیف انتظار داریم"
    const { data, error } = await client
      .from('members')
      .select('remaining_sessions, expiry_date, instagram_url, telegram_url')
      .eq('token', token)
      .single();

    // اگر Supabase خطا برگرداند (مثلاً ردیفی پیدا نشد یا RLS بست)
    if (error) {
      console.error('خطای Supabase:', error);

      // کد PGRST116 یعنی "هیچ ردیفی پیدا نشد"
      if (error.code === 'PGRST116') {
        showError(
          'کارت شناسایی نشد',
          'این کارت در سیستم ثبت نشده است. لطفاً با باشگاه تماس بگیرید.'
        );
      } else {
        // خطای دیگر (شبکه، دسترسی RLS و...)
        showError(
          'خطا در دریافت اطلاعات',
          'ارتباط با سرور برقرار نشد. لطفاً چند لحظه بعد دوباره تلاش کنید.'
        );
      }
      return;
    }

    // اگر data خالی بود (نباید رخ دهد چون قبلاً error چک شده)
    if (!data) {
      showError(
        'اطلاعاتی یافت نشد',
        'این کارت در سیستم وجود ندارد.'
      );
      return;
    }

    // --- گام ۵: پر کردن صفحه با داده‌های دریافتی ---

    // ۵.۱: تعداد جلسات
    const sessions = data.remaining_sessions ?? 0;
    setSafeText(sessionsEl, String(sessions));

    // اگر جلسات صفر یا خیلی کم بود، رنگ را به قرمز تغییر می‌دهیم
    // (این باعث می‌شود کاربر سریع متوجه شود باید شارژ کند)
    if (sessions <= 0) {
      sessionsEl.style.filter = 'drop-shadow(0 0 20px rgba(255, 59, 59, 0.6))';
      sessionsEl.style.background = 'linear-gradient(180deg, #ff6b6b, var(--danger))';
      sessionsEl.style.webkitBackgroundClip = 'text';
      sessionsEl.style.backgroundClip = 'text';
    } else if (sessions <= 3) {
      // بین ۱ تا ۳ جلسه: هشدار
      sessionsEl.style.filter = 'drop-shadow(0 0 20px rgba(255, 140, 58, 0.6))';
    }

    // ۵.۲: تاریخ انقضا به شمسی
    setSafeText(expiryEl, toPersianDate(data.expiry_date));

    // ۵.۳: لینک‌های شبکه‌های اجتماعی
    // اگر لینک تعریف نشده بود، دکمه را پنهان می‌کنیم (نه اینکه لینک خالی بگذاریم)
    if (data.instagram_url) {
      instagramBtn.href = data.instagram_url;
    } else {
      instagramBtn.style.display = 'none';
    }

    if (data.telegram_url) {
      telegramBtn.href = data.telegram_url;
    } else {
      telegramBtn.style.display = 'none';
    }

    // --- گام ۶: نمایش نهایی محتوا ---
    showContent();

  } catch (err) {
    // این catch برای خطاهای غیرمنتظره است (مثلاً قطعی کامل شبکه)
    console.error('خطای غیرمنتظره:', err);
    showError(
      'خطای غیرمنتظره',
      'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.'
    );
  }
}

// ============================================================
// 🏁 بخش ۵: راه‌اندازی
// DOMContentLoaded یعنی "صبر کن تا کل HTML لود شود، بعد اجرا کن"
// این کار جلوی خطاهای "المان پیدا نشد" را می‌گیرد.
// ============================================================
document.addEventListener('DOMContentLoaded', init);
