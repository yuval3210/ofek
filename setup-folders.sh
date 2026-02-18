#!/bin/bash
# Create photos/1, photos/2, ... and move each reason's media + create text.txt, story.txt
set -e
cd "$(dirname "$0")/photos"

# Order and content from current data.js (reason index -> filename, text, story)
mkdir -p 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17

mv -n IMG_8663.mov 1/ 2>/dev/null || true
mv -n IMG_3170.mov 2/ 2>/dev/null || true
mv -n IMG_9530.jpeg 3/ 2>/dev/null || true
mv -n IMG_8045.mov 4/ 2>/dev/null || true
mv -n IMG_8928.jpeg 5/ 2>/dev/null || true
mv -n IMG_1551.jpeg 6/ 2>/dev/null || true
mv -n IMG_2774.jpeg 7/ 2>/dev/null || true
mv -n IMG_1691.jpeg 8/ 2>/dev/null || true
mv -n IMG_1668.mov 9/ 2>/dev/null || true
mv -n IMG_2672.jpeg 10/ 2>/dev/null || true
mv -n "IMG_9906 (1).mov" 11/ 2>/dev/null || true
mv -n 585dcfec-d6c7-406b-9e1a-35e3ead4e53e.jpg 12/ 2>/dev/null || true
mv -n IMG_8348.jpeg 13/ 2>/dev/null || true
mv -n IMG_5789.jpeg 14/ 2>/dev/null || true
mv -n IMG_4349.jpeg 15/ 2>/dev/null || true
mv -n IMG_9302.jpeg 16/ 2>/dev/null || true
mv -n A7R08854.jpeg 17/ 2>/dev/null || true

# text.txt and story.txt for each folder
printf '%s' "כי אני רוצה לטייל איתך בכל העולם" > 1/text.txt
printf '%s' "יש לי את הסוכנת טיולים הכי מדהימה בעולם לכל החיים" > 1/story.txt

printf '%s' "כי אני רוצה שתמשיכי להצחיק אותי כל החיים" > 2/text.txt
touch 2/story.txt

printf '%s' "כי את תומכת בי בכל דבר שאני רוצה בחיים" > 3/text.txt
printf '%s' "את תומכת בי בכל שטות אפשרית וזה הכי חשוב לי ומדהים בעולם (חוץ מבישול מולקולרי)" > 3/story.txt

printf '%s' "כי גם המשפחה שלי מאוהבת בך" > 4/text.txt
printf '%s' "ובצדק" > 4/story.txt

printf '%s' "כי את פשוט הכי חמודה בעולם" > 5/text.txt
printf '%s' "לזכות בו היה הדבר הכי כיף וחמוד בעולם בזכות התגובה שלך" > 5/story.txt

printf '%s' "כי אני רוצה שתמיד תביאי אותי למסעדות הכי שוות בעולם" > 6/text.txt
printf '%s' "המסעדות איתך הן הכי מדהימות בכל היקום בפער" > 6/story.txt

printf '%s' "כי את אוהבת אותי הכי בעולם וגורמת לי תמיד להרגיש אהוב" > 7/text.txt
printf '%s' "תראי איך את מתרגשת פה לכתוב לי מכתב" > 7/story.txt

printf '%s' "כי אני רוצה להתפלצן איתך כל החיים" > 8/text.txt
printf '%s' "יין יותר טעים כשהוא עולה 80 יורו" > 8/story.txt

printf '%s' "ואחר כך ללכת לדפוק קינוח מושחת" > 9/text.txt
printf '%s' "כשמותר כמובן" > 9/story.txt

printf '%s' "כי את בן אדם שאוהב מכל הלב" > 10/text.txt
printf '%s' "ויש המון לב" > 10/story.txt

printf '%s' "כי קוקו אהב אותך מאוד" > 11/text.txt
printf '%s' "נחשי אם בכיתי" > 11/story.txt

printf '%s' "כי בזכותך אני עושה שטויות ונהנה" > 12/text.txt
printf '%s' "זוכרת את כל ההודים שם למעלה?" > 12/story.txt

printf '%s' "כי אני אוהב להכין איתך אוכל ורוצה לעשות את זה כל הזמן" > 13/text.txt
printf '%s' "בעיקר בחול" > 13/story.txt

printf '%s' "כי אני רוצה תמיד לראות אותך מאושרת וגאה בעצמך" > 14/text.txt
touch 14/story.txt

printf '%s' "וכי יש לנו עוד מיליון מקומות לבקר ביחד" > 15/text.txt
printf '%s' "אני יודע שכבר כתבתי את זה אבל זה חשוב להדגיש" > 15/story.txt

printf '%s' "כי הרגעים שאת מאושרת ושמחה ומתלהבת הם הרגעים הכי שמחים בחיים שלי" > 16/text.txt
printf '%s' "כל הכיף שלי בחול זה שאנחנו יכולים להתלהב ביחד" > 16/story.txt

printf '%s' "כי ביחד אנחנו נהיה הכי מאושרים בעולם כל יום מחדש" > 17/text.txt
touch 17/story.txt

echo Done. Folders 1-17 ready with media, text.txt, story.txt.
