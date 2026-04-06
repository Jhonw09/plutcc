/**
 * Button / anchor component.
 * Renders an <a> when `href` is provided, otherwise a <button>.
 *
 * @param {'primary'|'outline'|'ghost'} variant
 */
export function Button({ variant = 'primary', href, children, onClick, className = '', ...props }) {
  const cls = `btn-${variant}${className ? ` ${className}` : ''}`

  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={cls} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
