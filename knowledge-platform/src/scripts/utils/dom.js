/* ==========================================================================
   dom — tiny DOM helpers
   ========================================================================== */

export function createEl(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  if (props.className) el.className = props.className;
  if (props.id) el.id = props.id;
  if (props.style) el.style.cssText = props.style;
  if (props.href) el.href = props.href;
  for (const key of ["type", "placeholder", "value", "maxlength", "name", "autocomplete"]) {
    if (props[key] !== undefined) el.setAttribute(key, props[key]);
  }
  if (props["aria-label"]) el.setAttribute("aria-label", props["aria-label"]);
  if (props["aria-expanded"] !== undefined) el.setAttribute("aria-expanded", props["aria-expanded"]);
  if (props["aria-hidden"] !== undefined) el.setAttribute("aria-hidden", props["aria-hidden"]);
  if (props.text !== undefined) el.textContent = props.text;
  if (props.html) el.innerHTML = props.html;
  if (props.onClick) el.addEventListener("click", props.onClick);
  if (children) {
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      if (typeof c === "string") el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
  }
  return el;
}

export function html(strings, ...values) {
  return strings.reduce((acc, part, i) => acc + part + (values[i] ?? ""), "");
}