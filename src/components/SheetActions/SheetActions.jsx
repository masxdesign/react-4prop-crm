import { Separator } from "../ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"

const SheetActions = ({ info, open, tab, onOpenChange, onTabValueChange, side = "right", editMode, component: ViewComponent }) => {

    const bodyProps = { info, tab, onSelect: onTabValueChange }

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
                    {editMode ? (
                        <ViewComponent 
                            {...bodyProps}
                            onSubmit={() => onOpenChange(false)}
                        />
                    ) : (
                        <ViewComponent 
                            {...bodyProps}
                            onHide={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

  export default SheetActions