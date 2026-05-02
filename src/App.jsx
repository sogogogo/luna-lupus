import React, { useState, useMemo } from 'react';
import { Moon, Calendar, Users, CreditCard, ChevronRight, Check, Clock, Crown, Sparkles, AlertCircle, TrendingUp, User, Phone, Mail, Search, X, ArrowLeft, QrCode, Wallet, Video, Star, Megaphone, Shuffle, Eye, EyeOff, Send, Copy, RotateCcw, XCircle, CheckCircle2, AlertTriangle, Bell, Share2, MessageCircle, Link2, Zap } from 'lucide-react';

// ============ サンプルデータ ============
const SESSIONS_INIT = [
  { id: 1, date: '2026-05-08', day: '金', time: '19:30-22:30', type: '通常会', price: 2000, capacity: 12, gm: '夜霧GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/9824517632', isGuest: false, guestName: null, status: 'open' },
  { id: 2, date: '2026-05-09', day: '土', time: '14:00-17:00', type: '通常会', price: 2000, capacity: 12, gm: '月影GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/8273619482', isGuest: false, guestName: null, status: 'open' },
  { id: 3, date: '2026-05-09', day: '土', time: '19:00-22:30', type: '限定会', price: 3000, capacity: 10, gm: '黒猫GM', platform: 'Google Meet', meetingUrl: 'https://meet.google.com/xqp-fvtj-rnx', isGuest: false, guestName: null, status: 'open' },
  { id: 4, date: '2026-05-10', day: '日', time: '13:00-17:00', type: 'スーパーゲスト会', price: 4500, capacity: 14, gm: '夜霧GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/4729183746', isGuest: true, guestName: '狼月 シン', guestBio: '人狼歴12年、配信総視聴30万超のレジェンドプレイヤー', status: 'open' },
  { id: 5, date: '2026-05-15', day: '金', time: '19:30-22:30', type: '通常会', price: 2000, capacity: 12, gm: '月影GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/5938201746', isGuest: false, guestName: null, status: 'open' },
  { id: 6, date: '2026-05-16', day: '土', time: '19:00-23:00', type: 'ファン会', price: 5000, capacity: 10, gm: '黒猫GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/6184729301', isGuest: false, guestName: null, status: 'open' },
  { id: 7, date: '2026-05-23', day: '土', time: '20:00-23:30', type: 'ゲスト会', price: 4000, capacity: 12, gm: '黒猫GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/3847261059', isGuest: true, guestName: '霧島 アヤメ', guestBio: '人狼TLPT元メインキャスト、心理戦の名手', status: 'open' },
  { id: 8, date: '2026-04-28', day: '火', time: '19:30-22:30', type: '通常会', price: 2000, capacity: 12, gm: '夜霧GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/1029384756', isGuest: false, guestName: null, status: 'closed' },
  { id: 9, date: '2026-04-25', day: '土', time: '19:00-22:30', type: '限定会', price: 3000, capacity: 10, gm: '黒猫GM', platform: 'Google Meet', meetingUrl: 'https://meet.google.com/abc-defg-hij', isGuest: false, guestName: null, status: 'closed' },
  { id: 10, date: '2026-04-19', day: '日', time: '13:00-17:00', type: 'スーパーゲスト会', price: 4500, capacity: 14, gm: '夜霧GM', platform: 'Zoom', meetingUrl: 'https://zoom.us/j/9182736450', isGuest: true, guestName: '狼月 シン', guestBio: '人狼歴12年のレジェンドプレイヤー', status: 'closed' },
];

// 参加者名簿（セッションごと）
const PARTICIPANTS_INIT = [
  // 5/8 通常会
  { id: 'p1',  sessionId: 1, customerId: 1, name: '佐藤 健',     handle: '@takeru_jinrou', paid: true,  paidAt: '2026-05-01 21:14', cancelled: false, refunded: false, role: null },
  { id: 'p2',  sessionId: 1, customerId: 2, name: '鈴木 美咲',   handle: '@misaki_wolf',  paid: true,  paidAt: '2026-05-02 09:33', cancelled: false, refunded: false, role: null },
  { id: 'p3',  sessionId: 1, customerId: 3, name: '田中 翔太',   handle: '@shota_t',       paid: false, paidAt: null,                cancelled: false, refunded: false, role: null },
  { id: 'p4',  sessionId: 1, customerId: 4, name: '高橋 由美',   handle: '@yumi_taka',    paid: true,  paidAt: '2026-04-30 18:42', cancelled: false, refunded: false, role: null },
  { id: 'p5',  sessionId: 1, customerId: 5, name: '伊藤 大輔',   handle: '@daisuke_i',     paid: true,  paidAt: '2026-05-01 12:08', cancelled: false, refunded: false, role: null },
  { id: 'p6',  sessionId: 1, customerId: 6, name: '渡辺 さくら', handle: '@sakura_w',      paid: false, paidAt: null,                cancelled: false, refunded: false, role: null },
  { id: 'p7',  sessionId: 1, customerId: 7, name: '山本 龍之介', handle: '@ryu_yama',      paid: true,  paidAt: '2026-05-02 22:19', cancelled: false, refunded: false, role: null },
  { id: 'p8',  sessionId: 1, customerId: 8, name: '中村 葵',     handle: '@aoi_naka',      paid: true,  paidAt: '2026-05-01 07:55', cancelled: false, refunded: false, role: null },

  // 4/28 過去会・支払い実績
  { id: 'p20', sessionId: 8, customerId: 1, name: '佐藤 健',     handle: '@takeru_jinrou', paid: true,  paidAt: '2026-04-26 19:01', cancelled: false, refunded: false, role: '人狼' },
  { id: 'p21', sessionId: 8, customerId: 2, name: '鈴木 美咲',   handle: '@misaki_wolf',  paid: true,  paidAt: '2026-04-27 10:22', cancelled: false, refunded: false, role: '占い師' },
  { id: 'p22', sessionId: 8, customerId: 3, name: '田中 翔太',   handle: '@shota_t',       paid: false, paidAt: null,                cancelled: true,  refunded: true,  cancelledAt: '2026-04-27 22:00', refundedAt: '2026-04-28 09:00', role: null },
  { id: 'p23', sessionId: 8, customerId: 4, name: '高橋 由美',   handle: '@yumi_taka',    paid: true,  paidAt: '2026-04-25 15:12', cancelled: false, refunded: false, role: '村人' },
  { id: 'p24', sessionId: 8, customerId: 9, name: '小林 翼',     handle: '@tsubasa_k',     paid: true,  paidAt: '2026-04-26 20:33', cancelled: true,  refunded: false, cancelledAt: '2026-04-28 18:30', role: null }, // 当日キャンセル＝返金不可
  { id: 'p25', sessionId: 8, customerId: 5, name: '伊藤 大輔',   handle: '@daisuke_i',     paid: true,  paidAt: '2026-04-27 11:00', cancelled: false, refunded: false, role: '霊媒師' },
  { id: 'p26', sessionId: 8, customerId: 8, name: '中村 葵',     handle: '@aoi_naka',      paid: true,  paidAt: '2026-04-26 18:44', cancelled: false, refunded: false, role: '騎士' },
  { id: 'p27', sessionId: 8, customerId: 7, name: '山本 龍之介', handle: '@ryu_yama',      paid: true,  paidAt: '2026-04-27 09:18', cancelled: false, refunded: false, role: '狂人' },

  // 4/25 限定会
  { id: 'p30', sessionId: 9, customerId: 1, name: '佐藤 健',     handle: '@takeru_jinrou', paid: true,  paidAt: '2026-04-22 18:30', cancelled: false, refunded: false, role: '占い師' },
  { id: 'p31', sessionId: 9, customerId: 4, name: '高橋 由美',   handle: '@yumi_taka',    paid: true,  paidAt: '2026-04-22 20:11', cancelled: false, refunded: false, role: '人狼' },
  { id: 'p32', sessionId: 9, customerId: 2, name: '鈴木 美咲',   handle: '@misaki_wolf',  paid: true,  paidAt: '2026-04-23 12:00', cancelled: false, refunded: false, role: '村人' },
  { id: 'p33', sessionId: 9, customerId: 5, name: '伊藤 大輔',   handle: '@daisuke_i',     paid: true,  paidAt: '2026-04-24 09:45', cancelled: false, refunded: false, role: '騎士' },

  // 4/19 ゲスト会
  { id: 'p40', sessionId: 10, customerId: 1, name: '佐藤 健',    handle: '@takeru_jinrou', paid: true, paidAt: '2026-04-15 20:00', cancelled: false, refunded: false, role: '村人' },
  { id: 'p41', sessionId: 10, customerId: 4, name: '高橋 由美',  handle: '@yumi_taka',    paid: true, paidAt: '2026-04-15 21:30', cancelled: false, refunded: false, role: '占い師' },
  { id: 'p42', sessionId: 10, customerId: 2, name: '鈴木 美咲',  handle: '@misaki_wolf',  paid: true, paidAt: '2026-04-16 08:00', cancelled: false, refunded: false, role: '人狼' },

  // 5/9, 5/10, 5/15 など他の今後の会にも参加者を入れておく
  { id: 'p50', sessionId: 2, customerId: 1, name: '佐藤 健',     handle: '@takeru_jinrou', paid: true,  paidAt: '2026-05-01 21:15', cancelled: false, refunded: false, role: null },
  { id: 'p51', sessionId: 2, customerId: 4, name: '高橋 由美',   handle: '@yumi_taka',    paid: true,  paidAt: '2026-04-30 19:00', cancelled: false, refunded: false, role: null },
  { id: 'p52', sessionId: 4, customerId: 1, name: '佐藤 健',     handle: '@takeru_jinrou', paid: true,  paidAt: '2026-04-22 12:00', cancelled: false, refunded: false, role: null },
  { id: 'p53', sessionId: 4, customerId: 2, name: '鈴木 美咲',   handle: '@misaki_wolf',  paid: true,  paidAt: '2026-04-22 14:00', cancelled: false, refunded: false, role: null },
  { id: 'p54', sessionId: 4, customerId: 4, name: '高橋 由美',   handle: '@yumi_taka',    paid: true,  paidAt: '2026-04-22 18:00', cancelled: false, refunded: false, role: null },
];

const CUSTOMERS = [
  { id: 1, name: '佐藤 健', handle: '@takeru_jinrou', phone: '090-xxxx-1234', email: 'takeru@example.com', joined: '2024-03-15', total: 24, lastVisit: '2026-04-28', spent: 84000, tier: 'VIP', favoriteType: '通常会', notes: '初心者にも優しい。占い師経験豊富。', avatar: '佐' },
  { id: 2, name: '鈴木 美咲', handle: '@misaki_wolf', phone: '090-xxxx-5678', email: 'misaki@example.com', joined: '2024-08-02', total: 12, lastVisit: '2026-04-25', spent: 51000, tier: 'レギュラー', favoriteType: '限定会', notes: '占い師ロール大好き。木曜は来られない。', avatar: '鈴' },
  { id: 3, name: '田中 翔太', handle: '@shota_t', phone: '090-xxxx-9012', email: 'shota@example.com', joined: '2025-11-20', total: 5, lastVisit: '2026-04-20', spent: 17500, tier: '新規', favoriteType: '通常会', notes: '紹介経由。緊張しがち。', avatar: '田' },
  { id: 4, name: '高橋 由美', handle: '@yumi_taka', phone: '090-xxxx-3456', email: 'yumi@example.com', joined: '2024-01-08', total: 38, lastVisit: '2026-04-30', spent: 142500, tier: 'VIP', favoriteType: 'スーパーゲスト会', notes: '常連最古参。誕生日5/12。', avatar: '高' },
  { id: 5, name: '伊藤 大輔', handle: '@daisuke_i', phone: '090-xxxx-7890', email: 'daisuke@example.com', joined: '2024-06-12', total: 18, lastVisit: '2026-04-28', spent: 67500, tier: 'レギュラー', favoriteType: 'ファン会', notes: '霊媒師ロール得意。', avatar: '伊' },
  { id: 6, name: '渡辺 さくら', handle: '@sakura_w', phone: '090-xxxx-2233', email: 'sakura@example.com', joined: '2025-09-03', total: 7, lastVisit: '2026-04-15', spent: 24000, tier: '新規', favoriteType: '通常会', notes: '声優志望。', avatar: '渡' },
  { id: 7, name: '山本 龍之介', handle: '@ryu_yama', phone: '090-xxxx-4455', email: 'ryu@example.com', joined: '2024-11-18', total: 14, lastVisit: '2026-04-28', spent: 52500, tier: 'レギュラー', favoriteType: '限定会', notes: '狂人プレイが上手い。', avatar: '山' },
  { id: 8, name: '中村 葵', handle: '@aoi_naka', phone: '090-xxxx-6677', email: 'aoi@example.com', joined: '2025-02-22', total: 9, lastVisit: '2026-04-28', spent: 31500, tier: 'レギュラー', favoriteType: '通常会', notes: '騎士ロール好き。', avatar: '中' },
  { id: 9, name: '小林 翼', handle: '@tsubasa_k', phone: '090-xxxx-8899', email: 'tsubasa@example.com', joined: '2025-05-10', total: 6, lastVisit: '2026-04-15', spent: 21000, tier: '新規', favoriteType: 'ゲスト会', notes: '当日キャンセル歴あり、要注意。', avatar: '小' },
];

