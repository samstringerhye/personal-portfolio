// Fills every a[data-contact-email] with the mailto in the browser, so the address never appears
// in the HTML for scrapers to read. Links marked data-show-address also show it as their text.
const user = 'hello'
const host = ['samstringerhye', 'com'].join('.')

function fill() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-contact-email]').forEach((link) => {
    const subject = link.dataset.contactSubject
    link.href = `mailto:${user}@${host}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
    if ('showAddress' in link.dataset) link.textContent = `${user}@${host}`
  })
}

fill()
document.addEventListener('astro:page-load', fill)
