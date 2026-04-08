# מדריך העלאה לחנויות — Google Play & Apple App Store

מדריך מלא להעלאת **מחוננים** כאפליקציה ל-Android (Google Play) ול-iOS (Apple App Store) באמצעות **Capacitor** — שעוטף את אותו ה-code base הקיים (Vite + React) כ-WebView native, בלי לכתוב מחדש כלום.

---

## 0. תשתית שכבר הוקמה ✅

- ✅ `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios` הותקנו
- ✅ `capacitor.config.ts` נוצר עם:
  - `appId: com.razielamir.mehunanim` (ה-bundle id; אפשר לשנות)
  - `appName: מחוננים`
  - `webDir: dist`
  - SplashScreen + StatusBar בצבעי המותג

---

## 1. דרישות מקדימות

### לפיתוח Android
- **Android Studio** (https://developer.android.com/studio) — חינם
- **JDK 17+** (מגיע עם Android Studio)
- מכשיר אנדרואיד או אמולטור

### לפיתוח iOS (חובה Mac)
- **Xcode 15+** מ-Mac App Store
- **CocoaPods**: `sudo gem install cocoapods`
- חשבון **Apple Developer** ($99/שנה) לחתימה ולחנות

---

## 2. יצירת הפלטפורמות (פעם אחת)

```bash
cd /Users/razielamir/Mehunanim

# בנייה ראשונית
npm run build

# הוספת פלטפורמות (יוצר תיקיות android/ ו-ios/)
npx cap add android
npx cap add ios

# סנכרון נכסי web אל הפרויקטים הילידים
npx cap sync
```

> כל פעם שמשנים קוד frontend: `npm run build && npx cap sync`.

---

## 3. הרצה במכשיר/אמולטור

### Android
```bash
npx cap open android   # פותח Android Studio
```
ב-Android Studio: לחץ ▶️ Run, בחר אמולטור או חבר מכשיר עם USB Debugging.

### iOS
```bash
npx cap open ios       # פותח Xcode
```
ב-Xcode: בחר Simulator (iPhone 15 / iPad Pro), לחץ ▶️.

---

## 4. אייקונים ו-Splash Screen

הכן קובץ אחד גדול:
- **icon.png**: 1024×1024 PNG, רקע מלא (לא שקוף)
- **splash.png**: 2732×2732 PNG, הלוגו במרכז

צור אותם ב-`resources/`:
```bash
mkdir resources
# הכנס את icon.png ו-splash.png לתיקייה
npx @capacitor/assets generate --iconBackgroundColor '#8b5cf6' --splashBackgroundColor '#8b5cf6'
```
זה ייצר אוטומטית את כל הגדלים לכל הפלטפורמות.

---

## 5. הגדרות חיוניות לפני שליחה לחנות

### Android — `android/app/build.gradle`
- `applicationId "com.razielamir.mehunanim"`
- `versionCode 1` (מספר שלם, מעלים בכל release)
- `versionName "1.0.0"`
- `targetSdkVersion 34` (חובת Google Play 2024)

### iOS — Xcode → פרויקט → Target → Signing & Capabilities
- **Bundle Identifier**: `com.razielamir.mehunanim`
- **Team**: בחר את חשבון ה-Apple Developer שלך
- **Deployment Target**: iOS 14.0+
- **Display Name**: מחוננים

### הרשאות (אם תוסיף בעתיד)
- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/App/App/Info.plist` עם NSUsageDescription לכל פרמיששן

כרגע האפליקציה לא דורשת הרשאות מיוחדות (אין מצלמה/מיקום/מיקרופון).

---

## 6. בנייה לחנות

### Android — Bundle (AAB) ל-Google Play
```bash
cd android
./gradlew bundleRelease
```
התוצאה: `android/app/build/outputs/bundle/release/app-release.aab`

**חתימה**: לפני release, צור keystore:
```bash
keytool -genkey -v -keystore mehunanim.keystore -alias mehunanim -keyalg RSA -keysize 2048 -validity 10000
```
הוסף ל-`android/app/build.gradle` בלוק `signingConfigs` (מסמכי Capacitor: https://capacitorjs.com/docs/android/deploying-to-google-play).

### iOS — Archive ל-App Store
ב-Xcode:
1. Product → Scheme → Edit Scheme → Run → Build Configuration: **Release**
2. Product → **Archive**
3. Organizer → Distribute App → **App Store Connect** → Upload

---

## 7. שליחה לחנויות

### Google Play Console — https://play.google.com/console
1. הירשם ($25 חד-פעמי)
2. צור App חדשה: שם="מחוננים", שפה=עברית, קטגוריה=Education
3. השלם:
   - **Store listing**: תיאור קצר/ארוך, צילומי מסך (פלאפון + טאבלט), אייקון 512×512, גרפיקה ראשית 1024×500
   - **Content rating**: מלא שאלון (Everyone/All ages)
   - **Target audience**: 5–8 years (מסמן Designed for Families)
   - **Data safety**: אין איסוף נתונים אישיים, רק localStorage
   - **Privacy policy**: קישור לעמוד מדיניות (חובה)
4. העלה את ה-AAB ב-**Production** track
5. בקש review (~3-7 ימים)

### Apple App Store — https://appstoreconnect.apple.com
1. צור Bundle ID ב-Apple Developer
2. צור App ב-App Store Connect: Name="Mehunanim — Gifted", Primary Language=Hebrew
3. השלם:
   - תיאור, keywords, צילומי מסך (iPhone 6.7", 5.5" + iPad 12.9"), אייקון 1024×1024
   - **Age Rating**: 4+
   - **Category**: Education / Kids 6-8
   - **Privacy**: מלא Data Collection (None)
   - **Privacy Policy URL**: חובה
4. בחר build שעלה מ-Xcode
5. Submit for Review (~1-3 ימים)

---

## 8. דרישות חוקיות לאפליקציות ילדים 🛡️

שתי החנויות מחמירות במיוחד עם ילדים:

### חובות
- **מדיניות פרטיות** ייעודית — באתר ציבורי. דוגמה ב-`PRIVACY.md` (יש להעלות לדומיין).
- **COPPA** (ארה"ב) — אסור לאסוף PII מילדים מתחת לגיל 13 ללא הסכמת הורים. **המצב באפליקציה: לא נאסף שום מידע אישי. הכל ב-localStorage מקומי.**
- **GDPR-K** (אירופה) — דומה.
- **Designed for Families** (Google) — צריך לסמן ולעמוד בכללים מחמירים: בלי פרסומות פולשניות, בלי IAP בלי gate הורי, בלי קישורים יוצאים בלי הסכמה.
- **Apple Kids Category** — חובת PIN/חידה הורית לכל קישור יוצא, ללא third-party analytics, ללא פרסומות מבוססות התנהגות.

### מה כבר עשינו נכון
- ✅ Parent gate ("כמה זה 7×8?") שחוסם את אזור ההורים
- ✅ אין איסוף נתונים — הכל ב-localStorage
- ✅ אין פרסומות
- ✅ אין קישורים חיצוניים
- ✅ Gemini API נמצא מאחורי serverless proxy עם system prompt קשוח שמסנן תוכן

### מה צריך להוסיף
- 📝 דף **Privacy Policy** ציבורי (יצרתי דוגמה ב-`PRIVACY.md` — צריך להעלות לדומיין)
- 📝 דף **Terms of Service** (אופציונלי)
- 📝 צילומי מסך מרשימים (להכין ב-Figma או באייפד אמיתי)

---

## 9. עדכוני גרסאות

```bash
# 1. שנה קוד
# 2. בנה מחדש
npm run build
npx cap sync

# 3. עלה versionCode ב-android/app/build.gradle ו-CFBundleVersion ב-ios
# 4. בנה AAB / Archive
# 5. העלה לחנות
```

---

## 10. תזרים פיתוח עתידי

- **Live reload במכשיר**: ערוך `capacitor.config.ts` להגדיר `server.url` ל-IP של ה-LAN שלך, אז שינויי vite יופיעו מיידית במכשיר.
- **בדיקות native**: השתמש ב-Capacitor plugins (camera, share, haptics, push) — אותו API לשתי הפלטפורמות.
- **CI/CD**: Fastlane (iOS) + Gradle Play Publisher (Android) → push אוטומטי לחנויות מ-GitHub Actions.

---

## בעיות נפוצות

| בעיה | פתרון |
|---|---|
| `npx cap add ios` נכשל | רוץ `sudo gem install cocoapods` |
| Hebrew מופיע LTR | ודא ש-`<html dir="rtl">` ב-`dist/index.html` (נשמר אוטומטית) |
| Splash צהוב/לבן | רוץ `npx @capacitor/assets generate` שוב |
| API calls נכשלים מהאפליקציה | באפליקציה, `/api/gemini` חייב URL מלא לפרודקשן (Vercel). שנה את `lib/gemini.ts` לקרוא ל-`https://mehunanim.vercel.app/api/gemini` ב-Capacitor. |

```ts
// src/lib/gemini.ts — patch ל-Capacitor
import { Capacitor } from '@capacitor/core';
const API_BASE = Capacitor.isNativePlatform()
  ? 'https://mehunanim.vercel.app'
  : '';
fetch(`${API_BASE}/api/gemini`, ...);
```
