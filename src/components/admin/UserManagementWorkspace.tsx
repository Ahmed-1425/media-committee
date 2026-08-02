'use client';

import React, { useState } from 'react';
import {
  inviteOrUserCreate,
  updateUserAccount,
  resetUserPasswordDirectly,
  toggleUserStatus,
  deleteUserAccount,
} from '@/actions/users';
import {
  UserPlus,
  Users,
  ShieldCheck,
  Building2,
  KeyRound,
  Edit,
  Trash2,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface ProfileItem {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  account_status: string;
  membership?: any;
}

interface InitiativeItem {
  id: string;
  name: string;
}

export function UserManagementWorkspace({
  profiles,
  initiatives,
}: {
  profiles: ProfileItem[];
  initiatives: InitiativeItem[];
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Modals state
  const [editingUser, setEditingUser] = useState<ProfileItem | null>(null);
  const [resettingUser, setResettingUser] = useState<ProfileItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<ProfileItem | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Helper to extract initiative name cleanly from object or array response
  function getInitiativeName(p: ProfileItem): string {
    const m = p.membership;
    if (!m) return '-';
    if (Array.isArray(m)) {
      return m[0]?.initiative?.name || '-';
    }
    return m.initiative?.name || '-';
  }

  // Helper to extract initiative ID
  function getInitiativeId(p: ProfileItem): string {
    const m = p.membership;
    if (!m) return '';
    if (Array.isArray(m)) {
      return m[0]?.initiative_id || '';
    }
    return m.initiative_id || '';
  }

  // Handle Create User Submit
  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await inviteOrUserCreate(formData);

    setLoading(false);
    if (result.error) {
      setMessage({ text: result.error, isError: true });
    } else if (result.success) {
      setMessage({ text: result.success, isError: false });
      (e.target as HTMLFormElement).reset();
    }
  }

  // Handle Update User Submit
  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateUserAccount(formData);

    setLoading(false);
    setEditingUser(null);
    if (result.error) {
      setMessage({ text: result.error, isError: true });
    } else if (result.success) {
      setMessage({ text: result.success, isError: false });
    }
  }

  // Handle Reset Password Submit
  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resettingUser) return;
    setLoading(true);
    setMessage(null);

    const result = await resetUserPasswordDirectly(resettingUser.id, newPasswordValue);

    setLoading(false);
    setResettingUser(null);
    setNewPasswordValue('');
    if (result.error) {
      setMessage({ text: result.error, isError: true });
    } else if (result.success) {
      setMessage({ text: result.success, isError: false });
    }
  }

  // Handle Delete User Submit
  async function handleDeleteSubmit() {
    if (!deletingUser) return;
    setLoading(true);
    setMessage(null);

    const result = await deleteUserAccount(deletingUser.id);

    setLoading(false);
    setDeletingUser(null);
    if (result.error) {
      setMessage({ text: result.error, isError: true });
    } else if (result.success) {
      setMessage({ text: result.success, isError: false });
    }
  }

  // Handle Toggle Status
  async function handleToggle(userId: string, isDisable: boolean) {
    setLoading(true);
    setMessage(null);

    const result = await toggleUserStatus(userId, isDisable);
    setLoading(false);
    if (result.error) {
      setMessage({ text: result.error, isError: true });
    } else if (result.success) {
      setMessage({ text: result.success, isError: false });
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Toast Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            message.isError
              ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-mono opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Executive Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#06266F] via-[#023793] to-[#041B52] text-white p-6 sm:p-8 shadow-xl border border-blue-400/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold border border-white/15 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>إدارة الحسابات والصلاحيات المعالجة</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              إدارة مستخدمي وممثلي المبادرات الطلابية
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              قم بإنشاء وتعديل الحسابات، تعيين كلمات المرور، وربط كل ممثل بمبادرته التابعة مباشرة ليتمكن من تسجيل الدخول والبدء بالعمل فوراً.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-white/10 border border-white/20 text-center space-y-1">
            <Users className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xl font-black text-white">{profiles.length}</p>
            <p className="text-[11px] text-blue-200 font-semibold">إجمالي الحسابات المسجلة</p>
          </div>
        </div>
      </div>

      {/* Modern Account Creation Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#06266F]/10 dark:bg-blue-500/10 text-[#06266F] dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">إنشاء وتجهيز حساب جديد</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">إضافة بريد وكلمة مرور وتحديد المبادرة لربطه تلقائياً</p>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            تفعيل فوري للمبادرة
          </span>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">اسم المستخدم / ممثل المبادرة *</label>
              <div className="relative">
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="مثال: ممثل مبادرة طويق"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="user@gmail.com"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] transition-all dir-ltr text-right"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">كلمة المرور *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  defaultValue="Aa112233@112233@"
                  placeholder="كلمة المرور..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] transition-all dir-ltr text-right"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">نوع الصلاحية (الدور) *</label>
              <div className="relative">
                <select
                  name="role"
                  defaultValue="initiative"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold focus:ring-2 focus:ring-[#06266F] transition-all"
                >
                  <option value="initiative">ممثل مبادرة طلابية (Initiative)</option>
                  <option value="super_admin">مشرف ممتاز بالإدارة (Super Admin)</option>
                </select>
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Initiative Assignment */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">المبادرة التابع لها *</label>
              <div className="relative">
                <select
                  name="initiative_id"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-[#06266F] dark:text-blue-400 focus:ring-2 focus:ring-[#06266F] transition-all"
                >
                  <option value="">حدد المبادرة من القائمة...</option>
                  {initiatives.map((ini) => (
                    <option key={ini.id} value={ini.id}>
                      {ini.name}
                    </option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">رقم الجوال (اختياري)</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="05xxxxxxxx"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#06266F] transition-all dir-ltr text-right"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-[#06266F] hover:bg-[#023793] text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>إنشاء وتفعيل الحساب فوراً</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Users Operational Table */}
      <div className="rounded-3xl bg-white dark:bg-[#111C35] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#06266F] dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">قائمة الحسابات المعالجة والمعتمدة</h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">عدد الحسابات: {profiles.length}</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الصلاحية</th>
                <th className="p-4">المبادرة التابع لها</th>
                <th className="p-4">الحالة التشغيلية</th>
                <th className="p-4 text-center">التحكم والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {profiles.map((p) => {
                const initiativeName = getInitiativeName(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    
                    {/* User Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06266F] to-[#023793] text-white flex items-center justify-center font-black text-xs shadow-sm">
                          {p.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.full_name || 'مستخدم غير مسمى'}</p>
                          {p.phone && <p className="text-[10px] text-slate-400">{p.phone}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300 dir-ltr text-right">
                      {p.email}
                    </td>

                    {/* Role Badge */}
                    <td className="p-4 font-bold">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] ${
                          p.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/30'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300/30'
                        }`}
                      >
                        {p.role === 'super_admin' ? 'مشرف ممتاز (Super Admin)' : 'ممثل مبادرة طلابية'}
                      </span>
                    </td>

                    {/* Initiative Chip */}
                    <td className="p-4">
                      {p.role === 'initiative' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>{initiativeName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">الإدارة العامة</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(p.id, p.account_status === 'active')}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                          p.account_status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-rose-100 hover:text-rose-800'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        {p.account_status === 'active' ? 'نشط (اضغط للتعطيل)' : 'معطل (اضغط التنشيط)'}
                      </button>
                    </td>

                    {/* Control Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        <button
                          onClick={() => setEditingUser(p)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-700 dark:text-slate-300 hover:text-blue-700 transition-colors"
                          title="تعديل بيانات الحساب"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setResettingUser(p)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 text-slate-700 dark:text-slate-300 hover:text-amber-700 transition-colors"
                          title="تعيين كلمة مرور جديدة"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingUser(p)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-300 hover:text-rose-700 transition-colors"
                          title="حذف الحساب نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Transformation View */}
        <div className="md:hidden p-4 space-y-3">
          {profiles.map((p) => {
            const initiativeName = getInitiativeName(p);
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06266F] to-[#023793] text-white flex items-center justify-center font-bold text-xs">
                      {p.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{p.full_name || 'مستخدم غير مسمى'}</h4>
                      <p className="text-[10px] text-slate-400 font-mono dir-ltr text-right">{p.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(p.id, p.account_status === 'active')}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold ${
                      p.account_status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {p.account_status === 'active' ? 'نشط' : 'معطل'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    {p.role === 'super_admin' ? 'Super Admin' : 'ممثل مبادرة'}
                  </span>
                  {p.role === 'initiative' && (
                    <span className="font-bold text-amber-600 dark:text-amber-400">{initiativeName}</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setEditingUser(p)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => setResettingUser(p)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>كلمة السر</span>
                  </button>

                  <button
                    onClick={() => setDeletingUser(p)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Edit Account Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`تعديل حساب: ${editingUser.full_name}`}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs pt-2">
            <input type="hidden" name="userId" value={editingUser.id} />

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">الاسم الكامل *</label>
              <input
                type="text"
                name="full_name"
                defaultValue={editingUser.full_name}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">نوع الصلاحية (الدور)</label>
              <select
                name="role"
                defaultValue={editingUser.role}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold"
              >
                <option value="initiative">ممثل مبادرة طلابية (Initiative)</option>
                <option value="super_admin">مشرف ممتاز (Super Admin)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">المبادرة التابع لها</label>
              <select
                name="initiative_id"
                defaultValue={getInitiativeId(editingUser)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-[#06266F]"
              >
                <option value="">حدد المبادرة...</option>
                {initiatives.map((ini) => (
                  <option key={ini.id} value={ini.id}>
                    {ini.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">رقم التواصل (اختياري)</label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingUser.phone || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm dir-ltr text-right"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#06266F] hover:bg-[#023793] text-white font-bold rounded-xl shadow-md"
              >
                حفظ التعديلات
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <Modal
          isOpen={!!resettingUser}
          onClose={() => setResettingUser(null)}
          title={`تعيين كلمة مرور جديدة للحساب: ${resettingUser.email}`}
        >
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs pt-2">
            <p className="text-slate-500 leading-relaxed">
              أدخل كلمة المرور الجديدة الخاصة بـ <span className="font-bold text-slate-900 dark:text-white">{resettingUser.full_name}</span> ليتمكن من تسجيل الدخول بها فوراً.
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">كلمة المرور الجديدة *</label>
              <input
                type="text"
                required
                minLength={8}
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                placeholder="أدخل 8 خانات على الأقل..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono dir-ltr text-right"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || newPasswordValue.length < 8}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                تحديث كلمة المرور
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <Modal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          title="تأكيد حذف الحساب نهائياً"
        >
          <div className="space-y-4 text-xs pt-2">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 leading-relaxed">
              <p className="font-bold">تحذير هائل:</p>
              <p>هل أنت أكتد من رغبتك بحذف حساب <span className="underline font-bold">{deletingUser.full_name}</span> ({deletingUser.email}) نهائياً من قاعدة البيانات والمنصة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                تأكيد الحذف النهائي
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
