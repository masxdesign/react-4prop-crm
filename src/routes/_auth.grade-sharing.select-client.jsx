import ImportSingleContactForm from '@/components/ImportSingleContactForm'
import { useGradeSharingStore } from '@/hooks/useGradeSharing'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_auth/grade-sharing/select-client')({
  component: GradeSharingIndexComponent
})

function GradeSharingIndexComponent () {
    const { pid = null } = Route.useSearch()

    const navigate = useNavigate()

    const setSelected = useGradeSharingStore.use.setSelected()
    const setTag = useGradeSharingStore.use.setTag()
    const selected = useGradeSharingStore.use.selected()

    const handleSelect = (newSelected) => {

        setSelected(newSelected)
        setTag(null)
        navigate({ to: "../" })

    }

    return (
        <ImportSingleContactForm 
            pid={pid}
            defaultEmail={selected ? selected.email: ""}
            onSelect={handleSelect}
            submitText="Save contact & Select"
        />
    )
}