if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("../service-worker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}

// נשמור את אירוע ההתקנה במשתנה גלובלי כדי שנוכל להציגו מאוחר יותר
let deferredPrompt;

//אחרי טעינת העמוד- בדיקה האם אפשר לבצע התקנה
document.addEventListener("DOMContentLoaded", function (event) {
    //פנייה לדפדפן- אם כן, התקנה של פונקציה ביפור אינסטולט
    //הפונקצי ה הזו היא כמו הוספת מאזין לכפתור
    //הדפדפן "מאזין" ובודק האם ניתן להתקין את האפליקציה
    //אם האפליקציה כבר מותקנת לא יהיה אפשר להתקין
    window.addEventListener('beforeinstallprompt', (e) => {
        // נמנע הצגה של חלון ברירת מחדל במידה וקיים
        e.preventDefault();
        // נשמור את אירוע ההוספה למשתנה
        deferredPrompt = e;
        // נציג את כפתור ההתקנה שלנו
        showInstallPromotion();
    });

    //בדיקה האם הדפדפן (נוויגיטור) תומך בהפעלת מצלמת וידאו
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        //הפעלת הוידאו
        startVideo();
    } else {
        console.log("camera not supported");
    }

});

//הסרה של ביטול הצגת הכפתור
function showInstallPromotion() {
    document.getElementById("install-btn").classList.remove("d-none");
}
//הוספה של ביטול הצגת הכפתור
function hideInstallPromotion() {
    document.getElementById("install-btn").classList.add("d-none");
}

//התקנת האפליקציה 
function installApp() {
    // נסתיר את כפתור ההתקנה
    hideInstallPromotion();
    // נציג את חלונית ההתקנה
    //לוקחים את האירוע ששמרנו ומפעילים אותו
    deferredPrompt.prompt();
    // נרוקן את המשתנה בו שמרנו את האירוע, זהו אירוע חד פעמי
    deferredPrompt = null;
}

//הפעלת וידאו
//פונקציה אסינכרונית
async function startVideo() {
    // נשמור את תג הוידאו לתוך משתנה
    //שמירה במשתנה את האידי של הפלייר על מנת להזרים אליו בהמשך את הוידאו
    const player = document.getElementById('player');
    // נגדיר דרישות למדיה - נרצה להציג רק וידאו מהמצלמה האחורית
    //הגדרת פעולות של המדיה
    const constraints = {
        //בנוי כמפתח: ערך
        //בלי אודיו
        audio: false,
        video: {
            //הגדרת צילום במצלמה אחורית
            facingMode: 'environment'
        }
    };
    //במידה ונצליח לפנות למצלמה, נזרים את הוידאו לתג הוידאו
    //פנייה לדפדפן, שולחים לשם את דרישות המדיה. פונים לאיי פי אי
    navigator.mediaDevices.getUserMedia(constraints)
        //אפ הפונקציה הצליחה והצלחת להביא את המדיה
        //הפונקציה מקבלת את הזרם מדיה
        //הדמיה סטרים זה ההזרמת וידאו שהאיי פי אי מחזיר לי
        .then(function (mediaStream) {
            //פונים לתגית וידאו ושים שם את המדיה שהזרמנו
            player.srcObject = mediaStream;
        })
        //במדיה ולא הצלחנו להזרים את המדיה מדפיסים בקונסול שגיאה
        .catch(function (err) { console.log(err.name + ": " + err.message); });
}

//פונקציה לצילום מסך מהוידאו ליצירת תמונה
function doScreenshot() {
    // קאנבס זה השטח עליו נציג את התמונה
    const canvas = document.getElementById('canvas');
    // נרצה לשמור על הפרופורציות של הוידאו
    // הגדרת גובה ורוחב בהתאם לוידאו
    canvas.width = player.videoWidth;
    canvas.height = player.videoHeight;
    // נצייר את הפריים הנוכחי על גבי הקנבס
    // שתיים די זה שתי ממדים ולא תלת מימד
    canvas.getContext('2d').drawImage(player, 0, 0);

    //נמיר את הקנבס לפורמט של תמונה 
    //חשוב להמיר לתמונה על מנת שנוכל גם לשתף אותה אחכ
    document.getElementById('photo')
        //פנייה לקאנבס והופך אותו לקישור ושמים בתוך התגית אימג
        .src = canvas.toDataURL('image/jpeg');
    // נציג את הקנבס
    //הסרה של המחלקה שמסתירה את התמונה
    canvas.classList.remove('d-none');
};

//המרה מיואראל לקובץ
//מקבלת שני פרמטרים- יואראל ושם הוקבץ
function dataURLtoFile(dataUrl, fileName) {
    //פירוק המבנה ובנייה מחדש לקובץ תמונה
    var arr = dataUrl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
}

//שיתוף הקובץ
function share() {
    //פתיחת משתנה הקורא לפונקציה הממירה לקובץ, ושליחה אליה שני פרמטרים- הסורס של התמונה ושם הקובץ+הסוג
    var fileToSend = dataURLtoFile(document.getElementById('photo').src, "ImageProg3.jpeg")
    //הכנסה למערך את הקבצי תמונות
    var filesArray = [fileToSend];
    //בדיקה האם ניתן לשתף
    //פניה לנוייגיטור ובדיקה האם הפונקציה קן שר עובדת- האם ניתן לשתף
    //בדיקה האם ניתן לשתף +בדיקה האם ניתן לשתף קבצים
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        //אם כן מפעיל את פונקצית השיתוף
        navigator.share({
            files: filesArray,
        })
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
    } else {
        console.log(`Your system doesn't support sharing files.`);
    }
}

