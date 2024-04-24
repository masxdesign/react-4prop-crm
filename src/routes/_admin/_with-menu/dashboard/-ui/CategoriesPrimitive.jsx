import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import useCategoriesSuspenseQuery from './use-CategoriesSuspenseQuery';
import { Suspense } from 'react';

const CategoriesPrimitiveList = ({ value, badgeClassName }) => {
    const list = useCategoriesSuspenseQuery({ value })

    return (
        list.map(({ label }) => (
            <Badge
                variant="secondary"
                key={label}
                className={cn("rounded-sm px-1 font-normal text-nowrap", badgeClassName)}
            >
                {label}
            </Badge>
        ))
    )
}

const CategoriesPrimitive = ({ info, badgeClassName, ...props }) => (
    <div className="flex max-w-[150px] space-x-1" {...props}>
        <Suspense fallback={<small>Loading...</small>}>
            <CategoriesPrimitiveList value={info.row.getValue('categories')} badgeClassName={badgeClassName} />
        </Suspense>
    </div>
)

export default CategoriesPrimitive