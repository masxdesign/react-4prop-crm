import { Button } from '@/components/ui/button';

const LogDialog = ({ info }) => {

  const handleClick = () => {
    info.table.options.meta.showDialog(info.row.original.id)
  }

  return (
    <Button size="xs" variant="secondary" onClick={handleClick}>
      view
    </Button>
  )
}

export default LogDialog