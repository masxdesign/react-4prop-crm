import { useState } from 'react';
import * as Yup from "yup"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { util_add, util_delete } from '@/utils/localStorageController';

const messageSchema = Yup.object().shape({
    message: Yup.string().required()
})

const useChat = ({ queryOptions, deleteFn, addFn }) => {
    const queryClient = useQueryClient()

    const [autoScroll, setAutoScroll] = useState(true)
    const [scrollBehavior, setScrollBehavior] = useState(undefined)
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
  
    const resetScroll = () => {
        setAutoScroll(true)
        setScrollBehavior('smooth')
      }
  
    const deleteMutation = useMutation({
      mutationFn: deleteFn,
      onSuccess: (_, id) => {
        setAutoScroll(false)
        queryClient.setQueryData(queryOptions.queryKey, util_delete({ id: id }))
      }
    })
  
    const addMutation = useMutation({
        mutationFn: addFn,
        onSuccess: (data) => {
          resetScroll()
          queryClient.setQueryData(queryOptions.queryKey, util_add(data))
          setValue('')
        }
    })
    
    const handleSubmit = () => {
      try {
  
        messageSchema.validateSync({ message: value })
        addMutation.mutate({ message: value })
        setError(null)
  
      } catch (e) {
        setError(e.message)
      }
    }

    const handleChange = (e) => {
        setValue(e.target.value)
    }
  
    const handleDelete = (id) => {
        deleteMutation.mutate(id)
    }

    const handleFocus = () => {
      setError(null)
    }

    const chatBoxProps = {
        autoScroll,
        scrollBehavior,
        onDelete: handleDelete 
    }

    const messageBoxProps = {
        value,
        onFocus: handleFocus,
        onChange: handleChange
    }

    return {
        chatBoxProps,
        messageBoxProps,
        submit: handleSubmit,
        resetScroll,
        error
    }

}

export default useChat