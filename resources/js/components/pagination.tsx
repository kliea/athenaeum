import { Link } from '@inertiajs/react';
import { Paginated } from '@/types';

interface PaginationProps {
    links: Paginated<any>['links'];
    meta: Paginated<any>;
}

export default function Pagination({ links, meta }: PaginationProps) {
    return (
        <div className="flex items-center justify-between border-t border-gray-700 bg-transparent px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    href={meta.prev_page_url || '#'}
                    disabled={!meta.prev_page_url}
                    className="relative inline-flex items-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                    Previous
                </Link>
                <Link
                    href={meta.next_page_url || '#'}
                    disabled={!meta.next_page_url}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                    Next
                </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-400">
                        Showing <span className="font-medium text-white">{meta.from}</span> to <span className="font-medium text-white">{meta.to}</span> of{' '}
                        <span className="font-medium text-white">{meta.total}</span> results
                    </p>
                </div>
                <div>
                    {links && links.length > 0 && (
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            {links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        link.active
                                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                            : 'text-gray-300 ring-1 ring-inset ring-gray-700 hover:bg-gray-800 focus:outline-offset-0'
                                    } ${index === 0 ? 'rounded-l-md' : ''} ${index === links.length - 1 ? 'rounded-r-md' : ''} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
}
