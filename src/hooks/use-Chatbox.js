import { useState } from 'react';
import * as Yup from "yup"
import { useMutation } from '@tanstack/react-query';

const messageSchema = Yup.object().shape({
    message: Yup.string().required()
})

const useChatbox = ({ deleteMutationOptions, addMutationOptions }) => {
    const [autoScroll, setAutoScroll] = useState(true)
    const [scrollBehavior, setScrollBehavior] = useState(undefined)
    const [value, setValue] = useState('')
    const [error, setError] = useState(null)
  
    const resetScroll = () => {
      setAutoScroll(true)
      setScrollBehavior('smooth')
    }

    const ResetAll = () => {
      resetScroll()
      setValue('')
    }
  
    const addMutation = useMutation({
      ...addMutationOptions,
      onSuccess: (...args) => {
        addMutationOptions.onSuccess?.(...args)
        ResetAll()
      }
    })

    const deleteMutation = useMutation({
      ...deleteMutationOptions,
      onSuccess: (...args) => {
        deleteMutationOptions.onSuccess?.(...args)
        setAutoScroll(false)
      }
    })
    
    const handleSubmit = (buttonName) => {
      try {

        messageSchema.validateSync({ message: value })
        addMutation.mutate({ message: value, _button: buttonName })
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
        ResetAll,
        error
    }

}

export default useChatbox