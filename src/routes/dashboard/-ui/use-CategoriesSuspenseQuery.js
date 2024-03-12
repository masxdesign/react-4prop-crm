import categoriesQueryOptions from '@/api/categoriesQueryOptions';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const useCategoriesSuspenseQuery = ({ value }) => {
    const { data } = useSuspenseQuery(categoriesQueryOptions)
    return useMemo(() => data.filter((category) => value.includes(category.value)), [data, value])
}

export default useCategoriesSuspenseQuery