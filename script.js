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

function toPersianDate(dateStr) {
  if (!dateStr) return 'نامشخص';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  } catch (err) { return dateStr; }
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
    // 🚀 اینجا جادوی خودکارسازی اتفاق می‌افتد!
    // به جای خواندن ساده، تابع check_in_member را صدا می‌زنیم
    // این تابع خودش چک می‌کند، جلسه کم می‌کند و اطلاعات را برمی‌گرداند
    const { data: rpcData, error: rpcError } = await client.rpc('check_in_member', { p_token: token });

    if (rpcError) {
      console.error('خطای تابع:', rpcError);
      showError('خطا در سیستم', 'ارتباط با سرور برقرار نشد.');
      return;
    }

    // بررسی وضعیت برگشتی از دیتابیس
    if (rpcData.status === 'not_found') {
      showError('کارت شناسایی نشد', 'این کارت در سیستم ثبت نشده است.');
      return;
    }

    // حالا اطلاعات کامل عضو را می‌خوانیم تا نام و تاریخ را نشان دهیم
    const { data: member, error: memberError } = await client
      .from('members')
      .select('member_name, remaining_sessions, expiry_date')
      .eq('token', token)
      .single();

    if (memberError) {
      showError('خطا', 'اطلاعات عضو دریافت نشد.');
      return;
    }

    // تنظیم ظاهر بر اساس وضعیت
    if (rpcData.status === 'expired') {
      contentEl.classList.add('expired');
      sessionsEl.textContent = '0';
    } else if (rpcData.status === 'no_sessions') {
      sessionsEl.textContent = '0';
      sessionsEl.style.background = 'linear-gradient(180deg, #ff6b6b, #ff3b3b)';
      sessionsEl.style.webkitBackgroundClip = 'text';
      sessionsEl.style.backgroundClip = 'text';
    } else {
      // وضعیت success یا already_checked_in
      sessionsEl.textContent = String(rpcData.sessions);
    }

    if (member.member_name) {
      memberNameEl.textContent = member.member_name;
      memberNameContainer.classList.remove('hidden');
    }

    expiryEl.textContent = toPersianDate(member.expiry_date);
    showContent();

  } catch (err) {
    console.error('خطای غیرمنتظره:', err);
    showError('خطای غیرمنتظره', 'مشکلی پیش آمد.');
  }
}

document.addEventListener('DOMContentLoaded', init);
