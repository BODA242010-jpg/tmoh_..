/* Tmoh V13 — multilingual core navigation/onboarding and common controls.
 * Other lesson content remains in its verified original language until reviewed translations exist.
 * UI preference is isolated from student profiles. No external translation services or data transfers.
 */
(function(){
'use strict';
const LANGS=['ar','en','fr','es'];
const field='tmoh-ui-language';
let lang='ar';
try{const prev=localStorage.getItem(field);if(LANGS.includes(prev))lang=prev;}catch{}
const rows=[
 // Core login and main copy
 ['اللغة','Language','Langue','Idioma'],
 ['حلمك أقرب','Your dream is closer','Votre rêve est plus proche','Tu sueño está más cerca'],
 ['مما تتخيل.','than you think.','que vous ne l’imaginez.','de lo que imaginas.'],
 ['مساحتك الخاصة للنجاح','Your space to succeed','Votre espace pour réussir','Tu espacio para triunfar'],
 ['ذاكر بذكاء، اجمع إنجازاتك، وخلي كل يوم خطوة جديدة لحلمك.','Study smart, collect achievements, and take a step toward your dream every day.','Étudiez efficacement et avancez vers votre rêve chaque jour.','Estudia mejor y avanza cada día hacia tu sueño.'],
 ['مذاكرة ذكية','Smart learning','Études intelligentes','Estudio inteligente'],
 ['مكافآت ممتعة','Fun rewards','Récompenses amusantes','Recompensas divertidas'],
 ['رحلتك على طريقتك','Your journey, your way','Votre parcours, à votre façon','Tu viaje a tu manera'],
 ['ابدأ رحلتك إلى عالم طموح','Begin your Tmoh journey','Commencez votre parcours Tmoh','Comienza tu viaje en Tmoh'],
 ['أهلًا بعودتك','Welcome back','Heureux de vous revoir','¡Bienvenido de nuevo!'],
 ['اختر ملفك','Choose your profile','Choisissez votre profil','Elige tu perfil'],
 ['ملف جديد','New profile','Nouveau profil','Perfil nuevo'],
 ['ملف عرض تجريبي (بيانات تجريبية)','Demo profile (sample data)','Profil démo (données fictives)','Perfil de prueba (datos ficticios)'],
 ['الملفات محفوظة على هذا الجهاز فقط.','Profiles are saved on this device only.','Profils enregistrés uniquement sur cet appareil.','Los perfiles se guardan solo en este dispositivo.'],
 ['جهّز ملفك الدراسي','Set up your study profile','Configurez votre profil scolaire','Configura tu perfil de estudio'],
 ['اسمك أو اسمك المستعار','Your name or nickname','Votre nom ou pseudonyme','Tu nombre o apodo'],
 ['الصف الدراسي','School grade','Niveau scolaire','Curso escolar'],
 ['النظام الدراسي','Academic system','Système scolaire','Sistema educativo'],
 ['المسار / الشعبة','Track / stream','Filière / spécialité','Especialidad'],
 ['الوقت المتاح للمذاكرة يوميًا (دقيقة)','Daily study time available (minutes)','Temps d’étude quotidien (minutes)','Tiempo disponible al día (minutos)'],
 ['موادك (تتعبأ تلقائيًا حسب صفك ويمكنك تعديلها)','Your subjects (suggested automatically; editable)','Vos matières (suggestions modifiables)','Tus materias (sugeridas y editables)'],
 ['افصل بين المواد بفاصلة','Separate subjects with commas','Séparez les matières par des virgules','Separa las materias con comas'],
 ['ابدأ رحلتي','Start my journey','Commencer mon parcours','Comenzar mi viaje'],
 ['قائمة المواد اقتراحات عامة، وتقدر تعدّلها بعدين من الإعدادات.','Subjects are suggestions; you can edit them in settings.','Les matières sont des suggestions modifiables dans les paramètres.','Las materias son sugerencias editables en ajustes.'],
 ['إيه حلمك اللي نفسك تحققه؟','What is your dream?','Quel est votre rêve ?','¿Cuál es tu sueño?'],
 ['كل حلم كبير بيبدأ بخطوة صغيرة، وإحنا هنا علشان نساعدك توصل لحلمك.','Every big dream starts with a small step. We’re here to help.','Chaque grand rêve commence par un petit pas. Nous sommes là pour vous aider.','Todo gran sueño comienza con un pequeño paso. Estamos aquí para ayudarte.'],
 ['أو اكتب حلمًا آخر','Or write another dream','Ou écrivez un autre rêve','O escribe otro sueño'],
 ['التالي','Next','Suivant','Siguiente'],
 ['تخطي السؤال','Skip question','Passer la question','Saltar pregunta'],
 ['عندي ملف سابق','I have a profile','J’ai déjà un profil','Ya tengo un perfil'],
 ['عرض تجريبي للموقع','View demo','Voir la démo','Ver demostración'],
 ['طالب تجريبي','Demo student','Élève démo','Estudiante de prueba'],
 ['ملف تجريبي','Demo profile','Profil de démo','Perfil de prueba'],
 ['طبيب','Doctor','Médecin','Médico'],['مهندس','Engineer','Ingénieur','Ingeniero'],['صيدلي','Pharmacist','Pharmacien','Farmacéutico'],['مبرمج','Programmer','Programmeur','Programador'],['محاسب','Accountant','Comptable','Contador'],['معلم','Teacher','Enseignant','Profesor'],['إعلامي','Media professional','Professionnel des médias','Comunicador'],['عالم','Scientist','Scientifique','Científico'],
 ['تسجيل الخروج','Sign out','Se déconnecter','Cerrar sesión'],
 ['حلمي:','My dream:','Mon rêve :','Mi sueño:'],
 ['تثبيت','Install','Installer','Instalar'],
 ['ثبّت Tmoh كتطبيق','Install Tmoh as an app','Installer l’appli Tmoh','Instalar Tmoh como aplicación'],
 ['ثبّت Tmoh على جهازك','Install Tmoh on your device','Installer Tmoh sur votre appareil','Instala Tmoh en tu dispositivo'],
 ['تثبيت التطبيق','Install app','Installer l’application','Instalar aplicación'],
 ['لاحقًا','Later','Plus tard','Más tarde'],
 ['إغلاق','Close','Fermer','Cerrar'],
 ['ابحث عن قسم...','Search sections...','Rechercher une section...','Buscar sección...'],
 ['القائمة','Menu','Menu','Menú'],
 // Grade and stage labels; values saved in Arabic, display translated only
 ['الصف الأول الإعدادي','1st Preparatory (Grade 7)','1ère année du collège','1.º de secundaria básica'],
 ['الصف الثاني الإعدادي','2nd Preparatory (Grade 8)','2e année du collège','2.º de secundaria básica'],
 ['الصف الثالث الإعدادي','3rd Preparatory (Grade 9)','3e année du collège','3.º de secundaria básica'],
 ['الصف الأول الثانوي','1st Secondary (Grade 10)','1ère année du lycée','1.º de bachillerato'],
 ['الصف الثاني الثانوي','2nd Secondary (Grade 11)','2e année du lycée','2.º de bachillerato'],
 ['الصف الثالث الثانوي','3rd Secondary (Grade 12)','3e année du lycée','3.º de bachillerato'],
 ['المرحلة الإعدادية','Preparatory school','Collège','Secundaria básica'],
 ['الثانوية العامة','General Secondary','Secondaire général','Bachillerato general'],
 ['البكالوريا المصرية','Egyptian Baccalaureate','Baccalauréat égyptien','Bachillerato egipcio'],
 ['علمي','Science','Sciences','Ciencias'],['أدبي','Humanities','Lettres','Humanidades'],
 ['علمي علوم','Life sciences','Sciences de la vie','Ciencias naturales'],
 ['علمي رياضة','Mathematics','Mathématiques','Matemáticas'],
 ['الطب وعلوم الحياة','Medicine and Life Sciences','Médecine et sciences de la vie','Medicina y ciencias de la vida'],
 ['الهندسة وعلوم الحاسب','Engineering and Computing','Ingénierie et informatique','Ingeniería e informática'],
 ['الأعمال','Business','Commerce','Negocios'],['الآداب والفنون','Arts and Humanities','Arts et lettres','Artes y humanidades'],
 // Navigation: emojis are retained by translator when preceding the text
 ['الرئيسية','Home','Accueil','Inicio'],['رحلتي','My journey','Mon parcours','Mi camino'],
 ['المكافآت','Rewards','Récompenses','Recompensas'],['المناهج الدراسية الحديثة','Curriculum','Programme scolaire','Plan de estudios'],
 ['البكالوريا المصرية','Egyptian Baccalaureate','Baccalauréat égyptien','Bachillerato egipcio'],
 ['مخطط المذاكرة','Study planner','Planificateur','Planificador'],
 ['عداد المذاكرة','Study timer','Minuteur d’étude','Temporizador de estudio'],
 ['التراكمات','Backlogs','Retards','Pendientes'],
 ['المساعد الذكي','AI study assistant','Assistant IA','Asistente IA'],
 ['بنك الأسئلة','Question bank','Banque de questions','Banco de preguntas'],
 ['بنك الأخطاء','Mistake bank','Banque d’erreurs','Banco de errores'],
 ['كروت المراجعة','Flashcards','Cartes mémoire','Tarjetas de repaso'],
 ['ملاحظاتي','My notes','Mes notes','Mis notas'],
 ['التحليلات','Analytics','Analyses','Análisis'],
 ['الإنجازات','Achievements','Réussites','Logros'],
 ['تقرير الأداء','Performance report','Rapport de performance','Informe de rendimiento'],
 ['المنهج الدراسي','Curriculum','Programme scolaire','Plan de estudios'],
 ['الاختبارات','Quizzes','Quiz','Cuestionarios'],['الفلاش كاردز','Flashcards','Cartes mémoire','Tarjetas'],
 ['مراجعة الأخطاء','Review mistakes','Revoir les erreurs','Revisar errores'],
 ['الملاحظات','Notes','Notes','Notas'],['المكتبة','Library','Bibliothèque','Biblioteca'],
 ['الإعدادات','Settings','Paramètres','Ajustes'],['الإشعارات','Notifications','Notifications','Notificaciones'],
 ['تحديات اليوم','Daily challenges','Défis quotidiens','Desafíos diarios'],
 ['رفيق طموح','Tmoh companion','Compagnon Tmoh','Compañero Tmoh'],
 ['الجدول الذكي','Smart planner','Planning intelligent','Plan inteligente'],
 ['تحدي 5 دقائق','Five-minute challenge','Défi de 5 minutes','Desafío de 5 minutos'],
 ['معرض الإنجازات','Achievement gallery','Galerie des réussites','Galería de logros'],
 ['غرفة التركيز','Focus room','Salle de concentration','Sala de concentración'],
 ['دوري طموح','Tmoh league','Ligue Tmoh','Liga Tmoh'],
 ['كتب الوزارة','Official textbooks','Manuels officiels','Libros oficiales'],
 ['حساب اختياري','Optional account','Compte facultatif','Cuenta opcional'],
 ['ذاكر من داخل طموح','Study inside Tmoh','Étudier dans Tmoh','Estudia dentro de Tmoh'],
 ['مكتبتي','My library','Ma bibliothèque','Mi biblioteca'],
 ['مركز أدوات الدرس','Lesson tools','Outils du cours','Herramientas de lección'],
 ['خطة التراكمات','Backlog plan','Plan de rattrapage','Plan de pendientes'],
 ['رحلتي الأسبوعية','My week','Ma semaine','Mi semana'],
 ['حركة بعد المذاكرة','Movement break','Pause active','Pausa activa'],
 ['الراحة','Break','Pause','Descanso'],
 ['الإحصائيات','Statistics','Statistiques','Estadísticas'],
 ['تقرير الأداء','Progress report','Rapport de progrès','Informe de progreso'],
 ['الصحة النفسية','Wellbeing','Bien-être','Bienestar'],
 ['الدراسة والمصادر','Study and resources','Études et ressources','Estudio y recursos'],
 ['الوقت والخطة','Time and planning','Temps et planning','Tiempo y planificación'],
 ['الاختبارات والمكافآت','Quizzes and rewards','Quiz et récompenses','Cuestionarios y recompensas'],
 ['راحتي وتقدّمي','Wellbeing and progress','Bien-être et progrès','Bienestar y progreso'],
 ['أدوات أخرى','Other tools','Autres outils','Otras herramientas'],
 ['المزيد','More','Plus','Más'],
 // Common actions and settings
 ['مرحبًا','Welcome','Bienvenue','Bienvenido'],
 ['ابدأ جلسة مذاكرة','Start studying','Commencer à étudier','Empezar a estudiar'],
 ['ابدأ العداد','Start timer','Démarrer le minuteur','Iniciar temporizador'],
 ['إيقاف مؤقت','Pause','Pause','Pausar'],
 ['حفظ التعديلات','Save changes','Enregistrer','Guardar cambios'],
 ['إضافة','Add','Ajouter','Añadir'],['حفظ','Save','Enregistrer','Guardar'],
 ['إلغاء','Cancel','Annuler','Cancelar'],['ابدأ','Start','Commencer','Iniciar'],
 ['ملفي','My profile','Mon profil','Mi perfil'],['البيانات','Data','Données','Datos'],
 ['هوايتك المفضلة','Favorite hobby','Loisir préféré','Afición favorita'],
 ['اختر هواية (اختياري)','Choose hobby (optional)','Choisir un loisir (facultatif)','Elige afición (opcional)'],
 ['طريقة التعلم المفضلة','Preferred learning style','Style d’apprentissage','Estilo de aprendizaje'],
 ['تفعيل إشعارات المهام','Enable task reminders','Activer les rappels','Activar recordatorios'],
 ['إضافة مواد صفي تلقائيًا','Suggest subjects for my grade','Suggérer les matières','Sugerir materias'],
 ['تصدير نسخة احتياطية','Export backup','Exporter une sauvegarde','Exportar respaldo'],
 ['استيراد نسخة','Import backup','Importer une sauvegarde','Importar respaldo'],
 ['استيراد منهج رسمي (JSON)','Import verified curriculum (JSON)','Importer un programme vérifié (JSON)','Importar currículo verificado (JSON)'],
 ['حذف هذا الملف','Delete this profile','Supprimer ce profil','Eliminar este perfil'],
 ['رجوع','Back','Retour','Volver'],['الرجوع للرئيسية','Back home','Retour à l’accueil','Volver al inicio'],
 ['اللغة العربية','Arabic','Arabe','Árabe'],['اللغة الإنجليزية','English','Anglais','Inglés'],
 ['الرياضيات','Mathematics','Mathématiques','Matemáticas'],
 ['العلوم','Science','Sciences','Ciencias'],['الدراسات الاجتماعية','Social studies','Sciences sociales','Ciencias sociales'],
 ['التربية الدينية','Religious education','Éducation religieuse','Educación religiosa'],
 ['تكنولوجيا المعلومات','Information technology','Informatique','Tecnología de la información'],
 ['الفيزياء','Physics','Physique','Física'],['الكيمياء','Chemistry','Chimie','Química'],
 ['الأحياء','Biology','Biologie','Biología'],['التاريخ','History','Histoire','Historia'],
 ['الجغرافيا','Geography','Géographie','Geografía'],
 ['اللغة الأجنبية الأولى','First foreign language','Première langue étrangère','Primera lengua extranjera'],
 ['الملفات محفوظة على هذا الجهاز فقط.','Profiles are saved on this device only.','Profils enregistrés sur cet appareil uniquement.','Los perfiles se guardan solo aquí.'],
 ['حساب الطالب','Student account','Compte étudiant','Cuenta de estudiante'],
 ['البريد الإلكتروني','Email','E-mail','Correo electrónico'],
 ['كلمة السر','Password','Mot de passe','Contraseña'],
 ['دخول','Sign in','Connexion','Iniciar sesión'],
 ['حساب جديد','Create account','Créer un compte','Crear cuenta'],
 ['نسيت كلمة السر؟','Forgot password?','Mot de passe oublié ?','¿Olvidaste la contraseña?'],
 ['متابعة بدون حساب (حفظ على الجهاز فقط)','Continue without account (saved locally)','Continuer sans compte (local)','Continuar sin cuenta (local)'],
];
const map=new Map(rows.map(([key,...v])=>[key,v]));
const originals=new WeakMap();
let pending=false;
function lookup(text){
 if(lang==='ar')return text;
 const exact=map.get(text);
 if(exact)return exact[LANGS.indexOf(lang)-1]||text;
 const pos=text.search(/[\u0600-\u06FF]/);
 if(pos>0){const lead=text.slice(0,pos),tail=text.slice(pos);const t=map.get(tail);if(t)return lead+(t[LANGS.indexOf(lang)-1]||tail);}
 return text;
}
function translated(value){
 const m=String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
 return m?m[1]+lookup(m[2])+m[3]:value;
}
function processText(node){
 if(!node||!node.parentElement||node.parentElement.closest('script,style,pre,code,.bubble,option:not([value]),[data-no-translate]'))return;
 const raw=node.nodeValue;
 const saved=originals.get(node);
 const base=saved&&raw===saved.out?saved.base:raw;
 const out=translated(base);
 originals.set(node,{base,out});
 if(raw!==out)node.nodeValue=out;
}
function apply(){
 pending=false;
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('#tmohLangLogin,#tmohLangApp').forEach(sel=>{if(sel.value!==lang)sel.value=lang;});
 const root=document.body;
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;while((node=walker.nextNode()))processText(node);
 document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>{
   for(const a of ['placeholder','aria-label','title']){
     if(!el.hasAttribute(a))continue;
     const key='data-tmoh-ar-'+a;const now=el.getAttribute(a),from=el.getAttribute(key)||now;
     if(!el.hasAttribute(key))el.setAttribute(key,from);
     const t=translated(from);if(now!==t)el.setAttribute(a,t);
   }
 });
}
function schedule(){if(pending)return;pending=true;queueMicrotask(apply);}
function change(next){if(!LANGS.includes(next))return;lang=next;try{localStorage.setItem(field,lang);}catch{}schedule();}
document.addEventListener('change',e=>{if(e.target?.matches('#tmohLangLogin,#tmohLangApp'))change(e.target.value)});
new MutationObserver(mutations=>{
 if(mutations.every(x=>x.type==='characterData'&&originals.get(x.target)?.out===x.target.nodeValue))return;
 schedule();
}).observe(document.body,{childList:true,subtree:true,characterData:true});
window.TMOH_I18N=Object.freeze({get language(){return lang},change});
schedule();
})();
