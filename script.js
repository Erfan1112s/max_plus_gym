const SUPABASE_URL = 'https://aykilcqlydloxmvgjuwj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WPN3BAGfDaSu9i5K4pnUhw_Mzqv0_7r';

const loadingEl     = document.getElementById('loading');
const errorStateEl  = document.getElementById('error-state');
const errorTitleEl  = document.getElementById('error-title');
const errorMsgEl    = document.getElementById('error-message');
const contentEl     = document.getElementById('content');
const sessionsEl    = document.getElementById('remaining-sessions');
const expiryEl      = document.getElementById('expiry-date');
const memberNameEl  = document.getElementById('member-name');
const memberNameContainer = document.getElementById('member-name-container');

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

// تبدیل تاریخ به شمسی
function toPersianDate(dateStr) {
  if (!dateStr) return 'نامشخص';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  } catch (err) { return dateStr; }
}

// بررسی اینکه آیا تاریخ گذشته است یا نه
function isExpired(dateStr) {
  if (!dateStr) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // صفر کردن ساعت برای مقایسه دقیق روز
  const expDate = new Date(dateStr);
  return expDate < today;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    showError('توکن پیدا نشد', 'لطفاً کارت باشگاه را به گوشی نزدیک کنید تا صفحه به‌درستی باز شود.');
    return;
  }

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // خواندن اطلاعات از دیتابیس
    const { data, error } = await client
      .from('members')
      .select('member_name, remaining_sessions, expiry_date')
      .eq('token', token)
      .single();

    if (error) {
      console.error('خطای Supabase:', error);
      if (error.code === 'PGRST116') {
        showError('کارت شناسایی نشد', 'این کارت در سیستم ثبت نشده است.');
      } else {
        showError('خطا در دریافت اطلاعات', 'ارتباط با سرور برقرار نشد.');
      }
      return;
    }

    // پردازش تاریخ و وضعیت انقضا
    const expired = isExpired(data.expiry_date);
    const sessions = data.remaining_sessions ?? 0;

    // اگر منقضی شده، کارت را قرمز کن
    if (expired) {
      contentEl.classList.add('expired');
      sessionsEl.textContent = '0'; // اگر منقضی شده، جلسات را صفر نشان بده
    } else {
      sessionsEl.textContent = String(sessions);
    }

    // نمایش نام کاربر اگر در دیتابیس ثبت شده باشد
    if (data.member_name) {
      memberNameEl.textContent = data.member_name;
      memberNameContainer.classList.remove('hidden');
    }

    expiryEl.textContent = toPersianDate(data.expiry_date);
    showContent();

  } catch (err) {
    console.error('خطای غیرمنتظره:', err);
    showError('خطای غیرمنتظره', 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.');
  }
}

document.addEventListener('DOMContentLoaded', init);
