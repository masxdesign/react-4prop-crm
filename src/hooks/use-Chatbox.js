import { useState } from 'react';
import * as Yup from "yup"
import { useMutation } from '@tanstack/react-query';
import { Uppy } from '@uppy/core';
import ThumbnailGenerator from '@uppy/thumbnail-generator';
import { useUppyState } from '@uppy/react';
import { createSelector } from 'reselect';

const messageSchema = Yup.object().shape({
    message: Yup.string().required()
})

export const filesSelector = createSelector(
  state => state.files,
  (files) => Object.entries(files)
)

const useChatbox = ({ deleteMutationOptions, addMutationOptions }) => {
    const [uppy] = useState(() => new Uppy({
      restrictions: {
        maxNumberOfFiles: 3,
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
        maxFileSize: 15_000_000
      }
    }))

    const files = useUppyState(uppy, filesSelector)

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
        uppy.clear()
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
    
    const handleSubmit = async (buttonName) => {
      try {

        if (buttonName === "note" || files.length < 1) {
          messageSchema.validateSync({ message: value })
        }

        setError(null)
        addMutation.mutate({ message: value, files, _button: buttonName })
  
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
        uppy,
        files,
        chatBoxProps,
        messageBoxProps,
        submit: handleSubmit,
        resetScroll,
        ResetAll,
        error
    }

}

export default useChatbox