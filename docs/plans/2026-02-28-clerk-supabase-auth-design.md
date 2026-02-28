# Clerk + Supabase 用户认证系统设计

**日期:** 2026-02-28
**状态:** 已批准

## 概述

为 AInote 应用接入 Clerk 用户认证系统和 Supabase 数据库，实现：
- 邮箱 + Google OAuth 登录/注册
- Clerk Middleware 全局路由保护
- 笔记数据持久化到 Supabase（按用户隔离）
- localStorage 数据自动迁移

## 技术选型

- **认证:** Clerk（@clerk/nextjs）
- **数据库:** Supabase（PostgreSQL）
- **登录方式:** 邮箱 + Google OAuth
- **登录 UI:** Clerk 内置组件（`<SignIn />` / `<SignUp />`）
- **路由保护:** Clerk Middleware（方案 A - 全局保护）

## 架构

```
用户浏览器
    │
    ▼
┌─────────────────────────────┐
│  Next.js Middleware          │  ← Clerk 鉴权拦截
│  公开路由: /sign-in, /sign-up│
│  保护路由: /, /api/*         │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐  ┌──────────────┐
│ 页面路由  │  │  API 路由     │
│ /        │  │ /api/process │
│ /sign-in │  │ /api/notes   │
│ /sign-up │  └──────┬───────┘
└─────────┘         │
                    ▼
            ┌───────────────┐
            │  Supabase     │
            │  - users 表    │
            │  - notes 表    │
            └───────────────┘
```

## 数据库设计

### users 表

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | Supabase 自动生成 |
| clerk_id | text (UNIQUE) | Clerk 用户 ID |
| email | text | 用户邮箱 |
| name | text | 用户名 |
| avatar_url | text | 头像 URL |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### notes 表

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 笔记 ID |
| user_id | text (FK → users.clerk_id) | 所属用户 |
| content | text | 原始输入内容 |
| type | text | Action/Query/Idea/Resource/Unclassified |
| status | text | pending/processing/completed/error |
| title | text | AI 生成标题 |
| processed_content | text | AI 处理后的 Markdown |
| tags | text[] | 标签数组 |
| suggested_action | text | 建议操作 |
| deadline | text | 截止日期 |
| position_x | float | 卡片 X 坐标 |
| position_y | float | 卡片 Y 坐标 |
| z_index | int | 层级 |
| is_expanded | boolean | 是否展开 |
| checked_items | jsonb | 已勾选项 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### RLS 策略

- notes: 用户只能读写 `WHERE user_id = clerk_id`
- users: 用户只能读自己的记录

## API 路由设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/notes | 获取当前用户所有笔记 |
| POST | /api/notes | 创建新笔记 |
| PATCH | /api/notes/[id] | 更新笔记 |
| DELETE | /api/notes/[id] | 删除笔记 |
| POST | /api/webhooks/clerk | Clerk Webhook 用户同步 |

## 文件变更

### 新增文件

- `middleware.ts` — Clerk 路由保护
- `app/sign-in/[[...sign-in]]/page.tsx` — 登录页
- `app/sign-up/[[...sign-up]]/page.tsx` — 注册页
- `app/api/notes/route.ts` — 笔记 GET/POST
- `app/api/notes/[id]/route.ts` — 笔记 PATCH/DELETE
- `app/api/webhooks/clerk/route.ts` — Clerk Webhook
- `lib/supabase.ts` — Supabase 客户端

### 修改文件

- `app/layout.tsx` — ClerkProvider + UserButton
- `App.tsx` — localStorage → API 调用
- `services/apiService.ts` — 新增笔记 CRUD
- `types.ts` — 类型更新
- `package.json` — 新增依赖

### 新增依赖

- `@clerk/nextjs`
- `@supabase/supabase-js`
- `svix`

## 数据迁移

首次登录自动迁移 localStorage → Supabase：
1. 登录成功后检查 localStorage 是否有笔记
2. 有则批量上传到 Supabase 关联当前用户
3. 成功后清除 localStorage
4. 后续全部走 API

## 环境变量

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
