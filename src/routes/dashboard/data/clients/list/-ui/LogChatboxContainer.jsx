import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Yup from "yup"
import { addLog, deleteLog, fetchLog } from '@/api/api-fakeServer';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { util_add, util_delete } from '@/utils/localStorageController';
import LogChatbox from '../../../../-ui/LogChatbox';
import ColumnNextContact from '../../../../-ui/ColumnNextContact';
import ColumnContactDate from '../../../../-ui/ColumnLastContact';
import { useAuth } from '@/components/Auth/Auth-context';

const messageSchema = Yup.object().shape({
    message: Yup.string().required()
})

const LogChatboxContainer = ({ info }) => {
    const [autoScroll, setAutoScroll] = useState(true)
    const [scrollBehavior, setScrollBehavior] = useState(undefined)
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
  
    const { user } = useAuth()
    const currUserId = user.id
    const uid = info.row.original.id
  
    const queryClient = useQueryClient()
  
    const query = useQuery({
      queryKey: ['log', uid],
      queryFn: () => fetchLog(uid)
    })
  
    const data = useMemo(() => query.data?.map((row) => {
      let { message } = row
      let variant = row.author === currUserId ? 'author' : 'default'
  
      if(row.isJSON) {
  
        variant = 'default'
  
        let props = { label: null, value: null }
        
        const J = JSON.parse(message)
  
        switch (J.type) {
          case 'contact_date':
  
            props.label = 'Last contact'
  
            if(J.data) {
              props.value = format(J.data, "d MMM yyy")
            }
  
            break 
          case 'contact_next_date':
  
            props.label = 'Next contact'
  
            if(J.data) {
              props.value = format(J.data, "d MMM yyy")
            }
            
            break
          default:
            props = { label: J.type, value: J.data }
        }
  
        message = (
          <p className='space-x-2'>
            <span className='text-xs'>{props.label}</span>
            {props.value ? (
              <span>{props.value}</span>
            ) : (
              <span>No date</span>
            )}
          </p>
        )
      }
  
      return {
        ...row,
        variant,
        message
      }
    }), [query.data])
  
    const DeleteMutation = useMutation({
      mutationKey: ['log', uid],
      mutationFn: deleteLog,
      onSuccess: (_, id) => {
        setAutoScroll(false)
        queryClient.setQueryData(['log', uid], util_delete({ id: id }))
      }
    })
  
    const handleDelete = (id) => {
      DeleteMutation.mutate(id)
    }
  
    const addMutation = useMutation({
      mutationFn: addLog,
      onSuccess: (data) => {
        setAutoScroll(true)
        setScrollBehavior('smooth')
        queryClient.setQueryData(['log', uid], util_add(data))
        setValue('')
      }
    })
  
    const handleChange = (e) => {
      setValue(e.target.value)
    }
  
    const handleSubmit = () => {
      try {
  
        messageSchema.validateSync({ message: value })
        addMutation.mutate({ message: value, uid, author: currUserId })
        setError(null)
  
      } catch (e) {
        setError(e.message)
      }
    }
  
    const handleFocus = () => {
      setError(null)
    }
    
    const handleDateUpdate = () => {
      setAutoScroll(true)
      setScrollBehavior('smooth')
    }
  
    return (
      <>
         {query.isLoading ? (
            <p>Loading...</p>
          ) : (
            <LogChatbox 
              autoScroll={autoScroll} 
              scrollBehavior={scrollBehavior} 
              data={data} 
              onDelete={handleDelete} 
            />
          )}
          <div>
            <Textarea placeholder="Type your message here." value={value} onFocus={handleFocus} onChange={handleChange} />
            {error && <small className='text-red-500'>{error}</small>}
          </div>
          <div className="flex space-x-4 justify-start items-end">
            <ColumnContactDate info={info} onSuccess={handleDateUpdate} />
            <div className='flex justify-center flex-grow'>
              <Button onClick={handleSubmit}>Make note</Button>
            </div>
            <div>
              <ColumnNextContact info={info} onSuccess={handleDateUpdate} />
            </div>
          </div>
      </>
    )
}

export default LogChatboxContainer