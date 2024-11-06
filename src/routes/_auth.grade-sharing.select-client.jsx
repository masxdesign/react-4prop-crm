import ImportSingleContactForm from '@/components/ImportSingleContactForm'
import { useGradeSharingStore } from '@/hooks/useGradeSharing'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_auth/grade-sharing/select-client')({
  component: GradeSharingIndexComponent
})

function GradeSharingIndexComponent () {

    const navigate = useNavigate()

    const setSelected = useGradeSharingStore.use.setSelected()
    const selected = useGradeSharingStore.use.selected()

    const handleSelect = (newSelected) => {

        setSelected(newSelected)
        navigate({ to: "../" })

    }

    return (
        <ImportSingleContactForm 
            defaultEmail={selected ? selected.email: ""}
            onSelect={handleSelect}
            submitText="Save contact & Select"
        />
    )
}