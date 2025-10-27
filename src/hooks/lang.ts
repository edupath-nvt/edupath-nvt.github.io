export const t = (key: string) => {
    let lang = localStorage.getItem('lang');
    if (!lang) lang = "{}";
    const d = JSON.parse(lang);
    d[key] = key;
    localStorage.setItem('lang', JSON.stringify(d));
    return key;
}