import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AgentEmailSearchField from '@/components/Magazine/ui/AgentEmailSearchField'
import { useImpersonation } from '@/hooks/useImpersonation'
import { UserCheck, AlertTriangle } from 'lucide-react'

const ImpersonateDialog = ({ open, onOpenChange }) => {
    const [selectedAgent, setSelectedAgent] = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const { control } = useForm()
    const { impersonate, isImpersonatePending } = useImpersonation()

    const handleAgentSelect = (agent) => {
        setSelectedAgent(agent)
        setShowConfirm(true)
    }

    const handleConfirm = () => {
        if (selectedAgent) {
            impersonate(selectedAgent.nid)
        }
    }

    const handleCancel = () => {
        setShowConfirm(false)
        setSelectedAgent(null)
    }

    const handleOpenChange = (open) => {
        if (!open) {
            setShowConfirm(false)
            setSelectedAgent(null)
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Impersonate Agent</DialogTitle>
                    <DialogDescription>
                        Search for an agent to view the CRM as them
                    </DialogDescription>
                </DialogHeader>

                {!showConfirm ? (
                    <AgentEmailSearchField
                        name="agent"
                        control={control}
                        label="Search Agent"
                        placeholder="Type agent email or name..."
                        onAgentSelect={handleAgentSelect}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-medium text-amber-900">
                                    Impersonate {selectedAgent?.firstname} {selectedAgent?.surname}?
                                </p>
                                <p className="text-sm text-amber-700">
                                    You will view the CRM as this agent
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={isImpersonatePending}
                                className="flex-1 bg-amber-600 hover:bg-amber-700"
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {isImpersonatePending ? 'Switching...' : 'Confirm'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ImpersonateDialog
