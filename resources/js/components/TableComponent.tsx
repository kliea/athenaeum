import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';

// Define types
interface TableItem {
    id: string | number;
    status?: 'Available' | 'Borrowed' | 'Overdue' | 'Reserved' | string;
    title?: string;
    author?: string;
    date_borrowed?: string;
    [key: string]: any; // Allow for additional properties
}

interface StatusBadgeProps {
    status: string;
}

interface ActionButtonsProps {
    item: TableItem;
}

interface TableComponentProps<T extends TableItem> {
    data: T[];
    columns: string[];
    variant?: 'default' | 'dashboard' | 'management';
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onStatusChange?: (item: T) => void;
    emptyMessage?: string;
}

function TableComponent<T extends TableItem>({
    data,
    columns,
    variant = 'default', // 'default' | 'dashboard' | 'management'
    onEdit,
    onDelete,
    onStatusChange,
    emptyMessage = 'No data found',
}: TableComponentProps<T>) {
    // Status badge component
    const StatusBadge = ({ status }: StatusBadgeProps) => {
        const statusConfig = {
            Available: { bg: 'bg-green-100', text: 'text-green-800' },
            Borrowed: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            Overdue: { bg: 'bg-red-100', text: 'text-red-800' },
            Reserved: { bg: 'bg-blue-100', text: 'text-blue-800' },
            default: { bg: 'bg-gray-100', text: 'text-gray-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

        return (
            <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
            >
                {status}
            </span>
        );
    };

    // Action buttons component
    const ActionButtons = ({ item }: { item: T }) => {
        if (variant !== 'management') return null;

        return (
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit?.(item)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white transition-colors duration-200 hover:bg-blue-500"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete?.(item)}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs text-white transition-colors duration-200 hover:bg-red-500"
                >
                    Delete
                </button>
            </div>
        );
    };

    console.log('TableComponent data:', data);

    // Render cell content based on column type
    const renderCellContent = (item: T, column: string) => {
        const columnKey = column.toLowerCase().replace(/\s+/g, '');

        switch (columnKey) {
            case 'status':
                return item.status ? <StatusBadge status={item.status} /> : '-';

            case 'actions':
                return <ActionButtons item={item} />;

            case 'userid':
            case 'bookid':
                return (
                    <span className="font-medium text-gray-900 dark:text-white">
                        {item.id}
                    </span>
                );

            case 'title':
            case 'booktitle':
                return (
                    <span className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                    </span>
                );

            case 'author':
            case 'bookauthor':
                return (
                    <span className="text-gray-900 dark:text-white">
                        {item.author}
                    </span>
                );

            case 'dateborrowed':
            case 'dateborrow':
                return (
                    <span className="text-gray-900 dark:text-white">
                        {item.date_borrowed}
                    </span>
                );

            default:
                // For custom fields, try to find in item data
                const value = item[columnKey] || item[column.toLowerCase()];
                return value || '-';
        }
    };

    // Dashboard variant has different styling
    const getTableClasses = () => {
        if (variant === 'dashboard') {
            return 'bg-transparent border-none';
        }
        return '';
    };

    // Empty state component
    const EmptyState = () => (
        <TableRow>
            <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-gray-500 dark:text-gray-400"
            >
                {emptyMessage}
            </TableCell>
        </TableRow>
    );

    return (
        <div className="overflow-x-auto">
            <Table className={getTableClasses()}>
                <TableHeader>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableHead
                                key={index}
                                className={
                                    variant === 'dashboard'
                                        ? 'bg-transparent text-gray-400'
                                        : ''
                                }
                            >
                                {column}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y">
                    {data.length === 0 ? (
                        <EmptyState />
                    ) : (
                        data.map((item) => (
                            <TableRow
                                key={item.id}
                                className={`${variant === 'dashboard'
                                    ? 'bg-transparent hover:bg-white/5 dark:border-gray-700'
                                    : 'bg-white dark:border-gray-700 dark:bg-gray-800'
                                    }`}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {renderCellContent(item, column)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default TableComponent;