const ROLES_BY_PLAYERS = {
  8:  ['人狼', '人狼', '占い師', '霊媒師', '騎士', '村人', '村人', '狂人'],
  9:  ['人狼', '人狼', '占い師', '霊媒師', '騎士', '村人', '村人', '村人', '狂人'],
  10: ['人狼', '人狼', '占い師', '霊媒師', '騎士', '村人', '村人', '村人', '村人', '狂人'],
  11: ['人狼', '人狼', '占い師', '霊媒師', '騎士', '村人', '村人', '村人', '村人', '村人', '狂人'],
  12: ['人狼', '人狼', '人狼', '占い師', '霊媒師', '騎士', '村人', '村人', '村人', '村人', '村人', '狂人'],
  13: ['人狼', '人狼', '人狼', '占い師', '霊媒師', '騎士', '村人', '村人', '村人', '村人', '村人', '村人', '狂人'],
  14: ['人狼', '人狼', '人狼', '占い師', '霊媒師', '騎士', '共有者', '共有者', '村人', '村人', '村人', '村人', '村人', '狂人'],
};

const ROLE_STYLES = {
  '人狼':   { color: '#a85c5c', bg: 'rgba(168, 92, 92, 0.18)', team: '人狼陣営' },
  '占い師': { color: '#7da9cb', bg: 'rgba(125, 169, 203, 0.18)', team: '村人陣営' },
  '霊媒師': { color: '#9b87c4', bg: 'rgba(155, 135, 196, 0.18)', team: '村人陣営' },
  '騎士':   { color: '#c9a86a', bg: 'rgba(201, 168, 106, 0.18)', team: '村人陣営' },
  '共有者': { color: '#7da87d', bg: 'rgba(125, 168, 125, 0.18)', team: '村人陣営' },
  '村人':   { color: '#a8a89a', bg: 'rgba(168, 168, 154, 0.15)', team: '村人陣営' },
  '狂人':   { color: '#d97757', bg: 'rgba(217, 119, 87, 0.18)',  team: '人狼陣営' },
};

const TYPE_STYLES = {
  '通常会':           { color: '#c9a86a', bg: 'rgba(201, 168, 106, 0.12)', border: 'rgba(201, 168, 106, 0.4)', label: '通常' },
  '限定会':           { color: '#d97757', bg: 'rgba(217, 119, 87, 0.14)',  border: 'rgba(217, 119, 87, 0.45)',  label: '限定' },
  'ファン会':         { color: '#7da9cb', bg: 'rgba(125, 169, 203, 0.14)', border: 'rgba(125, 169, 203, 0.45)', label: 'ファン' },
  'ゲスト会':         { color: '#a85c8b', bg: 'rgba(168, 92, 139, 0.16)',  border: 'rgba(168, 92, 139, 0.5)',   label: 'ゲスト' },
  'スーパーゲスト会': { color: '#e8d18b', bg: 'rgba(232, 209, 139, 0.16)', border: 'rgba(232, 209, 139, 0.55)', label: 'S・ゲスト' },
};

const fmtYen = (n) => '¥' + n.toLocaleString('ja-JP');

