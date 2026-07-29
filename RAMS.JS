/* ══════════════════════════════════════════════════════════════════════
   RANA AHMAD MILK SHOP — SMART ENGINE  (v1.3)
   ──────────────────────────────────────────────────────────────────────
   v1.2 hi hai — sirf EK badi cheez barhi hai:

     ★ URDU ↔ ENGLISH SEARCH
       Client ka naam Urdu mein save hai, lekin ab aap English
       keyboard se "abbas", "abas", "wqs", "rana" likh kar bhi
       usay dhoond sakte hain. Search box aur suggestions dono mein.

   Baqi sab — bill ka size, style, PNG, PDF, bold naam — pehle jaisa.
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════ 0. BUNIYADI CHEEZEIN ═══════════════════ */

  var LS_PROFILES = 'rams_profiles_v1';
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var UR_MONTHS = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
    'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
  var UR_DAYS = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

  function $(id) { return document.getElementById(id); }
  function q(sel) { return document.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function toNum(t) {
    return parseFloat(String(t || '').replace(/Rs\.?\s*/gi, '').replace(/,/g, '')) || 0;
  }
  function money(n) { return 'Rs. ' + Math.round(n).toLocaleString('en-US'); }
  function mLabel(mv) {
    if (!mv) return '';
    var p = String(mv).split('-');
    return (MONTHS[parseInt(p[1], 10) - 1] || '') + ' ' + p[0];
  }
  function curMonth() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
  }
  function daysIn(mv) {
    var p = String(mv || curMonth()).split('-');
    return new Date(+p[0], +p[1], 0).getDate();
  }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!$('calculationBox') || !$('ledgerContent')) return;   /* ghalat page — chup chaap nikal jao */

  /* paighaam — panel ke foot mein + neeche toast */
  function note(msg, bad) {
    var s = $('saveStatus');
    if (s) {
      s.textContent = msg;
      s.style.color = bad ? '#b91c1c' : '#0f766e';
      setTimeout(function () { if (s.textContent === msg) s.textContent = ''; }, 2600);
    }
    toast(msg, bad);
  }

  /* ═══════════════════ 0b. BILL KA NAAM HAMESHA BOLD ═══════════════════ */

  var boldEl = document.createElement('style');
  boldEl.id = 'rams-bill-bold';
  boldEl.textContent =
    '#ledgerContent #clientName{ font-weight:900 !important; letter-spacing:.01em; }' +
    'body.app-dark #ledgerContent #clientName{ color:#f0e7d6 !important; }';
  document.head.appendChild(boldEl);

  /* ═══════════════════ 0c. URDU ↔ ROMAN SEARCH ═══════════════════
     Urdu naam ko English harf mein badal kar match karta hai.
     Vowels (a e i o u) nazar-andaaz — is liye "abas", "abbas",
     "aabaas" sab «عباس» par lag jate hain.                        */

  var UR2EN = {
    'ا': 'a', 'آ': 'a', 'أ': 'a', 'إ': 'a',
    'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 't', 'ث': 's',
    'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ڈ': 'd', 'ذ': 'z', 'ر': 'r', 'ڑ': 'r',
    'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ک': 'k', 'ك': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
    'ن': 'n', 'ں': 'n', 'ٹھ': 'th',
    'و': 'w', 'ؤ': 'w', 'ہ': 'h', 'ه': 'h', 'ھ': 'h', 'ۃ': 'h', 'ة': 'h',
    'ء': '', 'ی': 'y', 'ي': 'y', 'ئ': 'y', 'ے': 'e',
    'ٰ': '', 'َ': '', 'ِ': '', 'ُ': '', 'ّ': '', 'ْ': '', 'ً': '', 'ٍ': '', 'ٌ': '',
    '\u200c': '', '\u200d': ''
  };

  function urToRoman(s) {
    var out = '';
    String(s || '').split('').forEach(function (ch) {
      out += (UR2EN[ch] !== undefined) ? UR2EN[ch] : ch;
    });
    return out;
  }

  /* loose key — vowels aur dohre harf hata do */
  function loose(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z\u0600-\u06FF]/g, '')
      .replace(/[aeiou]/g, '')
      .replace(/(.)\1+/g, '$1');
  }

  function keysFor(name) {
    var n = String(name || '').toLowerCase();
    return [n, loose(n), loose(urToRoman(n))];
  }

  /* asal match — Urdu se bhi chalta hai, English se bhi */
  function nameMatches(name, qy) {
    if (!qy) return true;
    var q1 = String(qy).toLowerCase().trim();
    if (!q1) return true;
    var q2 = loose(q1);
    var q3 = loose(urToRoman(q1));
    var ks = keysFor(name);
    if (ks[0].indexOf(q1) !== -1) return true;
    if (q2 && (ks[1].indexOf(q2) !== -1 || ks[2].indexOf(q2) !== -1)) return true;
    if (q3 && ks[2].indexOf(q3) !== -1) return true;
    return false;
  }

  /* ═══════════════════ 1. STYLES ═══════════════════ */

  var CSS = `
/* ─────── PANEL ANIMATIONS ─────── */
#calculationBox.cp{ animation: rsPanel .6s cubic-bezier(.2,.85,.25,1) both; }
@keyframes rsPanel{ from{opacity:0; transform:translateY(16px) scale(.982);} to{opacity:1; transform:none;} }
#calculationBox .cp-head::before{ background-size:200% 100%; animation: rsSheen 5s linear infinite; }
@keyframes rsSheen{ to{ background-position:200% 0; } }

#calculationBox .cp-readout{ position:relative; overflow:hidden; }
#calculationBox .cp-readout::after{
  content:""; position:absolute; top:-20%; bottom:-20%; width:34%;
  background:linear-gradient(100deg,transparent,rgba(255,216,148,.13),transparent);
  transform:skewX(-18deg); pointer-events:none; animation: rsSweep 6.5s cubic-bezier(.5,0,.5,1) infinite;
}
@keyframes rsSweep{ 0%{left:-45%} 58%,100%{left:120%} }
#calculationBox .ro-val{ transition:color .3s, text-shadow .3s; font-variant-numeric:tabular-nums; }
#calculationBox .ro-val.rs-roll{ color:#ffe4ae; text-shadow:0 0 14px rgba(255,216,148,.45); }
#calculationBox .ro-val.rs-set{ animation: rsSettle .55s cubic-bezier(.2,1.5,.4,1) both; }
@keyframes rsSettle{ 0%{transform:scale(1.09)} 60%{transform:scale(.985)} 100%{transform:scale(1)} }
#calculationBox .cp-readout.rs-lit{ animation: rsLit .9s ease both; }
@keyframes rsLit{ 0%,100%{box-shadow:inset 0 0 0 0 rgba(255,216,148,0)} 30%{box-shadow:inset 0 0 34px -8px rgba(255,216,148,.30)} }

#calculationBox .cp-tab.is-on::after{ animation: rsBar .32s cubic-bezier(.2,.9,.3,1) both; }
@keyframes rsBar{ from{transform:scaleX(.15); opacity:.2} to{transform:scaleX(1); opacity:1} }
#calculationBox .cp-pane.is-on{ animation: rsPane .3s ease both; }
@keyframes rsPane{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none} }
#calculationBox.rs-fwd .cp-pane.is-on{ animation-name: rsPaneF; }
#calculationBox.rs-back .cp-pane.is-on{ animation-name: rsPaneB; }
@keyframes rsPaneF{ from{opacity:0; transform:translateX(14px)} to{opacity:1; transform:none} }
@keyframes rsPaneB{ from{opacity:0; transform:translateX(-14px)} to{opacity:1; transform:none} }

#calculationBox .cp-btn{ position:relative; overflow:hidden; transform:translateZ(0);
  transition:background-color .15s, border-color .15s, transform .13s, box-shadow .2s; }
#calculationBox .cp-btn:hover{ transform:translateY(-1.5px); box-shadow:0 4px 13px rgba(124,45,18,.17); }
#calculationBox .cp-btn:active{ transform:translateY(0) scale(.985); box-shadow:none; }
body.app-dark #calculationBox .cp-btn:hover{ box-shadow:0 4px 14px rgba(0,0,0,.45); }
.rs-rp{ position:absolute; border-radius:50%; pointer-events:none; transform:translate(-50%,-50%) scale(0);
  background:rgba(255,255,255,.40); animation: rsRipple .55s cubic-bezier(.25,.8,.3,1) forwards; }
.cp-btn-ghost .rs-rp, .cp-tab .rs-rp{ background:rgba(124,45,18,.16); }
body.app-dark .cp-btn-ghost .rs-rp, body.app-dark .cp-tab .rs-rp{ background:rgba(236,207,146,.20); }
@keyframes rsRipple{ to{ transform:translate(-50%,-50%) scale(1); opacity:0; } }
#calculationBox .cp-btn-hero{ box-shadow:0 0 0 0 rgba(124,45,18,.34); animation: rsBreathe 3s ease-in-out infinite; }
@keyframes rsBreathe{ 50%{ box-shadow:0 0 0 8px rgba(124,45,18,0); } }
#calculationBox .cp-btn-hero.rs-busy{ animation:none; pointer-events:none; opacity:.82; }
#calculationBox .cp-field{ transition:border-color .15s, box-shadow .2s, transform .13s; }
#calculationBox .cp-field:focus, #calculationBox .cp-field:focus-within{ transform:translateY(-1px); }
#calculationBox #saveStatus.rs-pop{ display:inline-block; animation: rsStat .42s cubic-bezier(.2,1.2,.4,1) both; }
@keyframes rsStat{ from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none} }
#loadingOverlay .dots-loader .dot{ background:linear-gradient(180deg,#ffd894,#c89f5e); box-shadow:0 0 12px rgba(200,159,94,.5); }
#dashboardOverlay .dash-box{ animation: rsDash .35s cubic-bezier(.2,.9,.3,1) both; }
@keyframes rsDash{ from{opacity:0; transform:translateY(-14px) scale(.985)} to{opacity:1; transform:none} }
#lockInput.rs-shake{ animation: rsShake .42s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes rsShake{ 10%,90%{transform:translateX(-2px)} 20%,80%{transform:translateX(4px)}
  30%,50%,70%{transform:translateX(-7px)} 40%,60%{transform:translateX(7px)} }

/* ─────── TOAST ─────── */
#rsToast{
  position:fixed; z-index:9997; left:50%; bottom:26px; transform:translateX(-50%) translateY(14px);
  max-width:min(88vw,340px); background:linear-gradient(180deg,#2a2015,#191309); color:#f2e3c6;
  border:1px solid #7c5f34; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.42);
  padding:9px 15px; font-family:'Segoe UI',sans-serif; font-size:13px; font-weight:700;
  direction:rtl; text-align:center; line-height:1.5; opacity:0; pointer-events:none;
  transition:opacity .28s, transform .28s cubic-bezier(.2,1.1,.4,1);
}
#rsToast.on{ opacity:1; transform:translateX(-50%) translateY(0); }
#rsToast.bad{ border-color:#a13a2a; color:#ffd7cf; }

/* ─────── CLIENT RAIL (ab SAB SE DAAYEN) ─────── */
:root{
  --rs-rail-w: 300px;
  --rs-rail-h: 820px;
}
.app-layout{ max-width:1240px; }
#rsRail{
  flex:0 0 var(--rs-rail-w); width:var(--rs-rail-w);
  position:sticky; top:10px; align-self:flex-start;
  height:var(--rs-rail-h); max-height:var(--rs-rail-h);
  display:flex; flex-direction:column; direction:rtl; overflow:hidden;
  background:linear-gradient(180deg,#fffdf9,#fbf4e8);
  border:1px solid #c89f5e; border-radius:11px; box-shadow:0 3px 14px rgba(124,45,18,.09);
  font-family:'Segoe UI',sans-serif; animation: rsPanel .55s cubic-bezier(.2,.85,.25,1) both;
}
#rsRail .rs-head{ position:relative; background:#fff; border-bottom:1px solid #e8d5c4;
  padding:9px 11px 8px; text-align:center; flex-shrink:0; }
#rsRail .rs-head::before{ content:""; position:absolute; top:0; left:0; right:0; height:3px;
  background:linear-gradient(90deg,#7c2d12,#c89f5e 50%,#7c2d12); background-size:200% 100%;
  animation: rsSheen 5s linear infinite; }
#rsRail .rs-t{ display:block; font-size:14px; font-weight:800; color:#5c3f1e; }
#rsRail .rs-s{ display:block; font-size:8px; letter-spacing:.16em; text-transform:uppercase;
  color:#a1794a; direction:ltr; margin-top:2px; }

/* ─────── LIVE WATCH ─────── */
.rs-clock{ flex-shrink:0; background:linear-gradient(180deg,#2a2015,#191309);
  border-bottom:1px solid #7c5f34; padding:8px 11px 9px; text-align:center; direction:rtl; }
.rs-clk-time{ display:block; font-family:'Segoe UI',Consolas,monospace; font-size:24px;
  font-weight:800; color:#ffd894; direction:ltr; letter-spacing:.02em; line-height:1.15;
  font-variant-numeric:tabular-nums; }
.rs-clk-time .rs-sec{ font-size:13.5px; color:#c89f5e; }
.rs-clk-time .rs-mer{ font-size:11.5px; color:#9b7c4e; margin-inline-start:3px; }
.rs-clk-date{ display:block; font-size:11px; font-weight:700; color:#e8c07a; margin-top:2px; }
.rs-clk-en{ display:block; font-size:8.5px; letter-spacing:.13em; text-transform:uppercase;
  color:#9b7c4e; direction:ltr; margin-top:1px; }

#rsRail .rs-tools{ padding:9px 9px 7px; display:grid; gap:6px; flex-shrink:0; position:relative; }
.rs-inp{ width:100%; height:34px; border:1px solid #d8bd91; border-radius:7px; background:#fff;
  color:#3c2810; font-size:12.5px; font-family:'Segoe UI',sans-serif; padding:0 9px; outline:none;
  transition:border-color .15s, box-shadow .2s; }
.rs-inp:focus{ border-color:#7c2d12; box-shadow:0 0 0 3px rgba(124,45,18,.10); }
.rs-inp::placeholder{ color:#b9a68c; }
.rs-b{ height:34px; border:1px solid transparent; border-radius:7px; cursor:pointer;
  font-family:'Segoe UI',sans-serif; font-size:12.5px; font-weight:700; display:flex;
  align-items:center; justify-content:center; gap:5px; white-space:nowrap;
  transition:background-color .15s, transform .12s, box-shadow .18s; }
.rs-b:hover{ transform:translateY(-1px); }
.rs-b:active{ transform:none; }
.rs-b-main{ background:#7c2d12; color:#fff; }
.rs-b-main:hover{ background:#96381a; }
.rs-b-ghost{ background:#fff; color:#5c3f1e; border-color:#ddc39a; }
.rs-b-ghost:hover{ background:#f9efdd; border-color:#c89f5e; }
.rs-b-wa{ background:#25D366; color:#0b3d1f; }
.rs-b-wa:hover{ background:#2ee273; }
.rs-2{ display:grid; grid-template-columns:1fr 1fr; gap:6px; }

/* suggestions dropdown */
#rsSug{ position:absolute; top:47px; right:9px; left:9px; z-index:60; background:#fff;
  border:1px solid #c89f5e; border-radius:8px; box-shadow:0 8px 22px rgba(124,45,18,.18);
  max-height:230px; overflow:auto; display:none; }
#rsSug.on{ display:block; animation: rsPane .18s ease both; }
#rsSug .rs-sg{ padding:7px 9px; cursor:pointer; border-bottom:1px solid #f2e6d2; }
#rsSug .rs-sg:last-child{ border-bottom:0; }
#rsSug .rs-sg:hover, #rsSug .rs-sg.hi{ background:#f9e8d2; }
#rsSug .rs-sg-n{ display:block; font-size:13px; font-weight:900; color:#3c2810; }
#rsSug .rs-sg-m{ display:block; font-size:9.5px; color:#a1794a; direction:ltr; text-align:right; margin-top:1px; }
#rsSug .rs-sg-new{ color:#0f766e; font-weight:800; font-size:12px; }

#rsRail .rs-list{ flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden; padding:0 7px 7px; }
#rsRail .rs-list::-webkit-scrollbar{ width:6px; }
#rsRail .rs-list::-webkit-scrollbar-thumb{ background:#c89f5e; border-radius:3px; }

/* ─────── CLIENT ROW ─────── */
.rs-item{ position:relative; display:flex; align-items:center; gap:6px; width:100%;
  background:#fff; border:1px solid #ecd9bd; border-right:3px solid transparent; border-radius:7px;
  padding:8px 10px; margin-bottom:5px; direction:rtl; font-family:'Segoe UI',sans-serif;
  transition:background-color .15s, border-color .15s, transform .12s, box-shadow .18s;
  animation: rsRow .28s ease both; }
@keyframes rsRow{ from{opacity:0; transform:translateY(5px)} to{opacity:1; transform:none} }
.rs-item:hover{ background:#fdf6ea; border-right-color:#c89f5e; transform:translateX(-2px);
  box-shadow:0 2px 8px rgba(124,45,18,.10); }
.rs-item.on{ background:#f9e8d2; border-color:#c89f5e; border-right-color:#7c2d12; }
.rs-item.gone{ animation: rsGone .3s ease forwards; }
@keyframes rsGone{ to{ opacity:0; transform:translateX(40px); } }
.rs-open{ flex:1; min-width:0; background:none; border:0; padding:0; cursor:pointer;
  text-align:right; direction:rtl; font-family:inherit; }

/* ★ NAAM — hamesha BOLD */
.rs-n{ display:block; font-size:13.5px; font-weight:900; color:#3c2810; letter-spacing:.01em;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rs-item.on .rs-n{ color:#7c2d12; }

.rs-meta{ display:flex; align-items:center; justify-content:space-between; gap:6px; margin-top:3px; }
.rs-mob{ font-size:9.5px; color:#a1794a; font-weight:700; direction:ltr; }
.rs-amt{ font-size:11.5px; font-weight:900; color:#3c2810; direction:ltr;
  font-family:'Segoe UI',Consolas,monospace; white-space:nowrap; }
.rs-amt.due{ color:#b91c1c; } .rs-amt.clr{ color:#15803d; }
.rs-tag{ display:inline-block; font-size:8px; font-weight:800; color:#7c2d12; background:#f4e6d0;
  border-radius:4px; padding:1px 5px; margin-right:4px; }
.rs-del{ flex-shrink:0; width:25px; height:25px; border:1px solid #ecd9bd; border-radius:6px;
  background:#fff; color:#b0806a; font-size:12px; line-height:1; cursor:pointer; opacity:.5;
  display:flex; align-items:center; justify-content:center;
  transition:opacity .15s, background-color .15s, color .15s, border-color .15s, transform .12s; }
.rs-item:hover .rs-del{ opacity:1; }
.rs-del:hover{ background:#b91c1c; border-color:#b91c1c; color:#fff; transform:scale(1.07); }
.rs-empty{ text-align:center; padding:24px 12px; color:#a89684; font-size:12px; line-height:1.8; }
#rsRail .rs-foot{ flex-shrink:0; border-top:1px solid #e8d5c4; background:#f9f0e2; padding:7px 10px;
  font-size:10.5px; font-weight:700; color:#8a7560; display:flex; justify-content:space-between; gap:6px; }
#rsRail .rs-foot b{ direction:ltr; font-family:'Segoe UI',Consolas,monospace; color:#7c2d12; }

/* ─────── MODAL (naya client + whatsapp import) ─────── */
.rs-ov{ position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(3px);
  z-index:9994; display:none; justify-content:center; align-items:flex-start;
  padding:22px 12px; overflow:auto; }
.rs-ov.on{ display:flex; }
.rs-box{ width:100%; background:#fffdf9; border:1.5px solid #c89f5e; border-radius:11px;
  box-shadow:0 12px 42px rgba(0,0,0,.38); overflow:hidden; direction:rtl;
  font-family:'Segoe UI',sans-serif; animation: rsDash .32s cubic-bezier(.2,.9,.3,1) both; }
#rsNewBox{ max-width:420px; } #rsWaBox{ max-width:760px; }
.rs-bh{ display:flex; align-items:center; gap:8px; background:linear-gradient(90deg,#7c2d12,#a15a2a); padding:9px 12px; }
.rs-bh span{ font-size:14px; font-weight:800; color:#fff; margin-left:auto; }
.rs-x{ background:rgba(255,255,255,.18); color:#fff; font-weight:900; border:0; border-radius:5px;
  width:26px; height:26px; line-height:1; cursor:pointer; }
.rs-bb{ padding:12px; display:grid; gap:9px; }
.rs-fld{ display:grid; gap:4px; }
.rs-lb{ font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#a1794a; }
.rs-ta{ width:100%; min-height:150px; resize:vertical; border:1px solid #d8bd91; border-radius:8px;
  background:#fff; color:#3c2810; padding:9px; font-size:12.5px; line-height:1.75;
  font-family:'Segoe UI',sans-serif; outline:none; direction:rtl; }
.rs-ta:focus{ border-color:#7c2d12; box-shadow:0 0 0 3px rgba(124,45,18,.10); }
.rs-hint{ font-size:10.5px; color:#a1794a; line-height:1.8; background:#f9f0e2;
  border:1px dashed #ddc39a; border-radius:7px; padding:7px 9px; }
.rs-hint code{ direction:ltr; display:inline-block; color:#7c2d12; font-weight:700; }
.rs-prev{ max-height:38vh; overflow:auto; border:1px solid #e0c9a6; border-radius:8px; }
#rsWaTable{ width:100%; border-collapse:collapse; font-size:11.5px; }
#rsWaTable th{ background:#f9e8d2; color:#5c3f1e; font-weight:800; font-size:10.5px;
  border:1px solid #e0c9a6; padding:5px 4px; position:sticky; top:0; }
#rsWaTable td{ border:1px solid #e8d5c4; padding:4px 5px; text-align:center; }
#rsWaTable td[contenteditable]{ background:#fff; }
#rsWaTable td[contenteditable]:focus{ outline:1px dashed #7c2d12; background:#fffbeb; }
#rsWaTable td.nm{ text-align:right; font-weight:900; color:#3c2810; }
#rsWaTable td.n{ direction:ltr; font-family:'Segoe UI',Consolas,monospace; }
#rsWaTable tbody tr.dup td{ background:#fdf3e3; }
.rs-bf{ border-top:1px solid #e8d5c4; background:#f9f0e2; padding:9px 12px;
  display:flex; gap:8px; align-items:center; }
.rs-bf .rs-b{ flex:1; }
.rs-bf .rs-cnt{ font-size:11px; font-weight:800; color:#8a7560; white-space:nowrap; }

/* ─────── DARK MODE ─────── */
body.app-dark #rsRail{ background:linear-gradient(180deg,#1d1710,#17130e); border-color:#6b5330; }
body.app-dark #rsRail .rs-head{ background:#241d14; border-bottom-color:#4a3c28; }
body.app-dark #rsRail .rs-t{ color:#eccf92; } body.app-dark #rsRail .rs-s{ color:#b08f5c; }
body.app-dark .rs-inp{ background:#241d14; border-color:#6f5734; color:#f6efe0; }
body.app-dark .rs-inp::placeholder{ color:#7a6a52; }
body.app-dark .rs-b-ghost{ background:#241d14; color:#e6d5b6; border-color:#6f5734; }
body.app-dark .rs-b-ghost:hover{ background:#2f2617; border-color:#b7873f; }
body.app-dark .rs-item{ background:#241d14; border-color:#4a3c28; }
body.app-dark .rs-item:hover{ background:#2f2617; border-right-color:#b7873f; }
body.app-dark .rs-item.on{ background:#3a2c17; border-color:#b7873f; border-right-color:#eccf92; }
body.app-dark .rs-n{ color:#ffdca0; }
body.app-dark .rs-item.on .rs-n{ color:#ffe4ae; }
body.app-dark .rs-mob{ color:#a4917a; }
body.app-dark .rs-amt{ color:#f0e7d6; }
body.app-dark .rs-amt.due{ color:#f87171; } body.app-dark .rs-amt.clr{ color:#4ade80; }
body.app-dark .rs-tag{ background:#3a2c17; color:#e0bd7f; }
body.app-dark .rs-del{ background:#241d14; border-color:#4a3c28; color:#b08f5c; }
body.app-dark .rs-del:hover{ background:#b91c1c; border-color:#b91c1c; color:#fff; }
body.app-dark #rsRail .rs-foot{ background:#241d14; border-top-color:#4a3c28; color:#a4917a; }
body.app-dark #rsRail .rs-foot b{ color:#e0bd7f; }
body.app-dark .rs-empty{ color:#7a6a52; }
body.app-dark #rsSug{ background:#1d1710; border-color:#6b5330; }
body.app-dark #rsSug .rs-sg{ border-bottom-color:#3a2f1e; }
body.app-dark #rsSug .rs-sg:hover, body.app-dark #rsSug .rs-sg.hi{ background:#2f2617; }
body.app-dark #rsSug .rs-sg-n{ color:#ffdca0; } body.app-dark #rsSug .rs-sg-m{ color:#a4917a; }
body.app-dark .rs-box{ background:#17130e; border-color:#6b5330; color:#ece3d3; }
body.app-dark .rs-ta{ background:#241d14; border-color:#6f5734; color:#f6efe0; }
body.app-dark .rs-hint{ background:#241d14; border-color:#4a3c28; color:#b08f5c; }
body.app-dark .rs-hint code{ color:#e0bd7f; }
body.app-dark .rs-lb{ color:#b08f5c; }
body.app-dark .rs-prev{ border-color:#6b5330; }
body.app-dark #rsWaTable th{ background:#3a2c17; color:#eccf92; border-color:#6b5330; }
body.app-dark #rsWaTable td{ background:#1d1710; color:#f0e7d6; border-color:#6b5330; }
body.app-dark #rsWaTable td.nm{ color:#ffdca0; }
body.app-dark #rsWaTable tbody tr.dup td{ background:#2a2114; }
body.app-dark .rs-bf{ background:#241d14; border-top-color:#4a3c28; }
body.app-dark .rs-bf .rs-cnt{ color:#a4917a; }

/* ─────── CHHOTI SCREEN ─────── */
#rsToggle{ position:fixed; bottom:18px; right:18px; z-index:9993; display:none;
  width:52px; height:52px; border:0; border-radius:16px; cursor:pointer; color:#fff; font-size:21px;
  background:linear-gradient(135deg,#7c2d12,#c89f5e); box-shadow:0 6px 18px rgba(124,45,18,.35);
  transition:transform .15s; }
#rsToggle:active{ transform:scale(.94); }
@media (max-width:1300px){
  #rsToggle{ display:block; }
  .app-layout{ max-width:880px; }
  #rsRail{ position:fixed; top:0; right:0; bottom:0; z-index:9992; flex:none; width:272px;
    height:auto; max-height:none; border-radius:0; border-left:1px solid #c89f5e; border-right:0;
    box-shadow:-8px 0 26px rgba(0,0,0,.22); transform:translateX(105%);
    transition:transform .3s cubic-bezier(.2,.9,.3,1); animation:none; }
  #rsRail.open{ transform:none; }
}
@media (prefers-reduced-motion: reduce){
  #calculationBox.cp, #calculationBox.cp *, #rsRail, #rsRail *, .rs-box, #rsToast{
    animation:none !important; transition:none !important; }
}
`;

  var styleEl = document.createElement('style');
  styleEl.id = 'rams-smart-style';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* ═══════════════════ 2. TOAST ═══════════════════ */

  var toastEl = document.createElement('div');
  toastEl.id = 'rsToast';
  document.body.appendChild(toastEl);
  var toastT = null;
  function toast(msg, bad) {
    if (!msg) return;
    toastEl.textContent = msg;
    toastEl.classList.toggle('bad', !!bad);
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }

  /* ═══════════════════ 3. PROFILE STORE ═══════════════════ */

  function getProfiles() {
    try { return JSON.parse(localStorage.getItem(LS_PROFILES) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function setProfiles(p) {
    try { localStorage.setItem(LS_PROFILES, JSON.stringify(p)); } catch (e) { }
  }
  function saveProfile(p) {
    if (!p || !p.name) return;
    var db = getProfiles();
    var old = db[p.name] || {};
    db[p.name] = {
      name: p.name,
      mobile: p.mobile || old.mobile || '',
      rate: p.rate || old.rate || '',
      daily: p.daily || old.daily || '',
      delivery: p.delivery || old.delivery || 'صبح',
      note: p.note || old.note || ''
    };
    setProfiles(db);
  }

  /* saved bills (app ka apna database) */
  function customers() {
    return (typeof window.getCustomers === 'function') ? (window.getCustomers() || {}) : {};
  }

  /* har naam — profile + saved bills dono se */
  function allNames() {
    var set = {};
    Object.keys(getProfiles()).forEach(function (n) { set[n] = 1; });
    Object.keys(customers()).forEach(function (n) { set[n] = 1; });
    return Object.keys(set).sort(function (a, b) { return a.localeCompare(b, 'ur'); });
  }

  function infoFor(name) {
    var prof = getProfiles()[name] || {};
    var db = customers()[name];
    var months = (db && db.months) || {};
    var keys = Object.keys(months).sort();
    var last = keys.length ? months[keys[keys.length - 1]] : null;
    return {
      name: name,
      mobile: prof.mobile || (last && last.mobile) || '',
      rate: prof.rate || (last && String(last.rate || '').trim()) || '',
      daily: prof.daily || '',
      delivery: prof.delivery || (last && last.delivery) || 'صبح',
      lastMonth: keys.length ? keys[keys.length - 1] : '',
      grand: last ? last.grand : '',
      saved: !!keys.length
    };
  }

  /* ═══════════════════ 4. BILL MEIN VALUE BHARNA ═══════════════════ */

  function fillDays(qty) {
    var cells = qa('.kg-input');
    if (!cells.length || !qty) return 0;
    var n = 0;
    cells.forEach(function (c) { c.textContent = qty; n++; });
    if (typeof window.updateAttendance === 'function') window.updateAttendance();
    return n;
  }

  function applyToBill(info, opts) {
    opts = opts || {};
    if (info.name) $('clientName').textContent = info.name;
    if (info.mobile) $('clientMobile').textContent = info.mobile;
    if (info.rate) {
      $('milkRate').textContent = info.rate;
      $('displayRate').textContent = 'Rs. ' + info.rate + '/Ltr';
    }
    if (info.delivery) $('deliveryTime').textContent = info.delivery;

    var filled = 0;
    if (opts.days && info.daily) filled = fillDays(info.daily);

    if (typeof window.saveDraft === 'function') window.saveDraft();

    if (opts.calc && info.rate) {
      var b = $('calculateBtn');
      if (b) b.click();
    } else if (typeof window.updateReadout === 'function') {
      window.updateReadout();
    }
    return filled;
  }

  /* naam par click / select — smart open */
  function openClient(name, opts) {
    opts = opts || {};
    if (typeof window.persistCurrentMonth === 'function') window.persistCurrentMonth();

    var mp = $('monthPicker');
    var mv = (mp && mp.value) || curMonth();
    var db = customers();
    var info = infoFor(name);

    if (db[name] && typeof window.loadCustomerMonth === 'function') {
      var months = Object.keys(db[name].months || {}).sort();
      var target = months.indexOf(mv) !== -1 ? mv : (months[months.length - 1] || mv);
      window.loadCustomerMonth(name, target);
      if (!$('clientMobile').textContent.trim() && info.mobile) $('clientMobile').textContent = info.mobile;
      if (!$('milkRate').textContent.trim() && info.rate) {
        $('milkRate').textContent = info.rate;
        $('displayRate').textContent = 'Rs. ' + info.rate + '/Ltr';
      }
      var empty = qa('.kg-input').every(function (c) { return c.textContent.trim() === ''; });
      if (empty && info.daily && opts.autoDays !== false) {
        fillDays(info.daily);
        var b = $('calculateBtn'); if (b && info.rate) b.click();
        note(name + ' — ' + mLabel(target) + ' · ' + info.daily + ' لیٹر روزانہ بھر دیے');
      } else {
        note('کھول دیا: ' + name + ' — ' + mLabel(target));
      }
    } else {
      if (typeof window.clearBill === 'function') window.clearBill();
      var n = applyToBill(info, { days: opts.autoDays !== false, calc: true });
      note(n ? (name + ' تیار — ' + n + ' دن، ریٹ ' + (info.rate || '—')) : (name + ' تیار ہے'));
    }

    if (typeof window.refreshCustomerList === 'function') window.refreshCustomerList(name);
    var sel = $('customerSelect'); if (sel) { try { sel.value = name; } catch (e) { } }
    if (window.innerWidth <= 1300) rail.classList.remove('open');
    buildList();
  }

  /* ═══════════════════ 4b. CLIENT DELETE ═══════════════════ */

  function deleteClient(name, rowEl) {
    var db = customers();
    var monthsCount = (db[name] && db[name].months) ? Object.keys(db[name].months).length : 0;
    var msg = '«' + name + '» کو مکمل ڈیلیٹ کریں؟\n\n' +
      (monthsCount ? (monthsCount + ' مہینے کے بل بھی ختم ہو جائیں گے۔\n') : '') +
      'یہ عمل واپس نہیں ہو سکتا۔';
    if (!confirm(msg)) return;

    var prof = getProfiles();
    delete prof[name];
    setProfiles(prof);

    if (db[name] && typeof window.setCustomers === 'function') {
      delete db[name];
      window.setCustomers(db);
    }

    if (activeName() === name && typeof window.clearBill === 'function') window.clearBill();
    if (typeof window.refreshCustomerList === 'function') window.refreshCustomerList();
    if (typeof window.refreshMonthList === 'function') window.refreshMonthList('');

    if (rowEl) {
      rowEl.classList.add('gone');
      setTimeout(buildList, 300);
    } else { buildList(); }

    note('ڈیلیٹ ہو گیا: ' + name, true);
  }

  /* ═══════════════════ 5. RAIL (side list) ═══════════════════ */

  var layout = q('.app-layout');
  var rail = document.createElement('div');
  rail.id = 'rsRail';
  rail.innerHTML =
    '<div class="rs-head"><span class="rs-t">کلائنٹس</span><span class="rs-s">Smart Customer List</span></div>' +
    '<div class="rs-clock">' +
      '<span class="rs-clk-time" id="rsClkTime">--:--</span>' +
      '<span class="rs-clk-date" id="rsClkDate">—</span>' +
      '<span class="rs-clk-en" id="rsClkEn">—</span>' +
    '</div>' +
    '<div class="rs-tools">' +
      '<input type="text" id="rsName" class="rs-inp" dir="auto" placeholder="نام لکھیں — اردو یا English دونوں" autocomplete="off">' +
      '<div id="rsSug"></div>' +
      '<div class="rs-2">' +
        '<button id="rsNewBtn" class="rs-b rs-b-ghost">+ نیا کلائنٹ</button>' +
        '<button id="rsWaBtn" class="rs-b rs-b-wa">واٹس ایپ سے</button>' +
      '</div>' +
    '</div>' +
    '<div class="rs-list" id="rsList"></div>' +
    '<div class="rs-foot"><span id="rsCount">0 کلائنٹ</span><b id="rsTotal">Rs. 0</b></div>';

  if (layout) layout.insertBefore(rail, layout.firstChild);
  else document.body.appendChild(rail);

  var toggle = document.createElement('button');
  toggle.id = 'rsToggle';
  toggle.textContent = '👥';
  toggle.title = 'کلائنٹس';
  document.body.appendChild(toggle);
  toggle.addEventListener('click', function () { rail.classList.toggle('open'); });
  document.addEventListener('click', function (e) {
    if (window.innerWidth > 1300 || !rail.classList.contains('open')) return;
    if (rail.contains(e.target) || toggle.contains(e.target)) return;
    rail.classList.remove('open');
  });

  /* ═══ RAIL KA SIZE — BILL KE BARABAR ═══ */
  function syncRailSize() {
    if (window.innerWidth <= 1300) return;
    var bill = $('ledgerContent');
    if (!bill) return;
    var r = bill.getBoundingClientRect();
    if (r.height > 220) {
      document.documentElement.style.setProperty('--rs-rail-h', Math.round(r.height) + 'px');
    }
    if (r.width > 240) {
      var w = Math.max(260, Math.min(340, Math.round(r.width * 0.40)));
      document.documentElement.style.setProperty('--rs-rail-w', w + 'px');
    }
  }
  syncRailSize();
  setTimeout(syncRailSize, 300);
  window.addEventListener('resize', syncRailSize);
  if (window.ResizeObserver && $('ledgerContent')) {
    try { new ResizeObserver(syncRailSize).observe($('ledgerContent')); } catch (e) { }
  }

  /* ── LIVE WATCH ── */
  function tickClock() {
    var n = new Date();
    var h = n.getHours(), m = n.getMinutes(), s = n.getSeconds();
    var mer = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    var t = $('rsClkTime');
    if (t) {
      t.innerHTML = String(h12).padStart(2, '0') + ':' + String(m).padStart(2, '0') +
        '<span class="rs-sec">:' + String(s).padStart(2, '0') + '</span>' +
        '<span class="rs-mer">' + mer + '</span>';
    }
    var d = $('rsClkDate');
    if (d) d.textContent = UR_DAYS[n.getDay()] + '، ' + n.getDate() + ' ' + UR_MONTHS[n.getMonth()] + ' ' + n.getFullYear();
    var e = $('rsClkEn');
    if (e) e.textContent = n.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  tickClock();
  setInterval(tickClock, 1000);

  function activeName() {
    var el = $('clientName');
    return el ? el.textContent.trim() : '';
  }

  function buildList() {
    var list = $('rsList');
    if (!list) return;
    var qy = ($('rsName').value || '').trim();
    var cur = activeName();
    var names = allNames();

    /* ★ Urdu ya English — dono se search */
    if (qy) names = names.filter(function (n) { return nameMatches(n, qy); });

    list.innerHTML = '';
    var total = 0, shown = 0;

    names.forEach(function (name, i) {
      var info = infoFor(name);
      var g = toNum(info.grand);
      total += g;
      shown++;
      var cls = g > 0 ? 'due' : (info.grand ? 'clr' : '');

      var row = document.createElement('div');
      row.className = 'rs-item' + (name === cur ? ' on' : '');
      row.style.animationDelay = Math.min(i, 18) * 22 + 'ms';
      row.innerHTML =
        '<button class="rs-open" type="button">' +
          '<span class="rs-n">' + esc(name) +
            (info.saved ? '' : '<span class="rs-tag">نیا</span>') + '</span>' +
          '<span class="rs-meta">' +
            '<span class="rs-mob">' + esc(info.mobile || '—') + '</span>' +
            '<span class="rs-amt ' + cls + '">' + esc(info.grand || '—') + '</span>' +
          '</span>' +
        '</button>' +
        '<button class="rs-del" type="button" title="ڈیلیٹ کریں">🗑</button>';

      row.querySelector('.rs-open').addEventListener('click', function () { openClient(name); });
      row.querySelector('.rs-del').addEventListener('click', function (e) {
        e.stopPropagation();
        deleteClient(name, row);
      });
      list.appendChild(row);
    });

    if (!shown) {
      list.innerHTML = '<div class="rs-empty">' +
        (qy ? 'اس نام کا کوئی کلائنٹ نہیں<br><b>+ نیا کلائنٹ</b> دبائیں'
            : 'ابھی کوئی کلائنٹ نہیں<br>واٹس ایپ سے ڈیٹا لائیں یا نیا کلائنٹ بنائیں') +
        '</div>';
    }
    $('rsCount').textContent = shown + ' کلائنٹ';
    $('rsTotal').textContent = money(total);
  }

  /* ── smart naam box — likhte hi tajaweez ── */
  var sug = $('rsSug'), nameBox = $('rsName'), hiIdx = -1;

  function showSug() {
    var v = (nameBox.value || '').trim();
    var names = allNames();

    /* ★ yahan bhi Urdu ↔ English dono */
    var found = v ? names.filter(function (n) { return nameMatches(n, v); }) : names.slice(0, 8);

    var html = '';
    found.slice(0, 8).forEach(function (n, i) {
      var info = infoFor(n);
      html += '<div class="rs-sg" data-n="' + esc(n) + '" data-i="' + i + '">' +
        '<span class="rs-sg-n">' + esc(n) + '</span>' +
        '<span class="rs-sg-m">' + esc(info.mobile || '—') +
        (info.rate ? ' · Rs. ' + esc(info.rate) + '/L' : '') +
        (info.daily ? ' · ' + esc(info.daily) + ' L' : '') + '</span></div>';
    });
    if (v && found.indexOf(v) === -1) {
      html += '<div class="rs-sg" data-new="1"><span class="rs-sg-new">+ «' + esc(v) + '» نیا کلائنٹ بنائیں</span></div>';
    }
    sug.innerHTML = html;
    sug.classList.toggle('on', html !== '');
    hiIdx = -1;
  }
  function hideSug() { sug.classList.remove('on'); hiIdx = -1; }

  nameBox.addEventListener('input', function () { showSug(); buildList(); });
  nameBox.addEventListener('focus', showSug);
  nameBox.addEventListener('blur', function () { setTimeout(hideSug, 180); });
  nameBox.addEventListener('keydown', function (e) {
    var items = qa('#rsSug .rs-sg');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return;
      e.preventDefault();
      hiIdx += (e.key === 'ArrowDown' ? 1 : -1);
      if (hiIdx < 0) hiIdx = items.length - 1;
      if (hiIdx >= items.length) hiIdx = 0;
      items.forEach(function (el, i) { el.classList.toggle('hi', i === hiIdx); });
      items[hiIdx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var pick = (hiIdx >= 0 && items[hiIdx]) ? items[hiIdx] : items[0];
      if (pick) pick.click();
      else if (nameBox.value.trim()) openNewForm(nameBox.value.trim());
    } else if (e.key === 'Escape') { hideSug(); }
  });
  sug.addEventListener('mousedown', function (e) {
    var el = e.target.closest('.rs-sg');
    if (!el) return;
    e.preventDefault();
    if (el.dataset.new) { hideSug(); openNewForm(nameBox.value.trim()); return; }
    hideSug();
    nameBox.value = '';
    openClient(el.dataset.n);
  });

  /* ═══════════════════ 6. NAYA CLIENT FORM ═══════════════════ */

  var newOv = document.createElement('div');
  newOv.className = 'rs-ov';
  newOv.id = 'rsNewOv';
  newOv.innerHTML =
    '<div class="rs-box" id="rsNewBox">' +
      '<div class="rs-bh"><span>نیا کلائنٹ</span><button class="rs-x" id="rsNewX">✕</button></div>' +
      '<div class="rs-bb">' +
        '<div class="rs-fld"><label class="rs-lb">نام</label>' +
          '<input type="text" id="nfName" class="rs-inp" dir="rtl" placeholder="مثلاً: رانا اسلم"></div>' +
        '<div class="rs-fld"><label class="rs-lb">موبائل نمبر</label>' +
          '<input type="text" id="nfMob" class="rs-inp" dir="ltr" placeholder="0300-1234567"></div>' +
        '<div class="rs-2">' +
          '<div class="rs-fld"><label class="rs-lb">ریٹ / لیٹر</label>' +
            '<input type="text" id="nfRate" class="rs-inp" dir="ltr" placeholder="220"></div>' +
          '<div class="rs-fld"><label class="rs-lb">روزانہ لیٹر</label>' +
            '<input type="text" id="nfDaily" class="rs-inp" dir="ltr" placeholder="2"></div>' +
        '</div>' +
        '<div class="rs-fld"><label class="rs-lb">ڈلیوری</label>' +
          '<select id="nfDel" class="rs-inp" dir="rtl">' +
            '<option>صبح</option><option>شام</option><option>صبح و شام</option></select></div>' +
        '<div class="rs-hint">محفوظ کرتے ہی یہ سب بل میں خود بھر جائے گا — نمبر، ریٹ، ڈلیوری اور پورے مہینے کے دن۔</div>' +
      '</div>' +
      '<div class="rs-bf">' +
        '<button id="nfSave" class="rs-b rs-b-main">محفوظ کر کے بل بنائیں</button>' +
        '<button id="nfOnly" class="rs-b rs-b-ghost">صرف محفوظ</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(newOv);

  function openNewForm(name) {
    $('nfName').value = name || '';
    $('nfMob').value = ''; $('nfRate').value = ''; $('nfDaily').value = '';
    $('nfDel').value = 'صبح';
    newOv.classList.add('on');
    setTimeout(function () { ($('nfName').value ? $('nfMob') : $('nfName')).focus(); }, 80);
  }
  function closeNew() { newOv.classList.remove('on'); }
  $('rsNewX').addEventListener('click', closeNew);
  newOv.addEventListener('click', function (e) { if (e.target === newOv) closeNew(); });

  function readNewForm() {
    var n = $('nfName').value.trim();
    if (!n) { note('پہلے نام لکھیں', true); $('nfName').focus(); return null; }
    return {
      name: n,
      mobile: normMobile($('nfMob').value),
      rate: String($('nfRate').value || '').replace(/[^\d.]/g, ''),
      daily: String($('nfDaily').value || '').replace(/[^\d.]/g, ''),
      delivery: $('nfDel').value
    };
  }
  $('nfSave').addEventListener('click', function () {
    var p = readNewForm(); if (!p) return;
    saveProfile(p); closeNew(); nameBox.value = '';
    openClient(p.name);
  });
  $('nfOnly').addEventListener('click', function () {
    var p = readNewForm(); if (!p) return;
    saveProfile(p); closeNew(); buildList();
    note('محفوظ: ' + p.name);
  });
  $('rsNewBtn').addEventListener('click', function () { openNewForm(nameBox.value.trim()); });

  /* ═══════════════════ 7. WHATSAPP SE DATA ═══════════════════ */

  function normMobile(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.indexOf('0092') === 0) d = d.slice(4);
    else if (d.indexOf('92') === 0 && d.length >= 12) d = d.slice(2);
    if (d.length === 10 && d[0] === '3') d = '0' + d;
    if (d.length === 11 && d.indexOf('03') === 0) return d.slice(0, 4) + '-' + d.slice(4);
    return d;
  }

  function parseLine(line) {
    var t = String(line || '').trim();
    if (!t) return null;

    t = t.replace(/^\[[^\]]*\]\s*/, '');
    t = t.replace(/^\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4},?\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*[-–]\s*/, '');
    if (!t.trim()) return null;

    var rest = t;

    var mob = '';
    var mm = rest.match(/(?:\+?92|0)?\s?3\d{2}[\s\-.]?\d{7}\b/);
    if (mm) { mob = normMobile(mm[0]); rest = rest.replace(mm[0], ' '); }

    var rate = '';
    var rm = rest.match(/(?:ریٹ|rate|قیمت)\s*[:=]?\s*(\d{2,4})/i)
          || rest.match(/(\d{2,4})\s*(?:\/\s*)?(?:per\s*)?(?:ltr|ltrs|litre|liter|لیٹر|لٹر)\s*(?:ریٹ|rate)?/i)
          || rest.match(/rs\.?\s*(\d{2,4})/i);
    if (rm) { rate = rm[1]; rest = rest.replace(rm[0], ' '); }

    var daily = '';
    var dm = rest.match(/(\d+(?:\.\d+)?)\s*(?:ل|لیٹر|لٹر|کلو|kg|ltr|liter|litre|l)\b/i);
    if (dm) { daily = dm[1]; rest = rest.replace(dm[0], ' '); }

    var del = '';
    if (/صبح\s*(?:و|اور|\+|&)\s*شام|دونوں|both/i.test(rest)) del = 'صبح و شام';
    else if (/شام|evening|sham/i.test(rest)) del = 'شام';
    else if (/صبح|morning|subah/i.test(rest)) del = 'صبح';
    rest = rest.replace(/صبح\s*(?:و|اور|\+|&)\s*شام|دونوں|both|شام|evening|sham|صبح|morning|subah/gi, ' ');

    var name = rest
      .replace(/[:،,\-–|.\/\\()\[\]#*_]+/g, ' ')
      .replace(/\b(?:ph|mob|mobile|no|number|contact|cell|whatsapp|wa)\b/gi, ' ')
      .replace(/\d+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!name) return null;
    if (name.length > 40) name = name.slice(0, 40).trim();
    if (!mob && !rate && !daily && name.split(' ').length > 6) return null;

    return { name: name, mobile: mob, rate: rate, daily: daily, delivery: del || 'صبح' };
  }

  var waOv = document.createElement('div');
  waOv.className = 'rs-ov';
  waOv.id = 'rsWaOv';
  waOv.innerHTML =
    '<div class="rs-box" id="rsWaBox">' +
      '<div class="rs-bh"><span>واٹس ایپ سے کلائنٹ لائیں</span><button class="rs-x" id="rsWaX">✕</button></div>' +
      '<div class="rs-bb">' +
        '<div class="rs-hint">واٹس ایپ سے کاپی کر کے یہاں چپکا دیں — ہر کلائنٹ الگ لائن میں۔ نام، نمبر، ریٹ اور روزانہ لیٹر خود پہچان لیے جائیں گے۔<br>' +
          'مثال: <code>رانا اسلم 0300-1234567 2 لیٹر صبح ریٹ 220</code></div>' +
        '<textarea id="rsWaText" class="rs-ta" placeholder="یہاں پیسٹ کریں…"></textarea>' +
        '<div class="rs-2">' +
          '<button id="rsWaScan" class="rs-b rs-b-main">پڑھیں</button>' +
          '<button id="rsWaClear" class="rs-b rs-b-ghost">خالی کریں</button>' +
        '</div>' +
        '<div class="rs-prev" id="rsWaPrevWrap" style="display:none;">' +
          '<table id="rsWaTable">' +
            '<thead><tr><th style="width:26px;">✓</th><th>نام</th><th>موبائل</th><th>ریٹ</th><th>روزانہ</th><th>ڈلیوری</th></tr></thead>' +
            '<tbody id="rsWaBody"></tbody></table></div>' +
      '</div>' +
      '<div class="rs-bf">' +
        '<span class="rs-cnt" id="rsWaCnt"></span>' +
        '<button id="rsWaImport" class="rs-b rs-b-main">محفوظ کریں</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(waOv);

  $('rsWaBtn').addEventListener('click', function () {
    waOv.classList.add('on');
    setTimeout(function () { $('rsWaText').focus(); }, 80);
  });
  $('rsWaX').addEventListener('click', function () { waOv.classList.remove('on'); });
  waOv.addEventListener('click', function (e) { if (e.target === waOv) waOv.classList.remove('on'); });
  $('rsWaClear').addEventListener('click', function () {
    $('rsWaText').value = '';
    $('rsWaBody').innerHTML = '';
    $('rsWaPrevWrap').style.display = 'none';
    $('rsWaCnt').textContent = '';
    $('rsWaText').focus();
  });

  function scanWa() {
    var lines = ($('rsWaText').value || '').split(/\r?\n/);
    var seen = {}, rows = [];
    lines.forEach(function (l) {
      var p = parseLine(l);
      if (!p) return;
      var key = p.name.toLowerCase();
      if (seen[key]) {
        var old = rows[seen[key] - 1];
        old.mobile = old.mobile || p.mobile;
        old.rate = old.rate || p.rate;
        old.daily = old.daily || p.daily;
        return;
      }
      seen[key] = rows.length + 1;
      rows.push(p);
    });

    var body = $('rsWaBody');
    body.innerHTML = '';
    var existing = getProfiles();

    rows.forEach(function (r) {
      var dup = !!existing[r.name];
      var tr = document.createElement('tr');
      if (dup) tr.className = 'dup';
      tr.innerHTML =
        '<td><input type="checkbox" class="rsChk" checked></td>' +
        '<td class="nm" contenteditable="true">' + esc(r.name) + '</td>' +
        '<td class="n" contenteditable="true">' + esc(r.mobile) + '</td>' +
        '<td class="n" contenteditable="true">' + esc(r.rate) + '</td>' +
        '<td class="n" contenteditable="true">' + esc(r.daily) + '</td>' +
        '<td contenteditable="true">' + esc(r.delivery) + '</td>';
      body.appendChild(tr);
    });

    $('rsWaPrevWrap').style.display = rows.length ? 'block' : 'none';
    var dups = rows.filter(function (r) { return !!existing[r.name]; }).length;
    $('rsWaCnt').textContent = rows.length
      ? (rows.length + ' ملے' + (dups ? ' · ' + dups + ' پہلے سے موجود' : ''))
      : '';
    if (!rows.length) note('کچھ سمجھ نہیں آیا — ہر کلائنٹ الگ لائن میں لکھیں', true);
    else note(rows.length + ' کلائنٹ پہچان لیے — دیکھ کر محفوظ کریں');
  }
  $('rsWaScan').addEventListener('click', scanWa);

  $('rsWaImport').addEventListener('click', function () {
    var rows = qa('#rsWaBody tr');
    if (!rows.length) { note('پہلے «پڑھیں» دبائیں', true); return; }
    var n = 0;
    rows.forEach(function (tr) {
      if (!tr.querySelector('.rsChk').checked) return;
      var td = tr.querySelectorAll('td');
      var name = td[1].textContent.trim();
      if (!name) return;
      saveProfile({
        name: name,
        mobile: normMobile(td[2].textContent),
        rate: td[3].textContent.replace(/[^\d.]/g, ''),
        daily: td[4].textContent.replace(/[^\d.]/g, ''),
        delivery: td[5].textContent.trim() || 'صبح'
      });
      n++;
    });
    waOv.classList.remove('on');
    buildList();
    note(n + ' کلائنٹ محفوظ ہو گئے');
  });

  /* ═══════════════════ 8. MOJOODA BILL SE PROFILE YAAD RAKHO ═══════════════════ */

  var saveBtn = $('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      var n = activeName();
      if (!n) return;
      saveProfile({
        name: n,
        mobile: $('clientMobile').textContent.trim(),
        rate: $('milkRate').textContent.trim(),
        delivery: $('deliveryTime').textContent.trim()
      });
      setTimeout(buildList, 60);
    });
  }
  var delBtn = $('deleteBtn');
  if (delBtn) delBtn.addEventListener('click', function () { setTimeout(buildList, 120); });

  ['refreshCustomerList', 'loadCustomerMonth', 'clearBill'].forEach(function (fn) {
    if (typeof window[fn] !== 'function') return;
    var o = window[fn];
    window[fn] = function () {
      var r = o.apply(this, arguments);
      setTimeout(function () { buildList(); syncRailSize(); }, 0);
      return r;
    };
  });

  /* ═══════════════════ 9. ANIMATION KA KAAM ═══════════════════ */

  document.addEventListener('click', function (e) {
    var b = e.target.closest('#calculationBox .cp-btn, #calculationBox .cp-tab, #rsRail .rs-b, .rs-bf .rs-b');
    if (!b || reduced) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.1;
    var s = document.createElement('span');
    s.className = 'rs-rp';
    s.style.width = s.style.height = d + 'px';
    s.style.left = (e.clientX - r.left) + 'px';
    s.style.top = (e.clientY - r.top) + 'px';
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.style.overflow = 'hidden';
    b.appendChild(s);
    setTimeout(function () { s.remove(); }, 600);
  }, true);

  var lastVal = {};
  function splitVal(txt) {
    var m = String(txt || '').match(/^(\D*?)(-?[\d.,]+)(.*)$/);
    if (!m) return null;
    var v = parseFloat(m[2].replace(/,/g, ''));
    if (isNaN(v)) return null;
    return { pre: m[1], num: v, suf: m[3], comma: m[2].indexOf(',') !== -1, dec: (m[2].split('.')[1] || '').length };
  }
  function renderVal(p, v) {
    var s = p.dec > 0 ? v.toFixed(p.dec)
      : ((p.comma || Math.abs(v) >= 1000) ? Math.round(v).toLocaleString('en-US') : String(Math.round(v)));
    return p.pre + s + p.suf;
  }
  function rollTo(el, target) {
    var p = splitVal(target);
    if (!p) { el.textContent = target; return; }
    var from = (lastVal[el.id] === undefined) ? 0 : lastVal[el.id];
    lastVal[el.id] = p.num;
    if (reduced || from === p.num) { el.textContent = target; return; }
    var box = el.closest('.cp-readout');
    if (box) { box.classList.remove('rs-lit'); void box.offsetWidth; box.classList.add('rs-lit'); }
    el.classList.add('rs-roll'); el.classList.remove('rs-set');
    var t0 = performance.now(), dur = 760;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = renderVal(p, from + (p.num - from) * e);
      if (k < 1) requestAnimationFrame(step);
      else {
        el.textContent = target;
        el.classList.remove('rs-roll'); void el.offsetWidth; el.classList.add('rs-set');
      }
    })(performance.now());
  }
  if (typeof window.updateReadout === 'function') {
    var origRO = window.updateReadout;
    window.updateReadout = function () {
      origRO.apply(this, arguments);
      ['roKg', 'roAmt'].forEach(function (id) {
        var el = $(id); if (!el) return;
        var t = el.textContent.trim();
        if (!t || t === '—') { lastVal[id] = 0; return; }
        rollTo(el, t);
      });
    };
  }

  var cb = $('calculateBtn');
  if (cb) cb.addEventListener('click', function () {
    var self = this, lbl = self.textContent;
    self.classList.add('rs-busy');
    self.textContent = 'حساب ہو رہا ہے…';
    setTimeout(function () {
      self.classList.remove('rs-busy'); self.textContent = lbl; syncRailSize();
    }, 1260);
  });

  var panel = $('calculationBox');
  var tabOrder = ['client', 'entry', 'bill', 'settings'];
  var onTab = q('#calculationBox .cp-tab.is-on');
  var tabIdx = onTab ? tabOrder.indexOf(onTab.dataset.tab) : 0;
  qa('#calculationBox .cp-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = tabOrder.indexOf(this.dataset.tab);
      panel.classList.remove('rs-fwd', 'rs-back');
      void panel.offsetWidth;
      panel.classList.add(i > tabIdx ? 'rs-fwd' : 'rs-back');
      tabIdx = i;
    }, true);
  });
  document.addEventListener('keydown', function (e) {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) {
      var b = q('#calculationBox .cp-tab[data-tab="' + tabOrder[n - 1] + '"]');
      if (b) { e.preventDefault(); b.click(); }
    }
  });

  var stEl = $('saveStatus');
  if (stEl) new MutationObserver(function () {
    var t = stEl.textContent.trim();
    if (!t) return;
    stEl.classList.remove('rs-pop'); void stEl.offsetWidth; stEl.classList.add('rs-pop');
  }).observe(stEl, { childList: true, characterData: true, subtree: true });

  var le = $('lockError'), li = $('lockInput');
  if (le && li) new MutationObserver(function () {
    if (!le.textContent.trim() || reduced) return;
    li.classList.remove('rs-shake'); void li.offsetWidth; li.classList.add('rs-shake');
  }).observe(le, { childList: true, characterData: true, subtree: true });

  if (typeof window.buildDashboard === 'function') {
    var oD = window.buildDashboard;
    window.buildDashboard = function () {
      oD.apply(this, arguments);
      if (reduced) return;
      qa('#dashBody tr').forEach(function (tr, i) {
        if (i > 24) return;
        tr.style.animation = 'rsRow .3s ease both';
        tr.style.animationDelay = (i * 26) + 'ms';
      });
    };
  }

  /* EXPORT ke waqt saari animation band — PNG/PDF bilkul saaf */
  ['exportBtn', 'pdfBtn', 'whatsappBtn'].forEach(function (id) {
    var b = $(id);
    if (b) b.addEventListener('click', function () {
      styleEl.disabled = true;
      setTimeout(function () { styleEl.disabled = false; }, 2600);
    }, true);
  });

  /* ═══════════════════ 10. SHURUAAT ═══════════════════ */

  ['roKg', 'roAmt'].forEach(function (id) {
    var el = $(id); if (!el) return;
    var p = splitVal(el.textContent.trim());
    lastVal[id] = p ? p.num : 0;
  });
  buildList();
  setTimeout(syncRailSize, 600);

})();
