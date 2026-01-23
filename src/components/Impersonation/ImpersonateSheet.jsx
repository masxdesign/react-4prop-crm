import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import AgentEmailSearchField from '@/components/Magazine/ui/AgentEmailSearchField'
import { useImpersonation } from '@/hooks/useImpersonation'
import { UserCheck, AlertTriangle, History } from 'lucide-react'

const RECENT_SWITCHES_KEY = 'impersonation_recent_switches'
const MAX_RECENT_SWITCHES = 5

const getRecentSwitches = () => {
    try {
        const stored = localStorage.getItem(RECENT_SWITCHES_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

const saveRecentSwitch = (agent) => {
    const recent = getRecentSwitches()
    // Remove if already exists (to move to top)
    const filtered = recent.filter(a => a.nid !== agent.nid)
    // Add to front and limit to max
    const updated = [agent, ...filtered].slice(0, MAX_RECENT_SWITCHES)
    localStorage.setItem(RECENT_SWITCHES_KEY, JSON.stringify(updated))
}

const ImpersonateSheet = ({ open, onOpenChange }) => {
    const [selectedAgent, setSelectedAgent] = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [recentSwitches, setRecentSwitches] = useState([])
    const { control } = useForm()
    const { impersonate, isImpersonatePending } = useImpersonation()

    // Load recent switches when sheet opens
    useEffect(() => {
        if (open) {
            setRecentSwitches(getRecentSwitches())
        }
    }, [open])

    const handleAgentSelect = (agent) => {
        setSelectedAgent(agent)
        setShowConfirm(true)
    }

    const handleConfirm = () => {
        if (selectedAgent) {
            // Save to recent switches before impersonating
            saveRecentSwitch({
                nid: selectedAgent.nid,
                firstname: selectedAgent.firstname,
                surname: selectedAgent.surname,
                email: selectedAgent.email,
                company: selectedAgent.company
            })
            impersonate({ targetNegId: selectedAgent.nid })
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
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="left" className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Impersonate Agent</SheetTitle>
                    <SheetDescription>
                        Search for an agent to view the CRM as them
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    {!showConfirm ? (
                        <div className="space-y-4">
                            <AgentEmailSearchField
                                name="agent"
                                control={control}
                                label="Search Agent"
                                placeholder="Type agent email or name..."
                                onAgentSelect={handleAgentSelect}
                            />

                            {recentSwitches.length > 0 && (
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <History className="h-3.5 w-3.5 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent</span>
                                    </div>
                                    <div className="space-y-1">
                                        {recentSwitches.map((agent) => (
                                            <button
                                                key={agent.nid}
                                                onClick={() => handleAgentSelect(agent)}
                                                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {agent.firstname} {agent.surname}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {agent.email}
                                                    </p>
                                                </div>
                                                <UserCheck className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ImpersonateSheet
