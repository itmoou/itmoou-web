import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import type { Env, Announcement, Attachment, NewsItem, SlideItem, HistoryItem, SolutionData, SolutionFeature, ContactSubmission, AdminUser } from './types'
import { escapeHtml } from './announcements'

const admin = new Hono<Env>()

// ──────────────── 인증 유틸 ────────────────

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`itmoou:${salt}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function generateToken(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function getCurrentUser(c: any): Promise<AdminUser | null> {
  const token = getCookie(c, 'admin_session')
  if (!token) return null
  const db = c.env.itmoou_db
  const session = await db.prepare(
    "SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).first<{user_id: number}>()
  if (!session) return null
  return db.prepare('SELECT * FROM admin_users WHERE id = ?').bind(session.user_id).first<AdminUser>()
}

// ──────────────── 인증 미들웨어 ────────────────

admin.use('*', async (c, next) => {
  const path = c.req.path
  if (path === '/admin/login' || path === '/admin/logout' || path === '/admin/setup') return next()

  // 계정이 없으면 setup으로
  const db = c.env.itmoou_db
  const userCount = await db.prepare('SELECT COUNT(*) as cnt FROM admin_users').first<{cnt:number}>()
  if (!userCount || userCount.cnt === 0) return c.redirect('/admin/setup')

  const token = getCookie(c, 'admin_session')
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')

  // Sliding session: 요청마다 30분 연장
  if (token) {
    const newExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    await db.prepare('UPDATE admin_sessions SET expires_at = ? WHERE token = ?').bind(newExpiry, token).run()
    setCookie(c, 'admin_session', token, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 60 * 30, path: '/' })
  }

  // CS담당자 접근 제한
  if (user.role === 'cs') {
    const allowed = ['/admin/contacts', '/admin/profile']
    const isAllowed = allowed.some(p => path === p || path.startsWith(p + '/'))
    if (!isAllowed) return c.redirect('/admin/contacts')
  }

  return next()
})

// ──────────────── 라우트 ────────────────

const CF_ACCOUNT_ID = '9f41d1fdc19ffc88ddd6bd0bac55b383'
const CF_PAGES_PROJECT = 'itmoou-webpage'

admin.get('/', async (c) => {
  const user = await getCurrentUser(c)
  return c.redirect(user?.role === 'cs' ? '/admin/contacts' : '/admin/analytics')
})
admin.get('/dashboard', (c) => c.redirect('/admin/analytics'))

// ──────────────── Setup 마법사 ────────────────

admin.get('/setup', async (c) => {
  const db = c.env.itmoou_db
  const userCount = await db.prepare('SELECT COUNT(*) as cnt FROM admin_users').first<{cnt:number}>()
  if (userCount && userCount.cnt > 0) return c.redirect('/admin/login')
  const error = c.req.query('error')
  return c.html(getSetupHTML(error))
})

admin.post('/setup', async (c) => {
  const db = c.env.itmoou_db
  const userCount = await db.prepare('SELECT COUNT(*) as cnt FROM admin_users').first<{cnt:number}>()
  if (userCount && userCount.cnt > 0) return c.redirect('/admin/login')

  const body = await c.req.formData()
  const masterKey = (body.get('master_key') as string) || ''
  const name = (body.get('name') as string)?.trim() || ''
  const email = (body.get('email') as string)?.trim() || ''
  const password = (body.get('password') as string) || ''
  const passwordConfirm = (body.get('password_confirm') as string) || ''

  if (masterKey !== c.env.ADMIN_PASSWORD) return c.redirect('/admin/setup?error=masterkey')
  if (!name || !email || !password) return c.redirect('/admin/setup?error=required')
  if (password !== passwordConfirm) return c.redirect('/admin/setup?error=password')
  if (password.length < 8) return c.redirect('/admin/setup?error=weak')

  const salt = await generateToken()
  const hash = await hashPassword(password, salt)
  await db.prepare('INSERT INTO admin_users (name, email, role, password_hash, salt) VALUES (?, ?, ?, ?, ?)')
    .bind(name, email, 'super', hash, salt).run()

  return c.redirect('/admin/login?setup=1')
})

// ──────────────── 로그인/로그아웃 ────────────────

admin.get('/login', async (c) => {
  const user = await getCurrentUser(c)
  if (user) return c.redirect(user.role === 'cs' ? '/admin/contacts' : '/admin/analytics')
  return c.html(getLoginHTML(c.req.query('error'), c.req.query('setup') === '1', c.req.query('reason')))
})

admin.post('/login', async (c) => {
  const body = await c.req.formData()
  const email = (body.get('email') as string)?.trim() || ''
  const password = (body.get('password') as string) || ''
  const db = c.env.itmoou_db

  // 잠금 여부 확인
  const attempt = await db.prepare('SELECT * FROM login_attempts WHERE email = ?').bind(email).first<{email:string;attempts:number;locked_until:string|null}>()
  if (attempt?.locked_until && attempt.locked_until > new Date().toISOString()) {
    return c.redirect('/admin/login?error=locked')
  }

  const user = await db.prepare('SELECT * FROM admin_users WHERE email = ?').bind(email).first<AdminUser>()
  if (!user) {
    // 존재하지 않는 계정도 시도 카운트 (이메일 노출 방지)
    return c.redirect('/admin/login?error=invalid')
  }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.password_hash) {
    const newAttempts = (attempt?.attempts ?? 0) + 1
    const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null
    await db.prepare('INSERT OR REPLACE INTO login_attempts (email, attempts, locked_until) VALUES (?, ?, ?)')
      .bind(email, newAttempts, lockedUntil).run()
    return c.redirect(newAttempts >= 5 ? '/admin/login?error=locked' : '/admin/login?error=invalid')
  }

  // 로그인 성공 — 시도 횟수 초기화
  await db.prepare('DELETE FROM login_attempts WHERE email = ?').bind(email).run()

  const token = await generateToken()
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  await db.prepare('INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, user.id, expires).run()

  setCookie(c, 'admin_session', token, {
    httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 60 * 60 * 8, path: '/',
  })
  return c.html(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><script>
    sessionStorage.setItem('admin_tab','1');
    window.location.replace('/admin/dashboard');
  </script></body></html>`)
})

admin.get('/logout', async (c) => {
  const token = getCookie(c, 'admin_session')
  if (token) await c.env.itmoou_db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run()
  deleteCookie(c, 'admin_session', { path: '/' })
  const reason = c.req.query('reason')
  return c.redirect(reason ? `/admin/login?reason=${reason}` : '/admin/login')
})

admin.post('/logout', async (c) => {
  const token = getCookie(c, 'admin_session')
  if (token) await c.env.itmoou_db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run()
  deleteCookie(c, 'admin_session', { path: '/' })
  return c.json({ ok: true })
})

// ──────────────── 계정 관리 (슈퍼관리자) ────────────────

const DEPARTMENTS = ['아이티무유', '시스템개발팀', '경영지원팀', '마케팅팀', 'CS전담팀']
const deptOptions = (selected = '') => DEPARTMENTS.map(d =>
  `<option value="${d}" ${selected === d ? 'selected' : ''}>${d}</option>`
).join('')

admin.get('/users', async (c) => {
  const user = await getCurrentUser(c)
  if (user?.role !== 'super') return c.redirect('/admin/contacts')
  const { results } = await c.env.itmoou_db.prepare('SELECT * FROM admin_users ORDER BY created_at ASC').all<AdminUser>()
  const error = c.req.query('error')
  const saved = c.req.query('saved') === '1'

  const rows = results.map(u => `
    <tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td><span style="font-size:0.82rem;color:#555;">${escapeHtml(u.department || '—')}</span></td>
      <td>${u.role === 'super'
        ? '<span style="background:#0052A5;color:#fff;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;font-weight:600;">슈퍼관리자</span>'
        : '<span style="background:#28a745;color:#fff;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;font-weight:600;">CS담당자</span>'}</td>
      <td style="color:#888;font-size:0.85rem;">${u.created_at?.slice(0,10)}</td>
      <td style="white-space:nowrap;">
        <a href="/admin/users/${u.id}/edit" class="btn-sm" style="background:#f0f4ff;color:#0052A5;border:1px solid #c8d8f8;text-decoration:none;padding:0.2rem 0.55rem;border-radius:4px;font-size:0.78rem;font-weight:600;">수정</a>
        ${u.id !== user!.id ? `
        <form method="POST" action="/admin/users/${u.id}/delete" style="display:inline;margin-left:0.25rem;" onsubmit="return confirm('${escapeHtml(u.name)} 계정을 삭제하시겠습니까?')">
          <button type="submit" class="btn-sm btn-delete">삭제</button>
        </form>` : ''}
      </td>
    </tr>`).join('')

  return c.html(adminBase('계정 관리', `
    <div class="admin-page-header"><h2>계정 관리</h2></div>
    ${saved ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-check-circle"></i> 계정이 생성되었습니다.</div>` : ''}
    ${error === 'exists' ? `<div style="background:#fff0f0;color:#d32f2f;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-exclamation-circle"></i> 이미 사용 중인 이메일입니다.</div>` : ''}
    ${error === 'weak' ? `<div style="background:#fff0f0;color:#d32f2f;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-exclamation-circle"></i> 비밀번호는 8자 이상이어야 합니다.</div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">
      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-user-plus"></i> 새 계정 추가</h3>
        <form method="POST" action="/admin/users">
          <div class="form-group">
            <label>이름</label>
            <input type="text" name="name" required placeholder="홍길동">
          </div>
          <div class="form-group">
            <label>이메일</label>
            <div style="display:flex;align-items:center;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
              <input type="text" name="email_local" id="email_local" placeholder="username"
                style="flex:1;padding:0.6rem;border:none;outline:none;font-size:0.9rem;"
                oninput="document.getElementById('email_hidden').value=this.value+'@itmoou.com'">
              <span style="padding:0.6rem 0.75rem;background:#f5f5f5;color:#666;font-size:0.88rem;border-left:1px solid #ddd;white-space:nowrap;">@itmoou.com</span>
            </div>
            <input type="hidden" name="email" id="email_hidden" value="">
          </div>
          <div class="form-group">
            <label>부서</label>
            <select name="department" style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:4px;font-size:0.9rem;">
              <option value="">— 선택</option>
              ${deptOptions()}
            </select>
          </div>
          <div class="form-group">
            <label>역할</label>
            <select name="role" style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:4px;font-size:0.9rem;">
              <option value="cs">CS담당자</option>
              <option value="super">슈퍼관리자</option>
            </select>
          </div>
          <div class="form-group">
            <label>초기 비밀번호 (8자 이상)</label>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <input type="password" id="new_user_pw" name="password" required minlength="8" style="flex:1;">
              <button type="button" onclick="var i=document.getElementById('new_user_pw');i.type=i.type==='password'?'text':'password';this.innerHTML=i.type==='password'?'<i class=\\'fas fa-eye\\'></i>':'<i class=\\'fas fa-eye-slash\\'></i>'"
                style="padding:0.55rem 0.75rem;border:1px solid #ddd;border-radius:4px;background:#f5f5f5;cursor:pointer;color:#666;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary"><i class="fas fa-plus"></i> 계정 추가</button>
          </div>
        </form>
      </div>

      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-users"></i> 계정 목록</h3>
        <table class="admin-table">
          <thead><tr><th>이름</th><th>이메일</th><th>부서</th><th>역할</th><th>생성일</th><th style="width:60px;">관리</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`, user))
})

admin.post('/users', async (c) => {
  const user = await getCurrentUser(c)
  if (user?.role !== 'super') return c.redirect('/admin/contacts')
  const body = await c.req.formData()
  const name = (body.get('name') as string)?.trim() || ''
  const email = (body.get('email') as string)?.trim() || ''
  const role = (body.get('role') as string) || 'cs'
  const department = (body.get('department') as string)?.trim() || ''
  const password = (body.get('password') as string) || ''

  if (password.length < 8) return c.redirect('/admin/users?error=weak')

  const existing = await c.env.itmoou_db.prepare('SELECT id FROM admin_users WHERE email = ?').bind(email).first()
  if (existing) return c.redirect('/admin/users?error=exists')

  const salt = await generateToken()
  const hash = await hashPassword(password, salt)
  await c.env.itmoou_db.prepare('INSERT INTO admin_users (name, email, role, department, password_hash, salt) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(name, email, role, department, hash, salt).run()
  return c.redirect('/admin/users?saved=1')
})

admin.get('/users/:id/edit', async (c) => {
  const currentUser = await getCurrentUser(c)
  if (currentUser?.role !== 'super') return c.redirect('/admin/contacts')
  const id = parseInt(c.req.param('id'))
  const target = await c.env.itmoou_db.prepare('SELECT * FROM admin_users WHERE id = ?').bind(id).first<AdminUser>()
  if (!target) return c.redirect('/admin/users')
  const saved = c.req.query('saved') === '1'

  return c.html(adminBase(`계정 수정 — ${target.name}`, `
    <div class="admin-page-header" style="display:flex;align-items:center;gap:1rem;">
      <a href="/admin/users" style="color:#888;text-decoration:none;font-size:0.9rem;">← 계정 관리</a>
      <h2 style="margin:0;">계정 수정</h2>
    </div>
    ${saved ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-check-circle"></i> 저장되었습니다.</div>` : ''}
    <div style="max-width:480px;">
      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-user-edit"></i> ${escapeHtml(target.name)} 계정 수정</h3>
        <form method="POST" action="/admin/users/${id}/edit">
          <div class="form-group">
            <label>이름</label>
            <input type="text" name="name" value="${escapeHtml(target.name)}" required>
          </div>
          <div class="form-group">
            <label>부서</label>
            <select name="department" style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:4px;font-size:0.9rem;">
              <option value="">— 없음</option>
              ${deptOptions(target.department || '')}
            </select>
          </div>
          <div class="form-group">
            <label>역할</label>
            <select name="role" style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:4px;font-size:0.9rem;">
              <option value="cs" ${target.role === 'cs' ? 'selected' : ''}>CS담당자</option>
              <option value="super" ${target.role === 'super' ? 'selected' : ''}>슈퍼관리자</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary"><i class="fas fa-save"></i> 저장</button>
            <a href="/admin/users" style="margin-left:0.75rem;color:#888;font-size:0.9rem;">취소</a>
          </div>
        </form>
      </div>
    </div>`, currentUser))
})

admin.post('/users/:id/edit', async (c) => {
  const currentUser = await getCurrentUser(c)
  if (currentUser?.role !== 'super') return c.redirect('/admin/contacts')
  const id = parseInt(c.req.param('id'))
  const body = await c.req.formData()
  const name = (body.get('name') as string)?.trim() || ''
  const department = (body.get('department') as string)?.trim() || ''
  const role = (body.get('role') as string) || 'cs'
  await c.env.itmoou_db.prepare('UPDATE admin_users SET name = ?, department = ?, role = ? WHERE id = ?')
    .bind(name, department, role, id).run()
  return c.redirect(`/admin/users/${id}/edit?saved=1`)
})

admin.post('/users/:id/delete', async (c) => {
  const currentUser = await getCurrentUser(c)
  if (currentUser?.role !== 'super') return c.redirect('/admin/contacts')
  const id = parseInt(c.req.param('id'))
  if (id === currentUser.id) return c.redirect('/admin/users')
  await c.env.itmoou_db.prepare('DELETE FROM admin_users WHERE id = ?').bind(id).run()
  await c.env.itmoou_db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').bind(id).run()
  return c.redirect('/admin/users')
})

// ──────────────── 프로필 / 비밀번호 변경 ────────────────

admin.get('/profile', async (c) => {
  const currentToken = getCookie(c, 'admin_session')
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')
  const saved = c.req.query('saved') === '1'
  const error = c.req.query('error')
  const { results: sessions } = await c.env.itmoou_db.prepare(
    "SELECT token, created_at, expires_at FROM admin_sessions WHERE user_id = ? AND expires_at > datetime('now') ORDER BY created_at DESC"
  ).bind(user.id).all<{token:string;created_at:string;expires_at:string}>()

  const sessionRows = sessions.map(s => {
    const isCurrent = s.token === currentToken
    return `<tr>
      <td style="font-family:monospace;font-size:0.78rem;color:#888;">${s.token.slice(0,12)}…</td>
      <td style="font-size:0.82rem;">${s.created_at?.slice(0,16)}</td>
      <td style="font-size:0.82rem;">${s.expires_at?.slice(0,16)}</td>
      <td>
        ${isCurrent
          ? '<span style="background:#e8f5e9;color:#2e7d32;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.78rem;font-weight:600;">현재 세션</span>'
          : `<form method="POST" action="/admin/profile/sessions/${s.token}/delete" style="display:inline;">
              <button type="submit" class="btn-sm btn-delete" style="font-size:0.75rem;padding:0.2rem 0.5rem;">종료</button>
             </form>`}
      </td>
    </tr>`
  }).join('')

  return c.html(adminBase('내 프로필', `
    <div class="admin-page-header"><h2>내 프로필</h2></div>
    ${saved ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-check-circle"></i> 비밀번호가 변경되었습니다.</div>` : ''}
    ${error === 'wrong' ? `<div style="background:#fff0f0;color:#d32f2f;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-exclamation-circle"></i> 현재 비밀번호가 올바르지 않습니다.</div>` : ''}
    ${error === 'mismatch' ? `<div style="background:#fff0f0;color:#d32f2f;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-exclamation-circle"></i> 새 비밀번호가 일치하지 않습니다.</div>` : ''}
    ${error === 'weak' ? `<div style="background:#fff0f0;color:#d32f2f;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-exclamation-circle"></i> 비밀번호는 8자 이상이어야 합니다.</div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start;">
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div class="admin-card">
          <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-user"></i> 계정 정보</h3>
          <table style="width:100%;font-size:0.9rem;">
            <tr><td style="padding:0.5rem 0;color:#888;width:80px;">이름</td><td><strong>${escapeHtml(user.name)}</strong></td></tr>
            <tr><td style="padding:0.5rem 0;color:#888;">이메일</td><td>${escapeHtml(user.email)}</td></tr>
            <tr><td style="padding:0.5rem 0;color:#888;">부서</td><td>${escapeHtml(user.department || '—')}</td></tr>
            <tr><td style="padding:0.5rem 0;color:#888;">역할</td><td>${user.role === 'super'
              ? '<span style="background:#0052A5;color:#fff;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;font-weight:600;">슈퍼관리자</span>'
              : '<span style="background:#28a745;color:#fff;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;font-weight:600;">CS담당자</span>'}</td></tr>
          </table>
          <form method="POST" action="/admin/profile/department" style="margin-top:1rem;display:flex;gap:0.5rem;align-items:center;">
            <select name="department" style="flex:1;padding:0.5rem;border:1px solid #ddd;border-radius:4px;font-size:0.87rem;">
              <option value="">— 부서 없음</option>
              ${deptOptions(user.department || '')}
            </select>
            <button type="submit" class="btn-primary" style="padding:0.5rem 1rem;font-size:0.87rem;white-space:nowrap;"><i class="fas fa-save"></i> 변경</button>
          </form>
        </div>

        <div class="admin-card">
          <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-lock"></i> 비밀번호 변경</h3>
          <form method="POST" action="/admin/profile">
            <div class="form-group">
              <label>현재 비밀번호</label>
              <input type="password" name="current_password" required>
            </div>
            <div class="form-group">
              <label>새 비밀번호 (8자 이상)</label>
              <input type="password" name="new_password" required minlength="8">
            </div>
            <div class="form-group">
              <label>새 비밀번호 확인</label>
              <input type="password" name="new_password_confirm" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary"><i class="fas fa-save"></i> 변경</button>
            </div>
          </form>
        </div>
      </div>

      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-shield-alt"></i> 활성 세션 (${sessions.length}개)</h3>
        <p style="font-size:0.82rem;color:#888;margin-bottom:1rem;">현재 로그인된 모든 세션 목록입니다. 의심스러운 세션은 즉시 종료하세요.</p>
        <table class="admin-table" style="font-size:0.82rem;">
          <thead><tr><th>토큰</th><th>생성일시</th><th>만료일시</th><th style="width:80px;">관리</th></tr></thead>
          <tbody>${sessionRows}</tbody>
        </table>
      </div>
    </div>`, user))
})

admin.post('/profile/sessions/:token/delete', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')
  const token = c.req.param('token')
  // 본인 세션만 삭제 가능
  await c.env.itmoou_db.prepare(
    'DELETE FROM admin_sessions WHERE token = ? AND user_id = ?'
  ).bind(token, user.id).run()
  return c.redirect('/admin/profile')
})

admin.post('/profile/department', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')
  const body = await c.req.formData()
  const department = (body.get('department') as string)?.trim() || ''
  await c.env.itmoou_db.prepare('UPDATE admin_users SET department = ? WHERE id = ?').bind(department, user.id).run()
  return c.redirect('/admin/profile?saved=1')
})

