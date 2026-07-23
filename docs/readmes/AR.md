# CLICK REPEATER

<p align="center" id="installation">
  <a href="https://chromewebstore.google.com/detail/click-repeater/ojdgninjdijhhclanjlhaipehopjjmoo" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=light">
      <img src="https://shieldcn.dev/badge/Chrome%20Web%20Store.svg?logo=googlechrome&logoColor=4285F4&mode=dark" alt="Chrome Web Store">
    </picture>
  </a>
  <a href="https://addons.mozilla.org/firefox/addon/click-repeater/" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Firefox%20Add%E2%80%91ons.svg?logo=firefoxbrowser&logoColor=FF7139&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Firefox%20Add%E2%80%91ons.svg?logo=firefoxbrowser&logoColor=FF7139&mode=light">
      <img src="https://shieldcn.dev/badge/Firefox%20Add%E2%80%91ons.svg?logo=firefoxbrowser&logoColor=FF7139&mode=dark" alt="Firefox Add-ons">
    </picture>
  </a>
  <a href="https://github.com/md2it/click-repeater/releases/latest/download/click-repeater.zip">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Latest%20Release%20ZIP.svg?logo=lu:FileArchive&logoColor=CA8A04&mode=dark">
      <source media="(prefers-color-scheme: light)" srcset="https://shieldcn.dev/badge/Latest%20Release%20ZIP.svg?logo=lu:FileArchive&logoColor=CA8A04&mode=light">
      <img src="https://shieldcn.dev/badge/Latest%20Release%20ZIP.svg?logo=lu:FileArchive&logoColor=CA8A04&mode=dark" alt="Latest Release ZIP">
    </picture>
  </a>
</p>

<p align="center" id="language">
=-=-=-=-=-=-=-=-= | <a href="./DE.md">DE</a> | <a href="../../README.md">EN</a> | <a href="./ES.md">ES</a> | <a href="./FR.md">FR</a> | <a href="./RU.md">RU</a> | <a href="./ZH.md">中文</a> | عربي | =-=-=-=-=-=-=-=-=
</p>

## الوصف

يسجل Click Repeater النقرات وإدخال لوحة المفاتيح على صفحة ويب ويكررها لاحقًا.

أنشئ تسلسل إجراءات مرة واحدة، واضبط طريقة تشغيله، ثم شغّله من نافذة الإضافة أو باستخدام اختصار لوحة المفاتيح. يمكن للنقرات استخدام الإحداثيات المسجلة أو عناصر الصفحة.

<p align="center" id="screenshots">
  <a href="../publication/screenshots/AR-0.png"><img src="../publication/screenshots/AR-0.png" width="180" alt="Click Repeater screenshot 1"></a>
  <a href="../publication/screenshots/AR-1.png"><img src="../publication/screenshots/AR-1.png" width="180" alt="Click Repeater screenshot 2"></a>
  <a href="../publication/screenshots/AR-2.png"><img src="../publication/screenshots/AR-2.png" width="180" alt="Click Repeater screenshot 3"></a>
  <a href="../publication/screenshots/AR-3.png"><img src="../publication/screenshots/AR-3.png" width="180" alt="Click Repeater screenshot 4"></a>
</p>

## الميزات الرئيسية

- تسجيل تسلسلات النقر على صفحات الويب
- تسجيل إدخال لوحة المفاتيح وتكراره
- التشغيل في وضع الموضع أو العنصر
- تشغيل مرئي أو مخفي
- التكرار حتى 999 مرة
- ضبط سرعة التنفيذ
- تعيين نقرات افتراضية وتشغيلها باختصار
- تعديل النقرات المحفوظة وحذفها وترتيبها
- سمة فاتحة وأخرى داكنة
- الواجهة متاحة بالإنجليزية والفرنسية والألمانية والإسبانية والروسية والعربية والصينية المبسطة

## الخصوصية

- لا يتم جمع البيانات
- لا يوجد تتبع
- لا توجد طلبات شبكة
- تُحفظ النقرات والإعدادات محليًا في المتصفح

## القيود

- لا تعمل إضافات المتصفح على صفحات النظام أو المواقع المحمية
- يتطلب وضع العنصر بقاء العناصر المسجلة متاحة في الصفحة
- يتطلب وضع الموضع بقاء المحتوى المطلوب عند الإحداثيات المسجلة
- قد تمنع تغييرات الموقع اكتمال النقرات المحفوظة القديمة
- لا تضمن حركة المؤشر المحاكاة تفعيل CSS `:hover` الأصلي؛ وقد لا تعمل عناصر التحكم التي تظهر فقط عند تحريك المؤشر الحقيقي فوقها
- لا يعمل تشغيل Delete / Backspace في Google Docs
- لا يعمل إدخال لوحة المفاتيح في خلايا Google Sheets
- قد تكتشف المواقع النقرات المحاكاة حتى في وضع Stealth — الأحداث التي يُنشئها المتصفح لا تحمل العلامة `isTrusted: true` التي تنفرد بها تفاعلات المستخدم الحقيقية؛ فالمواقع التي تتحقق من `event.isTrusted` ستكشف الأتمتة بصرف النظر عن طريقة إرسال النقرة

## الترخيص

[ترخيص MIT](../LICENSE)