// ============ ルートアプリ ============
export default function App() {
  const [view, setView] = useState('customer');
  const [sessions, setSessions] = useState(SESSIONS_INIT);
  const [participants, setParticipants] = useState(PARTICIPANTS_INIT);

  const updateParticipant = (id, patch) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a1820 0%, #0d0c12 50%, #050409 100%)',
      fontFamily: '"Shippori Mincho", "游明朝", "Yu Mincho", serif',
      color: '#e8e3d8',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Cinzel:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .num { font-family: 'DM Mono', monospace; letter-spacing: -0.02em; }
        .display { font-family: 'Cinzel', serif; letter-spacing: 0.08em; }
        .grain { position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fadeup { animation: fadeUp 0.5s ease-out backwards; }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(201,168,106,0.15); } 50% { box-shadow: 0 0 30px rgba(201,168,106,0.3); } }
        .pulse-glow { animation: glow 3s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(201,168,106,0.15), transparent); background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }
      `}</style>
      <div className="grain" />

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        background: 'rgba(13, 12, 18, 0.78)',
        borderBottom: '1px solid rgba(201, 168, 106, 0.15)',
        padding: '18px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c9a86a 0%, #8a6d3a 60%, #4a3a1f 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201, 168, 106, 0.4), inset 0 0 8px rgba(0,0,0,0.3)',
          }}>
            <Moon size={18} color="#1a1410" strokeWidth={2.2} />
          </div>
          <div>
            <div className="display" style={{ fontSize: 18, color: '#c9a86a', fontWeight: 700 }}>
              LUNA · LUPUS
            </div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(232, 227, 216, 0.5)', marginTop: 2 }}>
              月夜の人狼 — オンライン人狼ハウス
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(201, 168, 106, 0.2)',
          borderRadius: 999, padding: 3,
        }}>
          {['customer', 'admin'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em',
              background: view === v ? 'linear-gradient(135deg, #c9a86a, #a8895a)' : 'transparent',
              color: view === v ? '#1a1410' : 'rgba(232, 227, 216, 0.6)',
              fontWeight: view === v ? 700 : 500, transition: 'all 0.3s',
            }}>
              {v === 'customer' ? '参加者' : '管理者'}
            </button>
          ))}
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 2 }}>
        {view === 'customer'
          ? <CustomerView sessions={sessions} participants={participants} updateParticipant={updateParticipant} />
          : <AdminView sessions={sessions} participants={participants} setParticipants={setParticipants} />
        }
      </main>
    </div>
  );
}

// =============================================================
// 参加者側
// =============================================================
function CustomerView({ sessions, participants, updateParticipant }) {
  const [step, setStep] = useState('list');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);

  const ME_ID = 1; // 視点：佐藤 健
  const upcoming = sessions.filter(s => s.status === 'open');
  const guestSessions = upcoming.filter(s => s.isGuest);
  const filtered = useMemo(() => filter === 'all' ? upcoming : upcoming.filter(s => s.type === filter), [filter, upcoming]);

  // 自分の参加情報を取得
  const myBookings = participants.filter(p => p.customerId === ME_ID);
  const bookedSessionIds = new Set(myBookings.filter(b => !b.cancelled).map(b => b.sessionId));

  const getMyParticipant = (sessionId) => participants.find(p => p.sessionId === sessionId && p.customerId === ME_ID);

  if (step === 'mypage') return <MyPage onBack={() => setStep('list')} sessions={sessions} participants={participants} myId={ME_ID} updateParticipant={updateParticipant} />;
  if (step === 'confirm' && selected) return <ConfirmBooking session={selected} onBack={() => setStep('detail')} onDone={() => setStep('done')} />;
  if (step === 'done' && selected) return <BookingDone session={selected} onHome={() => { setStep('list'); setSelected(null); }} />;
  if (step === 'detail' && selected) return <SessionDetail session={selected} onBack={() => setStep('list')} onBook={() => setStep('confirm')} myParticipant={getMyParticipant(selected.id)} />;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px 80px' }}>
      {/* ヒーロー */}
      <section className="fadeup" style={{
        position: 'relative',
        padding: '48px 44px',
        marginBottom: 36,
        background: 'linear-gradient(135deg, rgba(40, 25, 30, 0.6) 0%, rgba(20, 15, 25, 0.4) 100%)',
        border: '1px solid rgba(201, 168, 106, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 240, height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,106,0.18) 0%, transparent 70%)',
        }} />
        <div style={{ fontSize: 11, letterSpacing: '0.4em', color: '#c9a86a', marginBottom: 16, textTransform: 'uppercase' }}>
          月の章 · 五月
        </div>
        <h1 className="display" style={{
          fontSize: 48, lineHeight: 1.15, margin: '0 0 16px', fontWeight: 700,
          background: 'linear-gradient(180deg, #f4ead0 0%, #c9a86a 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          今宵、君は<br />誰を疑う。
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(232, 227, 216, 0.7)', maxWidth: 520, lineHeight: 1.9, margin: 0 }}>
          会の予約から詳細の確認、お支払いまで。<br />
          このページひとつで、すべて完結します。
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <button onClick={() => setStep('mypage')} style={{
            padding: '12px 22px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(201, 168, 106, 0.3)',
            color: '#e8e3d8', borderRadius: 2, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.2em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <User size={14} /> マイページ
          </button>
          <button onClick={() => setAnnouncementsOpen(true)} style={{
            padding: '12px 22px', background: 'rgba(217, 119, 87, 0.1)',
            border: '1px solid rgba(217, 119, 87, 0.35)',
            color: '#d97757', borderRadius: 2, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.2em',
            display: 'flex', alignItems: 'center', gap: 8, position: 'relative',
          }}>
            <Bell size={14} /> お知らせ
            <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#d97757' }} />
          </button>
        </div>
      </section>

      {/* 今月のゲスト */}
      {guestSessions.length > 0 && (
        <section className="fadeup" style={{
          marginBottom: 40,
          padding: '32px 32px',
          background: 'linear-gradient(135deg, rgba(168, 92, 139, 0.12) 0%, rgba(40, 20, 35, 0.4) 100%)',
          border: '1px solid rgba(168, 92, 139, 0.35)',
          borderRadius: 4, position: 'relative', overflow: 'hidden',
        }}>
          <div className="shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, position: 'relative' }}>
            <Star size={14} color="#a85c8b" fill="#a85c8b" />
            <span style={{ fontSize: 10, letterSpacing: '0.45em', color: '#a85c8b' }}>SPECIAL · 今月のゲスト</span>
          </div>
          <h2 className="display" style={{ fontSize: 22, color: '#e8e3d8', margin: '0 0 24px', fontWeight: 600, letterSpacing: '0.15em', position: 'relative' }}>
            人狼界の名手と、今夜だけの一卓を。
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16, position: 'relative' }}>
            {guestSessions.map(s => (
              <article key={s.id} onClick={() => { setSelected(s); setStep('detail'); }} style={{
                cursor: 'pointer', padding: 22,
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(168, 92, 139, 0.3)',
                borderRadius: 3, transition: 'all 0.3s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#a85c8b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(168, 92, 139, 0.3)'; }}
              >
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #a85c8b, #5c2e4a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: 'serif',
                    boxShadow: '0 0 20px rgba(168, 92, 139, 0.4)',
                  }}>
                    {s.guestName?.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#a85c8b', marginBottom: 4 }}>GUEST</div>
                    <div style={{ fontSize: 17, color: '#e8e3d8', fontWeight: 500, marginBottom: 4 }}>{s.guestName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)', lineHeight: 1.5 }}>{s.guestBio}</div>
                  </div>
                </div>
                <div style={{ paddingTop: 14, borderTop: '1px solid rgba(168, 92, 139, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="num" style={{ fontSize: 14, color: '#e8e3d8' }}>{s.date.slice(5)} ({s.day})</div>
                    <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)' }}>{s.time}</div>
                  </div>
                  <div className="num" style={{ fontSize: 18, color: '#a85c8b', fontWeight: 600 }}>{fmtYen(s.price)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* フィルタ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h2 className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.85)', margin: 0, fontWeight: 500 }}>
          ── 開催予定の会
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', '通常会', '限定会', 'ファン会', 'ゲスト会', 'スーパーゲスト会'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 999,
              background: filter === f ? 'rgba(201, 168, 106, 0.15)' : 'transparent',
              border: `1px solid ${filter === f ? 'rgba(201, 168, 106, 0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: filter === f ? '#c9a86a' : 'rgba(232,227,216,0.5)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em',
            }}>{f === 'all' ? 'すべて' : f}</button>
          ))}
        </div>
      </div>

      {/* セッション一覧 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((s, i) => {
          const ts = TYPE_STYLES[s.type];
          const sessionParticipants = participants.filter(p => p.sessionId === s.id && !p.cancelled);
          const remaining = s.capacity - sessionParticipants.length;
          const isFull = remaining === 0;
          const isLow = remaining <= 3 && !isFull;
          const isBooked = bookedSessionIds.has(s.id);

          return (
            <article key={s.id} className="fadeup" onClick={() => { setSelected(s); setStep('detail'); }}
              style={{
                animationDelay: `${i * 60}ms`,
                position: 'relative', padding: '24px 22px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)',
                border: `1px solid ${isBooked ? '#c9a86a' : ts.border}`,
                borderRadius: 3, cursor: 'pointer',
                transition: 'all 0.3s', overflow: 'hidden',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = ts.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = isBooked ? '#c9a86a' : ts.border; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ts.color }} />

              {isBooked && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  padding: '4px 10px', fontSize: 9, letterSpacing: '0.2em',
                  background: 'rgba(201, 168, 106, 0.2)', color: '#c9a86a',
                  borderRadius: 2, border: '1px solid rgba(201, 168, 106, 0.4)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <CheckCircle2 size={10} /> 予約済
                </div>
              )}

              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, marginTop: isBooked ? 16 : 0 }}>
                <div>
                  <div className="num" style={{ fontSize: 28, color: '#e8e3d8', fontWeight: 500, lineHeight: 1 }}>
                    {s.date.slice(8, 10)}
                    <span style={{ fontSize: 13, color: 'rgba(232,227,216,0.5)', marginLeft: 6 }}>
                      / {s.date.slice(5, 7)}月（{s.day}）
                    </span>
                  </div>
                  <div className="num" style={{ fontSize: 12, color: 'rgba(232,227,216,0.55)', marginTop: 4 }}>{s.time}</div>
                </div>
                {!isBooked && (
                  <span style={{
                    padding: '4px 10px', fontSize: 10, letterSpacing: '0.2em',
                    background: ts.bg, color: ts.color, borderRadius: 2,
                    border: `1px solid ${ts.border}`,
                  }}>{s.type}</span>
                )}
              </header>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
                {s.isGuest && (
                  <div style={{ fontSize: 11, color: '#a85c8b', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, fontWeight: 600 }}>
                    <Star size={10} fill="#a85c8b" /> {s.guestName}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.45)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Crown size={10} /> {s.gm}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.45)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Video size={10} /> {s.platform}
                </div>
              </div>

              <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div className="num" style={{ fontSize: 22, color: '#c9a86a', fontWeight: 500 }}>{fmtYen(s.price)}</div>
                  <div style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)', letterSpacing: '0.1em' }}>PayPay 決済</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {isFull ? (
                    <span style={{ fontSize: 11, color: '#a85c5c', letterSpacing: '0.15em' }}>満員</span>
                  ) : (
                    <>
                      <div className="num" style={{ fontSize: 14, color: isLow ? '#d97757' : '#e8e3d8' }}>
                        残 {remaining}<span style={{ color: 'rgba(232,227,216,0.4)', fontSize: 11 }}>/{s.capacity}</span>
                      </div>
                      {isLow && <div style={{ fontSize: 9, color: '#d97757', letterSpacing: '0.1em', marginTop: 2 }}>残りわずか</div>}
                    </>
                  )}
                </div>
              </footer>
            </article>
          );
        })}
      </div>

      {announcementsOpen && <AnnouncementModal onClose={() => setAnnouncementsOpen(false)} />}
    </div>
  );
}

// ============ お知らせモーダル（参加者側）============
function AnnouncementModal({ onClose }) {
  const items = [
    { type: 'new', date: '5月2日', title: '5/23 ゲスト会「霧島アヤメ」さん追加！', body: '人狼TLPT元キャストの霧島アヤメさんをお迎えする会を急遽追加しました。残席わずか、お早めに。' },
    { type: 'remind', date: '5月1日', title: '5/8 通常会 開催3日前のリマインド', body: 'Zoomリンクは当日18時に再送します。お役職カードの確認はマイページから。' },
    { type: 'info', date: '4月30日', title: 'GW期間の予約受付について', body: '5/3-5/6 はお休みです。5/8 から通常通り開催します。' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '60px 24px',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fadeup" style={{
        maxWidth: 540, width: '100%', maxHeight: '80vh', overflow: 'auto',
        background: 'linear-gradient(180deg, #1a1820, #0d0c12)',
        border: '1px solid rgba(201, 168, 106, 0.3)', borderRadius: 4,
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(201, 168, 106, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: '#c9a86a' }}>── お知らせ</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#e8e3d8', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '8px 0' }}>
          {items.map((it, i) => {
            const tagColor = it.type === 'new' ? '#a85c8b' : it.type === 'remind' ? '#d97757' : '#7da9cb';
            const tagLabel = it.type === 'new' ? '新着' : it.type === 'remind' ? 'リマインド' : 'お知らせ';
            return (
              <div key={i} style={{ padding: '18px 28px', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 8px', fontSize: 9, letterSpacing: '0.2em', borderRadius: 2,
                    background: `${tagColor}22`, color: tagColor, border: `1px solid ${tagColor}55`,
                  }}>{tagLabel}</span>
                  <span className="num" style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)' }}>{it.date}</span>
                </div>
                <div style={{ fontSize: 14, color: '#e8e3d8', marginBottom: 6, fontWeight: 500 }}>{it.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,227,216,0.65)', lineHeight: 1.7 }}>{it.body}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ セッション詳細（参加者側）============
function SessionDetail({ session, onBack, onBook, myParticipant }) {
  const ts = TYPE_STYLES[session.type];
  const isAlreadyBooked = myParticipant && !myParticipant.cancelled;
  const role = myParticipant?.role;
  const isPaid = myParticipant?.paid;

  return (
    <div className="fadeup" style={{ maxWidth: 760, margin: '0 auto', padding: '40px 32px 80px' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: 'rgba(232,227,216,0.5)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: 0,
      }}><ArrowLeft size={14} /> 一覧へ</button>

      <div style={{
        position: 'relative', padding: '40px 36px',
        background: 'linear-gradient(135deg, rgba(40, 25, 30, 0.5) 0%, rgba(20, 15, 25, 0.3) 100%)',
        border: `1px solid ${ts.border}`, borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${ts.bg} 0%, transparent 70%)`,
        }} />

        <span style={{
          display: 'inline-block', padding: '5px 12px', fontSize: 10, letterSpacing: '0.25em',
          background: ts.bg, color: ts.color, borderRadius: 2, border: `1px solid ${ts.border}`,
          marginBottom: 18,
        }}>
          {session.type}
        </span>

        <h2 className="display" style={{
          fontSize: 36, margin: '0 0 8px', fontWeight: 700, lineHeight: 1.2,
          background: 'linear-gradient(180deg, #f4ead0 0%, #c9a86a 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {session.date} <span className="num" style={{ fontSize: 24 }}>({session.day})</span>
        </h2>
        <div className="num" style={{ fontSize: 16, color: 'rgba(232,227,216,0.7)', marginBottom: 32 }}>
          {session.time}
        </div>

        {/* ゲスト紹介 */}
        {session.isGuest && (
          <div style={{
            padding: '20px 22px', marginBottom: 28,
            background: 'linear-gradient(135deg, rgba(168, 92, 139, 0.15), rgba(168, 92, 139, 0.04))',
            border: '1px solid rgba(168, 92, 139, 0.4)', borderRadius: 3,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Star size={12} color="#a85c8b" fill="#a85c8b" />
              <span style={{ fontSize: 9, letterSpacing: '0.4em', color: '#a85c8b' }}>SPECIAL GUEST</span>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #a85c8b, #5c2e4a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 20, fontWeight: 700,
              }}>{session.guestName?.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 17, color: '#e8e3d8', fontWeight: 500 }}>{session.guestName}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,227,216,0.65)', marginTop: 2 }}>{session.guestBio}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          <Detail icon={<Crown size={14} />} label="GM" value={session.gm} />
          <Detail icon={<Video size={14} />} label="プラットフォーム" value={session.platform} />
          <Detail icon={<Users size={14} />} label="定員" value={`${session.capacity}名`} />
          <Detail icon={<CreditCard size={14} />} label="参加費" value={fmtYen(session.price)} />
        </div>

        {/* 予約済の場合の情報 */}
        {isAlreadyBooked && (
          <>
            {/* Zoomリンク */}
            <div style={{
              padding: '16px 18px', marginBottom: 16,
              background: 'rgba(125, 169, 203, 0.08)',
              border: '1px solid rgba(125, 169, 203, 0.3)', borderRadius: 3,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Video size={14} color="#7da9cb" />
                <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#7da9cb' }}>{session.platform} ミーティングリンク</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a href={session.meetingUrl} target="_blank" rel="noreferrer" style={{
                  flex: 1, fontSize: 12, color: '#e8e3d8', fontFamily: "'DM Mono', monospace",
                  padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 2,
                  textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>{session.meetingUrl}</a>
                <button onClick={() => navigator.clipboard?.writeText(session.meetingUrl)} style={{
                  padding: '8px 10px', background: 'rgba(125, 169, 203, 0.15)',
                  border: '1px solid rgba(125, 169, 203, 0.3)', color: '#7da9cb',
                  borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
                }}><Copy size={12} /></button>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)', marginTop: 8, letterSpacing: '0.1em' }}>
                ※ 開始30分前から入室可能です
              </div>
            </div>

            {/* 役職カード */}
            <RoleCard role={role} sessionDate={session.date} />

            {/* 支払いステータス */}
            <div style={{
              padding: '14px 18px', marginBottom: 12, borderRadius: 3,
              background: isPaid ? 'rgba(125, 168, 125, 0.08)' : 'rgba(217, 119, 87, 0.08)',
              border: `1px solid ${isPaid ? 'rgba(125, 168, 125, 0.3)' : 'rgba(217, 119, 87, 0.3)'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isPaid ? <CheckCircle2 size={16} color="#7da87d" /> : <AlertCircle size={16} color="#d97757" />}
                <div>
                  <div style={{ fontSize: 12, color: isPaid ? '#7da87d' : '#d97757', fontWeight: 600 }}>
                    {isPaid ? '支払い済み' : '未払い'}
                  </div>
                  {isPaid && myParticipant.paidAt && (
                    <div className="num" style={{ fontSize: 10, color: 'rgba(232,227,216,0.5)' }}>{myParticipant.paidAt}</div>
                  )}
                </div>
              </div>
              {!isPaid && (
                <button onClick={onBook} style={{
                  padding: '8px 14px', background: '#d97757', color: '#fff',
                  border: 'none', borderRadius: 2, fontSize: 11, letterSpacing: '0.2em',
                  fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                }}>支払う</button>
              )}
            </div>

            {/* キャンセル */}
            <CancelSection session={session} myParticipant={myParticipant} />
          </>
        )}

        {/* 予約していない場合の説明＋ボタン */}
        {!isAlreadyBooked && (
          <>
            <div style={{
              padding: 16, background: 'rgba(0,0,0,0.25)', borderRadius: 2,
              fontSize: 12, color: 'rgba(232,227,216,0.7)', lineHeight: 1.8, marginBottom: 20,
              borderLeft: `2px solid ${ts.color}`,
            }}>
              長考型のシナリオを中心に、参加者全員で深く楽しむ会です。<br />
              初心者の方には会前にルール説明の時間を設けます。
            </div>

            {/* キャンセルポリシー */}
            <div style={{
              padding: '12px 16px', marginBottom: 24, borderRadius: 2,
              background: 'rgba(217, 119, 87, 0.06)', border: '1px solid rgba(217, 119, 87, 0.2)',
              fontSize: 11, color: 'rgba(232,227,216,0.7)', lineHeight: 1.7,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97757', marginBottom: 4, letterSpacing: '0.15em' }}>
                <AlertTriangle size={11} /> CANCEL POLICY
              </div>
              前日23:59まで：全額返金 / 当日キャンセル：返金不可
            </div>

            <button onClick={onBook} className="pulse-glow" style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, #c9a86a 0%, #a8895a 100%)',
              color: '#1a1410', border: 'none', borderRadius: 2,
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.3em',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              この会に参加する <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============ 役職カード ============
function RoleCard({ role, sessionDate }) {
  const [revealed, setRevealed] = useState(false);

  if (!role) {
    return (
      <div style={{
        padding: '18px 18px', marginBottom: 16, borderRadius: 3,
        background: 'rgba(255,255,255,0.025)', border: '1px dashed rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Sparkles size={14} color="rgba(232,227,216,0.4)" />
        <span style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)' }}>役職は会の開始直前にGMが配布します</span>
      </div>
    );
  }

  const rs = ROLE_STYLES[role];

  return (
    <div style={{
      padding: '20px 22px', marginBottom: 16, borderRadius: 3,
      background: revealed
        ? `linear-gradient(135deg, ${rs.bg}, rgba(0,0,0,0.5))`
        : 'linear-gradient(135deg, rgba(40,30,40,0.6), rgba(15,12,18,0.8))',
      border: `1px solid ${revealed ? rs.color : 'rgba(201, 168, 106, 0.3)'}`,
      position: 'relative', overflow: 'hidden', transition: 'all 0.5s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: revealed ? 14 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="display" style={{ fontSize: 10, letterSpacing: '0.4em', color: revealed ? rs.color : '#c9a86a' }}>
            ROLE CARD
          </div>
          <span className="num" style={{ fontSize: 9, color: 'rgba(232,227,216,0.4)' }}>· {sessionDate}</span>
        </div>
        <button onClick={() => setRevealed(!revealed)} style={{
          padding: '6px 12px', background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2,
          color: 'rgba(232,227,216,0.7)', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.2em',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {revealed ? <><EyeOff size={11} /> 隠す</> : <><Eye size={11} /> 開く</>}
        </button>
      </div>

      {revealed ? (
        <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
          <div className="display" style={{ fontSize: 36, color: rs.color, fontWeight: 700, marginBottom: 4 }}>
            {role}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.5)' }}>
            {rs.team}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '8px 0 0', color: 'rgba(232,227,216,0.4)', fontSize: 12, letterSpacing: '0.2em' }}>
          ── あなたの役職が割り当てられました ──
        </div>
      )}
    </div>
  );
}

// ============ キャンセル処理 ============
function CancelSection({ session, myParticipant }) {
  const [confirming, setConfirming] = useState(false);

  // 当日かどうか判定（簡易：日付文字列比較）
  const isToday = session.date === '2026-05-02'; // デモ用：今日が5/2と仮定
  const refundable = !isToday;

  if (myParticipant.cancelled) {
    return (
      <div style={{
        padding: '14px 18px', borderRadius: 3,
        background: 'rgba(168, 92, 92, 0.08)', border: '1px solid rgba(168, 92, 92, 0.3)',
      }}>
        <div style={{ fontSize: 12, color: '#a85c5c', display: 'flex', alignItems: 'center', gap: 8 }}>
          <XCircle size={14} /> キャンセル済み
        </div>
        <div style={{ fontSize: 10, color: 'rgba(232,227,216,0.5)', marginTop: 4 }}>
          {myParticipant.refunded ? '返金処理済み' : '返金処理中'}
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div style={{
        padding: 18, borderRadius: 3,
        background: 'rgba(168, 92, 92, 0.08)', border: '1px solid rgba(168, 92, 92, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <AlertTriangle size={14} color="#a85c5c" />
          <span style={{ fontSize: 12, color: '#a85c5c', letterSpacing: '0.15em' }}>キャンセルしますか？</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.7)', lineHeight: 1.7, marginBottom: 14 }}>
          {refundable
            ? '前日までのキャンセルのため、参加費は全額返金されます。'
            : '当日キャンセルのため、参加費の返金はできません。'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setConfirming(false)} style={{
            flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', color: '#e8e3d8',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.15em',
          }}>戻る</button>
          <button onClick={() => alert('キャンセルを受け付けました（デモ）')} style={{
            flex: 1, padding: '10px', background: '#a85c5c',
            border: 'none', color: '#fff',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.15em', fontWeight: 600,
          }}>キャンセル確定</button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} style={{
      width: '100%', padding: '12px',
      background: 'transparent', border: '1px solid rgba(168, 92, 92, 0.3)',
      color: '#a85c5c', borderRadius: 2, cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.2em',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <XCircle size={12} /> 参加をキャンセルする
    </button>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'rgba(232,227,216,0.45)', letterSpacing: '0.2em', marginBottom: 6 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 14, color: '#e8e3d8' }}>{value}</div>
    </div>
  );
}

// ============ 予約確認 / PayPay ============
function ConfirmBooking({ session, onBack, onDone }) {
  const [step, setStep] = useState('form');
  const [name, setName] = useState('佐藤 健');
  const [handle, setHandle] = useState('@takeru_jinrou');
  const [note, setNote] = useState('');
  const ts = TYPE_STYLES[session.type];

  if (step === 'pay') {
    return (
      <div className="fadeup" style={{ maxWidth: 480, margin: '0 auto', padding: '40px 32px 80px' }}>
        <h2 className="display" style={{ fontSize: 22, color: '#c9a86a', letterSpacing: '0.2em', textAlign: 'center', marginBottom: 8 }}>PAYMENT</h2>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(232,227,216,0.5)', letterSpacing: '0.2em', marginBottom: 36 }}>
          PayPay で支払いを完了してください
        </p>
        <div style={{
          background: '#fff', padding: 32, borderRadius: 4, textAlign: 'center',
          border: '1px solid rgba(201, 168, 106, 0.3)',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#ff0033', color: '#fff', borderRadius: 4, marginBottom: 24, fontSize: 13, fontWeight: 700 }}>
            <Wallet size={14} /> PayPay
          </div>
          <div style={{
            width: 200, height: 200, margin: '0 auto', background: '#000', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <QrCode size={160} color="#fff" strokeWidth={1} />
          </div>
          <div className="num" style={{ fontSize: 32, color: '#000', marginTop: 24, fontWeight: 600 }}>{fmtYen(session.price)}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>ルナ・ルプス {session.date} 参加費</div>
        </div>
        <button onClick={onDone} style={{
          width: '100%', marginTop: 24, padding: '14px',
          background: 'linear-gradient(135deg, #c9a86a 0%, #a8895a 100%)',
          color: '#1a1410', border: 'none', borderRadius: 2,
          fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.25em', cursor: 'pointer',
        }}>支払い完了（デモ）</button>
        <button onClick={() => setStep('form')} style={{
          width: '100%', marginTop: 8, padding: '12px',
          background: 'transparent', color: 'rgba(232,227,216,0.5)', border: 'none',
          fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer',
        }}>戻る</button>
      </div>
    );
  }

  return (
    <div className="fadeup" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 32px 80px' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: 'rgba(232,227,216,0.5)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: 0,
      }}><ArrowLeft size={14} /> 詳細へ</button>

      <h2 className="display" style={{ fontSize: 28, color: '#c9a86a', letterSpacing: '0.15em', marginBottom: 8 }}>予約内容の確認</h2>

      <div style={{
        padding: 20, marginTop: 24, marginBottom: 28,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${ts.border}`, borderRadius: 3,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div className="num" style={{ fontSize: 18, color: '#e8e3d8' }}>{session.date} ({session.day})</div>
            <div className="num" style={{ fontSize: 12, color: 'rgba(232,227,216,0.5)' }}>{session.time}</div>
          </div>
          <span style={{ padding: '3px 10px', fontSize: 10, letterSpacing: '0.2em', background: ts.bg, color: ts.color, borderRadius: 2, border: `1px solid ${ts.border}` }}>{session.type}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(232,227,216,0.6)' }}>{session.platform} · {session.gm}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)', letterSpacing: '0.2em' }}>参加費</span>
          <span className="num" style={{ fontSize: 22, color: '#c9a86a' }}>{fmtYen(session.price)}</span>
        </div>
      </div>

      <Field label="お名前"><input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Field>
      <Field label="X / Twitter ID"><input value={handle} onChange={(e) => setHandle(e.target.value)} style={inputStyle} /></Field>
      <Field label="伝言（任意）"><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="例：初参加です。よろしくお願いします。" /></Field>

      <button onClick={() => setStep('pay')} style={{
        width: '100%', marginTop: 12, padding: '16px',
        background: 'linear-gradient(135deg, #c9a86a 0%, #a8895a 100%)',
        color: '#1a1410', border: 'none', borderRadius: 2,
        fontFamily: 'inherit', fontWeight: 700, fontSize: 13, letterSpacing: '0.3em',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>PayPayで支払いに進む <ChevronRight size={16} /></button>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(201, 168, 106, 0.2)',
  borderRadius: 2, color: '#e8e3d8',
  fontFamily: 'inherit', fontSize: 13, outline: 'none',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(232,227,216,0.5)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function BookingDone({ session, onHome }) {
  return (
    <div className="fadeup" style={{ maxWidth: 520, margin: '0 auto', padding: '60px 32px 80px', textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, margin: '0 auto 28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(201,168,106,0.25) 0%, transparent 70%)',
        border: '1px solid rgba(201, 168, 106, 0.4)',
      }}>
        <Check size={32} color="#c9a86a" strokeWidth={2.5} />
      </div>
      <h2 className="display" style={{ fontSize: 26, color: '#c9a86a', letterSpacing: '0.2em', marginBottom: 12 }}>BOOKED</h2>
      <p style={{ fontSize: 13, color: 'rgba(232,227,216,0.7)', lineHeight: 1.9, marginBottom: 32 }}>
        {session.date}（{session.day}）{session.time}<br />
        {session.type} の予約が確定しました。<br />
        <span style={{ color: 'rgba(232,227,216,0.45)', fontSize: 11 }}>{session.platform} のリンクは詳細画面から確認できます。</span>
      </p>
      <button onClick={onHome} style={{
        padding: '12px 28px', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(201, 168, 106, 0.3)',
        color: '#e8e3d8', borderRadius: 2, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.25em',
      }}>トップへ戻る</button>
    </div>
  );
}

// ============ マイページ ============
function MyPage({ onBack, sessions, participants, myId }) {
  const me = CUSTOMERS.find(c => c.id === myId);
  const myUpcoming = participants.filter(p => p.customerId === myId && !p.cancelled).map(p => ({ ...p, session: sessions.find(s => s.id === p.sessionId) })).filter(x => x.session?.status === 'open');
  const myHistory = participants.filter(p => p.customerId === myId).map(p => ({ ...p, session: sessions.find(s => s.id === p.sessionId) })).filter(x => x.session?.status === 'closed');

  return (
    <div className="fadeup" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 80px' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: 'rgba(232,227,216,0.5)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: 0,
      }}><ArrowLeft size={14} /> ホーム</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 32 }}>
        <div style={{
          padding: 28, background: 'linear-gradient(180deg, rgba(201,168,106,0.08), rgba(201,168,106,0.02))',
          border: '1px solid rgba(201, 168, 106, 0.25)', borderRadius: 3, textAlign: 'center',
        }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto 16px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a86a, #6a4d2a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#1a1410', fontSize: 32, fontWeight: 700, fontFamily: 'serif',
          }}>{me.avatar}</div>
          <div style={{ fontSize: 16, color: '#e8e3d8', marginBottom: 4 }}>{me.name}</div>
          <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)' }}>{me.handle}</div>
          <div style={{
            display: 'inline-block', marginTop: 14, padding: '4px 12px',
            background: 'rgba(201, 168, 106, 0.15)', border: '1px solid rgba(201, 168, 106, 0.3)',
            color: '#c9a86a', fontSize: 10, letterSpacing: '0.3em', borderRadius: 2,
          }}>{me.tier}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Stat label="参加回数" value={me.total} unit="回" />
          <Stat label="累計支払" value={fmtYen(me.spent)} small />
          <Stat label="お気に入り" value={me.favoriteType} small />
        </div>
      </div>

      {/* 今後の予約 */}
      <h3 className="display" style={{ fontSize: 13, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.7)', marginBottom: 16, fontWeight: 500 }}>── 今後の予約</h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 32 }}>
        {myUpcoming.map(b => {
          const s = b.session;
          const ts = TYPE_STYLES[s.type];
          return (
            <div key={b.id} style={{
              padding: '14px 18px', display: 'grid',
              gridTemplateColumns: '110px 90px 1fr auto auto', gap: 16, alignItems: 'center',
              background: 'rgba(255,255,255,0.025)', border: `1px solid ${ts.border}`, borderRadius: 3,
            }}>
              <div className="num" style={{ fontSize: 13, color: '#e8e3d8' }}>{s.date.slice(5)} ({s.day})</div>
              <span style={{ padding: '3px 9px', fontSize: 10, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2, justifySelf: 'start' }}>{s.type}</span>
              <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Video size={11} /> {s.platform}
              </div>
              <span style={{
                padding: '3px 8px', fontSize: 9, letterSpacing: '0.15em', borderRadius: 2,
                background: b.paid ? 'rgba(125, 168, 125, 0.15)' : 'rgba(217, 119, 87, 0.15)',
                color: b.paid ? '#7da87d' : '#d97757',
              }}>● {b.paid ? '支払済' : '未払い'}</span>
              <a href={s.meetingUrl} target="_blank" rel="noreferrer" style={{
                padding: '6px 10px', background: 'rgba(125, 169, 203, 0.12)',
                border: '1px solid rgba(125, 169, 203, 0.3)', color: '#7da9cb',
                borderRadius: 2, fontSize: 10, letterSpacing: '0.15em', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
              }}><Link2 size={10} /> 入室</a>
            </div>
          );
        })}
      </div>

      {/* 参加履歴 */}
      <h3 className="display" style={{ fontSize: 13, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.7)', marginBottom: 16, fontWeight: 500 }}>── 参加履歴</h3>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        {myHistory.map((h, i) => {
          const s = h.session;
          const ts = TYPE_STYLES[s.type];
          const rs = h.role ? ROLE_STYLES[h.role] : null;
          return (
            <div key={h.id} style={{
              padding: '16px 20px', display: 'grid',
              gridTemplateColumns: '120px 100px 1fr 100px 100px', alignItems: 'center', gap: 16,
              borderBottom: i < myHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div className="num" style={{ fontSize: 13, color: '#e8e3d8' }}>{s.date}</div>
              <span style={{ padding: '3px 10px', fontSize: 10, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2, justifySelf: 'start' }}>{s.type}</span>
              <div>
                {h.role && rs && (
                  <span style={{ padding: '2px 8px', fontSize: 10, background: rs.bg, color: rs.color, borderRadius: 2 }}>
                    {h.role}
                  </span>
                )}
              </div>
              <div className="num" style={{ fontSize: 13, color: '#c9a86a', textAlign: 'right' }}>{fmtYen(s.price)}</div>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', textAlign: 'right',
                color: h.cancelled ? '#a85c5c' : '#7da87d',
              }}>● {h.cancelled ? 'キャンセル' : '参加済'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, unit, small }) {
  return (
    <div style={{
      padding: '20px 18px', background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3,
    }}>
      <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(232,227,216,0.5)', marginBottom: 8 }}>{label}</div>
      <div className="num" style={{ fontSize: small ? 16 : 28, color: '#e8e3d8', fontWeight: 500 }}>
        {value}{unit && <span style={{ fontSize: 12, color: 'rgba(232,227,216,0.5)', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

// =============================================================
// 管理者側
// =============================================================
function AdminView({ sessions, participants, setParticipants }) {
  const [tab, setTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const updateParticipant = (id, patch) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: 'ダッシュボード', icon: TrendingUp },
          { id: 'sessions', label: '会の管理', icon: Calendar },
          { id: 'payments', label: '参加者・支払い', icon: CreditCard },
          { id: 'roles', label: '役職割り振り', icon: Shuffle },
          { id: 'announce', label: '告知センター', icon: Megaphone },
          { id: 'customers', label: '顧客管理', icon: Users },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedCustomer(null); setSelectedSession(null); }} style={{
              padding: '12px 18px', background: 'transparent', border: 'none',
              color: active ? '#c9a86a' : 'rgba(232,227,216,0.5)',
              borderBottom: `2px solid ${active ? '#c9a86a' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.18em',
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: -1, whiteSpace: 'nowrap',
            }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard' && <Dashboard sessions={sessions} participants={participants} />}
      {tab === 'sessions' && <SessionsAdmin sessions={sessions} participants={participants} />}
      {tab === 'payments' && <PaymentsAdmin sessions={sessions} participants={participants} updateParticipant={updateParticipant} />}
      {tab === 'roles' && (selectedSession
        ? <RoleAssignment session={selectedSession} participants={participants} updateParticipant={updateParticipant} onBack={() => setSelectedSession(null)} setParticipants={setParticipants} />
        : <RolesList sessions={sessions} participants={participants} onSelect={setSelectedSession} />)}
      {tab === 'announce' && <AnnouncementCenter sessions={sessions} participants={participants} />}
      {tab === 'customers' && (selectedCustomer
        ? <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} sessions={sessions} participants={participants} />
        : <CustomersAdmin onSelect={setSelectedCustomer} />)}
    </div>
  );
}

// ============ ダッシュボード ============
function Dashboard({ sessions, participants }) {
  const upcoming = sessions.filter(s => s.status === 'open');
  const totalRevenue = upcoming.reduce((sum, s) => {
    const cnt = participants.filter(p => p.sessionId === s.id && !p.cancelled).length;
    return sum + s.price * cnt;
  }, 0);
  const totalBookings = participants.filter(p => upcoming.some(s => s.id === p.sessionId) && !p.cancelled).length;
  const unpaid = participants.filter(p => upcoming.some(s => s.id === p.sessionId) && !p.cancelled && !p.paid).length;
  const refundsDue = participants.filter(p => p.cancelled && !p.refunded && p.paid).length;

  return (
    <div className="fadeup">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        <KPI label="今月の売上見込" value={fmtYen(totalRevenue)} accent="#c9a86a" />
        <KPI label="予約総数" value={`${totalBookings}件`} accent="#a8895a" />
        <KPI label="未払い件数" value={`${unpaid}件`} accent="#d97757" />
        <KPI label="返金処理待ち" value={`${refundsDue}件`} accent="#a85c5c" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <section style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
          <h3 className="display" style={{ fontSize: 13, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: '0 0 20px', fontWeight: 500 }}>
            ── 開催予定の会
          </h3>
          {upcoming.slice(0, 5).map(s => {
            const ts = TYPE_STYLES[s.type];
            const cnt = participants.filter(p => p.sessionId === s.id && !p.cancelled).length;
            const ratio = cnt / s.capacity;
            return (
              <div key={s.id} style={{
                padding: '14px 0', display: 'grid',
                gridTemplateColumns: '90px 90px 1fr 100px 80px', gap: 14, alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div className="num" style={{ fontSize: 13, color: '#e8e3d8' }}>{s.date.slice(5)} ({s.day})</div>
                <span style={{ padding: '3px 9px', fontSize: 10, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2, justifySelf: 'start' }}>{s.type}</span>
                <div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${ratio * 100}%`, height: '100%', background: ts.color }} />
                  </div>
                  <div className="num" style={{ fontSize: 10, color: 'rgba(232,227,216,0.5)', marginTop: 4 }}>{cnt} / {s.capacity}</div>
                </div>
                <div className="num" style={{ fontSize: 13, color: '#c9a86a', textAlign: 'right' }}>{fmtYen(s.price * cnt)}</div>
                <div style={{ fontSize: 10, color: ratio === 1 ? '#a85c5c' : ratio > 0.7 ? '#d97757' : 'rgba(232,227,216,0.4)', letterSpacing: '0.15em', textAlign: 'right' }}>
                  {ratio === 1 ? '満員' : ratio > 0.7 ? '残僅か' : '受付中'}
                </div>
              </div>
            );
          })}
        </section>

        <section style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
          <h3 className="display" style={{ fontSize: 13, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: '0 0 20px', fontWeight: 500 }}>
            ── 要対応アラート
          </h3>
          {unpaid > 0 && (
            <AlertItem icon={<AlertCircle size={12} />} color="#d97757" title={`未払いが${unpaid}件`} body="開催3日前までに支払い催促が必要" />
          )}
          {refundsDue > 0 && (
            <AlertItem icon={<RotateCcw size={12} />} color="#a85c5c" title={`返金処理${refundsDue}件`} body="前日キャンセル分の返金処理を行ってください" />
          )}
          <AlertItem icon={<Star size={12} />} color="#a85c8b" title="ゲスト会 残席わずか" body="5/23 霧島アヤメ回 残5席。告知のタイミングです" />
          <AlertItem icon={<Bell size={12} />} color="#7da9cb" title="5/8 開催3日前" body="参加者へZoomリンク再送＋役職配布の準備" />
        </section>
      </div>
    </div>
  );
}

function AlertItem({ icon, color, title, body }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color, marginBottom: 4, fontWeight: 600 }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function KPI({ label, value, accent }) {
  return (
    <div style={{
      padding: '22px 22px 20px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 3,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent }} />
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.5)', marginBottom: 12 }}>{label}</div>
      <div className="num" style={{ fontSize: 22, color: '#e8e3d8', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

// ============ 会の管理 ============
function SessionsAdmin({ sessions, participants }) {
  return (
    <div className="fadeup">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: 0, fontWeight: 500 }}>── 会の一覧</h3>
        <button style={{
          padding: '10px 18px', background: 'rgba(201, 168, 106, 0.15)',
          border: '1px solid rgba(201, 168, 106, 0.3)', color: '#c9a86a',
          borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, letterSpacing: '0.25em',
        }}>+ 新しい会を作成</button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '110px 80px 90px 1fr 110px 90px 100px 80px',
          gap: 14, padding: '14px 20px', minWidth: 980,
          background: 'rgba(255,255,255,0.025)',
          fontSize: 9, letterSpacing: '0.25em', color: 'rgba(232,227,216,0.5)',
        }}>
          <div>日付</div><div>時間</div><div>タイプ</div><div>GM / プラットフォーム</div>
          <div style={{ textAlign: 'right' }}>料金</div>
          <div style={{ textAlign: 'right' }}>予約</div>
          <div style={{ textAlign: 'right' }}>売上</div>
          <div style={{ textAlign: 'right' }}>状態</div>
        </div>
        {sessions.filter(s => s.status === 'open').map(s => {
          const ts = TYPE_STYLES[s.type];
          const cnt = participants.filter(p => p.sessionId === s.id && !p.cancelled).length;
          const ratio = cnt / s.capacity;
          return (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '110px 80px 90px 1fr 110px 90px 100px 80px',
              gap: 14, padding: '16px 20px', alignItems: 'center', minWidth: 980,
              borderTop: '1px solid rgba(255,255,255,0.03)',
            }}>
              <div className="num" style={{ fontSize: 12, color: '#e8e3d8' }}>{s.date.slice(5)} ({s.day})</div>
              <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)' }}>{s.time.split('-')[0]}</div>
              <span style={{ padding: '3px 8px', fontSize: 9, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2, justifySelf: 'start' }}>
                {ts.label}{s.isGuest && '★'}
              </span>
              <div>
                <div style={{ fontSize: 12, color: '#e8e3d8' }}>{s.gm}{s.guestName && ` × ${s.guestName}`}</div>
                <div style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Video size={9} /> {s.platform}
                </div>
              </div>
              <div className="num" style={{ fontSize: 12, color: '#c9a86a', textAlign: 'right' }}>{fmtYen(s.price)}</div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 12, color: '#e8e3d8' }}>{cnt}/{s.capacity}</div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${ratio * 100}%`, height: '100%', background: ratio === 1 ? '#a85c5c' : ts.color }} />
                </div>
              </div>
              <div className="num" style={{ fontSize: 12, color: '#e8e3d8', textAlign: 'right' }}>{fmtYen(s.price * cnt)}</div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textAlign: 'right',
                color: ratio === 1 ? '#a85c5c' : ratio > 0.7 ? '#d97757' : '#7da87d' }}>
                ● {ratio === 1 ? '満' : ratio > 0.7 ? '僅' : '空'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 参加者・支払いタブ（NEW）============
function PaymentsAdmin({ sessions, participants, updateParticipant }) {
  const monthSessions = sessions.filter(s => s.date.startsWith('2026-05') || s.date.startsWith('2026-04'));
  const [expandedId, setExpandedId] = useState(monthSessions[0]?.id || null);
  const [filter, setFilter] = useState('all'); // all | unpaid | refund

  const summary = useMemo(() => {
    let totalCollected = 0, totalUnpaid = 0, totalRefundDue = 0, totalRefunded = 0;
    monthSessions.forEach(s => {
      participants.filter(p => p.sessionId === s.id).forEach(p => {
        if (p.cancelled && p.paid && !p.refunded) totalRefundDue += s.price;
        else if (p.cancelled && p.refunded) totalRefunded += s.price;
        else if (p.paid) totalCollected += s.price;
        else if (!p.paid && !p.cancelled) totalUnpaid += s.price;
      });
    });
    return { totalCollected, totalUnpaid, totalRefundDue, totalRefunded };
  }, [monthSessions, participants]);

  return (
    <div className="fadeup">
      <h3 className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: '0 0 24px', fontWeight: 500 }}>── 参加者・支払い管理（今月）</h3>

      {/* サマリ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <KPI label="入金済" value={fmtYen(summary.totalCollected)} accent="#7da87d" />
        <KPI label="未入金" value={fmtYen(summary.totalUnpaid)} accent="#d97757" />
        <KPI label="返金待ち" value={fmtYen(summary.totalRefundDue)} accent="#a85c5c" />
        <KPI label="返金済" value={fmtYen(summary.totalRefunded)} accent="rgba(232,227,216,0.4)" />
      </div>

      {/* フィルタ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'all', label: 'すべて' },
          { id: 'unpaid', label: '未払いのみ' },
          { id: 'refund', label: '要返金のみ' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', borderRadius: 999,
            background: filter === f.id ? 'rgba(201, 168, 106, 0.15)' : 'transparent',
            border: `1px solid ${filter === f.id ? 'rgba(201, 168, 106, 0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: filter === f.id ? '#c9a86a' : 'rgba(232,227,216,0.5)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em',
          }}>{f.label}</button>
        ))}
      </div>

      {/* セッションごとのアコーディオン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {monthSessions.map(s => {
          let sessionParts = participants.filter(p => p.sessionId === s.id);
          if (filter === 'unpaid') sessionParts = sessionParts.filter(p => !p.paid && !p.cancelled);
          if (filter === 'refund') sessionParts = sessionParts.filter(p => p.cancelled && p.paid && !p.refunded);
          if (sessionParts.length === 0 && filter !== 'all') return null;

          const ts = TYPE_STYLES[s.type];
          const isOpen = expandedId === s.id;
          const totalParts = participants.filter(p => p.sessionId === s.id);
          const paidCount = totalParts.filter(p => p.paid && !p.cancelled).length;
          const unpaidCount = totalParts.filter(p => !p.paid && !p.cancelled).length;
          const refundDueCount = totalParts.filter(p => p.cancelled && p.paid && !p.refunded).length;

          return (
            <div key={s.id} style={{
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid ${isOpen ? ts.color : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 3, overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              <div onClick={() => setExpandedId(isOpen ? null : s.id)} style={{
                padding: '16px 20px', cursor: 'pointer', display: 'grid',
                gridTemplateColumns: '120px 80px 1fr auto auto auto auto', gap: 16, alignItems: 'center',
              }}>
                <div className="num" style={{ fontSize: 13, color: '#e8e3d8' }}>{s.date.slice(5)} ({s.day})</div>
                <span style={{ padding: '3px 8px', fontSize: 9, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2, justifySelf: 'start' }}>{s.type}</span>
                <div style={{ fontSize: 12, color: 'rgba(232,227,216,0.7)' }}>
                  {s.gm}{s.guestName && ` × ${s.guestName}`} {s.status === 'closed' && <span style={{ color: 'rgba(232,227,216,0.4)', marginLeft: 8 }}>· 終了</span>}
                </div>
                <Pill color="#7da87d" label={`済 ${paidCount}`} />
                <Pill color="#d97757" label={`未 ${unpaidCount}`} dimmed={unpaidCount === 0} />
                <Pill color="#a85c5c" label={`返金 ${refundDueCount}`} dimmed={refundDueCount === 0} />
                <ChevronRight size={16} color="rgba(232,227,216,0.4)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr 100px 130px 100px 130px',
                    gap: 14, padding: '10px 20px',
                    background: 'rgba(0,0,0,0.2)',
                    fontSize: 9, letterSpacing: '0.25em', color: 'rgba(232,227,216,0.4)',
                  }}>
                    <div>#</div><div>参加者</div><div>金額</div><div>支払い状況</div><div>役職</div><div style={{ textAlign: 'right' }}>アクション</div>
                  </div>
                  {sessionParts.map((p, idx) => (
                    <ParticipantRow key={p.id} idx={idx + 1} participant={p} session={s} updateParticipant={updateParticipant} />
                  ))}
                  {sessionParts.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'rgba(232,227,216,0.4)' }}>該当なし</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ color, label, dimmed }) {
  return (
    <span style={{
      padding: '3px 9px', fontSize: 10, letterSpacing: '0.1em',
      background: dimmed ? 'rgba(255,255,255,0.03)' : `${color}22`,
      color: dimmed ? 'rgba(232,227,216,0.3)' : color,
      borderRadius: 2, border: `1px solid ${dimmed ? 'rgba(255,255,255,0.05)' : color + '55'}`,
      fontFamily: "'DM Mono', monospace",
    }}>{label}</span>
  );
}

function ParticipantRow({ idx, participant, session, updateParticipant }) {
  const p = participant;
  let statusColor, statusLabel, statusIcon;
  if (p.cancelled && p.refunded) { statusColor = 'rgba(232,227,216,0.4)'; statusLabel = '返金済'; statusIcon = <CheckCircle2 size={11} />; }
  else if (p.cancelled && p.paid && !p.refunded) { statusColor = '#a85c5c'; statusLabel = '返金待ち'; statusIcon = <RotateCcw size={11} />; }
  else if (p.cancelled && !p.paid) { statusColor = 'rgba(232,227,216,0.3)'; statusLabel = 'キャンセル'; statusIcon = <XCircle size={11} />; }
  else if (p.paid) { statusColor = '#7da87d'; statusLabel = '支払済'; statusIcon = <CheckCircle2 size={11} />; }
  else { statusColor = '#d97757'; statusLabel = '未払い'; statusIcon = <AlertCircle size={11} />; }

  const rs = p.role ? ROLE_STYLES[p.role] : null;

  return (
    <div style={{
      padding: '12px 20px', display: 'grid',
      gridTemplateColumns: '60px 1fr 100px 130px 100px 130px', gap: 14, alignItems: 'center',
      borderTop: '1px solid rgba(255,255,255,0.03)',
    }}>
      <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.4)' }}>{String(idx).padStart(2, '0')}</div>
      <div>
        <div style={{ fontSize: 12, color: '#e8e3d8' }}>{p.name}</div>
        <div className="num" style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)' }}>{p.handle}</div>
      </div>
      <div className="num" style={{ fontSize: 12, color: '#c9a86a' }}>{fmtYen(session.price)}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: statusColor }}>
          {statusIcon} {statusLabel}
        </div>
        {p.paid && p.paidAt && (
          <div className="num" style={{ fontSize: 9, color: 'rgba(232,227,216,0.35)', marginTop: 2 }}>
            <Wallet size={8} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 3 }} />{p.paidAt}
          </div>
        )}
        {p.cancelled && p.cancelledAt && (
          <div className="num" style={{ fontSize: 9, color: 'rgba(232,227,216,0.35)', marginTop: 2 }}>
            キャンセル {p.cancelledAt.slice(5)}
          </div>
        )}
      </div>
      <div>
        {p.role && rs ? (
          <span style={{ padding: '2px 8px', fontSize: 10, background: rs.bg, color: rs.color, borderRadius: 2 }}>{p.role}</span>
        ) : (
          <span style={{ fontSize: 10, color: 'rgba(232,227,216,0.3)' }}>未割当</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {!p.paid && !p.cancelled && (
          <button onClick={() => updateParticipant(p.id, { paid: true, paidAt: '2026-05-02 ' + new Date().toTimeString().slice(0, 5) })} style={{
            padding: '6px 10px', background: 'rgba(125, 168, 125, 0.15)',
            border: '1px solid rgba(125, 168, 125, 0.3)', color: '#7da87d',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.1em',
          }}>入金確認</button>
        )}
        {p.cancelled && p.paid && !p.refunded && (
          <button onClick={() => updateParticipant(p.id, { refunded: true, refundedAt: '2026-05-02' })} style={{
            padding: '6px 10px', background: 'rgba(168, 92, 92, 0.15)',
            border: '1px solid rgba(168, 92, 92, 0.3)', color: '#a85c5c',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.1em',
          }}>返金完了</button>
        )}
        {!p.paid && !p.cancelled && (
          <button style={{
            padding: '6px 10px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,227,216,0.6)',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.1em',
          }}>催促</button>
        )}
      </div>
    </div>
  );
}

// ============ 役職割り振り（一覧）============
function RolesList({ sessions, participants, onSelect }) {
  const upcoming = sessions.filter(s => s.status === 'open');
  return (
    <div className="fadeup">
      <h3 className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: '0 0 8px', fontWeight: 500 }}>── 役職割り振り</h3>
      <p style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)', marginBottom: 24, lineHeight: 1.7 }}>
        各会の参加者へ、人狼・占い師・村人などの役職を割り当てます。手動指定とランダム抽選を切り替え可能。確定後、参加者のマイページに反映されます。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {upcoming.map(s => {
          const ts = TYPE_STYLES[s.type];
          const sParts = participants.filter(p => p.sessionId === s.id && !p.cancelled);
          const assigned = sParts.filter(p => p.role).length;
          const allAssigned = sParts.length > 0 && assigned === sParts.length;
          return (
            <div key={s.id} onClick={() => onSelect(s)} style={{
              padding: '20px 22px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3,
              transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ts.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div className="num" style={{ fontSize: 16, color: '#e8e3d8' }}>{s.date.slice(5)} ({s.day})</div>
                  <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)', marginTop: 2 }}>{s.time}</div>
                </div>
                <span style={{ padding: '3px 8px', fontSize: 9, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2 }}>{s.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)' }}>参加 {sParts.length}名</span>
                <span style={{
                  padding: '4px 10px', fontSize: 10, letterSpacing: '0.15em', borderRadius: 2,
                  background: allAssigned ? 'rgba(125,168,125,0.15)' : 'rgba(217,119,87,0.12)',
                  color: allAssigned ? '#7da87d' : '#d97757',
                }}>
                  {allAssigned ? `● 全員割当済` : `${assigned}/${sParts.length} 割当`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 役職割り振り（詳細）============
function RoleAssignment({ session, participants, updateParticipant, onBack, setParticipants }) {
  const [mode, setMode] = useState('manual'); // manual | random
  const sParts = participants.filter(p => p.sessionId === session.id && !p.cancelled);
  const ts = TYPE_STYLES[session.type];
  const roleSet = ROLES_BY_PLAYERS[sParts.length] || ROLES_BY_PLAYERS[12];

  // 残り役職を計算
  const usedRoles = sParts.filter(p => p.role).map(p => p.role);
  const availableRoles = useMemo(() => {
    const remaining = [...roleSet];
    usedRoles.forEach(r => {
      const idx = remaining.indexOf(r);
      if (idx >= 0) remaining.splice(idx, 1);
    });
    return remaining;
  }, [roleSet, usedRoles]);

  const handleRandomAssign = () => {
    const shuffled = [...roleSet].sort(() => Math.random() - 0.5);
    setParticipants(prev => prev.map(p => {
      if (p.sessionId !== session.id || p.cancelled) return p;
      const idx = sParts.findIndex(x => x.id === p.id);
      return { ...p, role: shuffled[idx] || null };
    }));
  };

  const handleClearAll = () => {
    setParticipants(prev => prev.map(p => p.sessionId === session.id ? { ...p, role: null } : p));
  };

  const handleManualSet = (participantId, role) => {
    updateParticipant(participantId, { role });
  };

  return (
    <div className="fadeup">
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: 'rgba(232,227,216,0.5)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0,
      }}><ArrowLeft size={14} /> 一覧へ</button>

      <div style={{
        padding: '24px 28px', marginBottom: 24,
        background: `linear-gradient(135deg, ${ts.bg}, rgba(20,15,25,0.4))`,
        border: `1px solid ${ts.border}`, borderRadius: 3,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ padding: '3px 10px', fontSize: 10, letterSpacing: '0.2em', background: ts.bg, color: ts.color, borderRadius: 2, border: `1px solid ${ts.border}` }}>{session.type}</span>
            <h3 className="display" style={{ fontSize: 24, color: '#e8e3d8', margin: '12px 0 4px', letterSpacing: '0.1em' }}>
              {session.date} ({session.day}) <span className="num" style={{ fontSize: 16, color: 'rgba(232,227,216,0.5)' }}>{session.time}</span>
            </h3>
            <div style={{ fontSize: 12, color: 'rgba(232,227,216,0.6)' }}>{session.gm} · 参加 {sParts.length}名</div>
          </div>

          {/* モード切替 */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, padding: 3,
          }}>
            <button onClick={() => setMode('manual')} style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.15em',
              background: mode === 'manual' ? 'rgba(201, 168, 106, 0.2)' : 'transparent',
              color: mode === 'manual' ? '#c9a86a' : 'rgba(232,227,216,0.5)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}><User size={12} /> 手動</button>
            <button onClick={() => setMode('random')} style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.15em',
              background: mode === 'random' ? 'rgba(201, 168, 106, 0.2)' : 'transparent',
              color: mode === 'random' ? '#c9a86a' : 'rgba(232,227,216,0.5)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}><Shuffle size={12} /> ランダム</button>
          </div>
        </div>
      </div>

      {/* 役職構成プレビュー */}
      <div style={{
        padding: '16px 20px', marginBottom: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3,
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.5)', marginBottom: 10 }}>
          {sParts.length}人構成 — 割り当てる役職
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(roleSet.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {})).map(([role, count]) => {
            const rs = ROLE_STYLES[role];
            return (
              <span key={role} style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 2,
                background: rs.bg, color: rs.color, border: `1px solid ${rs.color}55`,
              }}>{role} × {count}</span>
            );
          })}
        </div>
      </div>

      {/* ランダム or 手動操作 */}
      {mode === 'random' ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={handleRandomAssign} style={{
            padding: '14px 24px', flex: 1,
            background: 'linear-gradient(135deg, #c9a86a, #a8895a)',
            color: '#1a1410', border: 'none', borderRadius: 2, cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.25em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}><Shuffle size={14} /> ランダムで一括割り振り</button>
          <button onClick={handleClearAll} style={{
            padding: '14px 20px', background: 'transparent',
            color: '#a85c5c', border: '1px solid rgba(168, 92, 92, 0.3)',
            borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, letterSpacing: '0.2em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}><RotateCcw size={12} /> 全クリア</button>
        </div>
      ) : (
        <div style={{ marginBottom: 12, padding: '12px 16px', background: 'rgba(125, 169, 203, 0.06)', border: '1px solid rgba(125, 169, 203, 0.2)', borderRadius: 2, fontSize: 11, color: 'rgba(232,227,216,0.7)', lineHeight: 1.7 }}>
          <span style={{ color: '#7da9cb', letterSpacing: '0.15em', marginRight: 6 }}>HINT</span>
          各参加者の役職欄から手動で選択してください。残り役職は自動表示されます。
        </div>
      )}

      {/* 参加者リスト＋役職セレクタ */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        {sParts.map((p, i) => {
          const rs = p.role ? ROLE_STYLES[p.role] : null;
          return (
            <div key={p.id} style={{
              padding: '14px 20px', display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr', gap: 16, alignItems: 'center',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: 'rgba(232,227,216,0.6)', fontFamily: 'serif',
              }}>{p.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 13, color: '#e8e3d8' }}>{p.name}</div>
                <div className="num" style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)' }}>{p.handle}</div>
              </div>
              <div>
                {mode === 'manual' ? (
                  <select value={p.role || ''} onChange={(e) => handleManualSet(p.id, e.target.value || null)} style={{
                    width: '100%', padding: '8px 12px',
                    background: rs ? rs.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${rs ? rs.color : 'rgba(255,255,255,0.1)'}`,
                    color: rs ? rs.color : '#e8e3d8',
                    borderRadius: 2, fontFamily: 'inherit', fontSize: 12,
                    outline: 'none', cursor: 'pointer',
                  }}>
                    <option value="" style={{ background: '#1a1820' }}>未割当</option>
                    {Object.keys(ROLE_STYLES).map(r => (
                      <option key={r} value={r} style={{ background: '#1a1820' }}>{r}</option>
                    ))}
                  </select>
                ) : (
                  rs ? (
                    <span style={{
                      padding: '6px 14px', fontSize: 12, borderRadius: 2,
                      background: rs.bg, color: rs.color, border: `1px solid ${rs.color}55`,
                    }}>{p.role}</span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'rgba(232,227,216,0.3)' }}>未割当</span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 確定して通知 */}
      <button style={{
        width: '100%', marginTop: 20, padding: '16px',
        background: usedRoles.length === sParts.length && sParts.length > 0
          ? 'linear-gradient(135deg, #c9a86a 0%, #a8895a 100%)'
          : 'rgba(255,255,255,0.04)',
        color: usedRoles.length === sParts.length && sParts.length > 0 ? '#1a1410' : 'rgba(232,227,216,0.4)',
        border: 'none', borderRadius: 2,
        fontFamily: 'inherit', fontWeight: 700, fontSize: 12, letterSpacing: '0.3em',
        cursor: usedRoles.length === sParts.length && sParts.length > 0 ? 'pointer' : 'not-allowed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <Send size={14} /> {usedRoles.length === sParts.length && sParts.length > 0 ? '確定して参加者へ通知' : `あと ${sParts.length - usedRoles.length} 名の割当が必要`}
      </button>
    </div>
  );
}

// ============ 告知センター（NEW）============
function AnnouncementCenter({ sessions, participants }) {
  const [target, setTarget] = useState(sessions.find(s => s.status === 'open')?.id);
  const targetSession = sessions.find(s => s.id === target);
  const [tab, setTab] = useState('compose'); // compose | history
  const upcoming = sessions.filter(s => s.status === 'open');

  const xPost = targetSession ? generateXPost(targetSession) : '';
  const linePost = targetSession ? generateLinePost(targetSession) : '';

  const targetCount = targetSession ? participants.filter(p => p.sessionId === targetSession.id && !p.cancelled).length : 0;

  return (
    <div className="fadeup">
      <h3 className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: '0 0 8px', fontWeight: 500 }}>── 告知センター</h3>
      <p style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)', marginBottom: 24, lineHeight: 1.7 }}>
        会の告知・リマインドを一箇所から発信。アプリ内お知らせ／一斉メッセージ／X投稿文の自動生成、すべて揃えています。
      </p>

      {/* タブ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {[
          { id: 'compose', label: '告知を作成' },
          { id: 'history', label: '配信履歴' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 18px',
            background: tab === t.id ? 'rgba(201, 168, 106, 0.15)' : 'transparent',
            border: '1px solid', borderColor: tab === t.id ? 'rgba(201, 168, 106, 0.4)' : 'rgba(255,255,255,0.06)',
            color: tab === t.id ? '#c9a86a' : 'rgba(232,227,216,0.5)',
            borderRadius: 2, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.2em',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'compose' && targetSession && (
        <>
          {/* 対象選択 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(232,227,216,0.5)', marginBottom: 8 }}>告知対象の会</label>
            <select value={target} onChange={(e) => setTarget(Number(e.target.value))} style={{
              width: '100%', padding: '12px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(201, 168, 106, 0.2)',
              borderRadius: 2, color: '#e8e3d8',
              fontFamily: 'inherit', fontSize: 13, outline: 'none', cursor: 'pointer',
            }}>
              {upcoming.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#1a1820' }}>
                  {s.date} ({s.day}) {s.time} · {s.type}{s.guestName ? ` × ${s.guestName}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 4つのチャネル */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
            {/* アプリ内お知らせ */}
            <ChannelCard
              icon={<Bell size={14} />}
              color="#c9a86a"
              title="アプリ内お知らせ"
              audience="全ユーザーのトップ＆お知らせ欄"
              cta="アプリに掲載"
              hint="未予約者にも目に入る。新規告知に最適。"
            />
            {/* 参加者へ一斉メッセージ */}
            <ChannelCard
              icon={<MessageCircle size={14} />}
              color="#7da9cb"
              title="参加者へメール／LINE"
              audience={`予約済 ${targetCount}名へ一斉配信`}
              cta="送信予約"
              hint="リマインド・Zoomリンク再送に。"
            />
            {/* X投稿生成 */}
            <ChannelCard
              icon={<Twitter size={14} />}
              color="#a85c8b"
              title="X（Twitter）投稿"
              audience="自動生成 → コピーして投稿"
              cta="文面をコピー"
              hint="新規募集の集客に。"
              copyText={xPost}
            />
            {/* リマインド自動化 */}
            <ChannelCard
              icon={<Zap size={14} />}
              color="#d97757"
              title="自動リマインド設定"
              audience="3日前 / 前日 / 当日朝"
              cta="設定を開く"
              hint="一度設定すれば毎回自動で配信。"
            />
          </div>

          {/* プレビューエリア */}
          <div style={{
            padding: 24, background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3,
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.5)', marginBottom: 14 }}>
              ── 自動生成プレビュー
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <PreviewBox icon={<Twitter size={12} />} label="X投稿文" color="#a85c8b" content={xPost} />
              <PreviewBox icon={<MessageCircle size={12} />} label="LINE / メール文面" color="#7da9cb" content={linePost} />
            </div>
          </div>
        </>
      )}

      {tab === 'history' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          {[
            { date: '2026-04-30 10:00', channel: 'アプリ内', target: '全ユーザー', subject: '5/10 ゲスト会「狼月シン」さん追加', count: 142 },
            { date: '2026-04-28 18:00', channel: 'LINE一斉', target: '4/30 通常会 予約者', subject: '前日リマインド＋Zoomリンク再送', count: 12 },
            { date: '2026-04-27 09:00', channel: 'X投稿', target: '一般', subject: '5月の開催スケジュール公開', count: '—' },
            { date: '2026-04-25 12:00', channel: '自動', target: '4/28 通常会 予約者', subject: '3日前リマインド', count: 12 },
          ].map((h, i, arr) => (
            <div key={i} style={{
              padding: '14px 20px', display: 'grid',
              gridTemplateColumns: '160px 100px 200px 1fr 80px', gap: 14, alignItems: 'center',
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)' }}>{h.date}</div>
              <span style={{
                padding: '2px 8px', fontSize: 9, letterSpacing: '0.15em', borderRadius: 2, justifySelf: 'start',
                background: 'rgba(201, 168, 106, 0.12)', color: '#c9a86a',
              }}>{h.channel}</span>
              <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)' }}>{h.target}</div>
              <div style={{ fontSize: 12, color: '#e8e3d8' }}>{h.subject}</div>
              <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)', textAlign: 'right' }}>{h.count}{typeof h.count === 'number' && '名'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelCard({ icon, color, title, audience, cta, hint, copyText }) {
  const [copied, setCopied] = useState(false);
  const handleClick = () => {
    if (copyText && navigator.clipboard) {
      navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <div style={{
      padding: 18, background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${color}33`, borderRadius: 3,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color }}>{icon}</span>
        <div style={{ fontSize: 13, color: '#e8e3d8', fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(232,227,216,0.6)' }}>{audience}</div>
      <div style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)', lineHeight: 1.6 }}>{hint}</div>
      <button onClick={handleClick} style={{
        marginTop: 'auto', padding: '8px 12px',
        background: `${color}22`, border: `1px solid ${color}55`, color,
        borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 10, letterSpacing: '0.2em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        {copied ? <><Check size={11} /> コピーしました</> : <>{cta} {copyText ? <Copy size={11} /> : <ChevronRight size={12} />}</>}
      </button>
    </div>
  );
}

function PreviewBox({ icon, label, color, content }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{
      padding: 14, background: 'rgba(0,0,0,0.25)',
      border: `1px solid ${color}33`, borderRadius: 2,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color, letterSpacing: '0.2em' }}>
          {icon} {label}
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{
          padding: '4px 8px', background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,227,216,0.6)',
          borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, letterSpacing: '0.15em',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {copied ? <><Check size={10} /> OK</> : <><Copy size={10} /> コピー</>}
        </button>
      </div>
      <pre style={{
        margin: 0, fontFamily: 'inherit', fontSize: 11.5, color: 'rgba(232,227,216,0.8)',
        lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{content}</pre>
    </div>
  );
}

function generateXPost(s) {
  const guestLine = s.isGuest ? `\n🌙 SPECIAL GUEST: ${s.guestName}` : '';
  return `【${s.date.slice(5).replace('-', '/')}（${s.day}）${s.time} 開催】
${s.type}${guestLine}

参加費: ${fmtYen(s.price)}（PayPay対応）
定員: ${s.capacity}名
プラットフォーム: ${s.platform}

ご予約はプロフィールのリンクから🐺
#人狼 #LunaLupus`;
}

function generateLinePost(s) {
  const guestLine = s.isGuest ? `\n★ ゲスト：${s.guestName} さん` : '';
  return `件名：${s.date.slice(5)} ${s.type} 開催のご案内

いつもご参加ありがとうございます。
下記の通り、開催が決定しました。${guestLine}

▼ 開催日時
${s.date}（${s.day}）${s.time}

▼ プラットフォーム
${s.platform}

▼ 参加費
${fmtYen(s.price)}（PayPayにて）

ご予約はアプリのトップから承っております。
皆さまのご参加、心よりお待ちしております。`;
}

// ============ 顧客管理 ============
function CustomersAdmin({ onSelect }) {
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('all');

  const list = useMemo(() => CUSTOMERS.filter(c =>
    (tier === 'all' || c.tier === tier) &&
    (q === '' || c.name.includes(q) || c.handle.includes(q))
  ), [q, tier]);

  return (
    <div className="fadeup">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 className="display" style={{ fontSize: 14, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.8)', margin: 0, fontWeight: 500 }}>
          ── 顧客一覧（{list.length}名）
        </h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="rgba(232,227,216,0.4)" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="名前 / X ID で検索" style={{
              ...inputStyle, paddingLeft: 32, width: 220, fontSize: 12, padding: '9px 12px 9px 32px',
            }} />
          </div>
          {['all', 'VIP', 'レギュラー', '新規'].map(t => (
            <button key={t} onClick={() => setTier(t)} style={{
              padding: '7px 14px', borderRadius: 999,
              background: tier === t ? 'rgba(201, 168, 106, 0.15)' : 'transparent',
              border: `1px solid ${tier === t ? 'rgba(201, 168, 106, 0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: tier === t ? '#c9a86a' : 'rgba(232,227,216,0.5)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.15em',
            }}>{t === 'all' ? '全顧客' : t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {list.map((c, i) => (
          <article key={c.id} onClick={() => onSelect(c)} className="fadeup" style={{
            animationDelay: `${i * 50}ms`,
            padding: '20px 22px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3,
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201, 168, 106, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: c.tier === 'VIP'
                  ? 'linear-gradient(135deg, #c9a86a, #6a4d2a)'
                  : 'linear-gradient(135deg, #4a4a52, #2a2a32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.tier === 'VIP' ? '#1a1410' : '#e8e3d8',
                fontSize: 18, fontWeight: 600, fontFamily: 'serif',
                flexShrink: 0,
              }}>{c.avatar}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, color: '#e8e3d8', marginBottom: 2 }}>{c.name}</div>
                <div className="num" style={{ fontSize: 10, color: 'rgba(232,227,216,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.handle}</div>
              </div>
              <span style={{
                padding: '3px 8px', fontSize: 9, letterSpacing: '0.2em', borderRadius: 2,
                background: c.tier === 'VIP' ? 'rgba(201, 168, 106, 0.2)' : c.tier === 'レギュラー' ? 'rgba(125, 168, 125, 0.15)' : 'rgba(232, 227, 216, 0.08)',
                color: c.tier === 'VIP' ? '#c9a86a' : c.tier === 'レギュラー' ? '#7da87d' : 'rgba(232,227,216,0.6)',
              }}>{c.tier}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(232,227,216,0.4)', marginBottom: 3 }}>参加</div>
                <div className="num" style={{ fontSize: 14, color: '#e8e3d8' }}>{c.total}<span style={{ fontSize: 10, color: 'rgba(232,227,216,0.4)', marginLeft: 3 }}>回</span></div>
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(232,227,216,0.4)', marginBottom: 3 }}>累計</div>
                <div className="num" style={{ fontSize: 14, color: '#c9a86a' }}>{fmtYen(c.spent)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CustomerDetail({ customer, onBack, sessions, participants }) {
  const myHistory = participants.filter(p => p.customerId === customer.id).map(p => ({ ...p, session: sessions.find(s => s.id === p.sessionId) })).filter(x => x.session);

  return (
    <div className="fadeup">
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: 'rgba(232,227,216,0.5)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, letterSpacing: '0.15em',
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, padding: 0,
      }}><ArrowLeft size={14} /> 一覧へ</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 32 }}>
        <div style={{
          padding: 28, background: 'linear-gradient(180deg, rgba(201,168,106,0.08), rgba(201,168,106,0.02))',
          border: '1px solid rgba(201, 168, 106, 0.25)', borderRadius: 3,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: customer.tier === 'VIP' ? 'linear-gradient(135deg, #c9a86a, #6a4d2a)' : 'linear-gradient(135deg, #4a4a52, #2a2a32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: customer.tier === 'VIP' ? '#1a1410' : '#e8e3d8',
              fontSize: 26, fontWeight: 600, fontFamily: 'serif',
            }}>{customer.avatar}</div>
            <div>
              <div style={{ fontSize: 18, color: '#e8e3d8', marginBottom: 4 }}>{customer.name}</div>
              <div className="num" style={{ fontSize: 11, color: 'rgba(232,227,216,0.5)' }}>{customer.handle}</div>
            </div>
          </div>
          <ContactRow icon={<Phone size={11} />} value={customer.phone} />
          <ContactRow icon={<Mail size={11} />} value={customer.email} />
          <ContactRow icon={<Calendar size={11} />} value={`登録 ${customer.joined}`} />
          <ContactRow icon={<Clock size={11} />} value={`最終来店 ${customer.lastVisit}`} />
          <div style={{ marginTop: 20, padding: 14, background: 'rgba(0,0,0,0.25)', borderRadius: 2, borderLeft: '2px solid #c9a86a' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(232,227,216,0.5)', marginBottom: 6 }}>NOTES</div>
            <div style={{ fontSize: 12, color: 'rgba(232,227,216,0.85)', lineHeight: 1.7 }}>{customer.notes}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignContent: 'start' }}>
          <Stat label="参加回数" value={customer.total} unit="回" />
          <Stat label="累計支払" value={fmtYen(customer.spent)} small />
          <Stat label="お気に入り" value={customer.favoriteType} small />
        </div>
      </div>

      <h3 className="display" style={{ fontSize: 13, letterSpacing: '0.3em', color: 'rgba(232,227,216,0.7)', marginBottom: 16, fontWeight: 500 }}>── 参加履歴</h3>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        {myHistory.map((h, i) => {
          const s = h.session;
          const ts = TYPE_STYLES[s.type];
          const rs = h.role ? ROLE_STYLES[h.role] : null;
          return (
            <div key={h.id} style={{
              padding: '14px 20px', display: 'grid',
              gridTemplateColumns: '120px 100px 80px 1fr 100px 100px', alignItems: 'center', gap: 14,
              borderBottom: i < myHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div className="num" style={{ fontSize: 12, color: '#e8e3d8' }}>{s.date}</div>
              <span style={{ padding: '3px 9px', fontSize: 10, letterSpacing: '0.15em', background: ts.bg, color: ts.color, borderRadius: 2, justifySelf: 'start' }}>{s.type}</span>
              <div>
                {rs && <span style={{ padding: '2px 7px', fontSize: 9, background: rs.bg, color: rs.color, borderRadius: 2 }}>{h.role}</span>}
              </div>
              <div />
              <div className="num" style={{ fontSize: 12, color: '#c9a86a', textAlign: 'right' }}>{fmtYen(s.price)}</div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textAlign: 'right',
                color: h.cancelled ? (h.refunded ? 'rgba(232,227,216,0.4)' : '#a85c5c') : (h.paid ? '#7da87d' : '#d97757')
              }}>● {h.cancelled ? (h.refunded ? '返金済' : '返金待') : (h.paid ? '支払済' : '未払い')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContactRow({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 11, color: 'rgba(232,227,216,0.65)' }}>
      <span style={{ color: 'rgba(201, 168, 106, 0.6)' }}>{icon}</span>
      <span className="num">{value}</span>
    </div>
  );
}
