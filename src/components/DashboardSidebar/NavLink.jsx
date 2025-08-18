import { Link } from '@tanstack/react-router'

export function NavLink({ id, to, icon: Icon, label, context }) {
  const resolvedTo = typeof to === 'function' ? to(context) : to

  return (
    <Link 
      key={id}
      to={resolvedTo}
      activeOptions={{ exact: true, includeSearch: false }}
      className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center"
    >
      <Icon className="size-5 shrink-0" />
      <span className="opacity-60">{label}</span>
    </Link>
  )
}