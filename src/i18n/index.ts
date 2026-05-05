import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: {
    translation: {
      app: {
        name: 'Play to Learn',
        tagline: 'Learn languages, math & chess — the fun way!',
      },
      auth: {
        login: 'Log in',
        signup: 'Sign up',
        email: 'Email',
        password: 'Password',
        name: 'Your name',
        haveAccount: 'Already have an account?',
        noAccount: "Don't have an account?",
        google: 'Continue with Google',
        or: 'or',
      },
      tabs: { learn: 'Learn', courses: 'Courses', tutor: 'AI Tutor', profile: 'Profile' },
      lesson: {
        start: 'Start',
        review: 'Review',
        continue: 'Continue',
        check: 'Check',
        skip: 'Skip',
        correct: 'Nice work!',
        wrong: 'Not quite — try again!',
        complete: 'Lesson complete!',
        xpEarned: 'XP earned',
      },
      sub: {
        title: 'Go Plus',
        subtitle: 'Unlock unlimited learning',
        cta: 'Subscribe now',
        managed: 'Manage subscription',
        gcash: 'Pay with GCash',
        card: 'Pay with Card',
      },
    },
  },
  fil: {
    translation: {
      app: {
        name: 'Play to Learn',
        tagline: 'Matuto ng wika, math at chess — habang naglalaro!',
      },
      auth: {
        login: 'Mag-login',
        signup: 'Mag-sign up',
        email: 'Email',
        password: 'Password',
        name: 'Iyong pangalan',
        haveAccount: 'May account ka na?',
        noAccount: 'Wala pang account?',
        google: 'Magpatuloy gamit ang Google',
        or: 'o',
      },
      tabs: { learn: 'Matuto', courses: 'Kurso', tutor: 'AI Tutor', profile: 'Profile' },
      lesson: {
        start: 'Simulan',
        review: 'Balikan',
        continue: 'Magpatuloy',
        check: 'Suriin',
        skip: 'Laktawan',
        correct: 'Galing!',
        wrong: 'Mali — subukan ulit!',
        complete: 'Tapos na ang aralin!',
        xpEarned: 'XP na nakuha',
      },
      sub: {
        title: 'Maging Plus',
        subtitle: 'I-unlock ang walang-hanggang pag-aaral',
        cta: 'Mag-subscribe na',
        managed: 'Pamahalaan ang subscription',
        gcash: 'Magbayad gamit ang GCash',
        card: 'Magbayad gamit ang Card',
      },
    },
  },
  es: {
    translation: {
      app: { name: 'Play to Learn', tagline: '¡Aprende idiomas, matemáticas y ajedrez!' },
      auth: {
        login: 'Iniciar sesión',
        signup: 'Registrarse',
        email: 'Correo',
        password: 'Contraseña',
        name: 'Tu nombre',
        haveAccount: '¿Ya tienes cuenta?',
        noAccount: '¿No tienes cuenta?',
        google: 'Continuar con Google',
        or: 'o',
      },
      tabs: { learn: 'Aprender', courses: 'Cursos', tutor: 'Tutor IA', profile: 'Perfil' },
      lesson: {
        start: 'Comenzar',
        review: 'Repasar',
        continue: 'Continuar',
        check: 'Comprobar',
        skip: 'Saltar',
        correct: '¡Excelente!',
        wrong: 'Casi — ¡inténtalo de nuevo!',
        complete: '¡Lección completa!',
        xpEarned: 'XP ganado',
      },
      sub: {
        title: 'Hazte Plus',
        subtitle: 'Desbloquea aprendizaje ilimitado',
        cta: 'Suscríbete',
        managed: 'Gestionar suscripción',
        gcash: 'Pagar con GCash',
        card: 'Pagar con tarjeta',
      },
    },
  },
};

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
const lang = ['en', 'fil', 'es'].includes(deviceLang) ? deviceLang : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: lang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v3',
});

export default i18n;
