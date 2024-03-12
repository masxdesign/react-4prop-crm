import { ChatBubbleIcon } from '@radix-ui/react-icons';

const LogDialog = ({ info }) => {

  const handleClick = () => {
    info.table.options.meta.showDialog(info)
  }

  return (
    <ChatBubbleIcon className='cursor-pointer' onClick={handleClick} />
  )
}

export default LogDialog