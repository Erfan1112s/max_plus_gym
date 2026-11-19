const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY-HERE';

const loadingEl     = document.getElementById('loading');
const errorStateEl  = document.getElementById('error-state');
const errorTitleEl  = document.getElementById('error-title');
const errorMsgEl    = document.getElementById('error-message');
const contentEl     = document.getElementById('content');
const sessionsEl    = document.getElementById('remaining-sessions');
const expiryEl      = document.getElementById('expiry-date');

function showError(title, message) {
  loadingEl.classList.add('hidden');
  contentEl.classList.add('hidden');
  errorStateEl.classList.remove('hidden');
  errorTitleEl.textContent = title;
  errorMsgEl.textContent = message;
}

function showContent() {
  loadingEl.classList.add('hidden');
  errorStateEl.classList.add('hidden');
  contentEl.classList.remove('hidden');
}

function toPersianDate(dateStr) {
  if (!dateStr) return 'نامشخص';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  } catch (err) {
    return dateStr; 
  }
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    showError('توکن پیدا نشد', 'لطفاً کارت باشگاه را به گوشی نزدیک کنید تا صفحه به‌درستی باز شود.');
    return;
  }

  if (typeof supabase === 'undefined') {
    showError('خطای اتصال', 'کتابخانه دیتابیس لود نشد. لطفاً اتصال اینترنت خود را بررسی کنید.');
    return;
  }

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // فقط تعداد جلسات و تاریخ را از دیتابیس می‌خوانیم
    const { data, error } = await client
      .from('members')
      .select('remaining_sessions, expiry_date')
      .eq('token', token)
      .single();

    if (error) {
      console.error('خطای Supabase:', error);
      if (error.code === 'PGRST116') {
        showError('کارت شناسایی نشد', 'این کارت در سیستم ثبت نشده است یا توکن تستی در دیتابیس وجود ندارد.');
      } else {
        showError('خطا در دریافت اطلاعات', 'ارتباط با سرور برقرار نشد. (احتمالاً مشکل RLS در Supabase)');
      }
      return;
    }

    if (!data) {
      showError('اطلاعاتی یافت نشد', 'این کارت در سیستم وجود ندارد.');
      return;
    }

    // نمایش تعداد جلسات
    const sessions = data.remaining_sessions ?? 0;
    sessionsEl.textContent = String(sessions);

    if (sessions <= 0) {
      sessionsEl.style.background = 'linear-gradient(180deg, #ff6b6b, #ff3b3b)';
      sessionsEl.style.webkitBackgroundClip = 'text';
      sessionsEl.style.backgroundClip = 'text';
    }

    // نمایش تاریخ
    expiryEl.textContent = toPersianDate(data.expiry_date);

    showContent();

  } catch (err) {
    console.error('خطای غیرمنتظره:', err);
    showError('خطای غیرمنتظره', 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.');
  }
}

document.addEventListener('DOMContentLoaded', init);
