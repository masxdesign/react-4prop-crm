const trim = str => str.replace(/^\s+|\s+$/g,'')

export const trimPhp = (str, ch) => {
    var start = 0, 
        end = str.length;

    while(start < end && str[start] === ch)
        ++start;

    while(end > start && str[end - 1] === ch)
        --end;

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}

export const create_slug = (str, sep = '-') => {
    let slug = str
        .replace(/[\'|\(|\)]/, '')
        .replace(/[&]/, '')
        .replace(/[']/, '')
        .replace(/[^A-Za-z0-9-]+/g, sep)
        .replace(/[\s-]+/, sep)
        .toLowerCase()

    slug = trimPhp(slug, sep)
    return slug
}

export const slug_equal = (slug, non_slug) => create_slug(non_slug) === slug
export const slug_equal2 = (non_slug, non_slug2) => create_slug(non_slug) === create_slug(non_slug2)

export const aliasSplit = (str) => str.split(",").map((item) => trimPhp(item)).filter((item) => item !== "")

export const escapetext = text => 
    trim(text.replace(/xR0/g, '<br/>').replace(/xR1/g, "'"))

export const fallVals = (...vals) => 
    vals.find(val => val && trim(val) !== "")

export const strip_tags = html => {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.innerText; 
}