admin.post('/profile', async (c) => {
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')
  const body = await c.req.formData()
  const currentPassword = (body.get('current_password') as string) || ''
  const newPassword = (body.get('new_password') as string) || ''
  const newPasswordConfirm = (body.get('new_password_confirm') as string) || ''

  const currentHash = await hashPassword(currentPassword, user.salt)
  if (currentHash !== user.password_hash) return c.redirect('/admin/profile?error=wrong')
  if (newPassword !== newPasswordConfirm) return c.redirect('/admin/profile?error=mismatch')
  if (newPassword.length < 8) return c.redirect('/admin/profile?error=weak')

  const newSalt = await generateToken()
  const newHash = await hashPassword(newPassword, newSalt)
  await c.env.itmoou_db.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(newHash, newSalt, user.id).run()
  // 기존 세션 모두 만료
  await c.env.itmoou_db.prepare('DELETE FROM admin_sessions WHERE user_id = ?').bind(user.id).run()
  deleteCookie(c, 'admin_session', { path: '/' })
  return c.redirect('/admin/login?setup=1')
})

// ══════════════════════════════════════════════
// 통계 대시보드
// ══════════════════════════════════════════════

admin.get('/analytics', async (c) => {
  const db = c.env.itmoou_db

  // DB 통계
  const [contacts, news, announcements, history] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM contact_submissions WHERE status = 'new'").first<{cnt:number}>(),
    db.prepare('SELECT COUNT(*) as cnt FROM news').first<{cnt:number}>(),
    db.prepare('SELECT COUNT(*) as cnt FROM announcements').first<{cnt:number}>(),
    db.prepare('SELECT COUNT(*) as cnt FROM history_items').first<{cnt:number}>(),
  ])

  const [contactsWeek, recentContacts] = await Promise.all([
    db.prepare("SELECT COUNT(*) as cnt FROM contact_submissions WHERE created_at >= datetime('now','-7 days','+9 hours')").first<{cnt:number}>(),
    db.prepare('SELECT id, name, email, inquiry_type, status, ticket_no, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 5').all<{id:number;name:string;email:string;inquiry_type:string;status:string;ticket_no:string;created_at:string}>(),
  ])

  const [byType, byAssignee, byStatus, monthlyTrend] = await Promise.all([
    db.prepare("SELECT inquiry_type, COUNT(*) as cnt FROM contact_submissions GROUP BY inquiry_type ORDER BY cnt DESC").all<{inquiry_type:string;cnt:number}>(),
    db.prepare("SELECT assigned_to_name, COUNT(*) as cnt, SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) as resolved FROM contact_submissions WHERE assigned_to_name IS NOT NULL AND assigned_to_name != '' GROUP BY assigned_to_name ORDER BY cnt DESC").all<{assigned_to_name:string;cnt:number;resolved:number}>(),
    db.prepare("SELECT status, COUNT(*) as cnt FROM contact_submissions GROUP BY status").all<{status:string;cnt:number}>(),
    db.prepare("SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as cnt FROM contact_submissions GROUP BY month ORDER BY month DESC LIMIT 6").all<{month:string;cnt:number}>(),
  ])

  // Cloudflare Analytics
  const today = new Date()
  const d7 = new Date(today); d7.setDate(d7.getDate() - 7)
  const d30 = new Date(today); d30.setDate(d30.getDate() - 30)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  let cfData: {requests30: number; requests7: number; pageViews30: number; pageViews7: number; visits30: number; visits7: number; daily: {date: string; requests: number; pageViews: number; visits: number}[]} | null = null
  try {
    const query = `{
      viewer {
        accounts(filter: { accountTag: "${CF_ACCOUNT_ID}" }) {
          daily: httpRequestsOverviewAdaptiveGroups(
            filter: { date_geq: "${fmt(d30)}", date_leq: "${fmt(today)}" }
            limit: 31 orderBy: [date_ASC]
          ) { sum { pageViews requests } dimensions { date } }
          rum: rumPageloadEventsAdaptiveGroups(
            filter: { date_geq: "${fmt(d30)}", date_leq: "${fmt(today)}" }
            limit: 31 orderBy: [date_ASC]
          ) { sum { visits } dimensions { date } }
        }
      }
    }`
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${c.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const json = await res.json() as any
    const acc = json?.data?.viewer?.accounts?.[0]
    if (acc) {
      const daily30 = acc.daily ?? []
      const rum30 = acc.rum ?? []
      const rumMap: Record<string, number> = {}
      for (const r of rum30) rumMap[r.dimensions?.date] = r.sum?.visits ?? 0
      const daily7 = daily30.filter((d: any) => d.dimensions?.date >= fmt(d7))
      const rum7 = rum30.filter((d: any) => d.dimensions?.date >= fmt(d7))
      cfData = {
        requests30: daily30.reduce((s: number, d: any) => s + (d.sum?.requests ?? 0), 0),
        requests7: daily7.reduce((s: number, d: any) => s + (d.sum?.requests ?? 0), 0),
        pageViews30: daily30.reduce((s: number, d: any) => s + (d.sum?.pageViews ?? 0), 0),
        pageViews7: daily7.reduce((s: number, d: any) => s + (d.sum?.pageViews ?? 0), 0),
        visits30: rum30.reduce((s: number, d: any) => s + (d.sum?.visits ?? 0), 0),
        visits7: rum7.reduce((s: number, d: any) => s + (d.sum?.visits ?? 0), 0),
        daily: daily30.map((d: any) => ({
          date: d.dimensions?.date,
          requests: d.sum?.requests ?? 0,
          pageViews: d.sum?.pageViews ?? 0,
          visits: rumMap[d.dimensions?.date] ?? 0,
        })),
      }
    }
  } catch {}

  const inquiryLabels: Record<string, string> = {
    product: '제품 문의', solution: '솔루션 문의', support: '기술 지원', partnership: '파트너십', etc: '기타',
  }

  const statCard = (icon: string, label: string, value: string | number, color = '#0052A5') =>
    `<div style="background:#fff;border-radius:10px;padding:1.5rem;box-shadow:0 1px 4px rgba(0,0,0,0.08);display:flex;align-items:center;gap:1rem;">
      <div style="width:48px;height:48px;border-radius:10px;background:${color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="${icon}" style="font-size:1.3rem;color:${color};"></i>
      </div>
      <div>
        <div style="font-size:1.8rem;font-weight:700;color:#111;">${value}</div>
        <div style="font-size:0.82rem;color:#888;">${label}</div>
      </div>
    </div>`

  const cfSection = cfData ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem;">
      ${statCard('fas fa-users', '30일 방문자', cfData.visits30.toLocaleString(), '#0052A5')}
      ${statCard('fas fa-users', '7일 방문자', cfData.visits7.toLocaleString(), '#6f42c1')}
      ${statCard('fas fa-eye', '30일 페이지뷰', cfData.pageViews30.toLocaleString(), '#17a2b8')}
      ${statCard('fas fa-eye', '7일 페이지뷰', cfData.pageViews7.toLocaleString(), '#28a745')}
    </div>
    <div style="background:#fff;border-radius:10px;padding:1.5rem;box-shadow:0 1px 4px rgba(0,0,0,0.08);margin-bottom:2rem;">
      <h3 style="font-size:0.95rem;font-weight:700;color:#333;margin-bottom:1.2rem;">최근 30일 일별 방문자 / 페이지뷰</h3>
      <style>
        .bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; position:relative; }
        .bar-wrap:hover .bar-tip { display:block; }
        .bar-tip {
          display:none; position:absolute; bottom:calc(100% + 4px); left:50%; transform:translateX(-50%);
          background:#222; color:#fff; border-radius:5px; padding:5px 8px; font-size:0.72rem;
          white-space:nowrap; z-index:10; pointer-events:none; line-height:1.5;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
        }
        .bar-tip::after {
          content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
          border:4px solid transparent; border-top-color:#222;
        }
      </style>
      <div style="display:flex;align-items:flex-end;gap:3px;height:80px;">
        ${cfData.daily.map(d => {
          const maxPv = Math.max(...cfData!.daily.map(x => x.pageViews), 1)
          const hPv = Math.max(2, Math.round((d.pageViews / maxPv) * 80))
          const hVis = Math.max(2, Math.round((d.visits / maxPv) * 80))
          return `<div class="bar-wrap">
            <div class="bar-tip">${d.date}<br>방문자: <strong>${d.visits.toLocaleString()}</strong><br>페이지뷰: <strong>${d.pageViews.toLocaleString()}</strong></div>
            <div style="width:100%;display:flex;align-items:flex-end;gap:1px;height:80px;">
              <div style="flex:1;height:${hPv}px;background:#0052A5;border-radius:2px 2px 0 0;cursor:pointer;transition:background 0.15s;"
                onmouseover="this.style.background='#3a7fd4'" onmouseout="this.style.background='#0052A5'" title="페이지뷰"></div>
              <div style="flex:1;height:${hVis}px;background:#6f42c1;border-radius:2px 2px 0 0;cursor:pointer;transition:background 0.15s;"
                onmouseover="this.style.background='#9b6ddd'" onmouseout="this.style.background='#6f42c1'" title="방문자"></div>
            </div>
            <span style="font-size:0.55rem;color:#ccc;">${d.date?.slice(8)}</span>
          </div>`
        }).join('')}
      </div>
      <div style="display:flex;gap:1.5rem;margin-top:0.75rem;font-size:0.8rem;color:#666;">
        <span><span style="display:inline-block;width:10px;height:10px;background:#0052A5;border-radius:2px;margin-right:4px;"></span>페이지뷰</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:#6f42c1;border-radius:2px;margin-right:4px;"></span>방문자</span>
      </div>
    </div>` : `
    <div style="background:#fff;border-radius:10px;padding:1.5rem;box-shadow:0 1px 4px rgba(0,0,0,0.08);margin-bottom:2rem;text-align:center;color:#999;">
      <i class="fas fa-info-circle" style="margin-right:0.4rem;"></i> Cloudflare 트래픽 데이터를 불러올 수 없습니다.
      <a href="https://dash.cloudflare.com/${CF_ACCOUNT_ID}/pages/view/${CF_PAGES_PROJECT}/analytics" target="_blank" style="color:#0052A5;margin-left:0.5rem;">Cloudflare에서 직접 확인 →</a>
    </div>`

  const statusBadge = (s: string) => {
    const map: Record<string, [string,string]> = { new: ['#dc3545','미처리'], in_progress: ['#fd7e14','처리중'], resolved: ['#28a745','완료'] }
    const [color, label] = map[s] ?? ['#888', s]
    return `<span style="background:${color};color:#fff;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.75rem;font-weight:600;">${label}</span>`
  }
  const recentRows = recentContacts.results.length === 0
    ? '<p style="color:#999;text-align:center;padding:1rem;">최근 문의 없음</p>'
    : recentContacts.results.map(r => `
      <a href="/admin/contacts/${r.id}" style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #f0f0f0;text-decoration:none;color:inherit;">
        <div>
          <strong style="font-size:0.9rem;">${escapeHtml(r.name)}</strong>
          <span style="font-size:0.8rem;color:#888;margin-left:0.5rem;">${escapeHtml(r.email)}</span><br>
          <span style="font-family:monospace;font-size:0.75rem;color:#aaa;">TrackingID#${r.ticket_no || '—'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          ${statusBadge(r.status)}
          <span style="background:#e6f0ff;color:#0052A5;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.78rem;">${inquiryLabels[r.inquiry_type] || r.inquiry_type}</span>
          <span style="font-size:0.75rem;color:#bbb;">${r.created_at?.slice(0,16)}</span>
        </div>
      </a>`).join('')

  const user = await getCurrentUser(c)
  return c.html(adminBase('통계 대시보드', `
    <div class="admin-page-header"><h2>통계 대시보드</h2></div>

    <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;">
      <a href="https://dash.cloudflare.com/${CF_ACCOUNT_ID}/pages/view/${CF_PAGES_PROJECT}/analytics" target="_blank"
        style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;background:#f6821f;color:#fff;border-radius:6px;font-size:0.85rem;text-decoration:none;font-weight:600;">
        <i class="fas fa-cloud"></i> Cloudflare Analytics
      </a>
      <a href="https://search.google.com/search-console" target="_blank"
        style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;background:#4285F4;color:#fff;border-radius:6px;font-size:0.85rem;text-decoration:none;font-weight:600;">
        <i class="fab fa-google"></i> Google Search Console
      </a>
      <a href="https://searchadvisor.naver.com" target="_blank"
        style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;background:#03C75A;color:#fff;border-radius:6px;font-size:0.85rem;text-decoration:none;font-weight:600;">
        <i class="fas fa-search"></i> 네이버 Search Advisor
      </a>
    </div>

    <h3 style="font-size:0.9rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1rem;">트래픽</h3>
    ${cfSection}

    <h3 style="font-size:0.9rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1rem;">콘텐츠 현황</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:2rem;">
      ${statCard('fas fa-envelope-open-text', '미처리 문의', contacts?.cnt ?? 0, '#dc3545')}
      ${statCard('fas fa-calendar-week', '이번 주 문의', contactsWeek?.cnt ?? 0, '#6f42c1')}
      ${statCard('fas fa-newspaper', '뉴스 항목', news?.cnt ?? 0, '#28a745')}
      ${statCard('fas fa-bullhorn', '공고', announcements?.cnt ?? 0, '#fd7e14')}
      ${statCard('fas fa-history', '연혁', history?.cnt ?? 0, '#17a2b8')}
    </div>

    <h3 style="font-size:0.9rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1rem;">최근 문의</h3>
    <div style="background:#fff;border-radius:10px;padding:1.2rem 1.5rem;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
      ${recentRows}
      <div style="text-align:right;margin-top:0.75rem;">
        <a href="/admin/contacts" style="font-size:0.85rem;color:#0052A5;">전체 문의 보기 →</a>
      </div>
    </div>

    <h3 style="font-size:0.9rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:2rem 0 1rem;">문의 통계</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5rem;margin-bottom:2rem;">
      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1.2rem;"><i class="fas fa-chart-pie"></i> 유형별 문의</h3>
        ${byType.results.length === 0 ? '<p style="color:#999;text-align:center;">데이터 없음</p>' : (() => {
          const maxT = Math.max(...byType.results.map(r => r.cnt), 1)
          return byType.results.map(r => `
            <div style="margin-bottom:0.6rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.2rem;">
                <span>${CS_INQUIRY_LABELS[r.inquiry_type] || r.inquiry_type}</span>
                <strong>${r.cnt}</strong>
              </div>
              <div style="background:#f0f0f0;border-radius:3px;height:8px;">
                <div style="background:#0052A5;width:${Math.round(r.cnt/maxT*100)}%;height:8px;border-radius:3px;"></div>
              </div>
            </div>`).join('')
        })()}
      </div>
      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#28a745;margin-bottom:1.2rem;"><i class="fas fa-user-tie"></i> 담당자별 처리</h3>
        ${byAssignee.results.length === 0 ? '<p style="color:#999;text-align:center;">데이터 없음</p>' : (() => {
          const maxA = Math.max(...byAssignee.results.map(r => r.cnt), 1)
          return byAssignee.results.map(r => `
            <div style="margin-bottom:0.6rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.2rem;">
                <span>${escapeHtml(r.assigned_to_name)}</span>
                <strong>${r.cnt} <span style="color:#28a745;font-size:0.78rem;">(완료 ${r.resolved})</span></strong>
              </div>
              <div style="background:#f0f0f0;border-radius:3px;height:8px;">
                <div style="background:#28a745;width:${Math.round(r.cnt/maxA*100)}%;height:8px;border-radius:3px;"></div>
              </div>
            </div>`).join('')
        })()}
      </div>
      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#fd7e14;margin-bottom:1.2rem;"><i class="fas fa-tasks"></i> 상태별 문의</h3>
        ${byStatus.results.length === 0 ? '<p style="color:#999;text-align:center;">데이터 없음</p>' : (() => {
          const maxS = Math.max(...byStatus.results.map(r => r.cnt), 1)
          return byStatus.results.map(r => {
            const [color] = CS_STATUS_MAP[r.status] ?? ['#888']
            return `
            <div style="margin-bottom:0.6rem;">
              <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.2rem;">
                <span>${CS_STATUS_MAP[r.status]?.[1] || r.status}</span>
                <strong>${r.cnt}</strong>
              </div>
              <div style="background:#f0f0f0;border-radius:3px;height:8px;">
                <div style="background:${color};width:${Math.round(r.cnt/maxS*100)}%;height:8px;border-radius:3px;"></div>
              </div>
            </div>`
          }).join('')
        })()}
      </div>
    </div>
    <div class="admin-card" style="margin-bottom:2rem;">
      <h3 style="font-size:0.95rem;font-weight:700;color:#17a2b8;margin-bottom:1.2rem;"><i class="fas fa-chart-line"></i> 월별 문의 추이 (최근 6개월)</h3>
      ${monthlyTrend.results.length === 0 ? '<p style="color:#999;text-align:center;">데이터 없음</p>' : (() => {
        const maxM = Math.max(...monthlyTrend.results.map(r => r.cnt), 1)
        const sorted = [...monthlyTrend.results].reverse()
        return `<div style="display:flex;align-items:flex-end;gap:8px;height:80px;margin-bottom:0.5rem;">
          ${sorted.map(r => {
            const h = Math.max(4, Math.round(r.cnt / maxM * 80))
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
              <span style="font-size:0.72rem;color:#555;font-weight:600;">${r.cnt}</span>
              <div style="width:100%;height:${h}px;background:#17a2b8;border-radius:3px 3px 0 0;"></div>
              <span style="font-size:0.65rem;color:#aaa;">${r.month?.slice(5)}</span>
            </div>`
          }).join('')}
        </div>`
      })()}
    </div>`, user))
})

