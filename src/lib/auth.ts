import { Profile, UserRole } from '../types';
import { db } from './database';

const AUTH_USER_KEY = 'vipstore_auth_user_session_v1';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    phone: string;
    is_verified: boolean;
  };
  profile: Profile;
}

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Set<(session: AuthSession | null) => void> = new Set();
  private pendingOtp: { phoneOrEmail: string; code: string; userId: string; isSignup: boolean } | null = null;

  constructor() {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // refresh profile from db
        const latestProfile = db.getProfileById(parsed.user.id);
        if (latestProfile) {
          this.currentSession = {
            user: parsed.user,
            profile: latestProfile,
          };
        } else {
          this.currentSession = parsed;
        }
      } catch (e) {
        this.currentSession = null;
      }
    } else {
      // Default to demo merchant أحمد محمود for quick exploration
      const demoProfile = db.getProfileById('user-merchant-demo-01');
      if (demoProfile) {
        this.currentSession = {
          user: {
            id: demoProfile.id,
            email: demoProfile.email || 'merchant@vipstore.com',
            phone: demoProfile.phone || '+201012345678',
            is_verified: true,
          },
          profile: demoProfile,
        };
      }
    }
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public getUser(): AuthSession['user'] | null {
    return this.currentSession ? this.currentSession.user : null;
  }

  public getProfile(): Profile | null {
    return this.currentSession ? this.currentSession.profile : null;
  }

  public getRole(): UserRole | null {
    return this.currentSession ? this.currentSession.profile.role : null;
  }

  public isSuperAdmin(): boolean {
    return this.currentSession?.profile.role === 'super_admin';
  }

  public isMerchant(): boolean {
    return this.currentSession?.profile.role === 'merchant' || this.isSuperAdmin();
  }

  public subscribe(cb: (session: AuthSession | null) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    if (this.currentSession) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentSession));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    this.listeners.forEach((cb) => cb(this.currentSession));
  }

  // Request OTP for phone or email
  public requestOtp(phoneOrEmail: string, isSignup = false, role: UserRole = 'merchant') {
    const isEmail = phoneOrEmail.includes('@');
    const existingProfiles = db.getProfiles();
    const existing = existingProfiles.find(
      (p) => (isEmail && p.email?.toLowerCase() === phoneOrEmail.toLowerCase()) ||
             (!isEmail && p.phone === phoneOrEmail)
    );

    let userId = existing ? existing.id : 'user-' + Math.random().toString(36).substring(2, 9);

    // Generate 6-digit OTP (in DEV mode, 123456 is always accepted)
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    this.pendingOtp = {
      phoneOrEmail,
      code: generatedCode,
      userId,
      isSignup,
    };

    return {
      success: true,
      demoCode: import.meta.env.DEV ? '123456' : generatedCode,
      message: `تم إرسال رمز التحقق إلى ${phoneOrEmail}`,
    };
  }

  // Verify OTP
  public verifyOtp(code: string, fullName?: string, role: UserRole = 'merchant'): boolean {
    const isDev = import.meta.env.DEV === true;
    const isValidCode = (this.pendingOtp && this.pendingOtp.code === code) || (isDev && code === '123456');

    if (!isValidCode || !this.pendingOtp) {
      throw new Error('رمز التحقق غير صحيح. تأكد من إدخال الرمز بشكل صحيح.');
    }

    const { phoneOrEmail, userId } = this.pendingOtp;
    const isEmail = phoneOrEmail.includes('@');

    let profile = db.getProfileById(userId);
    if (!profile) {
      // Auto-create profile on signup trigger
      profile = {
        id: userId,
        full_name: fullName || (isEmail ? phoneOrEmail.split('@')[0] : 'تاجر VIP'),
        email: isEmail ? phoneOrEmail : null,
        phone: !isEmail ? phoneOrEmail : null,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.createProfile(profile);
    }

    this.currentSession = {
      user: {
        id: userId,
        email: isEmail ? phoneOrEmail : (profile.email || ''),
        phone: !isEmail ? phoneOrEmail : (profile.phone || ''),
        is_verified: true,
      },
      profile,
    };

    this.pendingOtp = null;
    this.notify();
    return true;
  }

  // Direct login for demo quick-switch
  public loginAs(role: 'super_admin' | 'merchant' | 'new_merchant') {
    if (role === 'super_admin') {
      const admin = db.getProfileById('user-super-admin-01');
      if (admin) {
        this.currentSession = {
          user: {
            id: admin.id,
            email: admin.email!,
            phone: admin.phone!,
            is_verified: true,
          },
          profile: admin,
        };
        this.notify();
      }
    } else if (role === 'merchant') {
      const merchant = db.getProfileById('user-merchant-demo-01');
      if (merchant) {
        this.currentSession = {
          user: {
            id: merchant.id,
            email: merchant.email!,
            phone: merchant.phone!,
            is_verified: true,
          },
          profile: merchant,
        };
        this.notify();
      }
    } else if (role === 'new_merchant') {
      const newId = 'user-new-' + Math.random().toString(36).substring(2, 7);
      const newProfile: Profile = {
        id: newId,
        full_name: 'تاجر جديد',
        email: `new_merchant_${Date.now()}@vipstore.com`,
        phone: `+201${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'merchant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.createProfile(newProfile);
      this.currentSession = {
        user: {
          id: newProfile.id,
          email: newProfile.email!,
          phone: newProfile.phone!,
          is_verified: true,
        },
        profile: newProfile,
      };
      this.notify();
    }
  }

  public logout() {
    this.currentSession = null;
    this.pendingOtp = null;
    this.notify();
  }
}

export const auth = new AuthService();
