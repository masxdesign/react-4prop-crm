import VirtualizedInfiniteTable from './VirtualizedInfiniteTable';

// Mock API function
const fetchUsers = async ({ pageParam, pageSize }) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const start = pageParam || 0;
  const data = Array.from({ length: pageSize }, (_, i) => ({
    id: start + i,
    name: `User ${start + i}`,
    email: `user${start + i}@example.com`,
    role: i % 2 === 0 ? 'Admin' : 'User',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  return {
    data,
    nextCursor: start + pageSize < 100 ? start + pageSize : undefined,
  };
};

const columns = [
  {
    key: 'name',
    header: 'Name',
    flex: 1,
    minWidth: '150px',
    render: (item) => item.name,
  },
  {
    key: 'email',
    header: 'Email',
    flex: 2,
    minWidth: '200px',
    render: (item) => item.email,
  },
  {
    key: 'role',
    header: 'Role',
    width: '100px',
    align: 'center',
    render: (item) => (
      <span className={item.role === 'Admin' ? 'text-blue-600' : 'text-gray-600'}>
        {item.role}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created',
    width: '120px',
    render: (item) => new Date(item.createdAt).toLocaleDateString(),
  },
];

const VirtualizedInfiniteTableExample = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Users Table</h2>
      <VirtualizedInfiniteTable
        queryKey={['users-example']}
        queryFn={fetchUsers}
        columns={columns}
        getRowKey={(item) => item.id}
        maxHeight="400px"
        emptyMessage="No users found"
        errorMessage="Failed to load users"
      />
    </div>
  );
};

export default VirtualizedInfiniteTableExample;
