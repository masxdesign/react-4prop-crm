import Link from "./Link"

const LinkGroup = ({ items, ...props}) => (
    <div {...props}>
        {items.map(({ label, ...linkProps }) => (
            <Link key={label} {...linkProps}>{label}</Link>
        ))}
    </div>
)

export default LinkGroup