// ══════════════════════════════════════════════
// 페이지 섹션 관리
// ══════════════════════════════════════════════

type FieldType = 'text' | 'textarea' | 'html' | 'image'
type FieldConfig = { key: string; label: string; type: FieldType }
type PageConfig = { label: string; fields: FieldConfig[] }

const PAGE_CONFIGS: Record<string, PageConfig> = {
  'company': {
    label: 'ITMoou 회사소개 관리',
    fields: [
      { key: 'subtitle', label: '헤더 부제목', type: 'text' as FieldType },
      { key: 'about_title', label: '소개 섹션 제목', type: 'text' as FieldType },
      { key: 'about_intro', label: '소개 첫 번째 문단', type: 'textarea' as FieldType },
      { key: 'about_desc', label: '소개 두 번째 문단', type: 'textarea' as FieldType },
      { key: 'vision_desc', label: 'Vision 설명', type: 'textarea' as FieldType },
      { key: 'mission_desc', label: 'Mission 설명', type: 'textarea' as FieldType },
      { key: 'core_values_desc', label: 'Core Values 설명', type: 'text' as FieldType },
      { key: 'about_image', label: '소개 섹션 이미지', type: 'image' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'location': {
    label: '오시는 길 관리',
    fields: [
      { key: 'address_detail', label: '주소', type: 'text' as FieldType },
      { key: 'phone', label: '전화번호', type: 'text' as FieldType },
      { key: 'email', label: '이메일', type: 'text' as FieldType },
      { key: 'car_direction', label: '자가용 안내', type: 'text' as FieldType },
      { key: 'parking', label: '주차 안내', type: 'text' as FieldType },
      { key: 'map_embed', label: '카카오맵 HTML (지도 퍼가기 코드)', type: 'html' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'ceo': {
    label: 'CEO 메시지 관리',
    fields: [
      { key: 'message1', label: '첫 번째 문단', type: 'textarea' as FieldType },
      { key: 'message2', label: '두 번째 문단', type: 'textarea' as FieldType },
      { key: 'message3', label: '세 번째 문단', type: 'textarea' as FieldType },
      { key: 'message4', label: '네 번째 문단', type: 'textarea' as FieldType },
      { key: 'message5', label: '다섯 번째 문단', type: 'textarea' as FieldType },
      { key: 'message6', label: '여섯 번째 문단', type: 'textarea' as FieldType },
      { key: 'signature', label: '서명', type: 'text' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'esg': {
    label: 'ESG 관리',
    fields: [
      { key: 'env_title', label: 'Environment 제목', type: 'text' as FieldType },
      { key: 'env_desc', label: 'Environment 설명', type: 'textarea' as FieldType },
      { key: 'social_title', label: 'Social 제목', type: 'text' as FieldType },
      { key: 'social_desc', label: 'Social 설명', type: 'textarea' as FieldType },
      { key: 'gov_title', label: 'Governance 제목', type: 'text' as FieldType },
      { key: 'gov_desc', label: 'Governance 설명', type: 'textarea' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'customer': {
    label: '고객지원 관리',
    fields: [
      { key: 'tech_title', label: '기술 지원 제목', type: 'text' as FieldType },
      { key: 'tech_desc', label: '기술 지원 설명', type: 'textarea' as FieldType },
      { key: 'training_title', label: '제품 교육 제목', type: 'text' as FieldType },
      { key: 'training_desc', label: '제품 교육 설명', type: 'textarea' as FieldType },
      { key: 'maintenance_title', label: '유지보수 제목', type: 'text' as FieldType },
      { key: 'maintenance_desc', label: '유지보수 설명', type: 'textarea' as FieldType },
      { key: 'hours', label: '운영 시간', type: 'text' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'rnd-lab': {
    label: '연구소 관리',
    fields: [
      { key: 'intro', label: '연구소 소개', type: 'textarea' as FieldType },
      { key: 'facility_title', label: '시설 제목', type: 'text' as FieldType },
      { key: 'facility_desc', label: '시설 설명', type: 'textarea' as FieldType },
      { key: 'expert_title', label: '인력 제목', type: 'text' as FieldType },
      { key: 'expert_desc', label: '인력 설명', type: 'textarea' as FieldType },
      { key: 'cooperation_title', label: '협력 제목', type: 'text' as FieldType },
      { key: 'cooperation_desc', label: '협력 설명', type: 'textarea' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'rnd-activities': {
    label: '연구개발 활동 관리',
    fields: [
      { key: 'intro', label: '활동 소개', type: 'textarea' as FieldType },
      { key: 'act1_title', label: '활동 1 제목', type: 'text' as FieldType },
      { key: 'act1_desc', label: '활동 1 설명', type: 'textarea' as FieldType },
      { key: 'act2_title', label: '활동 2 제목', type: 'text' as FieldType },
      { key: 'act2_desc', label: '활동 2 설명', type: 'textarea' as FieldType },
      { key: 'act3_title', label: '활동 3 제목', type: 'text' as FieldType },
      { key: 'act3_desc', label: '활동 3 설명', type: 'textarea' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'talent': {
    label: '인재상 관리',
    fields: [
      { key: 'card1_title', label: '인재상 1 제목', type: 'text' as FieldType },
      { key: 'card1_desc', label: '인재상 1 설명', type: 'textarea' as FieldType },
      { key: 'card2_title', label: '인재상 2 제목', type: 'text' as FieldType },
      { key: 'card2_desc', label: '인재상 2 설명', type: 'textarea' as FieldType },
      { key: 'card3_title', label: '인재상 3 제목', type: 'text' as FieldType },
      { key: 'card3_desc', label: '인재상 3 설명', type: 'textarea' as FieldType },
      { key: 'card4_title', label: '인재상 4 제목', type: 'text' as FieldType },
      { key: 'card4_desc', label: '인재상 4 설명', type: 'textarea' as FieldType },
      { key: 'card5_title', label: '인재상 5 제목', type: 'text' as FieldType },
      { key: 'card5_desc', label: '인재상 5 설명', type: 'textarea' as FieldType },
      { key: 'card6_title', label: '인재상 6 제목', type: 'text' as FieldType },
      { key: 'card6_desc', label: '인재상 6 설명', type: 'textarea' as FieldType },
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'seo-home': {
    label: '홈 SEO 설정',
    fields: [
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'seo-company': {
    label: '회사소개 SEO',
    fields: [
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'seo-ceo': {
    label: 'CEO 메시지 SEO',
    fields: [
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'seo-customer': {
    label: '솔루션/고객지원 SEO',
    fields: [
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'seo-rnd-lab': {
    label: '연구개발 SEO',
    fields: [
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
  'seo-talent': {
    label: '채용 SEO',
    fields: [
      { key: 'seo_title', label: 'SEO 제목 (브라우저 탭/검색결과)', type: 'text' as FieldType },
      { key: 'seo_description', label: 'SEO 설명 (검색결과 미리보기, 150자 이내)', type: 'textarea' as FieldType },
    ],
  },
}

const STUB_PAGE_LABELS: Record<string, string> = {
  'contact': 'Contact Us 관리',
}

admin.get('/pages/:page', async (c) => {
  const page = c.req.param('page')
  const config = PAGE_CONFIGS[page]
  const user = await getCurrentUser(c)
  if (!config) {
    const label = STUB_PAGE_LABELS[page] || '페이지 관리'
    return c.html(adminBase(label, `
      <div class="admin-page-header"><h2>${label}</h2></div>
      <div class="admin-card" style="padding:3rem;text-align:center;">
        <i class="fas fa-tools" style="font-size:3rem;color:#ccc;margin-bottom:1rem;display:block;"></i>
        <h3 style="color:#888;font-weight:500;margin-bottom:0.5rem;">준비 중</h3>
        <p style="color:#aaa;font-size:0.9rem;">이 기능은 곧 제공될 예정입니다.</p>
      </div>`, user))
  }
  const { results } = await c.env.itmoou_db.prepare(
    'SELECT section_key, content FROM page_sections WHERE page = ?'
  ).bind(page).all<{section_key: string; content: string}>()
  const sections: Record<string, string> = {}
  for (const r of results) sections[r.section_key] = r.content
  const saved = c.req.query('saved') === '1'
  return c.html(getPageSectionsFormHTML(page, config, sections, saved, user))
})

admin.post('/pages/:page', async (c) => {
  const page = c.req.param('page')
  const config = PAGE_CONFIGS[page]
  if (!config) return c.redirect(`/admin/pages/${page}`)
  const body = await c.req.formData()
  const db = c.env.itmoou_db
  for (const field of config.fields) {
    if (field.type === 'image') {
      const removeFlag = body.get(field.key + '_remove') === '1'
      const file = body.get(field.key + '_file') as File | null
      if (removeFlag) {
        const existing = await db.prepare('SELECT content FROM page_sections WHERE page = ? AND section_key = ?').bind(page, field.key).first<{content:string}>()
        if (existing?.content) await c.env.itmoou_files.delete(existing.content).catch(() => {})
        await db.prepare('INSERT OR REPLACE INTO page_sections (page, section_key, content) VALUES (?, ?, ?)').bind(page, field.key, '').run()
      } else if (file && file.size > 0) {
        const r2Key = `page-images/${page}/${field.key}/${Date.now()}_${file.name}`
        await c.env.itmoou_files.put(r2Key, file.stream(), { httpMetadata: { contentType: file.type || 'image/jpeg' } })
        const existing = await db.prepare('SELECT content FROM page_sections WHERE page = ? AND section_key = ?').bind(page, field.key).first<{content:string}>()
        if (existing?.content) await c.env.itmoou_files.delete(existing.content).catch(() => {})
        await db.prepare('INSERT OR REPLACE INTO page_sections (page, section_key, content) VALUES (?, ?, ?)').bind(page, field.key, r2Key).run()
      }
    } else {
      const value = (body.get(field.key) as string) ?? ''
      await db.prepare('INSERT OR REPLACE INTO page_sections (page, section_key, content) VALUES (?, ?, ?)')
        .bind(page, field.key, value).run()
      if (field.type !== 'html') {
        const valueEn = (body.get(field.key + '_en') as string) ?? ''
        await db.prepare('INSERT OR REPLACE INTO page_sections (page, section_key, content) VALUES (?, ?, ?)')
          .bind(page, field.key + '_en', valueEn).run()
      }
    }
  }
  return c.redirect(`/admin/pages/${page}?saved=1`)
})

// ══════════════════════════════════════════════
// 공고 관리
// ══════════════════════════════════════════════

admin.get('/announcements', async (c) => {
  const db = c.env.itmoou_db
  const user = await getCurrentUser(c)
  const { results } = await db.prepare('SELECT * FROM announcements ORDER BY number DESC').all<Announcement>()
  return c.html(getAdminListHTML(results, user))
})

admin.get('/announcements/new', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(getAnnouncementFormHTML(undefined, undefined, undefined, user))
})

admin.post('/announcements', async (c) => {
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files
  const body = await c.req.formData()

  const title = (body.get('title') as string)?.trim()
  const content = (body.get('content') as string)?.trim()
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const content_en = (body.get('content_en') as string)?.trim() || ''
  const category = (body.get('category') as string)?.trim()
  const notice_date = (body.get('notice_date') as string)?.trim()

  if (!title || !content || !category || !notice_date)
    return c.html(getAnnouncementFormHTML(undefined, '모든 필수 항목을 입력해주세요.'), 400)

  const newItem = await db.prepare(`
    INSERT INTO announcements (number, category, title, content, title_en, content_en, notice_date)
    VALUES (COALESCE((SELECT MAX(number) FROM announcements), 0) + 1, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(category, title, content, title_en, content_en, notice_date).first<Announcement>()

  if (!newItem) return c.html(getAnnouncementFormHTML(undefined, '저장 중 오류가 발생했습니다.'), 500)

  const files = body.getAll('files') as File[]
  for (const file of files) {
    if (!file || file.size === 0) continue
    const key = `announcements/${newItem.id}/${Date.now()}_${file.name}`
    await r2.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } })
    await db.prepare('INSERT INTO attachments (announcement_id, filename, storage_key, size) VALUES (?, ?, ?, ?)')
      .bind(newItem.id, file.name, key, file.size).run()
  }

  return c.redirect('/admin/announcements')
})

admin.get('/announcements/:id/edit', async (c) => {
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const [item, attachmentsResult, user] = await Promise.all([
    db.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first<Announcement>(),
    db.prepare('SELECT * FROM attachments WHERE announcement_id = ?').bind(id).all<Attachment>(),
    getCurrentUser(c),
  ])
  if (!item) return c.notFound()
  return c.html(getAnnouncementFormHTML(item, undefined, attachmentsResult.results, user))
})

admin.post('/announcements/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files
  const body = await c.req.formData()

  const _method = body.get('_method') as string
  if (_method === 'DELETE') {
    const { results: attachments } = await db.prepare('SELECT * FROM attachments WHERE announcement_id = ?').bind(id).all<Attachment>()
    for (const a of attachments) await r2.delete(a.storage_key)
    await db.prepare('DELETE FROM announcements WHERE id = ?').bind(id).run()
    return c.redirect('/admin/announcements')
  }

  const title = (body.get('title') as string)?.trim()
  const content = (body.get('content') as string)?.trim()
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const content_en = (body.get('content_en') as string)?.trim() || ''
  const category = (body.get('category') as string)?.trim()
  const notice_date = (body.get('notice_date') as string)?.trim()

  if (!title || !content || !category || !notice_date) {
    const item = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first<Announcement>()
    const { results: attachments } = await db.prepare('SELECT * FROM attachments WHERE announcement_id = ?').bind(id).all<Attachment>()
    return c.html(getAnnouncementFormHTML(item ?? undefined, '모든 필수 항목을 입력해주세요.', attachments), 400)
  }

  await db.prepare(`
    UPDATE announcements SET title=?, content=?, title_en=?, content_en=?, category=?, notice_date=?,
    updated_at=datetime('now','+9 hours') WHERE id=?
  `).bind(title, content, title_en, content_en, category, notice_date, id).run()

  const files = body.getAll('files') as File[]
  for (const file of files) {
    if (!file || file.size === 0) continue
    const key = `announcements/${id}/${Date.now()}_${file.name}`
    await r2.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } })
    await db.prepare('INSERT INTO attachments (announcement_id, filename, storage_key, size) VALUES (?, ?, ?, ?)')
      .bind(id, file.name, key, file.size).run()
  }

  const deleteIds = body.getAll('delete_attachment') as string[]
  for (const aid of deleteIds) {
    const a = await db.prepare('SELECT * FROM attachments WHERE id = ? AND announcement_id = ?')
      .bind(parseInt(aid), id).first<Attachment>()
    if (a) { await r2.delete(a.storage_key); await db.prepare('DELETE FROM attachments WHERE id = ?').bind(a.id).run() }
  }

  return c.redirect('/admin/announcements')
})

// ══════════════════════════════════════════════
// 뉴스 관리
// ══════════════════════════════════════════════

admin.get('/news', async (c) => {
  const [newsResult, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM news ORDER BY order_num ASC').all<NewsItem>(),
    getCurrentUser(c),
  ])
  const results = newsResult.results
  return c.html(adminBase('회사소식 관리', `
    <div class="admin-page-header">
      <h2>회사소식 관리</h2>
      <a href="/admin/news/new" class="btn-primary"><i class="fas fa-plus"></i> 뉴스 작성</a>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>제목</th><th style="width:120px;">날짜</th><th style="width:120px;">관리</th></tr></thead>
        <tbody>${results.length === 0
          ? '<tr><td colspan="3" style="text-align:center;padding:3rem;color:#999;">등록된 뉴스가 없습니다.</td></tr>'
          : results.map(n => `<tr>
              <td>${escapeHtml(n.title)}</td>
              <td>${n.date}</td>
              <td>
                <a href="/admin/news/${n.id}/edit" class="btn-sm btn-edit">수정</a>
                <form method="POST" action="/admin/news/${n.id}/delete" style="display:inline;" onsubmit="return confirm('삭제하시겠습니까?')">
                  <button type="submit" class="btn-sm btn-delete">삭제</button>
                </form>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`, user))
})

admin.get('/news/new', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(getNewsFormHTML(undefined, undefined, user))
})

admin.post('/news', async (c) => {
  const body = await c.req.formData()
  const title = (body.get('title') as string)?.trim()
  const description = (body.get('description') as string)?.trim()
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const description_en = (body.get('description_en') as string)?.trim() || ''
  const date = (body.get('date') as string)?.trim()
  if (!title || !description || !date) return c.html(getNewsFormHTML(undefined, '모든 항목을 입력해주세요.'), 400)
  const { results } = await c.env.itmoou_db.prepare('SELECT MAX(order_num) as max_num FROM news').all<{max_num: number}>()
  const nextOrder = (results[0]?.max_num ?? 0) + 1
  await c.env.itmoou_db.prepare('INSERT INTO news (title, description, title_en, description_en, date, order_num) VALUES (?, ?, ?, ?, ?, ?)').bind(title, description, title_en, description_en, date, nextOrder).run()
  return c.redirect('/admin/news')
})

admin.get('/news/:id/edit', async (c) => {
  const [item, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM news WHERE id = ?').bind(parseInt(c.req.param('id'))).first<NewsItem>(),
    getCurrentUser(c),
  ])
  if (!item) return c.notFound()
  return c.html(getNewsFormHTML(item, undefined, user))
})

admin.post('/news/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.formData()
  const title = (body.get('title') as string)?.trim()
  const description = (body.get('description') as string)?.trim()
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const description_en = (body.get('description_en') as string)?.trim() || ''
  const date = (body.get('date') as string)?.trim()
  if (!title || !description || !date) {
    const item = await c.env.itmoou_db.prepare('SELECT * FROM news WHERE id = ?').bind(id).first<NewsItem>()
    return c.html(getNewsFormHTML(item ?? undefined, '모든 항목을 입력해주세요.'), 400)
  }
  await c.env.itmoou_db.prepare(`UPDATE news SET title=?, description=?, title_en=?, description_en=?, date=?, updated_at=datetime('now','+9 hours') WHERE id=?`).bind(title, description, title_en, description_en, date, id).run()
  return c.redirect('/admin/news')
})

admin.post('/news/:id/delete', async (c) => {
  await c.env.itmoou_db.prepare('DELETE FROM news WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/news')
})

// ══════════════════════════════════════════════
// 슬라이더 관리
// ══════════════════════════════════════════════

admin.get('/slides', async (c) => {
  const [slidesResult, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM slides ORDER BY order_num ASC').all<SlideItem>(),
    getCurrentUser(c),
  ])
  const results = slidesResult.results
  return c.html(adminBase('슬라이더 관리', `
    <div class="admin-page-header"><h2>슬라이더 관리</h2></div>
    <p style="color:#888;font-size:0.9rem;margin-bottom:1.5rem;">메인 홈페이지 슬라이더 텍스트를 수정합니다. 이미지 파일(slide1.jpg 등)은 별도 관리됩니다.</p>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th style="width:60px;">순서</th><th>제목</th><th>이미지</th><th style="width:80px;">활성</th><th style="width:80px;">관리</th></tr></thead>
        <tbody>${results.map(s => `<tr>
          <td>${s.order_num + 1}</td>
          <td>${escapeHtml(s.title)}</td>
          <td><code>${s.image_filename}</code></td>
          <td>${s.active ? '<span style="color:#2e7d32;">●</span>' : '<span style="color:#ccc;">●</span>'}</td>
          <td><a href="/admin/slides/${s.id}/edit" class="btn-sm btn-edit">수정</a></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`, user))
})

admin.get('/slides/:id/edit', async (c) => {
  const [item, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM slides WHERE id = ?').bind(parseInt(c.req.param('id'))).first<SlideItem>(),
    getCurrentUser(c),
  ])
  if (!item) return c.notFound()
  return c.html(adminBase('슬라이드 수정', `
    <div class="admin-page-header">
      <h2>슬라이드 수정</h2>
      <a href="/admin/slides" class="btn-secondary"><i class="fas fa-arrow-left"></i> 목록으로</a>
    </div>
    <div class="admin-card">
      <form method="POST" action="/admin/slides/${item.id}">
        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label>이미지 파일명</label>
            <input type="text" name="image_filename" value="${escapeHtml(item.image_filename)}" placeholder="slide1.jpg">
          </div>
          <div class="form-group" style="flex:0 0 120px;">
            <label>활성</label>
            <select name="active">
              <option value="1" ${item.active ? 'selected' : ''}>활성</option>
              <option value="0" ${!item.active ? 'selected' : ''}>비활성</option>
            </select>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin:0 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e0e8ff;">
          <span>🇰🇷</span><h3 style="color:#0052A5;font-size:0.95rem;font-weight:700;margin:0;">한국어</h3>
        </div>
        <div class="form-group">
          <label>제목 <span class="required">*</span></label>
          <input type="text" name="title" value="${escapeHtml(item.title)}" required>
        </div>
        <div class="form-group">
          <label>설명 <span class="required">*</span></label>
          <input type="text" name="description" value="${escapeHtml(item.description)}" required>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin:1.5rem 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e8e0ff;padding-top:1rem;border-top:2px solid #e8e0ff;">
          <span>🇺🇸</span><h3 style="color:#6f42c1;font-size:0.95rem;font-weight:700;margin:0;">English</h3>
          <span style="font-size:0.78rem;color:#888;">비워두면 한국어가 그대로 표시됩니다.</span>
        </div>
        <div class="form-group">
          <label>Title (English)</label>
          <input type="text" name="title_en" value="${escapeHtml(item.title_en || '')}">
        </div>
        <div class="form-group">
          <label>Description (English)</label>
          <input type="text" name="description_en" value="${escapeHtml(item.description_en || '')}">
        </div>
        <div class="form-actions">
          <a href="/admin/slides" class="btn-secondary">취소</a>
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> 저장</button>
        </div>
      </form>
    </div>`, user))
})

admin.post('/slides/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.formData()
  const title = (body.get('title') as string)?.trim()
  const description = (body.get('description') as string)?.trim()
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const description_en = (body.get('description_en') as string)?.trim() || ''
  const image_filename = (body.get('image_filename') as string)?.trim() || 'slide1.jpg'
  const active = body.get('active') === '1' ? 1 : 0
  await c.env.itmoou_db.prepare('UPDATE slides SET title=?, description=?, title_en=?, description_en=?, image_filename=?, active=? WHERE id=?').bind(title, description, title_en, description_en, image_filename, active, id).run()
  return c.redirect('/admin/slides')
})

// ══════════════════════════════════════════════
// 연혁 관리
// ══════════════════════════════════════════════

admin.get('/history', async (c) => {
  const [histResult, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM history_items ORDER BY order_num ASC').all<HistoryItem>(),
    getCurrentUser(c),
  ])
  const results = histResult.results
  return c.html(adminBase('연혁 관리', `
    <div class="admin-page-header">
      <h2>연혁 관리</h2>
      <a href="/admin/history/new" class="btn-primary"><i class="fas fa-plus"></i> 항목 추가</a>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th style="width:80px;">연도</th><th>내용</th><th style="width:120px;">관리</th></tr></thead>
        <tbody>${results.length === 0
          ? '<tr><td colspan="3" style="text-align:center;padding:3rem;color:#999;">연혁이 없습니다.</td></tr>'
          : results.map(h => `<tr>
              <td><strong>${h.year}</strong></td>
              <td>${escapeHtml(h.content)}</td>
              <td>
                <a href="/admin/history/${h.id}/edit" class="btn-sm btn-edit">수정</a>
                <form method="POST" action="/admin/history/${h.id}/delete" style="display:inline;" onsubmit="return confirm('삭제하시겠습니까?')">
                  <button type="submit" class="btn-sm btn-delete">삭제</button>
                </form>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`, user))
})

admin.get('/history/new', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(getHistoryFormHTML(undefined, undefined, user))
})

admin.post('/history', async (c) => {
  const body = await c.req.formData()
  const year = (body.get('year') as string)?.trim()
  const content = (body.get('content') as string)?.trim()
  const content_en = (body.get('content_en') as string)?.trim() || ''
  if (!year || !content) return c.html(getHistoryFormHTML(undefined, '모든 항목을 입력해주세요.'), 400)
  const { results } = await c.env.itmoou_db.prepare('SELECT MAX(order_num) as max_num FROM history_items').all<{max_num: number}>()
  const nextOrder = (results[0]?.max_num ?? 0) + 1
  await c.env.itmoou_db.prepare('INSERT INTO history_items (year, content, content_en, order_num) VALUES (?, ?, ?, ?)').bind(year, content, content_en, nextOrder).run()
  return c.redirect('/admin/history')
})

admin.get('/history/:id/edit', async (c) => {
  const [item, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM history_items WHERE id = ?').bind(parseInt(c.req.param('id'))).first<HistoryItem>(),
    getCurrentUser(c),
  ])
  if (!item) return c.notFound()
  return c.html(getHistoryFormHTML(item, undefined, user))
})

admin.post('/history/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.formData()
  const year = (body.get('year') as string)?.trim()
  const content = (body.get('content') as string)?.trim()
  const content_en = (body.get('content_en') as string)?.trim() || ''
  if (!year || !content) {
    const item = await c.env.itmoou_db.prepare('SELECT * FROM history_items WHERE id = ?').bind(id).first<HistoryItem>()
    return c.html(getHistoryFormHTML(item ?? undefined, '모든 항목을 입력해주세요.'), 400)
  }
  await c.env.itmoou_db.prepare('UPDATE history_items SET year=?, content=?, content_en=? WHERE id=?').bind(year, content, content_en, id).run()
  return c.redirect('/admin/history')
})

admin.post('/history/:id/delete', async (c) => {
  await c.env.itmoou_db.prepare('DELETE FROM history_items WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/history')
})

// ══════════════════════════════════════════════
// 솔루션 관리
// ══════════════════════════════════════════════

admin.get('/solutions', (c) => c.redirect('/admin/solutions/loginexio'))

admin.get('/solutions/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db = c.env.itmoou_db
  const [sol, featuresResult, user] = await Promise.all([
    db.prepare('SELECT * FROM solutions WHERE slug = ?').bind(slug).first<SolutionData>(),
    db.prepare('SELECT * FROM solution_features WHERE solution_slug = ? ORDER BY order_num ASC').bind(slug).all<SolutionFeature>(),
    getCurrentUser(c),
  ])
  if (!sol) return c.notFound()
  return c.html(getSolutionPageHTML(sol, featuresResult.results, user))
})

admin.post('/solutions/:slug', async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.formData()
  const subtitle = (body.get('subtitle') as string)?.trim() || ''
  const description = (body.get('description') as string)?.trim() || ''
  const subtitle_en = (body.get('subtitle_en') as string)?.trim() || ''
  const description_en = (body.get('description_en') as string)?.trim() || ''
  await c.env.itmoou_db.prepare(
    `UPDATE solutions SET subtitle=?, description=?, subtitle_en=?, description_en=?, updated_at=datetime('now','+9 hours') WHERE slug=?`
  ).bind(subtitle, description, subtitle_en, description_en, slug).run()
  return c.redirect(`/admin/solutions/${slug}`)
})

// 기능 추가 폼
admin.get('/solutions/:slug/features/new', async (c) => {
  const user = await getCurrentUser(c)
  return c.html(getSolutionFeatureFormHTML(c.req.param('slug'), undefined, user))
})

// 기능 저장
admin.post('/solutions/:slug/features', async (c) => {
  const slug = c.req.param('slug')
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files
  const body = await c.req.formData()

  const title = (body.get('title') as string)?.trim() || ''
  const description = (body.get('description') as string)?.trim() || ''
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const description_en = (body.get('description_en') as string)?.trim() || ''
  const icon = (body.get('icon') as string)?.trim() || 'fas fa-star'
  const image_position = (body.get('image_position') as string) || 'right'

  const maxOrder = await db.prepare('SELECT MAX(order_num) as m FROM solution_features WHERE solution_slug = ?')
    .bind(slug).first<{m: number | null}>()
  const order_num = (maxOrder?.m ?? 0) + 1

  const result = await db.prepare(
    'INSERT INTO solution_features (solution_slug, order_num, title, description, title_en, description_en, icon, image_key, image_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id'
  ).bind(slug, order_num, title, description, title_en, description_en, icon, '', image_position).first<{id: number}>()

  if (result?.id) {
    const file = body.get('image') as File
    if (file && file.size > 0) {
      const key = `solution-features/${result.id}/${Date.now()}_${file.name}`
      await r2.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'image/jpeg' } })
      await db.prepare('UPDATE solution_features SET image_key = ? WHERE id = ?').bind(key, result.id).run()
    }
  }

  return c.redirect(`/admin/solutions/${slug}`)
})

// 기능 수정 폼
admin.get('/solutions/:slug/features/:id/edit', async (c) => {
  const slug = c.req.param('slug')
  const id = parseInt(c.req.param('id'))
  const [feature, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT * FROM solution_features WHERE id = ? AND solution_slug = ?').bind(id, slug).first<SolutionFeature>(),
    getCurrentUser(c),
  ])
  if (!feature) return c.notFound()
  return c.html(getSolutionFeatureFormHTML(slug, feature, user))
})

// 기능 수정 저장
admin.post('/solutions/:slug/features/:id', async (c) => {
  const slug = c.req.param('slug')
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files
  const body = await c.req.formData()

  const title = (body.get('title') as string)?.trim() || ''
  const description = (body.get('description') as string)?.trim() || ''
  const title_en = (body.get('title_en') as string)?.trim() || ''
  const description_en = (body.get('description_en') as string)?.trim() || ''
  const icon = (body.get('icon') as string)?.trim() || 'fas fa-star'
  const image_position = (body.get('image_position') as string) || 'right'
  const remove_image = body.get('remove_image') === '1'

  const file = body.get('image') as File
  if (file && file.size > 0) {
    const existing = await db.prepare('SELECT image_key FROM solution_features WHERE id = ?').bind(id).first<{image_key: string}>()
    if (existing?.image_key && !existing.image_key.startsWith('/')) await r2.delete(existing.image_key)
    const key = `solution-features/${id}/${Date.now()}_${file.name}`
    await r2.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'image/jpeg' } })
    await db.prepare('UPDATE solution_features SET title=?, description=?, title_en=?, description_en=?, icon=?, image_key=?, image_position=? WHERE id=? AND solution_slug=?')
      .bind(title, description, title_en, description_en, icon, key, image_position, id, slug).run()
  } else if (remove_image) {
    const existing = await db.prepare('SELECT image_key FROM solution_features WHERE id = ?').bind(id).first<{image_key: string}>()
    if (existing?.image_key && !existing.image_key.startsWith('/')) await r2.delete(existing.image_key)
    await db.prepare('UPDATE solution_features SET title=?, description=?, title_en=?, description_en=?, icon=?, image_key=?, image_position=? WHERE id=? AND solution_slug=?')
      .bind(title, description, title_en, description_en, icon, '', image_position, id, slug).run()
  } else {
    await db.prepare('UPDATE solution_features SET title=?, description=?, title_en=?, description_en=?, icon=?, image_position=? WHERE id=? AND solution_slug=?')
      .bind(title, description, title_en, description_en, icon, image_position, id, slug).run()
  }

  return c.redirect(`/admin/solutions/${slug}`)
})

// 기능 삭제
admin.post('/solutions/:slug/features/:id/delete', async (c) => {
  const slug = c.req.param('slug')
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files
  const feature = await db.prepare('SELECT image_key FROM solution_features WHERE id = ? AND solution_slug = ?')
    .bind(id, slug).first<{image_key: string}>()
  if (feature?.image_key && !feature.image_key.startsWith('/')) await r2.delete(feature.image_key)
  await db.prepare('DELETE FROM solution_features WHERE id = ? AND solution_slug = ?').bind(id, slug).run()
  return c.redirect(`/admin/solutions/${slug}`)
})

// ══════════════════════════════════════════════
// 문의 관리
// ══════════════════════════════════════════════

const CS_INQUIRY_LABELS: Record<string, string> = {
  product: '제품 문의', solution: '솔루션 문의', support: '기술 지원', partnership: '파트너십', etc: '기타',
}
const CS_STATUS_MAP: Record<string, [string, string]> = {
  new: ['#dc3545', '미처리'],
  in_progress: ['#fd7e14', '처리중'],
  resolved: ['#28a745', '완료'],
}
function csStatusBadge(s: string) {
  const [color, label] = CS_STATUS_MAP[s] ?? ['#888', s]
  return `<span style="background:${color};color:#fff;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;font-weight:600;">${label}</span>`
}

admin.get('/contacts', async (c) => {
  const filter = c.req.query('status') || 'all'
  const db = c.env.itmoou_db
  const user = await getCurrentUser(c)
  const where = filter === 'all' ? '' : `WHERE status = '${filter}'`
  const { results } = await db.prepare(
    `SELECT * FROM contact_submissions ${where} ORDER BY created_at DESC`
  ).all<ContactSubmission>()

  const counts = await db.prepare(
    "SELECT status, COUNT(*) as cnt FROM contact_submissions GROUP BY status"
  ).all<{status:string;cnt:number}>()
  const cntMap: Record<string,number> = { new:0, in_progress:0, resolved:0 }
  for (const r of counts.results) cntMap[r.status] = r.cnt
  const total = Object.values(cntMap).reduce((a,b)=>a+b,0)

  const tabStyle = (key: string) => {
    const active = filter === key
    return `style="padding:0.4rem 1rem;border-radius:6px;font-size:0.85rem;font-weight:600;text-decoration:none;${active ? 'background:#0052A5;color:#fff;' : 'background:#f0f4ff;color:#0052A5;'}"`
  }

  const rows = results.length === 0
    ? `<tr><td colspan="6" style="text-align:center;padding:3rem;color:#999;">해당 문의가 없습니다.</td></tr>`
    : results.map(r => `<tr style="cursor:pointer;" onclick="location.href='/admin/contacts/${r.id}'">
        <td style="font-family:monospace;font-size:0.8rem;color:#0052A5;white-space:nowrap;">TrackingID#${r.ticket_no || '—'}</td>
        <td>${csStatusBadge(r.status)}</td>
        <td style="color:#888;font-size:0.82rem;">${r.created_at?.slice(0,16)}</td>
        <td>${escapeHtml(r.name)}<br><span style="font-size:0.78rem;color:#888;">${r.lang === 'en' ? '🇺🇸' : '🇰🇷'} ${escapeHtml(r.email)}</span></td>
        <td><span style="background:#e6f0ff;color:#0052A5;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;">${CS_INQUIRY_LABELS[r.inquiry_type] || r.inquiry_type}</span></td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.88rem;">${escapeHtml(r.message)}</td>
        <td style="font-size:0.82rem;color:${r.assigned_to_name ? '#333' : '#bbb'};">${r.assigned_to_name ? escapeHtml(r.assigned_to_name) : '미배정'}</td>
      </tr>`).join('')

  return c.html(adminBase('문의 관리', `
    <div class="admin-page-header"><h2>문의 관리</h2></div>

    <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap;">
      <a href="/admin/contacts?status=all" ${tabStyle('all')}>전체 (${total})</a>
      <a href="/admin/contacts?status=new" ${tabStyle('new')}>🔴 미처리 (${cntMap.new})</a>
      <a href="/admin/contacts?status=in_progress" ${tabStyle('in_progress')}>🟠 처리중 (${cntMap.in_progress})</a>
      <a href="/admin/contacts?status=resolved" ${tabStyle('resolved')}>🟢 완료 (${cntMap.resolved})</a>
    </div>

    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width:190px;">TrackingID</th>
            <th style="width:90px;">상태</th>
            <th style="width:130px;">접수일시</th>
            <th style="width:180px;">고객</th>
            <th style="width:100px;">유형</th>
            <th>내용</th>
            <th style="width:90px;">담당자</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`, user))
})

admin.get('/contacts/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const [r, user, repliesResult, customerRepliesResult, memosResult, adminUsersResult] = await Promise.all([
    db.prepare('SELECT * FROM contact_submissions WHERE id = ?').bind(id).first<ContactSubmission>(),
    getCurrentUser(c),
    db.prepare('SELECT * FROM contact_replies WHERE contact_id = ? ORDER BY sent_at ASC').bind(id).all<{id:number;user_name:string;subject:string;body:string;sent_at:string}>(),
    db.prepare('SELECT * FROM customer_replies WHERE contact_id = ? OR ticket_no = (SELECT ticket_no FROM contact_submissions WHERE id = ?) ORDER BY received_at ASC').bind(id, id).all<{id:number;from_name:string;from_email:string;subject:string;body:string;received_at:string}>(),
    db.prepare('SELECT * FROM contact_memos WHERE contact_id = ? ORDER BY created_at ASC').bind(id).all<{id:number;user_id:number;user_name:string;content:string;created_at:string}>(),
    db.prepare('SELECT id, name FROM admin_users ORDER BY name ASC').all<{id:number;name:string}>(),
  ])
  if (!r) return c.redirect('/admin/contacts')
  const replies = repliesResult.results
  const customerReplies = customerRepliesResult.results
  const memos = memosResult.results
  const adminUsers = adminUsersResult.results
  const saved = c.req.query('saved') === '1'
  const replied = c.req.query('replied') === '1'
  const claimed = c.req.query('claimed') === '1'
  const memoed = c.req.query('memoed') === '1'

  const assigneeOptions = adminUsers.map(u =>
    `<option value="${u.id}|${escapeHtml(u.name)}" ${r.assigned_to_id2 === u.id ? 'selected' : ''}>${escapeHtml(u.name)}</option>`
  ).join('')

  return c.html(adminBase(`문의 상세 — ${r.name}`, `
    <div class="admin-page-header" style="display:flex;align-items:center;gap:1rem;">
      <a href="/admin/contacts" style="color:#888;text-decoration:none;font-size:0.9rem;">← 목록으로</a>
      <h2 style="margin:0;">문의 상세</h2>
    </div>

    ${saved ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-check-circle"></i> 저장되었습니다.</div>` : ''}
    ${replied ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-check-circle"></i> 답장이 발송되었습니다.</div>` : ''}
    ${claimed ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-user-check"></i> 담당자로 지정되었습니다.</div>` : ''}
    ${memoed ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;margin-bottom:1rem;"><i class="fas fa-sticky-note"></i> 메모가 저장되었습니다.</div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">

      <!-- 문의 정보 (compact) -->
      <div class="admin-card">
        <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1rem;"><i class="fas fa-info-circle"></i> 문의 정보</h3>

        <!-- 메타 배지 영역 -->
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
          ${csStatusBadge(r.status)}
          <span style="background:#e6f0ff;color:#0052A5;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;font-weight:600;">${CS_INQUIRY_LABELS[r.inquiry_type] || r.inquiry_type}</span>
          <span style="background:#f5f5f5;color:#555;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.8rem;">${r.lang === 'en' ? '🇺🇸 EN' : '🇰🇷 KO'}</span>
          <span style="background:#f5f5f5;color:#888;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.78rem;font-family:monospace;">TrackingID#${r.ticket_no || '—'}</span>
        </div>

        <!-- 고객 정보 2열 그리드 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem 1rem;font-size:0.87rem;margin-bottom:1rem;">
          <div><span style="color:#aaa;font-size:0.78rem;display:block;">이름</span><strong>${escapeHtml(r.name)}</strong></div>
          <div><span style="color:#aaa;font-size:0.78rem;display:block;">접수일시</span>${r.created_at?.slice(0,16)}</div>
          <div><span style="color:#aaa;font-size:0.78rem;display:block;">이메일</span><a href="mailto:${escapeHtml(r.email)}" style="color:#0052A5;">${escapeHtml(r.email)}</a></div>
          <div><span style="color:#aaa;font-size:0.78rem;display:block;">전화번호</span>${r.phone ? escapeHtml(r.phone) : '—'}</div>
        </div>

        <!-- 담당자 -->
        <div style="font-size:0.87rem;border-top:1px solid #f0f0f0;padding-top:0.75rem;margin-bottom:1rem;">
          <span style="color:#aaa;font-size:0.78rem;display:block;margin-bottom:0.3rem;">담당자</span>
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <span style="display:inline-flex;align-items:center;gap:0.3rem;">
              <i class="fas fa-user" style="color:#0052A5;font-size:0.75rem;"></i>
              ${r.assigned_to_name
                ? `<strong>${escapeHtml(r.assigned_to_name)}</strong>`
                : '<span style="color:#bbb;">미배정</span>'}
              <span style="color:#ccc;font-size:0.75rem;">1차</span>
            </span>
            ${r.assigned_to_name2 ? `
            <span style="color:#ddd;">·</span>
            <span style="display:inline-flex;align-items:center;gap:0.3rem;">
              <i class="fas fa-user-friends" style="color:#6c757d;font-size:0.75rem;"></i>
              <span>${escapeHtml(r.assigned_to_name2)}</span>
              <span style="color:#ccc;font-size:0.75rem;">2차</span>
            </span>` : ''}
            ${user && r.assigned_to_id !== user.id ? `
            <form method="POST" action="/admin/contacts/${r.id}/claim" style="display:inline;">
              <button type="submit" style="background:#0052A5;color:#fff;border:none;border-radius:5px;padding:0.2rem 0.6rem;font-size:0.78rem;font-family:inherit;cursor:pointer;font-weight:600;">
                <i class="fas fa-inbox"></i> 접수하기
              </button>
            </form>` : ''}
          </div>
        </div>

        <!-- 문의 내용 -->
        <div style="padding:0.85rem;background:#f9f9f9;border-left:3px solid #0052A5;border-radius:4px;">
          <p style="color:#aaa;font-size:0.75rem;margin-bottom:0.35rem;">문의 내용</p>
          <p style="color:#222;line-height:1.7;white-space:pre-wrap;font-size:0.88rem;margin:0;">${escapeHtml(r.message)}</p>
        </div>
      </div>

      <!-- 오른쪽 열 -->
      <div style="display:flex;flex-direction:column;gap:1.5rem;">

        <!-- 상태 & 담당자 -->
        <div class="admin-card">
          <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1rem;"><i class="fas fa-tasks"></i> 상태 & 담당자</h3>
          <form method="POST" action="/admin/contacts/${r.id}/update">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:0.82rem;">처리 상태</label>
                <select name="status" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;font-size:0.87rem;">
                  <option value="new" ${r.status==='new'?'selected':''}>🔴 미처리</option>
                  <option value="in_progress" ${r.status==='in_progress'?'selected':''}>🟠 처리중</option>
                  <option value="resolved" ${r.status==='resolved'?'selected':''}>🟢 완료</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:0.82rem;">2차 담당자</label>
                <select name="assignee2" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;font-size:0.87rem;">
                  <option value="">— 없음</option>
                  ${assigneeOptions}
                </select>
              </div>
            </div>
            <div class="form-actions" style="margin-top:0.5rem;">
              <button type="submit" class="btn-primary" style="padding:0.45rem 1.2rem;font-size:0.87rem;"><i class="fas fa-save"></i> 저장</button>
            </div>
          </form>
        </div>

        <!-- 내부 메모 -->
        <div class="admin-card">
          <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1rem;"><i class="fas fa-sticky-note"></i> 내부 메모 <span style="font-weight:400;color:#aaa;font-size:0.82rem;">(고객에게 보이지 않음)</span></h3>
          ${memos.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1rem;max-height:240px;overflow-y:auto;">
            ${memos.map(m => `
            <div style="background:#f9f9f9;border-radius:6px;padding:0.6rem 0.8rem;font-size:0.86rem;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                <span style="font-weight:600;color:#333;"><i class="fas fa-user-circle" style="color:#0052A5;margin-right:0.3rem;font-size:0.8rem;"></i>${escapeHtml(m.user_name)}</span>
                <span style="color:#bbb;font-size:0.78rem;">${m.created_at?.slice(0,16)}</span>
              </div>
              <p style="margin:0;color:#444;white-space:pre-wrap;line-height:1.6;">${escapeHtml(m.content)}</p>
            </div>`).join('')}
          </div>` : `<p style="color:#bbb;font-size:0.85rem;margin-bottom:1rem;">아직 메모가 없습니다.</p>`}
          <form method="POST" action="/admin/contacts/${r.id}/memo">
            <div class="form-group" style="margin-bottom:0.5rem;">
              <textarea name="content" rows="3" placeholder="메모 내용을 입력하세요..." style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:4px;font-size:0.87rem;resize:vertical;box-sizing:border-box;"></textarea>
            </div>
            <div class="form-actions" style="margin-top:0;">
              <button type="submit" class="btn-primary" style="padding:0.45rem 1.2rem;font-size:0.87rem;"><i class="fas fa-plus"></i> 메모 추가</button>
            </div>
          </form>
        </div>

        <!-- 고객 답장 -->
        <div class="admin-card">
          <h3 style="font-size:0.95rem;font-weight:700;color:#0052A5;margin-bottom:1rem;"><i class="fas fa-reply"></i> 고객 답장</h3>
          <form method="POST" action="/admin/contacts/${r.id}/reply">
            <div class="form-group">
              <label>제목</label>
              <input type="text" name="subject" value="Re: [ITMoou] 문의 답변 드립니다 — TrackingID#${r.ticket_no || r.id}">
            </div>
            <div class="form-group">
              <label>내용</label>
              <textarea name="body" rows="8" placeholder="고객에게 보낼 답변 내용을 입력하세요...">${r.lang === 'en' ? `Dear ${escapeHtml(r.name)},\n\nThank you for contacting ITMoou.\n\n\n\nBest regards,\nITMoou Customer Support\ncs@itmoou.com / 043-715-8553` : `${escapeHtml(r.name)} 님,\n\n안녕하세요. ITMoou 고객지원팀입니다.\n\n\n\n감사합니다.\nITMoou 고객지원팀\ncs@itmoou.com / 043-715-8553`}</textarea>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary"><i class="fas fa-paper-plane"></i> 답장 발송 (→ ${escapeHtml(r.email)})</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 송수신 이력 (통합) -->
    ${(replies.length > 0 || customerReplies.length > 0) ? (() => {
      const timeline = [
        ...replies.map(rep => ({ type: 'sent' as const, time: rep.sent_at || '', data: rep })),
        ...customerReplies.map(cr => ({ type: 'received' as const, time: cr.received_at || '', data: cr })),
      ].sort((a, b) => b.time.localeCompare(a.time))
      const total = timeline.length
      return `
    <div class="admin-card" style="margin-top:1.5rem;">
      <h3 style="font-size:0.95rem;font-weight:700;color:#333;margin-bottom:1.2rem;"><i class="fas fa-exchange-alt"></i> 송수신 이력 (${total}건)</h3>
      <div style="display:flex;flex-direction:column;gap:1rem;">
        ${timeline.map(item => item.type === 'sent' ? `
        <div style="border:1px solid #e0e8ff;border-radius:6px;overflow:hidden;">
          <div style="background:#f0f4ff;padding:0.6rem 1rem;display:flex;justify-content:space-between;align-items:center;font-size:0.83rem;">
            <span><i class="fas fa-paper-plane" style="color:#0052A5;margin-right:0.4rem;"></i><strong>${escapeHtml((item.data as any).user_name)}</strong> 발송 · <span style="color:#0052A5;">${escapeHtml((item.data as any).subject)}</span></span>
            <span style="color:#888;">${item.time?.slice(0,16)}</span>
          </div>
          <div style="padding:0.75rem 1rem;font-size:0.87rem;color:#444;white-space:pre-wrap;line-height:1.7;">${escapeHtml((item.data as any).body)}</div>
        </div>` : `
        <div style="border:1px solid #fce8d5;border-radius:6px;overflow:hidden;">
          <div style="background:#fff8f3;padding:0.6rem 1rem;display:flex;justify-content:space-between;align-items:center;font-size:0.83rem;">
            <span><i class="fas fa-inbox" style="color:#e67e22;margin-right:0.4rem;"></i><strong>${escapeHtml((item.data as any).from_name || (item.data as any).from_email)}</strong> <span style="color:#aaa;font-size:0.8rem;">&lt;${escapeHtml((item.data as any).from_email)}&gt;</span> · <span style="color:#e67e22;">${escapeHtml((item.data as any).subject)}</span></span>
            <span style="color:#888;">${item.time?.slice(0,16)}</span>
          </div>
          <iframe srcdoc="${(item.data as any).body.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" sandbox="allow-same-origin" style="width:100%;border:none;min-height:120px;background:#fff;" onload="this.style.height=this.contentDocument.body.scrollHeight+32+'px'"></iframe>
        </div>`).join('')}
      </div>
    </div>`
    })() : ''}

    <!-- 삭제 -->
    <div style="margin-top:1rem;text-align:right;">
      <form method="POST" action="/admin/contacts/${r.id}/delete" style="display:inline;" onsubmit="return confirm('이 문의를 삭제하시겠습니까?')">
        <button type="submit" class="btn-sm btn-delete"><i class="fas fa-trash"></i> 문의 삭제</button>
      </form>
    </div>`, user))
})

admin.post('/contacts/:id/update', async (c) => {
  const id = parseInt(c.req.param('id'))
  const body = await c.req.formData()
  const status = (body.get('status') as string) || 'new'
  const assignee2Raw = (body.get('assignee2') as string) || ''
  let assigned_to_id2: number | null = null
  let assigned_to_name2: string | null = null
  if (assignee2Raw) {
    const sep = assignee2Raw.indexOf('|')
    assigned_to_id2 = parseInt(assignee2Raw.slice(0, sep)) || null
    assigned_to_name2 = assignee2Raw.slice(sep + 1) || null
  }
  await c.env.itmoou_db.prepare(
    'UPDATE contact_submissions SET status = ?, assigned_to_id2 = ?, assigned_to_name2 = ? WHERE id = ?'
  ).bind(status, assigned_to_id2, assigned_to_name2, id).run()
  return c.redirect(`/admin/contacts/${id}?saved=1`)
})

admin.post('/contacts/:id/memo', async (c) => {
  const id = parseInt(c.req.param('id'))
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')
  const body = await c.req.formData()
  const content = ((body.get('content') as string) || '').trim()
  if (!content) return c.redirect(`/admin/contacts/${id}`)
  await c.env.itmoou_db.prepare(
    'INSERT INTO contact_memos (contact_id, user_id, user_name, content) VALUES (?, ?, ?, ?)'
  ).bind(id, user.id, user.name, content).run()
  return c.redirect(`/admin/contacts/${id}?memoed=1`)
})

admin.post('/contacts/:id/reply', async (c) => {
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const [r, sender] = await Promise.all([
    db.prepare('SELECT * FROM contact_submissions WHERE id = ?').bind(id).first<ContactSubmission>(),
    getCurrentUser(c),
  ])
  if (!r) return c.redirect('/admin/contacts')
  const body = await c.req.formData()
  const subject = (body.get('subject') as string) || `[ITMoou] 문의 답변`
  const replyBody = (body.get('body') as string) || ''

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
  <div style="background:#003366;padding:1.5rem 2rem;color:white;">
    <h2 style="margin:0;font-size:1.2rem;">ITMoou 고객지원</h2>
    <p style="margin:0.3rem 0 0;font-size:0.85rem;opacity:0.8;">TrackingID#${r.ticket_no || r.id}</p>
  </div>
  <div style="padding:2rem;background:#fff;line-height:1.8;color:#333;white-space:pre-wrap;font-size:0.95rem;">${escapeHtml(replyBody)}</div>
  <div style="padding:1rem 2rem;background:#f5f5f5;font-size:0.8rem;color:#aaa;text-align:center;">
    본 메일은 ITMoou 고객지원팀에서 발송되었습니다. cs@itmoou.com / 043-715-8553
  </div>
</div>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ITMoou 고객지원 <cs@itmoou.com>',
      to: [r.email],
      reply_to: 'cs@itmoou.com',
      subject,
      html,
    }),
  })

  await db.prepare("UPDATE contact_submissions SET status = 'in_progress' WHERE id = ? AND status = 'new'").bind(id).run()
  // 답장 이력 저장
  await db.prepare('INSERT INTO contact_replies (contact_id, user_id, user_name, subject, body) VALUES (?, ?, ?, ?, ?)')
    .bind(id, sender?.id ?? 0, sender?.name ?? '관리자', subject, replyBody).run()
  return c.redirect(`/admin/contacts/${id}?replied=1`)
})

admin.post('/contacts/:id/delete', async (c) => {
  await c.env.itmoou_db.prepare('DELETE FROM contact_submissions WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/contacts')
})

admin.post('/contacts/:id/claim', async (c) => {
  const id = parseInt(c.req.param('id'))
  const user = await getCurrentUser(c)
  if (!user) return c.redirect('/admin/login')
  const contact = await c.env.itmoou_db.prepare('SELECT * FROM contact_submissions WHERE id = ?').bind(id).first<ContactSubmission>()
  await c.env.itmoou_db.prepare(
    'UPDATE contact_submissions SET assigned_to_id = ?, assigned_to_name = ? WHERE id = ?'
  ).bind(user.id, user.name, id).run()
  // Teams 알림
  if (c.env.TEAMS_WEBHOOK_URL && contact) {
    fetch(c.env.TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNo: contact.ticket_no || String(id),
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        inquiry_type: contact.inquiry_type,
        message: `[접수] ${user.name}님이 문의를 접수했습니다.\n\n${contact.message}`,
        lang: contact.lang,
        created_at: new Date().toISOString(),
      }),
    }).catch(() => {})
  }
  return c.redirect(`/admin/contacts/${id}?claimed=1`)
})

// ══════════════════════════════════════════════
// 채용공고 URL 관리
// ══════════════════════════════════════════════

admin.get('/settings/jobs-url', async (c) => {
  const [setting, user] = await Promise.all([
    c.env.itmoou_db.prepare('SELECT value FROM site_settings WHERE key = ?').bind('jobs_url').first<{value: string}>(),
    getCurrentUser(c),
  ])
  const saved = c.req.query('saved') === '1'
  return c.html(getJobsUrlFormHTML(setting?.value || 'https://recruit.itmoou.com', saved, user))
})

admin.post('/settings/jobs-url', async (c) => {
  const body = await c.req.formData()
  const url = (body.get('jobs_url') as string)?.trim() || 'https://recruit.itmoou.com'
  await c.env.itmoou_db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)')
    .bind('jobs_url', url).run()
  return c.redirect('/admin/settings/jobs-url?saved=1')
})

// ══════════════════════════════════════════════
// HTML 생성
// ══════════════════════════════════════════════

function adminBase(title: string, content: string, user?: AdminUser | null) {
  const isSuper = user?.role === 'super'

  const allGroups = [
    {
      id: 'dashboard', label: '대시보드', icon: 'fas fa-chart-bar', superOnly: true,
      items: [{ label: '통계 대시보드', href: '/admin/analytics' }],
    },
    {
      id: 'main', label: '메인 페이지', icon: 'fas fa-home', superOnly: true,
      items: [{ label: '슬라이더 관리', href: '/admin/slides' }],
    },
    {
      id: 'company', label: '회사소개 탭 관리', icon: 'fas fa-building', superOnly: true,
      items: [
        { label: 'ITMoou 관리', href: '/admin/pages/company' },
        { label: 'CEO 메시지 관리', href: '/admin/pages/ceo' },
        { label: '회사소식 관리', href: '/admin/news' },
        { label: '공고 관리', href: '/admin/announcements' },
        { label: '연혁 관리', href: '/admin/history' },
        { label: 'ESG 관리', href: '/admin/pages/esg' },
        { label: '오시는 길 관리', href: '/admin/pages/location' },
      ],
    },
    {
      id: 'solutions', label: '솔루션 탭 관리', icon: 'fas fa-cubes', superOnly: true,
      items: [
        { label: 'LogiNexio 관리', href: '/admin/solutions/loginexio' },
        { label: 'BizSupport Pro 관리', href: '/admin/solutions/bizsupport' },
      ],
    },
    {
      id: 'rnd', label: '연구개발 탭 관리', icon: 'fas fa-flask', superOnly: true,
      items: [
        { label: '연구소 관리', href: '/admin/pages/rnd-lab' },
        { label: '연구개발 활동 관리', href: '/admin/pages/rnd-activities' },
      ],
    },
    {
      id: 'careers', label: '채용정보 탭 관리', icon: 'fas fa-users', superOnly: true,
      items: [
        { label: '인재상 관리', href: '/admin/pages/talent' },
        { label: '채용공고 URL 관리', href: '/admin/settings/jobs-url' },
      ],
    },
    {
      id: 'support', label: '지원센터', icon: 'fas fa-headset', superOnly: false,
      items: [
        ...(isSuper ? [
          { label: '고객지원 관리', href: '/admin/pages/customer' },
          { label: 'Contact Us 관리', href: '/admin/pages/contact' },
        ] : []),
        { label: '문의 관리', href: '/admin/contacts' },
      ],
    },
    ...(isSuper ? [{
      id: 'seo', label: 'SEO 설정', icon: 'fas fa-search', superOnly: true,
      items: [
        { label: '홈 SEO', href: '/admin/pages/seo-home' },
        { label: '회사소개 SEO', href: '/admin/pages/seo-company' },
        { label: 'CEO 메시지 SEO', href: '/admin/pages/seo-ceo' },
        { label: '솔루션 SEO', href: '/admin/pages/seo-customer' },
        { label: '연구개발 SEO', href: '/admin/pages/seo-rnd-lab' },
        { label: '채용 SEO', href: '/admin/pages/seo-talent' },
      ],
    }] : []),
    ...(isSuper ? [{
      id: 'system', label: '시스템', icon: 'fas fa-cog', superOnly: true,
      items: [{ label: '계정 관리', href: '/admin/users' }],
    }] : []),
  ]

  const groups = allGroups.filter(g => !g.superOnly || isSuper)

  const sidebarHTML = groups.map(g => `
    <div class="sg">
      <button class="sg-btn" onclick="toggleGroup('${g.id}')">
        <span><i class="${g.icon}"></i> ${g.label}</span>
        <i class="fas fa-chevron-down sg-chev" id="chev-${g.id}"></i>
      </button>
      <div class="sg-items" id="grp-${g.id}">
        ${g.items.map(it => `<a href="${it.href}" class="sg-item">${it.label}</a>`).join('')}
      </div>
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ITMoou 관리페이지</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>${adminStyles}</style>
</head>
<body>
  <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
  <button class="hamburger" id="hamburgerBtn" onclick="openSidebar()"><i class="fas fa-bars"></i></button>
  <div class="admin-layout">
    <aside class="admin-sidebar" id="adminSidebar">
      <a href="/admin/dashboard" class="sidebar-logo" style="text-decoration:none;color:inherit;display:flex;align-items:center;">
        <img src="/images/logo-mark.png" alt="ITMoou" style="width:40px;height:26px;object-fit:contain;filter:brightness(0) invert(1);">
        <span>ITMoou 관리페이지</span>
      </a>
      <nav class="sidebar-nav">${sidebarHTML}</nav>
      <div class="sidebar-footer">
        ${user ? `
        <div style="padding:0.75rem 1rem;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:0.5rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
            <span style="font-size:0.82rem;color:#aac4e8;">${escapeHtml(user.name)}${user.department ? `<span style="color:rgba(170,196,232,0.55);margin:0 0.3rem;">/</span><span style="color:rgba(170,196,232,0.65);">${escapeHtml(user.department)}</span>` : ''}</span>
            <span style="background:${user.role === 'super' ? '#0052A5' : '#28a745'};color:#fff;padding:0.1rem 0.4rem;border-radius:3px;font-size:0.72rem;font-weight:600;">${user.role === 'super' ? '슈퍼관리자' : 'CS담당자'}</span>
          </div>
          <!-- 세션 타이머 -->
          <div id="session-timer-box" style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;background:rgba(255,255,255,0.07);border-radius:5px;padding:0.35rem 0.6rem;">
            <span style="font-size:0.75rem;color:#aac4e8;"><i class="fas fa-clock" style="margin-right:0.3rem;opacity:0.7;"></i>세션 <span id="session-countdown" style="font-weight:700;font-family:monospace;">30:00</span></span>
            <button onclick="extendSession()" style="background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:3px;padding:0.15rem 0.5rem;font-size:0.72rem;font-family:inherit;cursor:pointer;font-weight:600;transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.28)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">연장</button>
          </div>
        </div>
        <a href="/admin/profile" class="sidebar-link">
          <i class="fas fa-user-cog"></i> 내 프로필
        </a>` : ''}
        <a href="/" target="_blank" class="sidebar-link sidebar-ext">
          <i class="fas fa-external-link-alt"></i> 사이트 보기
        </a>
        <a href="/admin/logout" class="sidebar-link sidebar-logout">
          <i class="fas fa-sign-out-alt"></i> 로그아웃
        </a>
      </div>
    </aside>
    <main class="admin-main">${content}</main>
  </div>
  <script>
    const cur = window.location.pathname;
    document.querySelectorAll('.sg-item').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (cur === href || cur.startsWith(href + '/'))) {
        a.classList.add('active');
        const grp = a.closest('.sg-items');
        if (grp) {
          grp.style.maxHeight = grp.scrollHeight + 'px';
          const id = grp.id.replace('grp-', '');
          const chev = document.getElementById('chev-' + id);
          if (chev) chev.style.transform = 'rotate(0deg)';
        }
      }
    });
    function toggleGroup(id) {
      const grp = document.getElementById('grp-' + id);
      const chev = document.getElementById('chev-' + id);
      if (grp.style.maxHeight && grp.style.maxHeight !== '0px') {
        grp.style.maxHeight = '0px';
        if (chev) chev.style.transform = 'rotate(-90deg)';
      } else {
        grp.style.maxHeight = grp.scrollHeight + 'px';
        if (chev) chev.style.transform = 'rotate(0deg)';
      }
    }
    document.querySelectorAll('.sg-items').forEach(g => {
      if (!g.querySelector('.sg-item.active')) {
        g.style.maxHeight = '0px';
        const id = g.id.replace('grp-', '');
        const chev = document.getElementById('chev-' + id);
        if (chev) chev.style.transform = 'rotate(-90deg)';
      }
    });
    function openSidebar() {
      document.getElementById('adminSidebar').classList.add('open');
      document.getElementById('sidebarOverlay').classList.add('open');
      document.getElementById('hamburgerBtn').style.display = 'none';
    }
    function closeSidebar() {
      document.getElementById('adminSidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('open');
      document.getElementById('hamburgerBtn').style.display = '';
    }

    // ── 탭 닫기 감지 ──────────────────────────────
    if (!sessionStorage.getItem('admin_tab')) {
      // 탭 닫힌 후 새 탭에서 열림 → 로그아웃
      fetch('/admin/logout', { method: 'POST', credentials: 'same-origin' }).finally(() => {
        window.location.replace('/admin/login?reason=tab_closed');
      });
    }
    sessionStorage.setItem('admin_tab', '1');

    // ── 비활동 자동 로그아웃 (30분) ───────────────
    const IDLE_MS = 30 * 60 * 1000;
    const WARN_MS = 25 * 60 * 1000;
    let idleTimer, warnTimer, countdownInterval;
    let idleDeadline = Date.now() + IDLE_MS;

    const countdownEl = document.getElementById('session-countdown');
    const timerBox = document.getElementById('session-timer-box');

    function updateCountdown() {
      const remaining = Math.max(0, idleDeadline - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      const text = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
      if (countdownEl) countdownEl.textContent = text;
      if (timerBox) {
        if (remaining <= 5 * 60 * 1000) {
          timerBox.style.background = 'rgba(220,53,69,0.25)';
          if (countdownEl) countdownEl.style.color = '#ff8080';
        } else if (remaining <= 10 * 60 * 1000) {
          timerBox.style.background = 'rgba(253,126,20,0.2)';
          if (countdownEl) countdownEl.style.color = '#ffa060';
        } else {
          timerBox.style.background = 'rgba(255,255,255,0.07)';
          if (countdownEl) countdownEl.style.color = '#fff';
        }
      }
    }

    const warningEl = document.createElement('div');
    warningEl.id = 'idle-warning';
    warningEl.innerHTML = \`
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:12px;padding:2rem 2.5rem;max-width:380px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.25);">
          <i class="fas fa-clock" style="font-size:2.5rem;color:#fd7e14;margin-bottom:1rem;display:block;"></i>
          <h3 style="margin:0 0 0.5rem;font-size:1.1rem;color:#333;">세션 만료 경고</h3>
          <p style="color:#666;font-size:0.9rem;margin-bottom:1.5rem;">5분 후 자동으로 로그아웃됩니다.<br>계속 사용하시려면 아래 버튼을 눌러주세요.</p>
          <button onclick="extendSession()" style="background:#0052A5;color:#fff;border:none;border-radius:6px;padding:0.7rem 2rem;font-size:1rem;font-weight:700;cursor:pointer;width:100%;">세션 연장</button>
        </div>
      </div>\`;
    warningEl.style.display = 'none';
    document.body.appendChild(warningEl);

    function extendSession() {
      warningEl.style.display = 'none';
      resetIdleTimer();
      fetch(window.location.href, { method: 'GET', credentials: 'same-origin' }).catch(() => {});
    }

    function doLogout() {
      clearInterval(countdownInterval);
      sessionStorage.removeItem('admin_tab');
      window.location.replace('/admin/logout?reason=idle');
    }

    function resetIdleTimer() {
      clearTimeout(idleTimer);
      clearTimeout(warnTimer);
      idleDeadline = Date.now() + IDLE_MS;
      updateCountdown();
      warnTimer = setTimeout(() => { warningEl.style.display = 'block'; }, WARN_MS);
      idleTimer = setTimeout(doLogout, IDLE_MS);
    }

    ['click','mousemove','keydown','scroll','touchstart'].forEach(e => {
      document.addEventListener(e, () => {
        if (warningEl.style.display === 'none') resetIdleTimer();
      }, { passive: true });
    });

    resetIdleTimer();
    countdownInterval = setInterval(updateCountdown, 1000);
  </script>
</body>
</html>`
}

function getLoginHTML(error?: string | null, showSetup = false, reason?: string | null) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>관리자 로그인 | ITMoou</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Sans KR', sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .login-box { background: #fff; border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .login-logo { text-align: center; margin-bottom: 2rem; }
    .login-logo i { font-size: 2.5rem; color: #0052A5; }
    .login-logo h1 { font-size: 1.2rem; font-weight: 700; color: #111; margin-top: 0.5rem; }
    .login-logo p { font-size: 0.85rem; color: #888; margin-top: 0.3rem; }
    label { display: block; font-size: 0.85rem; font-weight: 500; color: #444; margin-bottom: 0.4rem; }
    input[type=email], input[type=password] { width: 100%; padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; font-family: inherit; outline: none; transition: border 0.2s; }
    input[type=email]:focus, input[type=password]:focus { border-color: #0052A5; }
    .btn-login { width: 100%; padding: 0.85rem; background: #0052A5; color: #fff; border: none; border-radius: 6px; font-size: 1rem; font-family: inherit; font-weight: 600; cursor: pointer; margin-top: 1.5rem; transition: background 0.2s; }
    .btn-login:hover { background: #003d7a; }
    .error-msg { background: #fff0f0; color: #d32f2f; border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.88rem; margin-bottom: 1rem; }
    .success-msg { background: #e8f5e9; color: #2e7d32; border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.88rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="login-box">
    <div class="login-logo">
      <img src="/images/logo.png" alt="ITMoou" style="width:200px;height:auto;object-fit:contain;margin-bottom:0.5rem;">
      <p>관리자 전용 페이지입니다</p>
    </div>
    ${showSetup ? '<div class="success-msg"><i class="fas fa-check-circle"></i> 계정이 준비되었습니다. 로그인해 주세요.</div>' : ''}
    ${reason === 'idle' ? '<div class="error-msg"><i class="fas fa-clock"></i> 30분간 활동이 없어 자동 로그아웃되었습니다.</div>' : ''}
    ${reason === 'tab_closed' ? '<div class="error-msg"><i class="fas fa-window-close"></i> 브라우저 탭이 닫혀 로그아웃되었습니다.</div>' : ''}
    ${error === 'invalid' ? '<div class="error-msg"><i class="fas fa-exclamation-circle"></i> 이메일 또는 비밀번호가 올바르지 않습니다.</div>' : ''}
    ${error === 'locked' ? '<div class="error-msg"><i class="fas fa-lock"></i> 로그인 시도가 5회 초과되어 30분간 잠금 처리되었습니다.</div>' : ''}
    <form method="POST" action="/admin/login">
      <div style="margin-bottom:1rem;">
        <label for="email">이메일</label>
        <input type="email" id="email" name="email" placeholder="이메일을 입력하세요" autofocus required>
      </div>
      <div style="margin-bottom:1rem;">
        <label for="password">비밀번호</label>
        <input type="password" id="password" name="password" placeholder="비밀번호를 입력하세요" required>
      </div>
      <button type="submit" class="btn-login">로그인</button>
    </form>
  </div>
</body>
</html>`
}

function getSetupHTML(error?: string | null) {
  const messages: Record<string, string> = {
    masterkey: '마스터 키가 올바르지 않습니다.',
    required: '모든 항목을 입력해주세요.',
    password: '비밀번호가 일치하지 않습니다.',
    weak: '비밀번호는 8자 이상이어야 합니다.',
  }
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>관리자 초기 설정 | ITMoou</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Sans KR', sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .setup-box { background: #fff; border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 460px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .setup-logo { text-align: center; margin-bottom: 2rem; }
    .setup-logo i { font-size: 2.5rem; color: #0052A5; }
    .setup-logo h1 { font-size: 1.2rem; font-weight: 700; color: #111; margin-top: 0.5rem; }
    .setup-logo p { font-size: 0.85rem; color: #888; margin-top: 0.3rem; }
    label { display: block; font-size: 0.85rem; font-weight: 500; color: #444; margin-bottom: 0.4rem; }
    input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; font-family: inherit; outline: none; transition: border 0.2s; margin-bottom: 1rem; }
    input:focus { border-color: #0052A5; }
    .btn { width: 100%; padding: 0.85rem; background: #0052A5; color: #fff; border: none; border-radius: 6px; font-size: 1rem; font-family: inherit; font-weight: 600; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s; }
    .btn:hover { background: #003d7a; }
    .error-msg { background: #fff0f0; color: #d32f2f; border-radius: 6px; padding: 0.7rem 1rem; font-size: 0.88rem; margin-bottom: 1.2rem; }
    .divider { border: none; border-top: 1px solid #eee; margin: 1.5rem 0; }
    .notice { background: #fffbea; border: 1px solid #ffe082; border-radius: 6px; padding: 0.8rem 1rem; font-size: 0.83rem; color: #7a6000; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <div class="setup-box">
    <div class="setup-logo">
      <i class="fas fa-shield-alt"></i>
      <h1>ITMoou 관리자 초기 설정</h1>
      <p>슈퍼관리자 계정을 생성합니다</p>
    </div>
    <div class="notice"><i class="fas fa-info-circle"></i> 이 페이지는 최초 1회만 표시됩니다. 계정 생성 후 다시 접근할 수 없습니다.</div>
    ${error ? `<div class="error-msg"><i class="fas fa-exclamation-circle"></i> ${messages[error] || '오류가 발생했습니다.'}</div>` : ''}
    <form method="POST" action="/admin/setup">
      <label>마스터 키 (ADMIN_PASSWORD 환경변수)</label>
      <input type="password" name="master_key" placeholder="마스터 키를 입력하세요" required autofocus>
      <hr class="divider">
      <label>이름</label>
      <input type="text" name="name" placeholder="홍길동" required>
      <label>이메일</label>
      <input type="email" name="email" placeholder="admin@itmoou.com" required>
      <label>비밀번호 (8자 이상)</label>
      <input type="password" name="password" minlength="8" required>
      <label>비밀번호 확인</label>
      <input type="password" name="password_confirm" minlength="8" required>
      <button type="submit" class="btn"><i class="fas fa-user-plus"></i> 슈퍼관리자 계정 생성</button>
    </form>
  </div>
</body>
</html>`
}

// ── 공고 HTML ──

const ANN_CATEGORIES = ['일반공고', '주주총회', '기타']

function getAdminListHTML(items: Announcement[], user?: AdminUser | null) {
  const rows = items.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:3rem;color:#999;">등록된 공고가 없습니다.</td></tr>`
    : items.map(item => `
        <tr>
          <td>${item.number}</td>
          <td><span class="cat-badge cat-${item.category}">${item.category}</span></td>
          <td><a href="/announcements/${item.id}" target="_blank" style="color:#0052A5;text-decoration:none;">${escapeHtml(item.title)}</a></td>
          <td>${item.notice_date}</td>
          <td>
            <a href="/admin/announcements/${item.id}/edit" class="btn-sm btn-edit">수정</a>
            <form method="POST" action="/admin/announcements/${item.id}" style="display:inline;" onsubmit="return confirm('정말 삭제하시겠습니까?')">
              <input type="hidden" name="_method" value="DELETE">
              <button type="submit" class="btn-sm btn-delete">삭제</button>
            </form>
          </td>
        </tr>`).join('')

  return adminBase('공고 관리', `
    <div class="admin-page-header">
      <h2>공고 관리</h2>
      <a href="/admin/announcements/new" class="btn-primary"><i class="fas fa-plus"></i> 공고 작성</a>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width:70px;">번호</th><th style="width:110px;">분류</th>
            <th>제목</th><th style="width:110px;">공고일</th><th style="width:120px;">관리</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`, user)
}

function getAnnouncementFormHTML(item?: Announcement, error?: string, attachments?: Attachment[], user?: AdminUser | null) {
  const isEdit = !!item
  const categoryOptions = ANN_CATEGORIES.map(cat =>
    `<option value="${cat}" ${item?.category === cat ? 'selected' : ''}>${cat}</option>`
  ).join('')

  const attachmentSection = isEdit && attachments && attachments.length > 0
    ? `<div class="form-group">
        <label>기존 첨부파일</label>
        <div class="existing-attachments">
          ${attachments.map(a => `
            <div class="attachment-item">
              <span><i class="fas fa-file"></i> ${escapeHtml(a.filename)}</span>
              <label class="delete-check">
                <input type="checkbox" name="delete_attachment" value="${a.id}"> 삭제
              </label>
            </div>`).join('')}
        </div>
      </div>` : ''

  const today = new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\. /g, '-').replace('.', '')

  return adminBase(isEdit ? '공고 수정' : '공고 작성', `
    <div class="admin-page-header">
      <h2>${isEdit ? '공고 수정' : '공고 작성'}</h2>
      <a href="/admin/announcements" class="btn-secondary"><i class="fas fa-arrow-left"></i> 목록으로</a>
    </div>
    <div class="admin-card">
      ${error ? `<div class="form-error">${error}</div>` : ''}
      <form method="POST" action="${isEdit ? `/admin/announcements/${item!.id}` : '/admin/announcements'}" enctype="multipart/form-data">
        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label for="category">분류 <span class="required">*</span></label>
            <select id="category" name="category" required>${categoryOptions}</select>
          </div>
          <div class="form-group" style="flex:1;">
            <label for="notice_date">공고일 <span class="required">*</span></label>
            <input type="date" id="notice_date" name="notice_date" value="${item?.notice_date || today}" required>
          </div>
        </div>
        <div class="form-group">
          <label for="title">제목 (한국어) <span class="required">*</span></label>
          <input type="text" id="title" name="title" value="${escapeHtml(item?.title || '')}" placeholder="공고 제목을 입력하세요" required>
        </div>
        <div class="form-group">
          <label for="content">내용 (한국어) <span class="required">*</span></label>
          <textarea id="content" name="content" rows="10" placeholder="공고 내용을 입력하세요" required>${escapeHtml(item?.content || '')}</textarea>
        </div>
        <div class="form-group" style="background:#f8f9ff;border-radius:8px;margin:0 1.5rem;padding:1.5rem;border:1px solid #e0e8ff;">
          <p style="font-size:0.85rem;color:#0052A5;font-weight:600;margin-bottom:1rem;"><i class="fas fa-language"></i> English Version (영문 버전 — 선택사항)</p>
          <div style="margin-bottom:1rem;">
            <label for="title_en" style="font-size:0.87rem;font-weight:600;color:#444;margin-bottom:0.5rem;display:block;">Title (English)</label>
            <input type="text" id="title_en" name="title_en" value="${escapeHtml(item?.title_en || '')}" placeholder="English title (optional — falls back to Korean title)">
          </div>
          <div>
            <label for="content_en" style="font-size:0.87rem;font-weight:600;color:#444;margin-bottom:0.5rem;display:block;">Content (English)</label>
            <textarea id="content_en" name="content_en" rows="10" placeholder="English content (optional — falls back to Korean content)">${escapeHtml(item?.content_en || '')}</textarea>
          </div>
        </div>
        ${attachmentSection}
        <div class="form-group">
          <label for="files">첨부파일 <span style="color:#888;font-weight:400;font-size:0.85rem;">(PDF, 이미지 등 여러 파일 선택 가능)</span></label>
          <input type="file" id="files" name="files" multiple accept=".pdf,.doc,.docx,.hwp,.png,.jpg,.jpeg">
        </div>
        <div class="form-actions">
          <a href="/admin/announcements" class="btn-secondary">취소</a>
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> ${isEdit ? '수정 저장' : '공고 등록'}</button>
        </div>
      </form>
    </div>`, user)
}

// ── 뉴스 HTML ──

function getNewsFormHTML(item?: NewsItem, error?: string, user?: AdminUser | null) {
  return adminBase(item ? '뉴스 수정' : '뉴스 작성', `
    <div class="admin-page-header">
      <h2>${item ? '뉴스 수정' : '뉴스 작성'}</h2>
      <a href="/admin/news" class="btn-secondary"><i class="fas fa-arrow-left"></i> 목록으로</a>
    </div>
    <div class="admin-card">
      ${error ? `<div class="form-error">${error}</div>` : ''}
      <form method="POST" action="${item ? `/admin/news/${item.id}` : '/admin/news'}">
        <div class="form-group">
          <label>날짜 <span class="required">*</span></label>
          <input type="text" name="date" value="${escapeHtml(item?.date || '')}" placeholder="예: 2026.03.12" required>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #e0e8ff;">
          <span>🇰🇷</span><h3 style="color:#0052A5;font-size:0.95rem;font-weight:700;margin:0;">한국어</h3>
        </div>
        <div class="form-group">
          <label>제목 <span class="required">*</span></label>
          <input type="text" name="title" value="${escapeHtml(item?.title || '')}" placeholder="뉴스 제목" required>
        </div>
        <div class="form-group">
          <label>내용 <span class="required">*</span></label>
          <textarea name="description" rows="5" placeholder="뉴스 내용" required>${escapeHtml(item?.description || '')}</textarea>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin:1.5rem 0 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e8e0ff;padding-top:1rem;border-top:2px solid #e8e0ff;">
          <span>🇺🇸</span><h3 style="color:#6f42c1;font-size:0.95rem;font-weight:700;margin:0;">English</h3>
          <span style="font-size:0.78rem;color:#888;">비워두면 한국어가 그대로 표시됩니다.</span>
        </div>
        <div class="form-group">
          <label>Title (English)</label>
          <input type="text" name="title_en" value="${escapeHtml(item?.title_en || '')}" placeholder="News title in English">
        </div>
        <div class="form-group">
          <label>Content (English)</label>
          <textarea name="description_en" rows="5" placeholder="News content in English">${escapeHtml(item?.description_en || '')}</textarea>
        </div>
        <div class="form-actions">
          <a href="/admin/news" class="btn-secondary">취소</a>
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> ${item ? '수정 저장' : '등록'}</button>
        </div>
      </form>
    </div>`, user)
}

// ── 연혁 HTML ──

function getHistoryFormHTML(item?: HistoryItem, error?: string, user?: AdminUser | null) {
  return adminBase(item ? '연혁 수정' : '연혁 추가', `
    <div class="admin-page-header">
      <h2>${item ? '연혁 수정' : '연혁 추가'}</h2>
      <a href="/admin/history" class="btn-secondary"><i class="fas fa-arrow-left"></i> 목록으로</a>
    </div>
    <div class="admin-card">
      ${error ? `<div class="form-error">${error}</div>` : ''}
      <form method="POST" action="${item ? `/admin/history/${item.id}` : '/admin/history'}">
        <div class="form-group">
          <label>연도 <span class="required">*</span></label>
          <input type="text" name="year" value="${escapeHtml(item?.year || '')}" placeholder="예: 2026" required>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin:0 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e0e8ff;">
          <span>🇰🇷</span><h3 style="color:#0052A5;font-size:0.95rem;font-weight:700;margin:0;">한국어</h3>
        </div>
        <div class="form-group">
          <label>내용 <span class="required">*</span></label>
          <input type="text" name="content" value="${escapeHtml(item?.content || '')}" placeholder="연혁 내용" required>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin:1.5rem 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e8e0ff;padding-top:1rem;border-top:2px solid #e8e0ff;">
          <span>🇺🇸</span><h3 style="color:#6f42c1;font-size:0.95rem;font-weight:700;margin:0;">English</h3>
          <span style="font-size:0.78rem;color:#888;">비워두면 한국어가 그대로 표시됩니다.</span>
        </div>
        <div class="form-group">
          <label>Content (English)</label>
          <input type="text" name="content_en" value="${escapeHtml(item?.content_en || '')}" placeholder="History entry in English">
        </div>
        <div class="form-actions">
          <a href="/admin/history" class="btn-secondary">취소</a>
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> ${item ? '수정 저장' : '추가'}</button>
        </div>
      </form>
    </div>`, user)
}

// ── 솔루션 HTML ──

function getSolutionPageHTML(sol: SolutionData, features: SolutionFeature[], user?: AdminUser | null) {
  const name = sol.slug === 'loginexio' ? 'LogiNexio' : 'BizSupport Pro'
  const otherSlug = sol.slug === 'loginexio' ? 'bizsupport' : 'loginexio'
  const otherName = sol.slug === 'loginexio' ? 'BizSupport Pro' : 'LogiNexio'

  const featureRows = features.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#999;">등록된 기능이 없습니다.</td></tr>`
    : features.map((f, i) => {
        const imgSrc = f.image_key
          ? (f.image_key.startsWith('/') ? f.image_key : `/api/solution-feature/${f.id}/image`)
          : null
        return `<tr>
          <td style="text-align:center;color:#888;font-size:0.85rem;">${i + 1}</td>
          <td style="text-align:center;font-size:1.4rem;color:#0052A5;"><i class="${escapeHtml(f.icon)}"></i></td>
          <td><strong>${escapeHtml(f.title)}</strong></td>
          <td style="text-align:center;">
            ${imgSrc
              ? `<img src="${imgSrc}" style="height:40px;width:60px;object-fit:cover;border-radius:4px;">`
              : '<span style="color:#ccc;font-size:0.8rem;">없음</span>'}
          </td>
          <td style="text-align:center;">
            <span style="font-size:0.78rem;background:${f.image_position === 'left' ? '#e6f0ff' : '#f0f7ff'};color:#0052A5;padding:0.2rem 0.5rem;border-radius:4px;">
              ${f.image_position === 'left' ? '← 이미지 좌측' : '이미지 우측 →'}
            </span>
          </td>
          <td>
            <a href="/admin/solutions/${sol.slug}/features/${f.id}/edit" class="btn-sm btn-edit">수정</a>
            <form method="POST" action="/admin/solutions/${sol.slug}/features/${f.id}/delete" style="display:inline;" onsubmit="return confirm('기능을 삭제하시겠습니까?')">
              <button type="submit" class="btn-sm btn-delete">삭제</button>
            </form>
          </td>
        </tr>`
      }).join('')

  return adminBase(`${name} 관리`, `
    <div class="admin-page-header">
      <h2>${name} 관리</h2>
      <a href="/admin/solutions/${otherSlug}" class="btn-secondary">${otherName} 관리 →</a>
    </div>

    <div class="admin-card" style="margin-bottom:1.5rem;">
      <div style="padding:1.5rem 1.5rem 0;">
        <h3 style="font-size:1rem;font-weight:700;color:#333;margin-bottom:1rem;">기본 정보</h3>
      </div>
      <form method="POST" action="/admin/solutions/${sol.slug}">
        <div style="display:flex;align-items:center;gap:0.5rem;margin:0 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e0e8ff;">
          <span>🇰🇷</span><h3 style="color:#0052A5;font-size:0.95rem;font-weight:700;margin:0;">한국어</h3>
        </div>
        <div class="form-group">
          <label>부제목 <span class="required">*</span></label>
          <input type="text" name="subtitle" value="${escapeHtml(sol.subtitle)}" required>
        </div>
        <div class="form-group">
          <label>설명 <span class="required">*</span></label>
          <textarea name="description" rows="4" required>${escapeHtml(sol.description)}</textarea>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin:1.5rem 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e8e0ff;padding-top:1rem;border-top:2px solid #e8e0ff;">
          <span>🇺🇸</span><h3 style="color:#6f42c1;font-size:0.95rem;font-weight:700;margin:0;">English</h3>
          <span style="font-size:0.78rem;color:#888;">비워두면 한국어가 그대로 표시됩니다.</span>
        </div>
        <div class="form-group">
          <label>Subtitle (English)</label>
          <input type="text" name="subtitle_en" value="${escapeHtml(sol.subtitle_en || '')}">
        </div>
        <div class="form-group">
          <label>Description (English)</label>
          <textarea name="description_en" rows="4">${escapeHtml(sol.description_en || '')}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> 기본 정보 저장</button>
        </div>
      </form>
    </div>

    <div class="admin-page-header" style="margin-bottom:1rem;">
      <h3 style="font-size:1.1rem;font-weight:700;">기능 목록</h3>
      <a href="/admin/solutions/${sol.slug}/features/new" class="btn-primary">
        <i class="fas fa-plus"></i> 기능 추가
      </a>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width:50px;text-align:center;">순서</th>
            <th style="width:60px;text-align:center;">아이콘</th>
            <th>제목</th>
            <th style="width:80px;text-align:center;">이미지</th>
            <th style="width:130px;text-align:center;">이미지 위치</th>
            <th style="width:120px;">관리</th>
          </tr>
        </thead>
        <tbody>${featureRows}</tbody>
      </table>
    </div>`, user)
}

const POPULAR_ICONS = [
  'fas fa-star','fas fa-boxes','fas fa-file-alt','fas fa-handshake','fas fa-map-marker-alt',
  'fas fa-chart-bar','fas fa-chart-line','fas fa-cogs','fas fa-users','fas fa-comments',
  'fas fa-project-diagram','fas fa-robot','fas fa-truck','fas fa-warehouse','fas fa-search',
  'fas fa-shield-alt','fas fa-globe','fas fa-cloud','fas fa-database','fas fa-bolt',
  'fas fa-check-circle','fas fa-tasks','fas fa-sync-alt','fas fa-layer-group','fas fa-bell',
]

function getSolutionFeatureFormHTML(slug: string, feature?: SolutionFeature, user?: AdminUser | null) {
  const isEdit = !!feature
  const name = slug === 'loginexio' ? 'LogiNexio' : 'BizSupport Pro'
  const imgSrc = feature?.image_key
    ? (feature.image_key.startsWith('/') ? feature.image_key : `/api/solution-feature/${feature.id}/image`)
    : null

  const iconSuggestions = POPULAR_ICONS.map(ic =>
    `<button type="button" class="icon-suggest-btn" onclick="setIcon('${ic}')" title="${ic}">
       <i class="${ic}"></i>
     </button>`
  ).join('')

  return adminBase(isEdit ? '기능 수정' : '기능 추가', `
    <div class="admin-page-header">
      <h2>${isEdit ? '기능 수정' : '기능 추가'} — ${name}</h2>
      <a href="/admin/solutions/${slug}" class="btn-secondary"><i class="fas fa-arrow-left"></i> 목록으로</a>
    </div>
    <div class="admin-card">
      <form method="POST" action="${isEdit ? `/admin/solutions/${slug}/features/${feature!.id}` : `/admin/solutions/${slug}/features`}" enctype="multipart/form-data">

        <div class="form-group">
          <label>아이콘 (FontAwesome) <span class="required">*</span></label>
          <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem;">
            <input type="text" id="iconInput" name="icon" value="${escapeHtml(feature?.icon || 'fas fa-star')}"
              placeholder="예: fas fa-star" oninput="updateIconPreview(this.value)" style="flex:1;">
            <div id="iconPreview" style="font-size:2.2rem;color:#0052A5;width:3rem;text-align:center;flex-shrink:0;">
              <i class="${escapeHtml(feature?.icon || 'fas fa-star')}"></i>
            </div>
          </div>
          <div class="icon-grid">${iconSuggestions}</div>
          <p style="font-size:0.78rem;color:#999;margin-top:0.5rem;">FontAwesome 클래스명 직접 입력 또는 아이콘 클릭하여 선택</p>
        </div>

        <div style="display:flex;align-items:center;gap:0.5rem;margin:0 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e0e8ff;">
          <span>🇰🇷</span><h3 style="color:#0052A5;font-size:0.95rem;font-weight:700;margin:0;">한국어</h3>
        </div>
        <div class="form-group">
          <label for="feat-title">제목 <span class="required">*</span></label>
          <input type="text" id="feat-title" name="title" value="${escapeHtml(feature?.title || '')}" placeholder="기능 제목" required>
        </div>

        <div class="form-group">
          <label for="feat-desc">설명 <span class="required">*</span></label>
          <textarea id="feat-desc" name="description" rows="6" placeholder="기능 설명" required>${escapeHtml(feature?.description || '')}</textarea>
        </div>

        <div style="display:flex;align-items:center;gap:0.5rem;margin:1.5rem 1.5rem 1rem;padding-bottom:0.5rem;border-bottom:2px solid #e8e0ff;padding-top:1rem;border-top:2px solid #e8e0ff;">
          <span>🇺🇸</span><h3 style="color:#6f42c1;font-size:0.95rem;font-weight:700;margin:0;">English</h3>
          <span style="font-size:0.78rem;color:#888;">비워두면 한국어가 그대로 표시됩니다.</span>
        </div>
        <div class="form-group">
          <label>Title (English)</label>
          <input type="text" name="title_en" value="${escapeHtml(feature?.title_en || '')}" placeholder="Feature title in English">
        </div>

        <div class="form-group">
          <label>Description (English)</label>
          <textarea name="description_en" rows="6" placeholder="Feature description in English">${escapeHtml(feature?.description_en || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex:1;">
            <label>이미지 파일 <span style="color:#888;font-weight:400;font-size:0.82rem;">(선택사항 — JPG, PNG, WebP)</span></label>
            ${imgSrc ? `
              <div style="margin-bottom:0.75rem;">
                <img src="${imgSrc}" style="height:80px;border-radius:6px;object-fit:cover;" alt="현재 이미지">
                <label style="display:flex;align-items:center;gap:0.4rem;margin-top:0.5rem;font-size:0.85rem;color:#d32f2f;cursor:pointer;font-weight:400;">
                  <input type="checkbox" name="remove_image" value="1"> 이미지 삭제
                </label>
              </div>` : ''}
            <input type="file" name="image" accept="image/*">
          </div>
          <div class="form-group" style="flex:0 0 200px;">
            <label>이미지 위치</label>
            <select name="image_position">
              <option value="right" ${(!feature || feature.image_position === 'right') ? 'selected' : ''}>이미지 우측 →</option>
              <option value="left" ${feature?.image_position === 'left' ? 'selected' : ''}>← 이미지 좌측</option>
            </select>
            <p style="font-size:0.78rem;color:#999;margin-top:0.4rem;">텍스트를 기준으로 이미지 위치</p>
          </div>
        </div>

        <div class="form-actions">
          <a href="/admin/solutions/${slug}" class="btn-secondary">취소</a>
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> ${isEdit ? '수정 저장' : '기능 추가'}</button>
        </div>
      </form>
    </div>
    <script>
      function updateIconPreview(val) {
        document.getElementById('iconPreview').innerHTML = '<i class="' + val + '"></i>';
      }
      function setIcon(cls) {
        document.getElementById('iconInput').value = cls;
        updateIconPreview(cls);
      }
    </script>`, user)
}

// ── 채용공고 URL HTML ──

function getJobsUrlFormHTML(currentUrl: string, saved = false, user?: AdminUser | null) {
  return adminBase('채용공고 URL 관리', `
    <div class="admin-page-header"><h2>채용공고 URL 관리</h2></div>
    ${saved ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;font-size:0.9rem;margin-bottom:1.5rem;"><i class="fas fa-check-circle"></i> 저장되었습니다.</div>` : ''}
    <div class="admin-card">
      <form method="POST" action="/admin/settings/jobs-url">
        <div class="form-group">
          <label for="jobs_url">채용공고 사이트 URL <span class="required">*</span></label>
          <input type="url" id="jobs_url" name="jobs_url" value="${escapeHtml(currentUrl)}"
            placeholder="https://recruit.itmoou.com" required>
          <p style="font-size:0.82rem;color:#888;margin-top:0.5rem;">
            네비게이션 메뉴의 "채용공고" 및 인재상 페이지의 "채용공고 보기" 버튼이 이 주소로 연결됩니다.
          </p>
        </div>
        <div class="form-group" style="padding-bottom:1.5rem;">
          <label style="color:#888;font-weight:400;font-size:0.85rem;">현재 설정된 URL</label>
          <a href="${escapeHtml(currentUrl)}" target="_blank" rel="noopener" style="color:#0052A5;font-size:0.9rem;word-break:break-all;">${escapeHtml(currentUrl)}</a>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> 저장</button>
        </div>
      </form>
    </div>`, user)
}

// ── 페이지 섹션 HTML ──

function getPageSectionsFormHTML(page: string, config: PageConfig, sections: Record<string, string>, saved = false, user?: AdminUser | null) {
  const hasImageField = config.fields.some(f => f.type === 'image')

  const renderField = (key: string, label: string, type: FieldType, isEn: boolean) => {
    if (type === 'image') {
      if (isEn) return ''
      const imgKey = sections[key] ?? ''
      const imgSrc = imgKey ? `/api/page-image/${page}/${key}` : ''
      return `<div class="form-group">
        <label>${label}</label>
        ${imgSrc ? `<div style="margin-bottom:0.75rem;"><img src="${imgSrc}" style="max-height:120px;border-radius:6px;object-fit:cover;" alt="현재 이미지"><label style="display:flex;align-items:center;gap:0.4rem;margin-top:0.5rem;font-size:0.85rem;color:#d32f2f;cursor:pointer;font-weight:400;"><input type="checkbox" name="${key}_remove" value="1"> 이미지 삭제</label></div>` : ''}
        <input type="file" name="${key}_file" accept="image/*">
        <input type="hidden" name="${key}" value="${escapeHtml(imgKey)}">
      </div>`
    }
    const fieldKey = isEn ? key + '_en' : key
    const value = escapeHtml(sections[fieldKey] ?? '')
    if (type === 'html') {
      if (isEn) return ''
      return `<div class="form-group">
        <label>${label}</label>
        <p style="font-size:0.8rem;color:#888;margin-bottom:0.5rem;">카카오맵 "지도 퍼가기"에서 복사한 코드를 그대로 붙여넣으세요.</p>
        <textarea name="${fieldKey}" rows="8" style="font-family:monospace;font-size:0.82rem;">${value}</textarea>
      </div>`
    }
    if (type === 'textarea') {
      return `<div class="form-group">
        <label>${label}</label>
        <textarea name="${fieldKey}" rows="4">${value}</textarea>
      </div>`
    }
    return `<div class="form-group">
      <label>${label}</label>
      <input type="text" name="${fieldKey}" value="${value}">
    </div>`
  }

  const koFieldsHTML = config.fields.map(f => renderField(f.key, f.label, f.type, false)).join('')
  const enFieldsHTML = config.fields.map(f => renderField(f.key, f.label, f.type, true)).filter(Boolean).join('')

  return adminBase(config.label, `
    <div class="admin-page-header"><h2>${config.label}</h2></div>
    ${saved ? `<div style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:0.75rem 1rem;font-size:0.9rem;margin-bottom:1.5rem;"><i class="fas fa-check-circle"></i> 저장되었습니다.</div>` : ''}
    <div class="admin-card">
      <form method="POST" action="/admin/pages/${page}"${hasImageField ? ' enctype="multipart/form-data"' : ''}>

        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:2px solid #e0e8ff;">
          <span style="font-size:1.1rem;">🇰🇷</span>
          <h3 style="color:#0052A5;font-size:1rem;font-weight:700;margin:0;">한국어</h3>
        </div>
        ${koFieldsHTML}

        <div style="display:flex;align-items:center;gap:0.5rem;margin:2rem 0 0.5rem;padding-top:1.5rem;border-top:2px solid #e8e0ff;padding-bottom:0.75rem;border-bottom:2px solid #e8e0ff;">
          <span style="font-size:1.1rem;">🇺🇸</span>
          <h3 style="color:#6f42c1;font-size:1rem;font-weight:700;margin:0;">English</h3>
          <span style="font-size:0.8rem;color:#888;margin-left:0.5rem;">비워두면 기본 영어 번역이 사용됩니다.</span>
        </div>
        ${enFieldsHTML}

        <div class="form-actions">
          <button type="submit" class="btn-primary"><i class="fas fa-save"></i> 저장</button>
        </div>
      </form>
    </div>`, user)
}

// ──────────────── 스타일 ────────────────

const adminStyles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Noto Sans KR', sans-serif; background: #f0f2f5; color: #222; }
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar {
  width: 240px; min-width: 240px; background: #003366; color: #fff;
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; overflow-y: auto;
}
.sidebar-logo {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 1.2rem 1.5rem; font-size: 0.95rem; font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.12); flex-shrink: 0;
}
.sidebar-logo i { font-size: 1.2rem; color: #66aaff; }
.sidebar-nav { flex: 1; padding: 0.5rem 0; }
.sg { border-bottom: 1px solid rgba(255,255,255,0.07); }
.sg-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 0.65rem 1.2rem; background: none; border: none;
  color: rgba(255,255,255,0.8); font-size: 0.82rem; font-weight: 600;
  cursor: pointer; text-align: left; font-family: inherit; letter-spacing: 0.01em;
}
.sg-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sg-btn span i { margin-right: 0.45rem; color: #66aaff; font-size: 0.85rem; }
.sg-chev { font-size: 0.65rem; transition: transform 0.2s; flex-shrink: 0; }
.sg-items { overflow: hidden; transition: max-height 0.25s ease; }
.sg-item {
  display: block; padding: 0.5rem 1.2rem 0.5rem 2.6rem;
  color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.82rem;
  transition: all 0.15s; border-left: 3px solid transparent;
}
.sg-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sg-item.active { background: rgba(255,255,255,0.1); color: #fff; border-left-color: #66aaff; }
.sidebar-footer { border-top: 1px solid rgba(255,255,255,0.12); padding: 0.75rem 0; flex-shrink: 0; }
.sidebar-link {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1.2rem; color: rgba(255,255,255,0.65);
  text-decoration: none; font-size: 0.82rem; transition: all 0.15s;
}
.sidebar-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
.sidebar-ext { font-size: 0.78rem; }
.sidebar-logout { color: #ff9999; }
.sidebar-logout:hover { background: rgba(255,100,100,0.15); }
.admin-main { margin-left: 240px; padding: 2rem; flex: 1; }
.admin-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
.admin-page-header h2 { font-size: 1.4rem; font-weight: 700; }
.admin-page-header h3 { font-size: 1.1rem; font-weight: 700; }
.admin-card { background: #fff; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); overflow: hidden; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
.admin-table th { background: #f8f9fa; padding: 0.8rem 1rem; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #e9ecef; }
.admin-table td { padding: 0.8rem 1rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.admin-table tr:hover td { background: #f8f9ff; }
.btn-sm { display: inline-block; padding: 0.3rem 0.7rem; border-radius: 4px; font-size: 0.8rem; text-decoration: none; cursor: pointer; border: none; font-family: inherit; }
.btn-edit { background: #e6f0ff; color: #0052A5; }
.btn-edit:hover { background: #cce0ff; }
.btn-delete { background: #fff0f0; color: #d32f2f; }
.btn-delete:hover { background: #ffd6d6; }
.btn-primary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.2rem; background: #0052A5; color: #fff; border: none; border-radius: 6px; font-size: 0.9rem; font-family: inherit; font-weight: 600; cursor: pointer; text-decoration: none; transition: background 0.2s; }
.btn-primary:hover { background: #003d7a; }
.btn-secondary { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.2rem; background: #f0f0f0; color: #555; border: none; border-radius: 6px; font-size: 0.9rem; font-family: inherit; cursor: pointer; text-decoration: none; transition: background 0.2s; }
.btn-secondary:hover { background: #e0e0e0; }
.cat-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
.cat-일반공고 { background: #e6f0ff; color: #0052A5; }
.cat-주주총회 { background: #fff3e0; color: #e65100; }
.cat-기타     { background: #f5f5f5; color: #666; }
.form-row { display: flex; gap: 1.5rem; }
.form-group { padding: 1.5rem 1.5rem 0; }
.form-group:last-of-type { padding-bottom: 0; }
label { display: block; font-size: 0.87rem; font-weight: 600; color: #444; margin-bottom: 0.5rem; }
.required { color: #d32f2f; }
input[type=text], input[type=date], input[type=url], select, textarea {
  width: 100%; padding: 0.7rem 0.9rem;
  border: 1px solid #ddd; border-radius: 6px;
  font-size: 0.95rem; font-family: inherit;
  outline: none; transition: border 0.2s;
}
input:focus, select:focus, textarea:focus { border-color: #0052A5; }
textarea { resize: vertical; line-height: 1.6; }
input[type=file] { padding: 0.4rem 0; border: none; font-size: 0.9rem; }
input[type=checkbox] { width: auto; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.5rem; border-top: 1px solid #f0f0f0; margin-top: 1.5rem; }
.form-error { margin: 1.5rem 1.5rem 0; background: #fff0f0; color: #d32f2f; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.9rem; }
.existing-attachments { border: 1px solid #eee; border-radius: 6px; overflow: hidden; }
.attachment-item { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 1rem; border-bottom: 1px solid #f5f5f5; font-size: 0.9rem; }
.attachment-item:last-child { border-bottom: none; }
.attachment-item i { margin-right: 0.4rem; color: #888; }
.delete-check { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #d32f2f; cursor: pointer; font-weight: 400; }
.icon-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
.icon-suggest-btn {
  width: 2.2rem; height: 2.2rem; border: 1px solid #ddd; border-radius: 6px;
  background: #f8f9fa; cursor: pointer; font-size: 0.9rem; color: #555;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.icon-suggest-btn:hover { background: #e6f0ff; color: #0052A5; border-color: #b0d0ff; }

/* ── 햄버거 버튼 ── */
.hamburger {
  display: none; position: fixed; top: 0.75rem; left: 0.75rem; z-index: 200;
  background: #003366; color: #fff; border: none; border-radius: 8px;
  padding: 0.55rem 0.75rem; font-size: 1.2rem; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
.sidebar-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 99;
}
.sidebar-overlay.open { display: block; }

/* ── 모바일 반응형 ── */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-260px); transition: transform 0.25s ease; z-index: 100;
  }
  .admin-sidebar.open { transform: translateX(0); }
  .admin-main { margin-left: 0 !important; padding: 3.5rem 1rem 2rem; }
  .hamburger { display: flex; align-items: center; justify-content: center; }
  .admin-page-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .admin-page-header h2 { font-size: 1.1rem; }
  .form-row { flex-direction: column; }
  div[style*="grid-template-columns:1fr 1fr"],
  div[style*="grid-template-columns: 1fr 1fr"] {
    grid-template-columns: 1fr !important;
  }
  div[style*="grid-template-columns:repeat(auto-fit"] {
    grid-template-columns: 1fr 1fr !important;
  }
  .admin-table { font-size: 0.78rem; }
  .admin-table th, .admin-table td { padding: 0.5rem 0.4rem; }
}
@media (max-width: 480px) {
  div[style*="grid-template-columns:repeat(auto-fit"] {
    grid-template-columns: 1fr !important;
  }
}
`

export default admin
