import { Separator } from "../ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import ClientFormEdit from "../Clientform/ClientFormEdit"

const SheetActions = ({ info, open, tab, onOpenChange, onTabValueChange, side = "right", readOnly }) => {

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={side} className="w-[375px] sm:w-[800px]">
                <div className="space-y-6">
                    <SheetHeader>
                        <SheetTitle>{info.row.getValue('fullName')}</SheetTitle>
                        <SheetDescription>
                            {info.row.getValue('company')}
                        </SheetDescription>
                    </SheetHeader>
                    <Separator />
                    {readOnly ? (
                        <p>{info.row.getValue('first')}</p>
                    ) : (
                        <ClientFormEdit 
                            info={info}
                            tab={tab} 
                            onSelect={onTabValueChange} 
                            onSubmit={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

  export default SheetActions